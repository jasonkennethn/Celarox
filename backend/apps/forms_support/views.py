import secrets
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import DynamicForm, FormSubmission, SupportTicket, TicketMessage
from .serializers import (
    DynamicFormSerializer,
    FormSubmissionSerializer,
    SupportTicketSerializer,
    TicketMessageSerializer
)
from apps.crm.views import get_user_workspace_id
from apps.integrations.brevo_service import send_contact_inquiry_to_admin, send_brevo_email
from apps.workflows.engine import trigger_workflow_event


class DynamicFormViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DynamicFormSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return DynamicForm.objects.none()
        return DynamicForm.objects.filter(workspace_id=ws_id).prefetch_related('submissions')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        slug_base = serializer.validated_data.get('title', 'form').lower().replace(' ', '-')
        slug = f"{slug_base}-{secrets.token_hex(4)}"
        serializer.save(workspace_id=ws_id, slug=slug)

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        form = self.get_object()
        submissions = form.submissions.all()
        return Response(FormSubmissionSerializer(submissions, many=True).data)


class PublicFormView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        form = DynamicForm.objects.filter(slug=slug, is_published=True).first()
        if not form:
            return Response({'error': 'Form not found or unpublished.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DynamicFormSerializer(form).data)

    def post(self, request, slug):
        form = DynamicForm.objects.filter(slug=slug, is_published=True).first()
        if not form:
            return Response({'error': 'Form not found or unpublished.'}, status=status.HTTP_404_NOT_FOUND)

        form_data = request.data.get('data', {})
        submitter_email = request.data.get('email') or form_data.get('email', '')
        submitter_name = request.data.get('name') or form_data.get('name', '')

        submission = FormSubmission.objects.create(
            form=form,
            data=form_data,
            submitter_email=submitter_email,
            submitter_name=submitter_name,
            ip_address=request.META.get('REMOTE_ADDR')
        )

        # Trigger workflow automations
        try:
            trigger_workflow_event(
                workspace_id=form.workspace_id,
                trigger_event='form.submitted',
                context_data={
                    'form_title': form.title,
                    'email': submitter_email,
                    'name': submitter_name,
                    'data': form_data
                }
            )
        except Exception:
            pass

        return Response({
            'message': form.success_message,
            'submission_id': str(submission.id),
            'redirect_url': form.redirect_url
        }, status=status.HTTP_201_CREATED)


class PublicContactInquiryView(APIView):
    """
    Public Contact Portal:
    - User submits inquiry from Celarox website (https://celarox.com)
    - Admin email dispatched to hello@celarox.com (reply-to: user's email)
    - Confirmation email dispatched to submitter from no-reply@celarox.com
    """
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        company = request.data.get('company', '').strip()
        subject = request.data.get('subject', '').strip() or 'Enterprise Platform Inquiry'
        message = request.data.get('message', '').strip()
        phone = request.data.get('phone', '').strip()

        if not name or not email or not message:
            return Response({'error': 'Name, email, and message are required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # Dispatch via Brevo
        result = send_contact_inquiry_to_admin(
            user_name=name,
            user_email=email,
            user_company=company,
            subject=subject,
            message=message,
            phone=phone
        )

        return Response({
            'success': True,
            'message': 'Thank you! Your message has been received and our team will get back to you shortly.',
            'details': result
        }, status=status.HTTP_200_OK)


class SupportTicketViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return SupportTicket.objects.none()
        return SupportTicket.objects.filter(workspace_id=ws_id).prefetch_related('messages')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        ticket_number = f"TICK-{secrets.token_hex(3).upper()}"
        ticket = serializer.save(workspace_id=ws_id, ticket_number=ticket_number)

        # Create first message
        desc = serializer.validated_data.get('description', '')
        if desc:
            TicketMessage.objects.create(
                ticket=ticket,
                sender_user=self.request.user,
                sender_type='customer',
                sender_name=self.request.user.full_name,
                message=desc
            )

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        msg_text = request.data.get('message', '').strip()
        if not msg_text:
            return Response({'error': 'Message content cannot be blank.'}, status=status.HTTP_400_BAD_REQUEST)

        message = TicketMessage.objects.create(
            ticket=ticket,
            sender_user=request.user,
            sender_type='agent',
            sender_name=request.user.full_name,
            message=msg_text,
            attachment_url=request.data.get('attachment_url', '')
        )

        ticket.status = 'waiting_on_customer'
        ticket.save(update_fields=['status'])

        # Notify customer via Brevo
        try:
            send_brevo_email(
                to_email=ticket.customer_email,
                to_name=ticket.customer_name,
                subject=f"Update on Support Ticket [{ticket.ticket_number}] - {ticket.subject}",
                html_content=f"""
                <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3 style="color: #0f172a;">Response to Ticket #{ticket.ticket_number}</h3>
                    <p style="color: #475569;"><strong>Agent {request.user.full_name}:</strong></p>
                    <div style="background: #f8fafc; padding: 14px; border-radius: 6px; margin: 12px 0;">{msg_text}</div>
                    <p style="font-size: 12px; color: #94a3b8;">You can reply to this email or access your Celarox portal to continue the discussion.</p>
                </div>
                """
            )
        except Exception:
            pass

        return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)

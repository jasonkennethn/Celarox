from decimal import Decimal
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ClientBillingProfile, Invoice, InvoiceItem, PaymentTransaction, Expense
from .serializers import (
    ClientBillingProfileSerializer,
    InvoiceSerializer,
    InvoiceItemSerializer,
    PaymentTransactionSerializer,
    ExpenseSerializer
)
from .pdf_generator import generate_invoice_pdf
from apps.crm.views import get_user_workspace_id
from apps.integrations.brevo_service import send_brevo_email


class ClientBillingProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientBillingProfileSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return ClientBillingProfile.objects.none()
        return ClientBillingProfile.objects.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Invoice.objects.none()
        return Invoice.objects.filter(workspace_id=ws_id).prefetch_related('items', 'payments')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        pdf_buffer = generate_invoice_pdf(invoice)
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        amount = Decimal(str(request.data.get('amount', '0')))
        method = request.data.get('payment_method', 'bank_transfer')
        ref = request.data.get('reference_number', '')
        notes = request.data.get('notes', '')

        if amount <= 0:
            return Response({'error': 'Payment amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        transaction = PaymentTransaction.objects.create(
            workspace=invoice.workspace,
            invoice=invoice,
            amount=amount,
            payment_method=method,
            reference_number=ref,
            notes=notes
        )

        invoice.amount_paid += amount
        if invoice.amount_paid >= invoice.total_amount:
            invoice.status = 'paid'
        elif invoice.amount_paid > 0:
            invoice.status = 'partially_paid'
        invoice.save()

        return Response({
            'message': 'Payment recorded successfully.',
            'transaction': PaymentTransactionSerializer(transaction).data,
            'invoice': InvoiceSerializer(invoice).data
        })

    @action(detail=True, methods=['post'])
    def send_to_client(self, request, pk=None):
        invoice = self.get_object()
        recipient_email = request.data.get('email') or invoice.client_email or (invoice.client.email if invoice.client else '')
        if not recipient_email:
            return Response({'error': 'Client email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        invoice.status = 'sent'
        invoice.save(update_fields=['status'])

        client_name = invoice.client_name or (invoice.client.contact_name if invoice.client else 'Valued Client')
        html_content = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0 0 6px 0;">Invoice #{invoice.invoice_number} from {invoice.workspace.name}</h2>
                <p style="color: #64748b; font-size: 14px; margin: 0;">Total Due: <strong>{invoice.currency} {invoice.total_amount:,.2f}</strong></p>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello {client_name},</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Please find your invoice #{invoice.invoice_number} issued by <strong>{invoice.workspace.name}</strong>.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; background: #f8fafc; border-radius: 8px; padding: 12px;">
                <tr>
                    <td style="padding: 10px 14px; color: #64748b;"><strong>Issue Date:</strong></td>
                    <td style="padding: 10px 14px; color: #0f172a;">{invoice.issue_date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; color: #64748b;"><strong>Due Date:</strong></td>
                    <td style="padding: 10px 14px; color: #0f172a;">{invoice.due_date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; color: #64748b;"><strong>Amount Due:</strong></td>
                    <td style="padding: 10px 14px; color: #0f172a; font-weight: 700; font-size: 16px;">{invoice.currency} {invoice.total_amount:,.2f}</td>
                </tr>
            </table>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                Terms: {invoice.terms}
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                Sent via Celarox Enterprise Invoicing Platform
            </p>
        </div>
        """

        send_brevo_email(
            to_email=recipient_email,
            to_name=client_name,
            subject=f"Invoice #{invoice.invoice_number} from {invoice.workspace.name}",
            html_content=html_content
        )

        return Response({'message': f'Invoice sent to {recipient_email}.', 'invoice': InvoiceSerializer(invoice).data})


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Expense.objects.none()
        category = self.request.query_params.get('category')
        qs = Expense.objects.filter(workspace_id=ws_id)
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class PaymentTransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentTransactionSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return PaymentTransaction.objects.none()
        return PaymentTransaction.objects.filter(workspace_id=ws_id).select_related('invoice')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class FinanceOverviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        ws_id = get_user_workspace_id(request)
        if not ws_id:
            return Response({'error': 'No active workspace.'}, status=status.HTTP_400_BAD_REQUEST)

        invoices = Invoice.objects.filter(workspace_id=ws_id)
        expenses = Expense.objects.filter(workspace_id=ws_id)

        total_invoiced = sum(i.total_amount for i in invoices)
        total_received = sum(i.amount_paid for i in invoices)
        total_outstanding = sum((i.total_amount - i.amount_paid) for i in invoices if i.status != 'paid')
        total_expenses = sum(e.amount for e in expenses)
        net_profit = total_received - total_expenses

        # Category breakdown of expenses
        cat_map = {}
        for exp in expenses:
            cat_map[exp.category] = cat_map.get(exp.category, Decimal('0.00')) + exp.amount

        expense_breakdown = [{'category': k, 'amount': v} for k, v in cat_map.items()]

        return Response({
            'total_invoiced': total_invoiced,
            'total_received': total_received,
            'total_outstanding': total_outstanding,
            'total_expenses': total_expenses,
            'net_profit': net_profit,
            'invoices_count': invoices.count(),
            'paid_invoices_count': invoices.filter(status='paid').count(),
            'expense_breakdown': expense_breakdown
        })

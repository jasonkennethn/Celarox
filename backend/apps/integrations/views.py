"""
Integrations & External Communications Views for Celarox Enterprise
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .brevo_service import send_contact_inquiry_to_admin


class ContactInquiryView(APIView):
    """
    Public Contact Portal Endpoint:
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
            return Response(
                {'error': 'Name, email, and message are required fields.'},
                status=status.HTTP_400_BAD_REQUEST
            )

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

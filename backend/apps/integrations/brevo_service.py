"""
Brevo (Sendinblue) Transactional Email Service for Celarox Enterprise
"""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_brevo_email(
    to_email: str,
    to_name: str,
    subject: str,
    html_content: str,
    reply_to_email: str = None,
    reply_to_name: str = None,
    attachment_url: str = None,
    attachment_name: str = None
) -> dict:
    """
    Send an email via Brevo transactional API.
    Sender: no-reply@celarox.com (or settings.EMAIL_NO_REPLY)
    """
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    if not api_key:
        logger.warning("BREVO_API_KEY is not configured.")
        return {"success": False, "error": "API key missing"}

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": getattr(settings, 'SENDER_NAME', 'Celarox Enterprise'),
            "email": getattr(settings, 'EMAIL_NO_REPLY', 'no-reply@celarox.com')
        },
        "to": [
            {
                "email": to_email,
                "name": to_name or to_email.split('@')[0]
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    if reply_to_email:
        payload["replyTo"] = {
            "email": reply_to_email,
            "name": reply_to_name or reply_to_email
        }

    if attachment_url and attachment_name:
        payload["attachment"] = [
            {
                "url": attachment_url,
                "name": attachment_name
            }
        ]

    try:
        response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code in (200, 201, 202):
            return {"success": True, "data": response.json()}
        else:
            logger.error(f"Brevo API error: {response.status_code} - {response.text}")
            return {"success": False, "error": response.text, "status_code": response.status_code}
    except Exception as exc:
        logger.exception(f"Brevo API Exception: {exc}")
        return {"success": False, "error": str(exc)}


def send_contact_inquiry_to_admin(
    user_name: str,
    user_email: str,
    user_company: str,
    subject: str,
    message: str,
    phone: str = ""
) -> dict:
    """
    When a user or prospective client submits a contact form:
    - Admin notification goes to hello@celarox.com
    - Reply-to is set to user's email address
    - Confirmation email is sent to the user from no-reply@celarox.com
    """
    admin_email = getattr(settings, 'EMAIL_ADMIN', 'hello@celarox.com')

    admin_html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0 0 6px 0;">New Inbound Inquiry - Celarox Enterprise</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Received via Celarox Public Portal</p>
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Full Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">{user_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:{user_email}" style="color: #4f46e5;">{user_email}</a></td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">{user_company or 'Not specified'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">{phone or 'Not provided'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">{subject}</td>
            </tr>
        </table>
        <div style="margin-top: 16px; background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #4f46e5;">
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{message}</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Clicking 'Reply' in your email client will reply directly to {user_email}.</p>
    </div>
    """

    # 1. Send to Admin with reply-to = user
    admin_result = send_brevo_email(
        to_email=admin_email,
        to_name="Celarox Executive Team",
        subject=f"[Celarox Inquiry] {subject} - {user_name}",
        html_content=admin_html,
        reply_to_email=user_email,
        reply_to_name=user_name
    )

    # 2. Send acknowledgment to the User from no-reply@celarox.com
    user_html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Celarox Enterprise</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Unified Business Management Platform</p>
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello {user_name},</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Thank you for reaching out to Celarox Enterprise. We have received your inquiry regarding <strong>"{subject}"</strong> and our enterprise team is currently reviewing your details.
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            One of our solution specialists will follow up directly at this email address within one business day.
        </p>
        <div style="margin: 24px 0; background: #f8fafc; padding: 16px; border-radius: 8px;">
            <p style="color: #475569; font-size: 13px; margin: 0;"><strong>Your Message Summary:</strong></p>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 6px 0 0 0; font-style: italic;">"{message}"</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Best regards,<br />
            <strong>The Celarox Enterprise Team</strong><br />
            <a href="https://celarox.com" style="color: #4f46e5; text-decoration: none;">celarox.com</a>
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            © 2026 Celarox Enterprise. All rights reserved. This is an automated message sent from no-reply@celarox.com.
        </p>
    </div>
    """

    send_brevo_email(
        to_email=user_email,
        to_name=user_name,
        subject="We have received your message - Celarox Enterprise",
        html_content=user_html
    )

    return admin_result


def send_welcome_email(user_email: str, user_name: str, workspace_name: str) -> dict:
    """Send welcome onboarding email to newly registered user."""
    html_content = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; font-size: 26px; font-weight: 700; margin: 0 0 8px 0;">Welcome to Celarox Enterprise</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Your unified operating foundation for business growth</p>
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello {user_name},</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your account has been successfully created and your primary workspace <strong>"{workspace_name}"</strong> is ready to use.
        </p>
        <div style="margin: 28px 0; text-align: center;">
            <a href="https://celarox.com/app" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">Open Workspace</a>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            With Celarox, you can immediately:
        </p>
        <ul style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>Manage client relationships & visual sales pipelines</li>
            <li>Track operational projects and team Kanban boards</li>
            <li>Generate professional invoices and track payments</li>
            <li>Organize documents with cloud object storage and Google Drive</li>
            <li>Automate cross-module business workflows</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Sent by Celarox Enterprise · <a href="https://celarox.com/privacy" style="color: #64748b;">Privacy Policy</a> · <a href="https://celarox.com/terms" style="color: #64748b;">Terms of Service</a>
        </p>
    </div>
    """
    return send_brevo_email(
        to_email=user_email,
        to_name=user_name,
        subject=f"Welcome to Celarox Enterprise - {workspace_name}",
        html_content=html_content
    )


def send_password_reset_email(user_email: str, user_name: str, reset_token: str) -> dict:
    """Send secure password reset link to user."""
    reset_url = f"https://celarox.com/reset-password?token={reset_token}&email={user_email}"
    html_content = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0f172a; margin: 0 0 12px 0;">Reset Your Password</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello {user_name},</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We received a request to reset the password for your Celarox Enterprise account. Click the button below to set a new password:
        </p>
        <div style="margin: 24px 0; text-align: center;">
            <a href="{reset_url}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            If you did not request this password reset, please ignore this email or contact <a href="mailto:hello@celarox.com" style="color: #4f46e5;">hello@celarox.com</a> if you have concerns.
        </p>
    </div>
    """
    return send_brevo_email(
        to_email=user_email,
        to_name=user_name,
        subject="Reset Your Celarox Enterprise Password",
        html_content=html_content
    )

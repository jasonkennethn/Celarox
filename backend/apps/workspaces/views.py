import secrets
from datetime import timedelta
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action

from .models import Workspace, WorkspaceMembership, WorkspaceInvitation, AuditLog
from .serializers import (
    WorkspaceSerializer,
    WorkspaceMembershipSerializer,
    WorkspaceInvitationSerializer,
    AuditLogSerializer
)
from apps.authentication.models import User
from apps.integrations.brevo_service import send_brevo_email


class WorkspaceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkspaceSerializer

    def get_queryset(self):
        return Workspace.objects.filter(
            memberships__user=self.request.user,
            memberships__is_active=True
        ).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMembership.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='owner',
            job_title='Owner'
        )
        AuditLog.objects.create(
            workspace=workspace,
            user=self.request.user,
            action='create',
            module='workspace',
            details={'workspace_name': workspace.name}
        )

    @action(detail=True, methods=['get', 'post'])
    def members(self, request, pk=None):
        workspace = self.get_object()

        if request.method == 'GET':
            memberships = workspace.memberships.filter(is_active=True).select_related('user')
            serializer = WorkspaceMembershipSerializer(memberships, many=True)
            return Response(serializer.data)

        # POST: Invite or add member
        # Only admin/owner can invite
        caller_membership = workspace.memberships.filter(user=request.user, is_active=True).first()
        if not caller_membership or caller_membership.role not in ('owner', 'admin'):
            return Response({'error': 'Only workspace owners or admins can invite new members.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email', '').lower().strip()
        role = request.data.get('role', 'member')
        job_title = request.data.get('job_title', '')
        department = request.data.get('department', 'General')

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already a member
        existing_user = User.objects.filter(email__iexact=email).first()
        if existing_user and workspace.memberships.filter(user=existing_user, is_active=True).exists():
            return Response({'error': 'User is already an active member of this workspace.'}, status=status.HTTP_400_BAD_REQUEST)

        token_str = secrets.token_urlsafe(32)
        invitation = WorkspaceInvitation.objects.create(
            workspace=workspace,
            email=email,
            role=role,
            token=token_str,
            invited_by=request.user,
            expires_at=timezone.now() + timedelta(days=7)
        )

        # Send Invitation Email via Brevo
        invite_url = f"https://celarox.com/accept-invite?token={token_str}"
        html_content = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 12px 0;">You've been invited to join {workspace.name}</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                {request.user.full_name} ({request.user.email}) has invited you to collaborate in the <strong>{workspace.name}</strong> workspace on Celarox Enterprise as a <strong>{role.title()}</strong>.
            </p>
            <div style="margin: 28px 0; text-align: center;">
                <a href="{invite_url}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
                This invitation link will expire in 7 days.
            </p>
        </div>
        """
        try:
            send_brevo_email(
                to_email=email,
                to_name=email.split('@')[0],
                subject=f"Invitation to join {workspace.name} on Celarox Enterprise",
                html_content=html_content
            )
        except Exception:
            pass

        # If user already exists in Celarox, directly create active membership
        if existing_user:
            membership, _ = WorkspaceMembership.objects.update_or_create(
                workspace=workspace,
                user=existing_user,
                defaults={'role': role, 'job_title': job_title, 'department': department, 'is_active': True}
            )
            invitation.is_accepted = True
            invitation.save()
            return Response(WorkspaceMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)

        return Response(WorkspaceInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch', 'delete'], url_path='members/(?P<member_id>[^/.]+)')
    def manage_member(self, request, pk=None, member_id=None):
        workspace = self.get_object()
        caller_membership = workspace.memberships.filter(user=request.user, is_active=True).first()
        if not caller_membership or caller_membership.role not in ('owner', 'admin'):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        target_membership = workspace.memberships.filter(id=member_id).first()
        if not target_membership:
            return Response({'error': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_membership.role == 'owner' and caller_membership.role != 'owner':
            return Response({'error': 'Cannot modify the owner membership.'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'DELETE':
            if target_membership.user == workspace.owner:
                return Response({'error': 'Cannot remove the workspace owner.'}, status=status.HTTP_400_BAD_REQUEST)
            target_membership.is_active = False
            target_membership.save()
            return Response({'message': 'Member removed from workspace.'}, status=status.HTTP_200_OK)

        # PATCH: update role or title
        new_role = request.data.get('role')
        if new_role and new_role in dict(WorkspaceMembership.ROLE_CHOICES):
            target_membership.role = new_role
        if 'job_title' in request.data:
            target_membership.job_title = request.data['job_title']
        if 'department' in request.data:
            target_membership.department = request.data['department']
        target_membership.save()

        return Response(WorkspaceMembershipSerializer(target_membership).data)

    @action(detail=True, methods=['get'])
    def audit_logs(self, request, pk=None):
        workspace = self.get_object()
        logs = workspace.audit_logs.all()[:100]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class AcceptInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token_str = request.data.get('token')
        if not token_str:
            return Response({'error': 'Invitation token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        invitation = WorkspaceInvitation.objects.filter(
            token=token_str,
            is_accepted=False,
            expires_at__gt=timezone.now()
        ).select_related('workspace').first()

        if not invitation:
            return Response({'error': 'Invitation is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        membership, _ = WorkspaceMembership.objects.update_or_create(
            workspace=invitation.workspace,
            user=request.user,
            defaults={'role': invitation.role, 'is_active': True}
        )

        invitation.is_accepted = True
        invitation.save()

        workspace_data = WorkspaceSerializer(invitation.workspace, context={'request': request}).data
        return Response({
            'message': f'You have successfully joined {invitation.workspace.name}.',
            'workspace': workspace_data
        })

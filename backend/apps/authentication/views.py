import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, PasswordResetToken
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    WorkspaceBriefSerializer
)
from apps.workspaces.models import Workspace, WorkspaceMembership
from apps.integrations.brevo_service import (
    send_welcome_email,
    send_password_reset_email
)
from apps.integrations.google_service import verify_google_id_token


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user, workspace = serializer.save()
        tokens = get_tokens_for_user(user)

        # Trigger Brevo welcome email
        try:
            send_welcome_email(user.email, user.full_name, workspace.name)
        except Exception:
            pass

        user_data = UserSerializer(user).data
        workspace_data = WorkspaceBriefSerializer(workspace, context={'request': request}).data

        return Response({
            'message': 'Account created successfully.',
            'tokens': tokens,
            'user': user_data,
            'workspace': workspace_data,
            'workspaces': [workspace_data]
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)
        if not user:
            # Check if user exists by email
            user_obj = User.objects.filter(email__iexact=email).first()
            if user_obj and user_obj.check_password(password):
                user = user_obj

        if not user:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Your account has been deactivated.'},
                status=status.HTTP_403_FORBIDDEN
            )

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        # Get workspaces
        memberships = WorkspaceMembership.objects.filter(user=user, is_active=True).select_related('workspace')
        workspaces = [m.workspace for m in memberships]
        workspaces_data = WorkspaceBriefSerializer(workspaces, many=True, context={'request': request}).data
        active_workspace = workspaces_data[0] if workspaces_data else None

        return Response({
            'message': 'Login successful.',
            'tokens': tokens,
            'user': user_data,
            'workspace': active_workspace,
            'workspaces': workspaces_data
        }, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        id_token = serializer.validated_data.get('id_token')
        email = serializer.validated_data.get('email')
        name = serializer.validated_data.get('name', '')
        picture = serializer.validated_data.get('picture', '')

        # If ID token is provided, verify it with Google API
        if id_token:
            token_res = verify_google_id_token(id_token)
            if token_res.get('success'):
                email = token_res.get('email')
                name = token_res.get('name') or name
                picture = token_res.get('picture') or picture

        if not email:
            return Response({'error': 'Valid Google account info or ID token required.'}, status=status.HTTP_400_BAD_REQUEST)

        email = email.lower().strip()
        user = User.objects.filter(email__iexact=email).first()
        is_new_user = False

        if not user:
            is_new_user = True
            name_parts = name.split(' ', 1) if name else ['', '']
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar_url=picture,
                auth_provider='google',
                is_verified=True
            )

            # Auto-create workspace
            workspace = Workspace.objects.create(
                name=f"{first_name or email.split('@')[0]}'s Workspace",
                owner=user
            )
            WorkspaceMembership.objects.create(
                workspace=workspace,
                user=user,
                role='owner',
                job_title='Founder / Owner'
            )

            try:
                send_welcome_email(user.email, user.full_name, workspace.name)
            except Exception:
                pass
        else:
            if picture and not user.avatar_url:
                user.avatar_url = picture
                user.save(update_fields=['avatar_url'])

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        memberships = WorkspaceMembership.objects.filter(user=user, is_active=True).select_related('workspace')
        workspaces = [m.workspace for m in memberships]
        workspaces_data = WorkspaceBriefSerializer(workspaces, many=True, context={'request': request}).data
        active_workspace = workspaces_data[0] if workspaces_data else None

        return Response({
            'message': 'Google authentication successful.',
            'tokens': tokens,
            'user': user_data,
            'workspace': active_workspace,
            'workspaces': workspaces_data,
            'is_new_user': is_new_user
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data
        memberships = WorkspaceMembership.objects.filter(user=request.user, is_active=True).select_related('workspace')
        workspaces = [m.workspace for m in memberships]
        workspaces_data = WorkspaceBriefSerializer(workspaces, many=True, context={'request': request}).data

        return Response({
            'user': user_data,
            'workspaces': workspaces_data
        })

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated.', 'user': serializer.data})
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        user = User.objects.filter(email__iexact=email).first()

        if user:
            token_str = secrets.token_urlsafe(48)
            PasswordResetToken.objects.create(
                user=user,
                token=token_str,
                expires_at=timezone.now() + timedelta(hours=2)
            )
            try:
                send_password_reset_email(user.email, user.full_name, token_str)
            except Exception:
                pass

        return Response({
            'message': 'If an account exists with this email, a password reset link has been dispatched.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        token_str = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        reset_token = PasswordResetToken.objects.filter(token=token_str, is_used=False).first()
        if not reset_token or not reset_token.is_valid:
            return Response({'error': 'Password reset token is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.is_used = True
        reset_token.save()

        return Response({'message': 'Password has been reset successfully. You can now log in.'}, status=status.HTTP_200_OK)

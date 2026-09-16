from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PasswordResetToken
from apps.workspaces.models import Workspace, WorkspaceMembership


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'title', 'avatar_url', 'is_verified',
            'two_factor_enabled', 'auth_provider', 'created_at'
        )
        read_only_fields = ('id', 'is_verified', 'created_at')


class WorkspaceBriefSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ('id', 'name', 'slug', 'logo_url', 'industry', 'currency', 'role')

    def get_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            if membership:
                return membership.role
        return 'member'


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    workspace_name = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower().strip()

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        ws_name = validated_data.get('workspace_name') or f"{first_name or email.split('@')[0]}'s Workspace"

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        workspace = Workspace.objects.create(
            name=ws_name,
            owner=user
        )

        WorkspaceMembership.objects.create(
            workspace=workspace,
            user=user,
            role='owner',
            job_title='Founder / Owner'
        )

        return user, workspace


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=False, allow_blank=True)
    access_token = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    picture = serializers.CharField(required=False, allow_blank=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

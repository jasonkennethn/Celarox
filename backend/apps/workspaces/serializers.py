from rest_framework import serializers
from .models import Workspace, WorkspaceMembership, WorkspaceInvitation, AuditLog
from apps.authentication.serializers import UserSerializer


class WorkspaceSerializer(serializers.ModelSerializer):
    owner_email = serializers.ReadOnlyField(source='owner.email')
    members_count = serializers.SerializerMethodField()
    current_user_role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = (
            'id', 'name', 'slug', 'owner', 'owner_email', 'logo_url',
            'industry', 'company_size', 'website', 'currency', 'timezone',
            'is_active', 'created_at', 'members_count', 'current_user_role'
        )
        read_only_fields = ('id', 'slug', 'owner', 'created_at')

    def get_members_count(self, obj):
        return obj.memberships.filter(is_active=True).count()

    def get_current_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            m = obj.memberships.filter(user=request.user).first()
            return m.role if m else None
        return None


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = WorkspaceMembership
        fields = ('id', 'workspace', 'user', 'user_id', 'role', 'job_title', 'department', 'is_active', 'joined_at')
        read_only_fields = ('id', 'joined_at')


class WorkspaceInvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.ReadOnlyField(source='invited_by.full_name')

    class Meta:
        model = WorkspaceInvitation
        fields = ('id', 'workspace', 'email', 'role', 'token', 'invited_by', 'invited_by_name', 'is_accepted', 'expires_at', 'created_at')
        read_only_fields = ('id', 'token', 'invited_by', 'is_accepted', 'created_at')


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = AuditLog
        fields = ('id', 'workspace', 'user', 'user_name', 'user_email', 'action', 'module', 'details', 'ip_address', 'created_at')
        read_only_fields = ('id', 'created_at')

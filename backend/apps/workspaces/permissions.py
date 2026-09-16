from rest_framework import permissions
from .models import WorkspaceMembership


class HasWorkspaceAccess(permissions.BasePermission):
    """
    Ensures user is an active member of the requested workspace.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        workspace_id = request.headers.get('x-workspace-id') or request.query_params.get('workspace_id')
        if not workspace_id:
            # Let view handle default or query
            return True

        membership = WorkspaceMembership.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            is_active=True
        ).first()

        if membership:
            request.workspace = membership.workspace
            request.workspace_role = membership.role
            return True

        return False


class IsWorkspaceAdminOrOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        workspace_id = request.headers.get('x-workspace-id') or request.query_params.get('workspace_id')
        if not workspace_id and hasattr(view, 'get_workspace_id'):
            workspace_id = view.get_workspace_id()

        if not workspace_id:
            return True

        membership = WorkspaceMembership.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            is_active=True
        ).first()

        if membership and membership.role in ('owner', 'admin'):
            request.workspace = membership.workspace
            request.workspace_role = membership.role
            return True

        return False

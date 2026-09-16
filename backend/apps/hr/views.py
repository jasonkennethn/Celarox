from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Department, EmployeeProfile, LeaveRequest, Announcement
from .serializers import (
    DepartmentSerializer,
    EmployeeProfileSerializer,
    LeaveRequestSerializer,
    AnnouncementSerializer
)
from apps.crm.views import get_user_workspace_id


class DepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Department.objects.none()
        return Department.objects.filter(workspace_id=ws_id)

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class EmployeeProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeProfileSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return EmployeeProfile.objects.none()
        return EmployeeProfile.objects.filter(workspace_id=ws_id).select_related('user', 'department')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return LeaveRequest.objects.none()
        return LeaveRequest.objects.filter(workspace_id=ws_id).select_related('employee__user', 'employee__department', 'reviewed_by')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        emp = EmployeeProfile.objects.filter(workspace_id=ws_id, user=self.request.user).first()
        if not emp:
            emp = EmployeeProfile.objects.create(workspace_id=ws_id, user=self.request.user)
        serializer.save(workspace_id=ws_id, employee=emp)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        leave = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ('approved', 'rejected'):
            return Response({'error': 'Status must be approved or rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = new_status
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.save()

        return Response(LeaveRequestSerializer(leave).data)


class AnnouncementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return Announcement.objects.none()
        return Announcement.objects.filter(workspace_id=ws_id).select_related('author')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id, author=self.request.user)

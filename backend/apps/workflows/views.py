from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import WorkflowRule, WorkflowAction, WorkflowExecutionLog
from .serializers import WorkflowRuleSerializer, WorkflowActionSerializer, WorkflowExecutionLogSerializer
from .engine import trigger_workflow_event
from apps.crm.views import get_user_workspace_id


class WorkflowRuleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkflowRuleSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return WorkflowRule.objects.none()
        return WorkflowRule.objects.filter(workspace_id=ws_id).prefetch_related('actions')

    def perform_create(self, serializer):
        ws_id = get_user_workspace_id(self.request)
        serializer.save(workspace_id=ws_id)

    @action(detail=True, methods=['post'])
    def test_run(self, request, pk=None):
        rule = self.get_object()
        results = trigger_workflow_event(
            workspace_id=rule.workspace_id,
            trigger_event=rule.trigger_event,
            context_data=request.data or {'test': True, 'name': 'Manual Test Run'}
        )
        return Response({'message': 'Test execution completed.', 'results': results})

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        rule = self.get_object()
        logs = rule.execution_logs.all()[:50]
        return Response(WorkflowExecutionLogSerializer(logs, many=True).data)


class WorkflowExecutionLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkflowExecutionLogSerializer

    def get_queryset(self):
        ws_id = get_user_workspace_id(self.request)
        if not ws_id:
            return WorkflowExecutionLog.objects.none()
        return WorkflowExecutionLog.objects.filter(rule__workspace_id=ws_id)

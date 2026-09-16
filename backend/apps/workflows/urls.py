from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowRuleViewSet, WorkflowExecutionLogViewSet

router = DefaultRouter()
router.register(r'rules', WorkflowRuleViewSet, basename='workflow_rules')
router.register(r'logs', WorkflowExecutionLogViewSet, basename='workflow_logs')

urlpatterns = [
    path('', include(router.urls)),
]

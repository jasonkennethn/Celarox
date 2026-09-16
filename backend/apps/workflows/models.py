import uuid
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace


class WorkflowRule(models.Model):
    TRIGGER_CHOICES = (
        ('deal.won', 'When Deal is Won'),
        ('deal.created', 'When Deal is Created'),
        ('invoice.paid', 'When Invoice is Paid'),
        ('invoice.overdue', 'When Invoice is Overdue'),
        ('task.completed', 'When Task is Completed'),
        ('form.submitted', 'When Form is Submitted'),
        ('member.joined', 'When New Member Joins'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='workflow_rules')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    trigger_event = models.CharField(max_length=64, choices=TRIGGER_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_workflow_rules'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.trigger_event})"


class WorkflowAction(models.Model):
    ACTION_CHOICES = (
        ('send_email', 'Send Transactional Email via Brevo'),
        ('create_task', 'Create Follow-up Task'),
        ('send_notification', 'Send Internal Notification'),
        ('create_invoice', 'Draft Invoice'),
        ('webhook', 'Trigger External Webhook'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rule = models.ForeignKey(WorkflowRule, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=64, choices=ACTION_CHOICES)
    config = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'celarox_workflow_actions'
        ordering = ['order']

    def __str__(self):
        return f"{self.action_type} for {self.rule.name}"


class WorkflowExecutionLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rule = models.ForeignKey(WorkflowRule, on_delete=models.CASCADE, related_name='execution_logs')
    trigger_event = models.CharField(max_length=64)
    context_data = models.JSONField(default=dict)
    status = models.CharField(max_length=32, default='success')
    output = models.JSONField(default=dict)
    executed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_workflow_execution_logs'
        ordering = ['-executed_at']

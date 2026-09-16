import uuid
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace
from apps.authentication.models import User


class DynamicForm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='forms')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    is_published = models.BooleanField(default=True)
    submit_button_text = models.CharField(max_length=64, default='Submit')
    success_message = models.TextField(default='Thank you! Your response has been recorded.')
    redirect_url = models.URLField(max_length=512, blank=True, default='')
    fields_schema = models.JSONField(default=list)  # List of field configs: [{id, name, label, type, required, options}]
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_dynamic_forms'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.workspace.name})"


class FormSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(DynamicForm, on_delete=models.CASCADE, related_name='submissions')
    data = models.JSONField(default=dict)
    submitter_email = models.EmailField(blank=True, default='')
    submitter_name = models.CharField(max_length=150, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_form_submissions'
        ordering = ['-created_at']


class SupportTicket(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('waiting_on_customer', 'Waiting on Customer'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='support_tickets')
    ticket_number = models.CharField(max_length=32, db_index=True)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=32, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='open')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_support_tickets'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.ticket_number}] {self.subject} ({self.status})"


class TicketMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sender_type = models.CharField(max_length=32, choices=(('agent', 'Support Agent'), ('customer', 'Customer')), default='agent')
    sender_name = models.CharField(max_length=150)
    message = models.TextField()
    attachment_url = models.URLField(max_length=1024, blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_ticket_messages'
        ordering = ['created_at']

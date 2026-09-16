import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace
from apps.authentication.models import User


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='crm_companies')
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, blank=True, default='')
    industry = models.CharField(max_length=128, blank=True, default='')
    phone = models.CharField(max_length=64, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    website = models.URLField(max_length=255, blank=True, default='')
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=128, blank=True, default='')
    country = models.CharField(max_length=128, blank=True, default='')
    annual_revenue = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    employee_count = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_crm_companies'
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Contact(models.Model):
    STATUS_CHOICES = (
        ('lead', 'Lead'),
        ('prospect', 'Prospect'),
        ('customer', 'Customer'),
        ('inactive', 'Inactive'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='crm_contacts')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='contacts')
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=64, blank=True, default='')
    job_title = models.CharField(max_length=128, blank=True, default='')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='lead')
    is_primary = models.BooleanField(default=False)
    avatar_url = models.URLField(max_length=1024, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_crm_contacts'
        ordering = ['first_name', 'last_name']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Pipeline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='crm_pipelines')
    name = models.CharField(max_length=128, default='Sales Pipeline')
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_crm_pipelines'

    def __str__(self):
        return f"{self.name} - {self.workspace.name}"


class DealStage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='stages')
    name = models.CharField(max_length=128)
    order = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=32, default='#6366f1')
    win_probability = models.PositiveIntegerField(default=50)

    class Meta:
        db_table = 'celarox_crm_deal_stages'
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.win_probability}%)"


class Deal(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='crm_deals')
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='deals')
    stage = models.ForeignKey(DealStage, on_delete=models.CASCADE, related_name='deals')
    name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=8, default='USD')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_deals')
    expected_close_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='open')
    loss_reason = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_crm_deals'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.currency} {self.value}"


class CRMActivity(models.Model):
    ACTIVITY_TYPES = (
        ('note', 'Note'),
        ('call', 'Call'),
        ('meeting', 'Meeting'),
        ('email', 'Email'),
        ('stage_change', 'Stage Change'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='crm_activities')
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    activity_type = models.CharField(max_length=32, choices=ACTIVITY_TYPES, default='note')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_crm_activities'
        ordering = ['-created_at']

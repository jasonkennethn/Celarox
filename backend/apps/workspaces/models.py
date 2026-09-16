import uuid
from django.db import models
from django.utils.timezone import now as django_now
from django.utils.text import slugify
from apps.authentication.models import User


class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_workspaces')
    logo_url = models.URLField(max_length=1024, blank=True, default='')

    industry = models.CharField(max_length=128, blank=True, default='Technology')
    company_size = models.CharField(max_length=64, blank=True, default='1-10')
    website = models.URLField(max_length=255, blank=True, default='')
    currency = models.CharField(max_length=8, default='USD')
    timezone = models.CharField(max_length=64, default='UTC')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=django_now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_workspaces'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or 'workspace'
            unique_slug = base_slug
            counter = 1
            while Workspace.objects.filter(slug=unique_slug).exclude(id=self.id).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class WorkspaceMembership(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
        ('guest', 'Guest'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workspace_memberships')
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='member')
    job_title = models.CharField(max_length=128, blank=True, default='')
    department = models.CharField(max_length=128, blank=True, default='General')
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(default=django_now)

    class Meta:
        db_table = 'celarox_workspace_memberships'
        unique_together = ('workspace', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.workspace.name} ({self.role})"


class WorkspaceInvitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField(max_length=255)
    role = models.CharField(max_length=32, choices=WorkspaceMembership.ROLE_CHOICES, default='member')
    token = models.CharField(max_length=128, unique=True, db_index=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')
    is_accepted = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'celarox_workspace_invitations'


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=128)
    module = models.CharField(max_length=64)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'celarox_audit_logs'
        ordering = ['-created_at']

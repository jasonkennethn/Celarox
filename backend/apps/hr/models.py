import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace
from apps.authentication.models import User


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_hr_departments'
        ordering = ['name']

    def __str__(self):
        return self.name


class EmployeeProfile(models.Model):
    EMPLOYMENT_TYPES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contractor'),
        ('intern', 'Intern'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='employees')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employee_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    employee_id = models.CharField(max_length=64, blank=True, default='')
    designation = models.CharField(max_length=150, blank=True, default='')
    employment_type = models.CharField(max_length=32, choices=EMPLOYMENT_TYPES, default='full_time')
    join_date = models.DateField(default=timezone.now)
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=8, default='USD')
    emergency_contact = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_hr_employees'
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"{self.user.full_name} ({self.designation})"


class LeaveRequest(models.Model):
    LEAVE_TYPES = (
        ('annual', 'Annual Paid Leave'),
        ('sick', 'Sick Leave'),
        ('casual', 'Casual Leave'),
        ('unpaid', 'Unpaid Leave'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='leave_requests')
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=32, choices=LEAVE_TYPES, default='annual')
    start_date = models.DateField()
    end_date = models.DateField()
    days_count = models.PositiveIntegerField(default=1)
    reason = models.TextField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leaves')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_hr_leaves'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.user.full_name} - {self.leave_type} ({self.status})"


class Announcement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_hr_announcements'
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title

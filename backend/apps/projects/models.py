import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace
from apps.authentication.models import User


class Project(models.Model):
    STATUS_CHOICES = (
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    )
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='active')
    priority = models.CharField(max_length=32, choices=PRIORITY_CHOICES, default='medium')
    lead = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_projects')
    color = models.CharField(max_length=32, default='#4f46e5')
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_projects'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TaskBoard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='boards')
    name = models.CharField(max_length=128, default='Main Board')
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_task_boards'


class TaskColumn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    board = models.ForeignKey(TaskBoard, on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=128)
    order = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=32, default='#64748b')

    class Meta:
        db_table = 'celarox_task_columns'
        ordering = ['order']

    def __str__(self):
        return self.name


class Task(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='tasks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    board = models.ForeignKey(TaskBoard, on_delete=models.CASCADE, related_name='tasks')
    column = models.ForeignKey(TaskColumn, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=32, choices=PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    due_date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
    actual_hours = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_tasks'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class SubTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_subtasks'
        ordering = ['order']


class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_comments')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_task_comments'
        ordering = ['created_at']


class TimeLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='time_logs')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_logs')
    hours_spent = models.DecimalField(max_digits=6, decimal_places=2)
    date = models.DateField(default=timezone.now)
    description = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_time_logs'
        ordering = ['-date', '-created_at']

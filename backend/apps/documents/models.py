import uuid
from django.db import models
from django.utils import timezone
from apps.workspaces.models import Workspace
from apps.authentication.models import User


class DocumentFolder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='doc_folders')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    name = models.CharField(max_length=150)
    color = models.CharField(max_length=32, default='#4f46e5')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'celarox_document_folders'
        ordering = ['name']

    def __str__(self):
        return self.name


class Document(models.Model):
    PROVIDER_CHOICES = (
        ('cloudinary', 'Cloudinary'),
        ('google_drive', 'Google Drive'),
        ('link', 'External Link'),
    )
    FILE_TYPE_CHOICES = (
        ('pdf', 'PDF Document'),
        ('image', 'Image'),
        ('doc', 'Word/Document'),
        ('spreadsheet', 'Spreadsheet'),
        ('presentation', 'Presentation'),
        ('archive', 'ZIP/Archive'),
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='documents')
    folder = models.ForeignKey(DocumentFolder, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    title = models.CharField(max_length=255)
    file_url = models.URLField(max_length=1024)
    file_type = models.CharField(max_length=32, choices=FILE_TYPE_CHOICES, default='other')
    file_size = models.BigIntegerField(default=0)  # in bytes
    storage_provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES, default='cloudinary')
    cloudinary_public_id = models.CharField(max_length=255, blank=True, default='')
    google_drive_id = models.CharField(max_length=255, blank=True, default='')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_starred = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'celarox_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.storage_provider})"

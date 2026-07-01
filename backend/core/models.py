from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage


class WebsiteSettings(models.Model):
    logo = models.ImageField(
        upload_to="website/logo/", storage=MediaCloudinaryStorage(), blank=True, null=True
    )
    favicon = models.ImageField(
        upload_to="website/favicon/", storage=MediaCloudinaryStorage(), blank=True, null=True
    )
    site_name = models.CharField(max_length=255, default="Celarox")
    site_description = models.TextField(
        default="Celarox is a unified business platform that helps organizations launch, manage, and grow from a single connected ecosystem."
    )

    class Meta:
        verbose_name_plural = "Website Settings"

    def __str__(self):
        return self.site_name


class Section(models.Model):
    SECTION_TYPES = [
        ("hero", "Hero"),
        ("products", "Products"),
        ("features", "Features"),
        ("testimonials", "Testimonials"),
        ("contact", "Contact"),
        ("custom", "Custom"),
    ]

    title = models.CharField(max_length=255)
    section_type = models.CharField(max_length=50, choices=SECTION_TYPES, default="custom")
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    content = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Element(models.Model):
    ELEMENT_TYPES = [
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
        ("button", "Button"),
        ("card", "Card"),
        ("heading", "Heading"),
    ]

    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="elements"
    )
    element_type = models.CharField(max_length=50, choices=ELEMENT_TYPES)
    content = models.JSONField(default=dict, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.element_type} - {self.section.title}"

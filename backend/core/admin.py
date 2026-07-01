from django.contrib import admin
from .models import WebsiteSettings, Section, Element


@admin.register(WebsiteSettings)
class WebsiteSettingsAdmin(admin.ModelAdmin):
    list_display = ["site_name"]


class ElementInline(admin.TabularInline):
    model = Element
    extra = 1


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ["title", "section_type", "order", "is_active"]
    list_editable = ["order", "is_active"]
    inlines = [ElementInline]


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ["element_type", "section", "order"]
    list_editable = ["order"]

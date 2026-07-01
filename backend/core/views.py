from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import WebsiteSettings, Section, Element
from .serializers import (
    WebsiteSettingsSerializer,
    SectionSerializer,
    ElementSerializer,
)


class WebsiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = WebsiteSettings.objects.all()
    serializer_class = WebsiteSettingsSerializer
    permission_classes = [IsAdminUser]


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAdminUser]


class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer
    permission_classes = [IsAdminUser]

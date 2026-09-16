"""
Celarox Enterprise URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'Celarox Enterprise Core API',
        'version': '1.0.0',
        'database': 'connected'
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='api_health'),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/crm/', include('apps.crm.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/finance/', include('apps.finance.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/workflows/', include('apps.workflows.urls')),
    path('api/hr/', include('apps.hr.urls')),
    path('api/forms/', include('apps.forms_support.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

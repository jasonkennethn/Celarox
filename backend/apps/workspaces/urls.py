from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkspaceViewSet, AcceptInvitationView

router = DefaultRouter()
router.register(r'', WorkspaceViewSet, basename='workspaces')

urlpatterns = [
    path('invitations/accept/', AcceptInvitationView.as_view(), name='accept_invitation'),
    path('', include(router.urls)),
]

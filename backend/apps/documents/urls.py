from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentFolderViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'folders', DocumentFolderViewSet, basename='document_folders')
router.register(r'files', DocumentViewSet, basename='document_files')

urlpatterns = [
    path('', include(router.urls)),
]

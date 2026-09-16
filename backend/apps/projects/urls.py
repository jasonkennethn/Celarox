from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, SubTaskViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'subtasks', SubTaskViewSet, basename='subtasks')

urlpatterns = [
    path('', include(router.urls)),
]

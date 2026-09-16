from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet,
    EmployeeProfileViewSet,
    LeaveRequestViewSet,
    AnnouncementViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='hr_departments')
router.register(r'employees', EmployeeProfileViewSet, basename='hr_employees')
router.register(r'leaves', LeaveRequestViewSet, basename='hr_leaves')
router.register(r'announcements', AnnouncementViewSet, basename='hr_announcements')

urlpatterns = [
    path('', include(router.urls)),
]

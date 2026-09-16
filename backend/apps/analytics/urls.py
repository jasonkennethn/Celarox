from django.urls import path
from .views import DashboardOverviewView

urlpatterns = [
    path('overview/', DashboardOverviewView.as_view(), name='analytics_overview'),
    path('dashboard/', DashboardOverviewView.as_view(), name='analytics_dashboard'),
]

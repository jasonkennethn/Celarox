from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientBillingProfileViewSet,
    InvoiceViewSet,
    ExpenseViewSet,
    FinanceOverviewViewSet
)

router = DefaultRouter()
router.register(r'clients', ClientBillingProfileViewSet, basename='finance_clients')
router.register(r'invoices', InvoiceViewSet, basename='finance_invoices')
router.register(r'expenses', ExpenseViewSet, basename='finance_expenses')
router.register(r'overview', FinanceOverviewViewSet, basename='finance_overview')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DynamicFormViewSet,
    PublicFormView,
    PublicContactInquiryView,
    SupportTicketViewSet
)

router = DefaultRouter()
router.register(r'forms', DynamicFormViewSet, basename='forms')
router.register(r'tickets', SupportTicketViewSet, basename='tickets')

urlpatterns = [
    path('public/forms/<slug:slug>/', PublicFormView.as_view(), name='public_form_view'),
    path('public/contact/', PublicContactInquiryView.as_view(), name='public_contact_inquiry'),
    path('', include(router.urls)),
]

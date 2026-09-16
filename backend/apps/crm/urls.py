from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet,
    ContactViewSet,
    PipelineViewSet,
    DealViewSet,
    CRMActivityViewSet
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='crm_companies')
router.register(r'contacts', ContactViewSet, basename='crm_contacts')
router.register(r'pipelines', PipelineViewSet, basename='crm_pipelines')
router.register(r'deals', DealViewSet, basename='crm_deals')
router.register(r'activities', CRMActivityViewSet, basename='crm_activities')

urlpatterns = [
    path('', include(router.urls)),
]

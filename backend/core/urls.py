from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    WebsiteSettingsViewSet,
    SectionViewSet,
    ElementViewSet,
)

router = DefaultRouter()
router.register(r"settings", WebsiteSettingsViewSet)
router.register(r"sections", SectionViewSet)
router.register(r"elements", ElementViewSet)

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from django.conf import settings

# Swagger imports
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from orders import views as order_views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Swagger schema view
schema_view = get_schema_view(
    openapi.Info(
        title="E-Commerce API",
        default_version='v1',
        description="API documentation for the product catalog and order system",
        contact=openapi.Contact(email="support@example.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# Non-translatable routes
urlpatterns = [
    # Language switch endpoint
    path('i18n/', include('django.conf.urls.i18n')),

    # Auth and OAuth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('oauth2init/', order_views.oauth2_init, name='oauth2_init'),
    # path('oauth2callback/', order_views.oauth2_callback, name='oauth2_callback'),

    # Swagger docs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Translatable routes 
urlpatterns += i18n_patterns(
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/catalog/', include('catalog.urls')),
    path('api/orders/', include('orders.urls')),
)

# Media file serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

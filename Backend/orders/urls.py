# orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'wilaya-delivery', views.WilayaDeliveryViewSet)

urlpatterns = [
    # ORDER ENDPOINTS
    path('', views.OrderCreateView.as_view(), name='order-create'),  # POST
    path('my-orders/', views.OrderHistoryView.as_view(), name='order-history'),  # GET
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),  # GET, PUT, DELETE
    
    # DELIVERY ENDPOINTS
    path('', include(router.urls)),  # For wilaya-delivery/ (GET, POST, PUT, DELETE)
    path('wilaya-delivery/list/', views.WilayaDeliveryListView.as_view(), name='wilaya-delivery-list'),  # GET only
    path('get-delivery-price/', views.GetDeliveryPriceView.as_view(), name='get-delivery-price'),  # GET
]
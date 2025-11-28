# serializers.py
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Order, OrderItem

# serializers.py - Update OrderItemSerializer
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'quantity', 'product_name', 'price', 'color',
            'hauteur', 'largeur', 'carr'  # Add measurement fields
        ]
        extra_kwargs = {
            'product': {'label': _("Product")},
            'quantity': {'label': _("Quantity")},
            'product_name': {'label': _("Product Name")},
            'price': {'label': _("Price")},
            'color': {'label': _("Color")},
            'hauteur': {'label': _("Hauteur"), 'required': False},
            'largeur': {'label': _("Largeur"), 'required': False},
            'carr': {'label': _("Carr"), 'required': False},
        }
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, label=_("Items"))

    class Meta:
        model = Order
        fields = [
            'id', 'client', 'guest_email', 'guest_name', 'guest_phone', 
            'guest_wilaya', 'guest_address', 'created_at', 'is_sent', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'client']
        extra_kwargs = {
            'client': {'label': _("Client")},
            'guest_email': {'label': _("Guest Email"), 'required': False},
            'guest_name': {'label': _("Guest Name"), 'required': False},
            'guest_phone': {'label': _("Guest Phone"), 'required': False},
            'guest_wilaya': {'label': _("Guest Wilaya"), 'required': False},
            'guest_address': {'label': _("Guest Address"), 'required': False},
            'created_at': {'label': _("Created At")},
            'is_sent': {'label': _("Is Sent")},
        }

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Create order - client will be set by the view's perform_create
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        instance.is_sent = validated_data.get('is_sent', instance.is_sent)
        
        # Update guest info if provided
        if not instance.client:  # Only update guest info for guest orders
            instance.guest_email = validated_data.get('guest_email', instance.guest_email)
            instance.guest_name = validated_data.get('guest_name', instance.guest_name)
            instance.guest_phone = validated_data.get('guest_phone', instance.guest_phone)
            instance.guest_wilaya = validated_data.get('guest_wilaya', instance.guest_wilaya)
            instance.guest_address = validated_data.get('guest_address', instance.guest_address)
        
        instance.save()

        if items_data:
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        return instance
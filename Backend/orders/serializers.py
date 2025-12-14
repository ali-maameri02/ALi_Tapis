# serializers.py
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Order, OrderItem, WilayaDelivery

# serializers.py - Update OrderItemSerializer
# serializers.py - Final version
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'product_name',  'longueur', 'price', 'color']

        extra_kwargs = {
            'product': {'label': _("Product")},
            'quantity': {'label': _("Quantity")},
            'product_name': {'label': _("Product Name")},
            'price': {'label': _("Price")},
            'color': {'label': _("Color"), 'required': False},
            'longueur': {'label': _("longueur"), 'required': False},
        }
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, label=_("Items"))

    class Meta:
        model = Order
        fields = [
    'id', 'client', 'guest_email', 'guest_name', 'guest_phone',
    'guest_wilaya', 'guest_address',
    'created_at', 'is_sent', 'delivery_price', 'total_price', 'items'
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
     order = Order.objects.create(**validated_data)

     total_items_price = 0

     for item_data in items_data:
        item = OrderItem.objects.create(order=order, **item_data)
        total_items_price += item.price

    # DELIVERY PRICE BASED ON WILAYA
     from .models import WilayaDelivery
     if order.guest_wilaya:
        try:
            delivery = WilayaDelivery.objects.get(name=order.guest_wilaya)
            order.delivery_price = delivery.delivery_price
        except WilayaDelivery.DoesNotExist:
            order.delivery_price = 0

    # Final total
     order.total_price = total_items_price + order.delivery_price
     order.save()

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
    
    
class WilayaDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WilayaDelivery
        fields = ['id', 'name', 'delivery_price']
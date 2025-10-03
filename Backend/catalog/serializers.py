# pylint: disable=no-member
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _  
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image']
        extra_kwargs = {
            'name': {'label': _("Category Name")},
            'description': {'label': _("Description")},
            'image': {'label': _("Image")},
        }
# serializers.py
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'color', 'color_name', 'order'] 
        extra_kwargs = {
            'image': {'label': _("Image")},
        }

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True, label=_("Category"))
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        label=_("Category")
    )
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price',
            'is_available', 'created_at', 'image',
            'category', 'category_id', 'images'
        ]

        extra_kwargs = {
            'name': {'label': _("Product Name")},
            'description': {'label': _("Description")},
            'price': {'label': _("Price")},
            'is_available': {'label': _("Available")},
            'created_at': {'label': _("Created At")},
            'image': {'label': _("Image")},
        }

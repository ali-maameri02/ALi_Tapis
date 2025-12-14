from django.db import models
from django.utils.translation import gettext_lazy as _  
from colorfield.fields import ColorField  # Add this import

class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Category Name")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    image = models.ImageField(
        upload_to='category_images/',
        null=True,
        blank=True,
        verbose_name=_("Image")
    )

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    def __str__(self):
        return str(self.name)

class ProductImage(models.Model):
    product = models.ForeignKey(
        'Product',
        related_name='images',
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    image = models.ImageField(
        upload_to='product_images/',
        verbose_name=_("Image")
    )
    color = ColorField(
        default='#FFFFFF',
        verbose_name=_("Color"),
        help_text=_("Select the dominant color of this product image")
    )
    color_name = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Color Name"),
        help_text=_("Optional: Name of the color (e.g., Red, Blue, Black)")
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Ordre d'affichage")
    )

    class Meta:
        ordering = ['order']
        verbose_name = _("Image du produit")
        verbose_name_plural = _("Images du produit")

    def __str__(self):
        color_display = self.color_name or self.color
        return f"Image {self.id} for {self.product.name} ({color_display})"

class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.CASCADE,
        verbose_name=_("Category")
    )
    name = models.CharField(
        max_length=255,
        verbose_name=_("Product Name")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_("Price")
    )
    is_available = models.BooleanField(
        default=True,
        verbose_name=_("Available")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    image = models.ImageField(
        upload_to='product_images/',
        null=True,
        blank=True,
        verbose_name=_("Main Image")  # Optional: keep as fallback
    )
    
    metre_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    poids = models.DecimalField(
        _("Poids (kg)"),
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Poids en kilogrammes")
    ) 

    class Meta:
        verbose_name = _("Produit")
        verbose_name_plural = _("Produits")

    def __str__(self):
        return str(self.name)
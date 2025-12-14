from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from catalog.models import Product





class WilayaDelivery(models.Model):
    name = models.CharField(_("Wilaya"), max_length=100, unique=True)
    delivery_price = models.DecimalField(_("Prix de livraison"), max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _("Prix de livraison par wilaya")
        verbose_name_plural = _("Prix de livraison par wilaya")

    def __str__(self):
        return f"{self.name} - {self.delivery_price} DA"


class Order(models.Model):
    # For authenticated users
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_("Client"),
        null=True,
        blank=True
    )

    # For guest users
    guest_email = models.EmailField(_("Email de l’invité"), blank=True, null=True)
    guest_name = models.CharField(_("Nom de l’invité"), max_length=255, blank=True)
    guest_phone = models.CharField(_("Téléphone de l’invité"), max_length=20, blank=True)
    guest_wilaya = models.CharField(_("Wilaya de l’invité"), max_length=100, blank=True)
    guest_address = models.TextField(_("Adresse de l’invité"), blank=True)

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    is_sent = models.BooleanField(default=False, verbose_name=_("Envoyée"))
    delivery_price = models.DecimalField(_("Prix livraison"), max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(_("Prix total commande"), max_digits=12, decimal_places=2, default=0)
    class Meta:
        verbose_name = _("Commande")
        verbose_name_plural = _("Commandes")

    def __str__(self):
        if self.client:
            return _("Commande n°%(id)s par %(client)s") % {"id": self.id, "client": self.client}
        else:
            return _("Commande n°%(id)s par %(nom)s (Invité)") % {"id": self.id, "nom": self.guest_name}


# orders/models.py - Update the OrderItem model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    quantity = models.PositiveIntegerField(default=1)
    product_name = models.CharField(_("Nom du produit"), max_length=255, blank=True)
    
    # NEW FIELDS
    # metre_price = models.DecimalField(_("Prix par mètre"), max_digits=10, decimal_places=2, default=0)
    longueur = models.DecimalField(_("Longueur (m)"), max_digits=8, decimal_places=2, null=True, blank=True)
    color = models.CharField(_("Couleur"), max_length=100, blank=True, null=True)  # ADD THIS LINE
    
    price = models.DecimalField(_("Prix total"), max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        # Auto name
        if not self.product_name:
            self.product_name = self.product.name

        # Auto metre_price from product
        if self.product and hasattr(self.product, "metre_price"):
            self.metre_price = self.product.metre_price

        # Compute final price = metre_price × longueur × quantity
        if self.longueur:
            self.price = self.metre_price * self.longueur * self.quantity

        super().save(*args, **kwargs)
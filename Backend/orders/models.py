from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from catalog.models import Product


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

    class Meta:
        verbose_name = _("Commande")
        verbose_name_plural = _("Commandes")

    def __str__(self):
        if self.client:
            return _("Commande n°%(id)s par %(client)s") % {"id": self.id, "client": self.client}
        else:
            return _("Commande n°%(id)s par %(nom)s (Invité)") % {"id": self.id, "nom": self.guest_name}


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='items',
        on_delete=models.CASCADE,
        verbose_name=_("Commande")
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name=_("Quantité"))

    # Additional fields for order tracking
    product_name = models.CharField(_("Nom du produit"), max_length=255, blank=True)
    price = models.DecimalField(_("Prix"), max_digits=10, decimal_places=2, default=0)
    color = models.CharField(_("Couleur"), max_length=100, blank=True)

    # Measurement fields
    hauteur = models.DecimalField(_("Hauteur"), max_digits=8, decimal_places=2, null=True, blank=True)
    largeur = models.DecimalField(_("Largeur"), max_digits=8, decimal_places=2, null=True, blank=True)
    carr = models.DecimalField(_("Carré"), max_digits=8, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = _("Article de commande")
        verbose_name_plural = _("Articles de commande")

    def __str__(self):
        return _("%(quantité)s × %(produit)s") % {"quantité": self.quantity, "produit": self.product.name}

    def save(self, *args, **kwargs):
        # Auto-populate product name if not set
        if not self.product_name and self.product:
            self.product_name = self.product.name
        super().save(*args, **kwargs)

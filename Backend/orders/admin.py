from django.contrib import admin
from django.urls import path, reverse
from django.utils.html import format_html, mark_safe
from django.shortcuts import render
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _
import csv
import xlwt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import io
from datetime import datetime
from decimal import Decimal

from .models import Order, OrderItem, WilayaDelivery


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    autocomplete_fields = ['product']
    readonly_fields = ['image_produit', 'sous_total_display', 'longueur_display', 'metre_price_display']
    
    def image_produit(self, obj):
        """Display product image in inline"""
        if obj.product and obj.product.image:
            return format_html(
                '<img src="{}" style="max-width: 80px; max-height: 80px; border-radius: 4px;" />',
                obj.product.image.url
            )
        return format_html('<span style="color: #999;">{}</span>', _('Aucune image'))
    image_produit.short_description = _('Image Produit')
    
    def sous_total_display(self, obj):
        """Display subtotal in inline"""
        # Use product.metre_price instead of item.metre_price
        if obj.longueur and obj.product and hasattr(obj.product, 'metre_price') and obj.product.metre_price:
            try:
                # Calculate using product.metre_price * longueur * quantity
                metre_price = Decimal(str(obj.product.metre_price))
                longueur = Decimal(str(obj.longueur))
                total = metre_price * longueur * obj.quantity
                return f"{total:.2f} DA"
            except (ValueError, TypeError, AttributeError):
                pass
        
        # Fallback to standard price
        total = obj.quantity * Decimal(str(obj.price))
        return f"{total:.2f} DA"
    sous_total_display.short_description = _('Sous-total')
    
    def longueur_display(self, obj):
        """Display longueur in inline"""
        if obj.longueur:
            return f"{obj.longueur} m"
        return "-"
    longueur_display.short_description = _('Longueur')
    
    def metre_price_display(self, obj):
        """Display metre_price in inline from product"""
        if obj.product and hasattr(obj.product, 'metre_price') and obj.product.metre_price:
            try:
                return f"{Decimal(str(obj.product.metre_price)):.2f} DA/m"
            except (ValueError, TypeError):
                pass
        return "-"
    metre_price_display.short_description = _('Prix au mètre')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    
    list_display = ['id', 'info_client', 'date_creation', 'est_envoye', 'voir_articles', 'delivery_price_display', 'total_commande', 'images_commande']
    list_filter = ['is_sent', 'created_at']
    search_fields = ['client__email', 'client__name', 'guest_email', 'guest_name', 'guest_phone']
    inlines = [OrderItemInline]
    readonly_fields = ['images_commande_display', 'total_commande_display', 'date_creation_display', 'items_summary_display', 'delivery_price_display_detail']
    actions = ['exporter_excel', 'exporter_pdf', 'exporter_csv', 'marquer_comme_envoye', 'marquer_comme_non_envoye']
    
    # French column names
    @admin.display(description=_('ID'))
    def id(self, obj):
        return obj.id

    @admin.display(description=_('Informations Client'))
    def info_client(self, obj):
        """Display client information"""
        if obj.client:
            info_parts = [obj.client.email]
            if obj.client.phone:
                info_parts.append(obj.client.phone)
            return format_html('<span>{}</span>', ' | '.join(info_parts))
        else:
            # For guest orders
            info_parts = []
            if obj.guest_name:
                info_parts.append(obj.guest_name)
            if obj.guest_email:
                info_parts.append(obj.guest_email)
            if obj.guest_phone:
                info_parts.append(obj.guest_phone)
            if obj.guest_wilaya:
                info_parts.append(obj.guest_wilaya)
            if info_parts:
                return format_html('<span style="color: #666;">{}</span>', ' | '.join(info_parts))
            return format_html('<span style="color: #999;">{}</span>', _('Client Invité'))
    
    @admin.display(description=_('Date de Création'))
    def date_creation(self, obj):
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    
    @admin.display(description=_('Est Envoyé'), boolean=True)
    def est_envoye(self, obj):
        return obj.is_sent
    
    @admin.display(description=_('Voir Articles'))
    def voir_articles(self, obj):
        return format_html(
            '<a href="{}" class="button">{}</a>',
            reverse('admin:orders_order_change', args=[obj.id]),
            _('Voir')
        )
    
    @admin.display(description=_('Frais Livraison'))
    def delivery_price_display(self, obj):
        return f"{obj.delivery_price:.2f} DA" if obj.delivery_price else "0.00 DA"
    
    @admin.display(description=_('Total Commande'))
    def total_commande(self, obj):
        """Calculate total price using product.metre_price * longueur + delivery_price"""
        total_items = Decimal('0')
        
        for item in obj.items.all():
            # Check if product has metre_price and item has longueur
            if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                try:
                    # Get metre_price from product
                    metre_price = Decimal(str(item.product.metre_price))
                    longueur = Decimal(str(item.longueur))
                    # Calculate using product.metre_price * longueur * quantity
                    item_total = metre_price * longueur * item.quantity
                except (ValueError, TypeError, AttributeError):
                    # Fallback to standard price from OrderItem
                    item_total = item.quantity * Decimal(str(item.price))
            else:
                # Use standard price from OrderItem
                item_total = item.quantity * Decimal(str(item.price))
            
            total_items += item_total
        
        # Add delivery price
        delivery_price = obj.delivery_price or Decimal('0')
        total = total_items + delivery_price
        return f"{total:.2f} DA"
    
    @admin.display(description=_('Images Commande'))
    def images_commande(self, obj):
        """Display product images thumbnails in list view"""
        items_with_images = obj.items.filter(product__image__isnull=False)[:3]  # Limit to 3 images
        images_html = []
        
        for item in items_with_images:
            if item.product.image:
                images_html.append(
                    format_html(
                        '<img src="{}" style="max-width: 40px; max-height: 40px; border-radius: 4px; margin-right: 5px; border: 1px solid #ddd;" title="{}" />',
                        item.product.image.url,
                        item.product.name
                    )
                )
        
        if images_html:
            return mark_safe(''.join(str(html) for html in images_html))
        return format_html('<span style="color: #999;">{}</span>', _('Aucune image'))
    images_commande.short_description = _('Images')
    
    def images_commande_display(self, obj):
        """Display all product images in detail view"""
        items_with_images = obj.items.filter(product__image__isnull=False)
        
        if not items_with_images:
            return format_html('<span style="color: #999;">{}</span>', _('Aucune image disponible'))
        
        images_html = []
        for item in items_with_images:
            if item.product.image:
                # Calculate item price
                if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                    try:
                        metre_price = Decimal(str(item.product.metre_price))
                        longueur = Decimal(str(item.longueur))
                        item_price = f"{metre_price:.2f} DA/m × {longueur}m × {item.quantity}"
                        item_total = metre_price * longueur * item.quantity
                    except (ValueError, TypeError, AttributeError):
                        price = Decimal(str(item.price))
                        item_price = f"{price:.2f} DA × {item.quantity}"
                        item_total = item.quantity * price
                else:
                    price = Decimal(str(item.price))
                    item_price = f"{price:.2f} DA × {item.quantity}"
                    item_total = item.quantity * price
                
                image_html = format_html(
                    '''
                    <div style="display: inline-block; margin: 10px; text-align: center; vertical-align: top; width: 150px;">
                        <img src="{}" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 2px solid #ddd;" />
                        <div style="margin-top: 5px; font-size: 12px; color: #666; max-width: 140px; word-wrap: break-word;">{} (x{})</div>
                        <div style="font-size: 11px; color: #999;">{}</div>
                        <div style="font-size: 11px; color: #2E86AB; font-weight: bold;">{:.2f} DA</div>
                    </div>
                    ''',
                    item.product.image.url,
                    item.product.name,
                    item.quantity,
                    item_price,
                    item_total
                )
                images_html.append(str(image_html))
        
        if images_html:
            return mark_safe('<div style="display: flex; flex-wrap: wrap; gap: 10px;">' + ''.join(images_html) + '</div>')
        return format_html('<span style="color: #999;">{}</span>', _('Aucune image disponible'))
    images_commande_display.short_description = _('Images des Produits')
    
    def delivery_price_display_detail(self, obj):
        """Display delivery price in detail view"""
        return format_html(
            '<div style="font-size: 16px; font-weight: bold; color: #2E86AB; padding: 10px; background: #f8f9fa; border-radius: 5px;">{} DA</div>',
            f"{obj.delivery_price:.2f}" if obj.delivery_price else "0.00"
        )
    delivery_price_display_detail.short_description = _('Frais de Livraison')
    
    def total_commande_display(self, obj):
        """Display total in detail view with breakdown"""
        total_items = Decimal('0')
        items_breakdown = []
        
        for item in obj.items.all():
            # Check if product has metre_price and item has longueur
            if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                try:
                    # Get metre_price from product
                    metre_price = Decimal(str(item.product.metre_price))
                    longueur = Decimal(str(item.longueur))
                    # Calculate using product.metre_price * longueur * quantity
                    item_total = metre_price * longueur * item.quantity
                    breakdown = f"{metre_price:.2f} DA/m × {longueur}m × {item.quantity} = {item_total:.2f} DA"
                except (ValueError, TypeError, AttributeError):
                    # Fallback to standard price
                    price = Decimal(str(item.price))
                    item_total = item.quantity * price
                    breakdown = f"{price:.2f} DA × {item.quantity} = {item_total:.2f} DA"
            else:
                # Use standard price
                price = Decimal(str(item.price))
                item_total = item.quantity * price
                breakdown = f"{price:.2f} DA × {item.quantity} = {item_total:.2f} DA"
            
            total_items += item_total
            items_breakdown.append(f"{item.product.name}: {breakdown}")
        
        # Add delivery price
        delivery_price = obj.delivery_price or Decimal('0')
        total = total_items + delivery_price
        
        # Create HTML breakdown
        breakdown_html = '<div style="margin-bottom: 15px;">'
        
        # Items breakdown
        if items_breakdown:
            breakdown_html += '<div style="margin-bottom: 10px;">'
            breakdown_html += '<strong style="color: #555;">Articles:</strong><br>'
            for breakdown in items_breakdown:
                breakdown_html += f'<div style="margin-left: 20px; color: #666;">• {breakdown}</div>'
            breakdown_html += f'<div style="margin-left: 20px; margin-top: 5px; font-weight: bold;">Total articles: {total_items:.2f} DA</div>'
            breakdown_html += '</div>'
        
        # Delivery
        breakdown_html += f'<div style="margin-bottom: 10px;">'
        breakdown_html += f'<strong style="color: #555;">Livraison ({obj.guest_wilaya or "Wilaya non spécifiée"}):</strong> '
        breakdown_html += f'<span style="color: #666;">{delivery_price:.2f} DA</span>'
        breakdown_html += '</div>'
        
        # Total
        breakdown_html += f'<div style="border-top: 2px solid #ddd; padding-top: 10px; font-size: 18px; font-weight: bold; color: #2E86AB;">'
        breakdown_html += f'Total à payer: {total:.2f} DA'
        breakdown_html += '</div>'
        
        breakdown_html += '</div>'
        
        return mark_safe(breakdown_html)
    total_commande_display.short_description = _('Détail du Calcul')
    
    def items_summary_display(self, obj):
        """Display summary of items"""
        summary = []
        for item in obj.items.all():
            # Check if product has metre_price and item has longueur
            if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                try:
                    metre_price = Decimal(str(item.product.metre_price))
                    longueur = Decimal(str(item.longueur))
                    summary.append(f"{item.product.name}: {item.quantity} × ({metre_price:.2f} DA/m × {longueur}m)")
                except (ValueError, TypeError, AttributeError):
                    price = Decimal(str(item.price))
                    summary.append(f"{item.product.name}: {item.quantity} × {price:.2f} DA")
            else:
                price = Decimal(str(item.price))
                summary.append(f"{item.product.name}: {item.quantity} × {price:.2f} DA")
        
        return format_html('<br>'.join(summary) if summary else '<span style="color: #999;">{}</span>'.format(_('Aucun article')))
    items_summary_display.short_description = _('Résumé des Articles')
    
    def date_creation_display(self, obj):
        """Display creation date in detail view"""
        return format_html(
            '<div style="font-size: 14px; padding: 8px; background: #f0f0f0; border-radius: 4px;">{}</div>',
            obj.created_at.strftime('%d/%m/%Y à %H:%M:%S')
        )
    date_creation_display.short_description = _('Date de Création')
    
    fieldsets = (
        (_('Informations Client'), {
            'fields': ('client', 'guest_email', 'guest_name', 'guest_phone', 'guest_wilaya', 'guest_address')
        }),
        (_('Statut Commande'), {
            'fields': ('is_sent', 'date_creation_display')
        }),
        (_('Calcul du Prix'), {
            'fields': ('total_commande_display', 'delivery_price_display_detail'),
            'classes': ('wide',)
        }),
        (_('Résumé des Articles'), {
            'fields': ('items_summary_display',),
            'classes': ('collapse',)
        }),
        (_('Images des Produits'), {
            'fields': ('images_commande_display',),
            'classes': ('collapse',)
        }),
    )
    
    # Export actions (updated to use correct calculation)
    @admin.action(description=_('Exporter les commandes sélectionnées en Excel'))
    def exporter_excel(self, request, queryset):
        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = 'attachment; filename="commandes.xls"'
        
        wb = xlwt.Workbook(encoding='utf-8')
        ws = wb.add_sheet('Commandes')
        
        # Style for header
        header_style = xlwt.easyxf('font: bold on; align: vert centre, horiz center')
        
        # French headers
        headers = [
            'ID',
            'Client',
            'Email',
            'Téléphone',
            'Wilaya',
            'Date de Création',
            'Envoyé',
            'Frais Livraison',
            'Total Articles',
            'Total Commande',
            'Nombre d\'Articles',
            'Produits'
        ]
        
        # Write headers
        for col, header in enumerate(headers):
            ws.write(0, col, header, header_style)
        
        # Write data
        for row, order in enumerate(queryset, 1):
            if order.client:
                client_name = order.client.name or order.client.email
                email = order.client.email
                phone = order.client.phone or ''
                wilaya = order.client.wilaya or ''
            else:
                client_name = order.guest_name or _('Client Invité')
                email = order.guest_email or ''
                phone = order.guest_phone or ''
                wilaya = order.guest_wilaya or ''
            
            # Calculate totals
            total_items = Decimal('0')
            products_list = []
            
            for item in order.items.all():
                # Check if product has metre_price and item has longueur
                if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                    try:
                        metre_price = Decimal(str(item.product.metre_price))
                        longueur = Decimal(str(item.longueur))
                        item_total = metre_price * longueur * item.quantity
                        products_list.append(f"{item.product.name}: {item.quantity} × ({metre_price:.2f} DA/m × {longueur}m)")
                    except (ValueError, TypeError, AttributeError):
                        price = Decimal(str(item.price))
                        item_total = item.quantity * price
                        products_list.append(f"{item.product.name}: {item.quantity} × {price:.2f} DA")
                else:
                    price = Decimal(str(item.price))
                    item_total = item.quantity * price
                    products_list.append(f"{item.product.name}: {item.quantity} × {price:.2f} DA")
                
                total_items += item_total
            
            delivery_price = order.delivery_price or Decimal('0')
            total_commande = total_items + delivery_price
            item_count = order.items.count()
            
            ws.write(row, 0, order.id)
            ws.write(row, 1, str(client_name))
            ws.write(row, 2, email)
            ws.write(row, 3, phone)
            ws.write(row, 4, wilaya)
            ws.write(row, 5, order.created_at.strftime('%d/%m/%Y %H:%M'))
            ws.write(row, 6, 'Oui' if order.is_sent else 'Non')
            ws.write(row, 7, f"{delivery_price:.2f}")
            ws.write(row, 8, f"{total_items:.2f}")
            ws.write(row, 9, f"{total_commande:.2f}")
            ws.write(row, 10, item_count)
            ws.write(row, 11, "\n".join(products_list))
        
        wb.save(response)
        return response
    
    @admin.action(description=_('Exporter les commandes sélectionnées en PDF'))
    def exporter_pdf(self, request, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="commandes.pdf"'
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph("Rapport des Commandes", styles['Title'])
        elements.append(title)
        
        # Date
        date_str = Paragraph(f"Généré le: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal'])
        elements.append(date_str)
        
        # Space
        elements.append(Paragraph("<br/><br/>", styles['Normal']))
        
        # Table data
        data = [['ID', 'Client', 'Wilaya', 'Date', 'Livraison', 'Total Articles', 'Total', 'Articles']]
        
        for order in queryset:
            if order.client:
                client_name = order.client.name or order.client.email
                wilaya = order.client.wilaya or ''
            else:
                client_name = order.guest_name or _('Client Invité')
                wilaya = order.guest_wilaya or ''
            
            # Calculate totals
            total_items = Decimal('0')
            products_summary = []
            
            for item in order.items.all():
                # Check if product has metre_price and item has longueur
                if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                    try:
                        metre_price = Decimal(str(item.product.metre_price))
                        longueur = Decimal(str(item.longueur))
                        item_total = metre_price * longueur * item.quantity
                        products_summary.append(f"{item.product.name} ({item.quantity})")
                    except (ValueError, TypeError, AttributeError):
                        item_total = item.quantity * Decimal(str(item.price))
                        products_summary.append(f"{item.product.name} ({item.quantity})")
                else:
                    item_total = item.quantity * Decimal(str(item.price))
                    products_summary.append(f"{item.product.name} ({item.quantity})")
                
                total_items += item_total
            
            delivery_price = order.delivery_price or Decimal('0')
            total_commande = total_items + delivery_price
            
            data.append([
                str(order.id),
                client_name[:20] + "..." if len(client_name) > 20 else client_name,
                wilaya[:15] + "..." if len(wilaya) > 15 else wilaya,
                order.created_at.strftime('%d/%m/%Y'),
                f"{delivery_price:.2f} DA",
                f"{total_items:.2f} DA",
                f"{total_commande:.2f} DA",
                ", ".join(products_summary[:3]) + ("..." if len(products_summary) > 3 else "")
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        return response
    
    @admin.action(description=_('Exporter les commandes sélectionnées en CSV'))
    def exporter_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="commandes.csv"'
        
        writer = csv.writer(response)
        # French headers
        writer.writerow([
            'ID', 'Client', 'Email', 'Téléphone', 'Wilaya', 
            'Date de Création', 'Envoyé', 'Frais Livraison', 'Total Articles', 'Total Commande', 'Nombre d\'Articles', 'Produits'
        ])
        
        for order in queryset:
            if order.client:
                client_name = order.client.name or order.client.email
                email = order.client.email
                phone = order.client.phone or ''
                wilaya = order.client.wilaya or ''
            else:
                client_name = order.guest_name or _('Client Invité')
                email = order.guest_email or ''
                phone = order.guest_phone or ''
                wilaya = order.guest_wilaya or ''
            
            # Calculate totals
            total_items = Decimal('0')
            products_list = []
            
            for item in order.items.all():
                # Check if product has metre_price and item has longueur
                if item.longueur and item.product and hasattr(item.product, 'metre_price') and item.product.metre_price:
                    try:
                        metre_price = Decimal(str(item.product.metre_price))
                        longueur = Decimal(str(item.longueur))
                        item_total = metre_price * longueur * item.quantity
                        products_list.append(f"{item.product.name}: {item.quantity} × ({metre_price:.2f} DA/m × {longueur}m)")
                    except (ValueError, TypeError, AttributeError):
                        price = Decimal(str(item.price))
                        item_total = item.quantity * price
                        products_list.append(f"{item.product.name}: {item.quantity} × {price:.2f} DA")
                else:
                    price = Decimal(str(item.price))
                    item_total = item.quantity * price
                    products_list.append(f"{item.product.name}: {item.quantity} × {price:.2f} DA")
                
                total_items += item_total
            
            delivery_price = order.delivery_price or Decimal('0')
            total_commande = total_items + delivery_price
            item_count = order.items.count()
            
            writer.writerow([
                order.id,
                client_name,
                email,
                phone,
                wilaya,
                order.created_at.strftime('%d/%m/%Y %H:%M'),
                'Oui' if order.is_sent else 'Non',
                f"{delivery_price:.2f} DA",
                f"{total_items:.2f} DA",
                f"{total_commande:.2f} DA",
                item_count,
                " | ".join(products_list)
            ])
        
        return response
    
    @admin.action(description=_('Marquer comme envoyé'))
    def marquer_comme_envoye(self, request, queryset):
        updated = queryset.update(is_sent=True)
        self.message_user(request, f"{updated} commande(s) marquée(s) comme envoyée(s).")
    
    @admin.action(description=_('Marquer comme non envoyé'))
    def marquer_comme_non_envoye(self, request, queryset):
        updated = queryset.update(is_sent=False)
        self.message_user(request, f"{updated} commande(s) marquée(s) comme non envoyée(s).")
    
    def get_queryset(self, request):
        """Optimize queryset to avoid N+1 queries"""
        return super().get_queryset(request).select_related('client').prefetch_related('items__product')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'commande', 'produit', 'image_produit', 'longueur_display', 'metre_price_display', 'quantite', 'prix', 'couleur', 'sous_total']
    list_filter = ['order__is_sent', 'order__created_at']
    search_fields = ['product__name', 'order__client__email', 'order__guest_name']
    autocomplete_fields = ['product', 'order']
    readonly_fields = ['image_produit_display', 'sous_total_display', 'calculation_display']
    
    # French column names
    @admin.display(description=_('ID'))
    def id(self, obj):
        return obj.id
    
    @admin.display(description=_('Commande'))
    def commande(self, obj):
        url = reverse('admin:orders_order_change', args=[obj.order.id])
        return format_html('<a href="{}">Commande #{}</a>', url, obj.order.id)
    
    @admin.display(description=_('Produit'))
    def produit(self, obj):
        return obj.product.name
    
    @admin.display(description=_('Image Produit'))
    def image_produit(self, obj):
        """Display product image in list view"""
        if obj.product and obj.product.image:
            return format_html(
                '<img src="{}" style="max-width: 50px; max-height: 50px; border-radius: 4px; border: 1px solid #ddd;" />',
                obj.product.image.url
            )
        return format_html('<span style="color: #999; font-size: 12px;">{}</span>', _('Aucune image'))
    
    @admin.display(description=_('Longueur'))
    def longueur_display(self, obj):
        if obj.longueur:
            return f"{obj.longueur} m"
        return "-"
    
    @admin.display(description=_('Prix au mètre'))
    def metre_price_display(self, obj):
        """Display metre_price from product"""
        if obj.product and hasattr(obj.product, 'metre_price') and obj.product.metre_price:
            try:
                return f"{Decimal(str(obj.product.metre_price)):.2f} DA/m"
            except (ValueError, TypeError):
                pass
        return "-"
    
    @admin.display(description=_('Quantité'))
    def quantite(self, obj):
        return obj.quantity
    
    @admin.display(description=_('Prix'))
    def prix(self, obj):
        return f"{obj.price} DA"
    
    @admin.display(description=_('Couleur'))
    def couleur(self, obj):
        return obj.color or "-"
    
    @admin.display(description=_('Sous-total'))
    def sous_total(self, obj):
        # Check if product has metre_price and item has longueur
        if obj.longueur and obj.product and hasattr(obj.product, 'metre_price') and obj.product.metre_price:
            try:
                metre_price = Decimal(str(obj.product.metre_price))
                longueur = Decimal(str(obj.longueur))
                total = metre_price * longueur * obj.quantity
                return f"{total:.2f} DA"
            except (ValueError, TypeError, AttributeError):
                pass
        
        # Fallback to standard price
        total = obj.quantity * Decimal(str(obj.price))
        return f"{total:.2f} DA"
    
    def image_produit_display(self, obj):
        """Display larger product image in detail view"""
        if obj.product and obj.product.image:
            return format_html(
                '''
                <div style="text-align: center;">
                    <img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;" />
                    <div style="margin-top: 10px; font-weight: bold;">{}</div>
                </div>
                ''',
                obj.product.image.url,
                obj.product.name
            )
        return format_html('<div style="color: #999; text-align: center;">{}</div>', _('Aucune image disponible'))
    image_produit_display.short_description = _('Image du Produit')
    
    def sous_total_display(self, obj):
        """Display subtotal in detail view"""
        # Check if product has metre_price and item has longueur
        if obj.longueur and obj.product and hasattr(obj.product, 'metre_price') and obj.product.metre_price:
            try:
                metre_price = Decimal(str(obj.product.metre_price))
                longueur = Decimal(str(obj.longueur))
                total = metre_price * longueur * obj.quantity
                calculation = f"{metre_price:.2f} DA/m × {longueur}m × {obj.quantity} = {total:.2f} DA"
            except (ValueError, TypeError, AttributeError):
                price = Decimal(str(obj.price))
                total = obj.quantity * price
                calculation = f"{price:.2f} DA × {obj.quantity} = {total:.2f} DA"
        else:
            price = Decimal(str(obj.price))
            total = obj.quantity * price
            calculation = f"{price:.2f} DA × {obj.quantity} = {total:.2f} DA"
        
        return format_html(
            '''
            <div style="font-size: 16px; font-weight: bold; color: #2E86AB; padding: 8px; background: #f8f9fa; border-radius: 4px; text-align: center;">
                {}<br>
                <small style="font-size: 12px; color: #666; font-weight: normal;">{}</small>
            </div>
            ''',
            f"{total:.2f} DA",
            calculation
        )
    sous_total_display.short_description = _('Sous-total')
    
    def calculation_display(self, obj):
        """Display calculation details"""
        # Check if product has metre_price and item has longueur
        if obj.longueur and obj.product and hasattr(obj.product, 'metre_price') and obj.product.metre_price:
            try:
                metre_price = Decimal(str(obj.product.metre_price))
                calculation = f"Calcul: {metre_price:.2f} DA/m × {obj.longueur}m × {obj.quantity}"
            except (ValueError, TypeError, AttributeError):
                price = Decimal(str(obj.price))
                calculation = f"Calcul: {price:.2f} DA × {obj.quantity}"
        else:
            price = Decimal(str(obj.price))
            calculation = f"Calcul: {price:.2f} DA × {obj.quantity}"
        
        return format_html(
            '<div style="padding: 8px; background: #f0f0f0; border-radius: 4px;">{}</div>',
            calculation
        )
    calculation_display.short_description = _('Calcul du Prix')
    
    fieldsets = (
        (_('Informations Commande'), {
            'fields': ('order', 'product')
        }),
        (_('Détails Article'), {
            'fields': ('quantity', 'price', 'color', 'product_name', 'longueur')
        }),
        (_('Calcul du Prix'), {
            'fields': ('calculation_display',)
        }),
        (_('Image Produit'), {
            'fields': ('image_produit_display',)
        }),
        (_('Sous-total'), {
            'fields': ('sous_total_display',)
        }),
    )


@admin.register(WilayaDelivery)
class WilayaDeliveryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'delivery_price']
    list_display_links = ['id', 'name']
    search_fields = ['name']
    ordering = ['name']


# Add actions to OrderAdmin
OrderAdmin.actions = [
    'exporter_excel',
    'exporter_pdf',
    'exporter_csv',
    'marquer_comme_envoye',
    'marquer_comme_non_envoye',
]
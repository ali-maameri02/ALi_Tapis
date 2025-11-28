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

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    autocomplete_fields = ['product']
    readonly_fields = ['image_produit', 'sous_total_display']
    
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
        total = obj.quantity * float(obj.price)
        return f"{total:.2f} DA"
    sous_total_display.short_description = _('Sous-total')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    
    list_display = ['id', 'info_client', 'date_creation', 'est_envoye', 'voir_articles', 'total_commande', 'images_commande']
    list_filter = ['is_sent', 'created_at']
    search_fields = ['client__email', 'client__name', 'guest_email', 'guest_name', 'guest_phone']
    inlines = [OrderItemInline]
    readonly_fields = ['images_commande_display', 'total_commande_display', 'date_creation_display']
    actions = ['exporter_excel', 'exporter_pdf', 'exporter_csv', 'marquer_comme_envoye', 'marquer_comme_non_envoye']
    
    
    @admin.display(description=_('Hauteur'))
    def hauteur_display(self, obj):
        return f"{obj.hauteur} cm" if obj.hauteur else "-"
    
    @admin.display(description=_('Largeur'))
    def largeur_display(self, obj):
        return f"{obj.largeur} cm" if obj.largeur else "-"
    
    @admin.display(description=_('Carré'))
    def carr_display(self, obj):
        return f"{obj.carr} cm" if obj.carr else "-"
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
    
    @admin.display(description=_('Total Commande'))
    def total_commande(self, obj):
        total = sum(item.quantity * float(item.price) for item in obj.items.all())
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
                image_html = format_html(
                    '''
                    <div style="display: inline-block; margin: 10px; text-align: center; vertical-align: top;">
                        <img src="{}" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 2px solid #ddd;" />
                        <div style="margin-top: 5px; font-size: 12px; color: #666; max-width: 120px; word-wrap: break-word;">{} (x{})</div>
                        <div style="font-size: 11px; color: #999;">{} DA</div>
                    </div>
                    ''',
                    item.product.image.url,
                    item.product.name,
                    item.quantity,
                    float(item.price)
                )
                images_html.append(str(image_html))
        
        if images_html:
            return mark_safe('<div style="display: flex; flex-wrap: wrap; gap: 10px;">' + ''.join(images_html) + '</div>')
        return format_html('<span style="color: #999;">{}</span>', _('Aucune image disponible'))
    images_commande_display.short_description = _('Images des Produits')
    
    def total_commande_display(self, obj):
        """Display total in detail view"""
        total = sum(item.quantity * float(item.price) for item in obj.items.all())
        return format_html(
            '<div style="font-size: 18px; font-weight: bold; color: #2E86AB; padding: 10px; background: #f8f9fa; border-radius: 5px;">{} DA</div>',
            f"{total:.2f}"
        )
    total_commande_display.short_description = _('Total Commande')
    
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
            'fields': ('is_sent', 'date_creation_display', 'total_commande_display')
        }),
        (_('Images des Produits'), {
            'fields': ('images_commande_display',),
            'classes': ('collapse',)
        }),
    )
    
    # Export actions
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
            
            total = sum(item.quantity * float(item.price) for item in order.items.all())
            item_count = order.items.count()
            products_list = ", ".join([f"{item.product.name} (x{item.quantity})" for item in order.items.all()])
            
            ws.write(row, 0, order.id)
            ws.write(row, 1, str(client_name))
            ws.write(row, 2, email)
            ws.write(row, 3, phone)
            ws.write(row, 4, wilaya)
            ws.write(row, 5, order.created_at.strftime('%d/%m/%Y %H:%M'))
            ws.write(row, 6, 'Oui' if order.is_sent else 'Non')
            ws.write(row, 7, f"{total:.2f} DA")
            ws.write(row, 8, item_count)
            ws.write(row, 9, products_list)
        
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
        data = [['ID', 'Client', 'Email', 'Téléphone', 'Wilaya', 'Date', 'Envoyé', 'Total', 'Articles']]
        
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
            
            total = sum(item.quantity * float(item.price) for item in order.items.all())
            item_count = order.items.count()
            
            data.append([
                str(order.id),
                client_name,
                email,
                phone,
                wilaya,
                order.created_at.strftime('%d/%m/%Y'),
                'Oui' if order.is_sent else 'Non',
                f"{total:.2f} DA",
                str(item_count)
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
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
            'Date de Création', 'Envoyé', 'Total Commande', 'Nombre d\'Articles', 'Produits'
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
            
            total = sum(item.quantity * float(item.price) for item in order.items.all())
            item_count = order.items.count()
            products_list = ", ".join([f"{item.product.name} (x{item.quantity})" for item in order.items.all()])
            
            writer.writerow([
                order.id,
                client_name,
                email,
                phone,
                wilaya,
                order.created_at.strftime('%d/%m/%Y %H:%M'),
                'Oui' if order.is_sent else 'Non',
                f"{total:.2f} DA",
                item_count,
                products_list
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
    list_display = ['id', 'commande', 'produit', 'image_produit', 'quantite', 'prix', 'couleur', 'sous_total']
    list_filter = ['order__is_sent', 'order__created_at']
    search_fields = ['product__name', 'order__client__email', 'order__guest_name']
    autocomplete_fields = ['product', 'order']
    readonly_fields = ['image_produit_display', 'sous_total_display']
    
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
        total = obj.quantity * float(obj.price)
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
        total = obj.quantity * float(obj.price)
        return format_html(
            '<div style="font-size: 16px; font-weight: bold; color: #2E86AB; padding: 8px; background: #f8f9fa; border-radius: 4px; text-align: center;">{} DA</div>',
            f"{total:.2f}"
        )
    sous_total_display.short_description = _('Sous-total')
    
    fieldsets = (
        (_('Informations Commande'), {
            'fields': ('order', 'product')
        }),
        (_('Détails Article'), {
            'fields': ('quantity', 'price', 'color', 'product_name')
        }),
        (_('Image Produit'), {
            'fields': ('image_produit_display',)
        }),
        (_('Calculs'), {
            'fields': ('sous_total_display',)
        }),
    )
    OrderAdmin.actions = [
    'exporter_excel',
    'exporter_pdf',
    'exporter_csv',
    'marquer_comme_envoye',
    'marquer_comme_non_envoye',
]
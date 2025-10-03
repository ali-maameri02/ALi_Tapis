from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _  
from .models import Category, Product, ProductImage
from django.contrib.auth.models import Group

admin.site.unregister(Group)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'image_preview')
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;" />', 
                obj.image.url
            )
        return "-"
    image_preview.short_description = _("Image Preview")

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'color', 'color_name', 'order', 'image_preview', 'color_preview')
    readonly_fields = ('image_preview', 'color_preview')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover;" />', 
                obj.image.url
            )
        return "-"
    image_preview.short_description = _("Image Preview")
    
    def color_preview(self, obj):
        return format_html(
            '<div style="width: 30px; height: 30px; background-color: {}; border: 1px solid #ccc; border-radius: 3px;"></div>',
            obj.color
        )
    color_preview.short_description = _("Color")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ('id', 'name', 'price', 'is_available', 'category', 'image_preview')
    list_filter = ('is_available', 'category')
    search_fields = ('name',)
    ordering = ('-created_at',)
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;" />', 
                obj.image.url
            )
        return "-"
    image_preview.short_description = _("Image Preview")
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['image'].help_text = _(
            'After selecting an image, save to see the preview.'
        )
        return form
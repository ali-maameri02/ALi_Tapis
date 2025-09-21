from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User
from django.contrib.auth.models import Group, Permission

# Custom Group Admin to display permissions count
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_permissions_count']
    filter_horizontal = ('permissions',)
    search_fields = ['name']
    
    def get_permissions_count(self, obj):
        return obj.permissions.count()
    get_permissions_count.short_description = _('Permissions Count')

# Custom User Admin
class UserAdmin(BaseUserAdmin):
    model = User
    ordering = ['email']
    list_display = ['email', 'name', 'phone', 'is_staff', 'is_active', 'is_superuser', 'get_groups']
    list_filter = ['is_staff', 'is_active', 'is_superuser', 'groups']
    search_fields = ['email', 'name', 'phone']
    verbose_name = _("User")
    verbose_name_plural = _("Users")
    
    # Add filter horizontal for groups and user_permissions
    filter_horizontal = ('groups', 'user_permissions',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('name', 'phone', 'wilaya', 'address')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse', 'wide'),
        }),
        (_('Important dates'), {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'name', 'phone', 'wilaya', 'address', 'password1', 'password2',
                'is_active', 'is_staff', 'is_superuser', 'groups'
            ),
        }),
    )
    
    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_groups.short_description = _('Groups')

# Register your models here
admin.site.register(User, UserAdmin)

# Unregister and re-register Group with custom admin
admin.site.unregister(Group)  # Unregister first
admin.site.register(Group, GroupAdmin)

# Add this to your accounts/admin.py if you want to manage permissions directly
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'codename', 'content_type']
    list_filter = ['content_type']
    search_fields = ['name', 'codename']

# Then register it (uncomment if you want this)
admin.site.register(Permission, PermissionAdmin)
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group
from .models import User

# Unregister the default Group admin if needed
# admin.site.unregister(Group)

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_permissions_count']
    filter_horizontal = ('permissions',)
    search_fields = ['name']
    
    def get_permissions_count(self, obj):
        return obj.permissions.count()
    get_permissions_count.short_description = _('Permissions Count')

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
        (_('Personal info'), {'fields': ('name', 'phone')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse', 'wide'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'name', 'phone', 'password1', 'password2',
                'is_active', 'is_staff', 'is_superuser', 'groups'
            ),
        }),
    )
    
    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_groups.short_description = _('Groups')


admin.site.register(User, UserAdmin)
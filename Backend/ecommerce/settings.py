import os
from pathlib import Path
import socket
from decouple import config, Csv  # pip install python-decouple
from django.utils.translation import gettext_lazy as _

BASE_DIR = Path(__file__).resolve().parent.parent

# === Security ===
SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", cast=bool)
ALLOWED_HOSTS = [
    'www.alitapis.com',
    'alitapis.com',
    '142.93.180.74',
    'backend',  # Docker service name
    'localhost',
    '127.0.0.1',
]
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
# Get the Docker host IP
hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
INTERNAL_IPS = [ip[:-1] + '1' for ip in ips] + ['127.0.0.1', 'localhost']
GOOGLE_SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, config("GOOGLE_SERVICE_ACCOUNT_FILE"))
GOOGLE_CLIENT_SECRET_FILE = os.path.join(BASE_DIR, 'credentials/client_secret_577784229752-l918ioee4s60vhnl55r1ltlar49imufn.apps.googleusercontent.com.json') 
GOOGLE_REDIRECT_URI = 'http://localhost:8000/oauth2callback/'

# === Custom User Model ===
AUTH_USER_MODEL = "accounts.User"

# === REST Framework ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# === Media files ===
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# === Static files ===
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# === Applications ===
INSTALLED_APPS = [
    # Django apps
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd-party apps
    'rest_framework',
    'corsheaders',
    'drf_yasg',
        'colorfield',

    # Local apps
    'accounts',
    'catalog',
    'orders',
]

# === Middleware ===
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    # Enable language switching
    'django.middleware.locale.LocaleMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# === URLs and Templates ===
ROOT_URLCONF = 'ecommerce.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],  
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',  
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecommerce.wsgi.application'

# === PostgreSQL Database ===
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config("DB_NAME"),
        'USER': config("DB_USER"),
        'PASSWORD': config("DB_PASSWORD"),
        'HOST': config("DB_HOST", default="localhost"),
        'PORT': config("DB_PORT", default="5432"),
    }
}

CORS_ALLOWED_ORIGINS = [
    "https://www.alitapis.com",
    "https://alitapis.com",
    "http://localhost:5173",
    "http://localhost:5174"
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Proxy settings
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

CSRF_TRUSTED_ORIGINS = [
   "https://www.alitapis.com",
    "https://alitapis.com",
    "http://localhost:5173",
    'http://localhost:5174'
]

# Language settings
LANGUAGE_CODE = 'fr'
LANGUAGES = [
    ('en', 'English'),
    ('fr', 'French'),
    ('ar', 'Arabic'),
]

# Session settings for admin
LANGUAGE_COOKIE_NAME = 'django_language'
LANGUAGE_COOKIE_HTTPONLY = True
LANGUAGE_COOKIE_SAMESITE = 'Lax'
LANGUAGE_COOKIE_PATH = '/'
LANGUAGE_COOKIE_DOMAIN = None
I18N_URL_PREFIXES = ['admin']  # Only add language prefix to admin URLs

# API settings
API_DEFAULT_VERSION = 'v1'
API_DEFAULT_FORMAT = 'json'

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# === CORS Settings ===
# === CORS Settings ===
CORS_ALLOW_ALL_ORIGINS = False  # Change this to False
CORS_ALLOW_CREDENTIALS = True  # Add this line

CSRF_TRUSTED_ORIGINS = [
   "https://www.alitapis.com",
    "https://alitapis.com",
    "http://localhost:5173",
    'http://localhost:5174'
]
# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost:5173",  # Also add to CSRF trusted origins
# ]

# === Auto Field ===
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



# ... (previous imports remain the same)

# === Jazzmin Admin Configuration ===
JAZZMIN_SETTINGS = {
    # title of the window
    "site_title": "Admin Panel",
        "site_brand": "HVMC",

    # Title on the brand, and the login screen (19 chars max)
    "site_header": "Admin",
    
    # Logo to use for your site, must be present in static files, used for brand on top left
    "site_logo": None,
    
    # Welcome text on the login screen
    "welcome_sign": "Welcome to the admin panel",
    
    # Copyright on the footer
    "copyright": "HVMC Coiffure",
    
    # Field name on user model that contains avatar image
    "user_avatar": None,
    
    ############
    # Top Menu #
    ############
    
    # Links to put along the top menu
    "topmenu_links": [
        # Url that gets reversed (Permissions can be added)
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        
        # external url that opens in a new window (Permissions can be added)
        {"name": "Support", "url": "https://github.com/farridav/django-jazzmin/issues", "new_window": True},
        
        # model admin to link to (Permissions checked against model)
        {"model": "auth.User"},
        
        # App with dropdown menu to all its models pages (Permissions checked against models)
        {"app": "orders"},
    ],
    
    #############
    # User Menu #
    #############
    
    # Additional links to include in the user menu on the top right ("app" url type is not allowed)
    "usermenu_links": [
        {"name": "Support", "url": "https://github.com/farridav/django-jazzmin/issues", "new_window": True},
        {"model": "auth.user"}
    ],
    
    #############
    # Side Menu #
    #############
    
    # Whether to display the side menu
    "show_sidebar": True,
    
    # Whether to aut expand the menu
    "navigation_expanded": True,
    
    # Hide these apps when generating side menu e.g (auth)
    "hide_apps": [],
    
    # Hide these models when generating side menu (e.g auth.user)
    "hide_models": [],
    
    # List of apps to base side menu ordering off of (does not need to contain all apps)
    "order_with_respect_to": ["auth", "accounts", "catalog", "orders"],
    
    # Custom links to append to app groups, keyed on app name
    # "custom_links": {
    #     "orders": [{
    #         "name": "Make Messages", 
    #         "url": "make_messages", 
    #         "icon": "fas fa-comments",
    #         "permissions": ["orders.view_order"]
    #     }]
    # },
    
    # Custom icons for side menu apps/models
  "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "auth.Permission": "fas fa-lock",
        "accounts.User": "fas fa-user",
        "catalog.Product": "fas fa-box",
        "orders.Order": "fas fa-shopping-cart",
    },
    
    # Icons that are used when one is not manually specified
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    #################
    # Related Modal #
    #################
    
    # Activate Bootstrap modal
    "related_modal_active": False,
        "rtl_support": True,  # Enable RTL support for Arabic

    
    #############
    # UI Tweaks #
    #############
    
    # Relative paths to custom CSS/JS scripts (must be present in static files)
    "custom_css": None,
    "custom_js": None,
    
    # Whether to show the UI customizer on the sidebar
    "show_ui_builder": False,
    
    ###############
    # Change view #
    ###############
    
    # Render out the change view as a single form, or in tabs, current options are:
    # - single
    # - horizontal_tabs (default)
    # - vertical_tabs
    # - collapsible
    # - carousel
    "changeform_format": "horizontal_tabs",
    
    # override change forms on a per modeladmin basis
    # "changeform_format_overrides": {"auth.user": "collapsible", "auth.group": "vertical_tabs"},
    
    # Add a language dropdown into the admin
    # "language_chooser": True,
}

# Jazzmin UI localization for French and Arabic
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-primary",
    "accent": "accent-primary",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-outline-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-outline-info",
        "warning": "btn-outline-warning",
        "danger": "btn-outline-danger",
        "success": "btn-outline-success"
    },
    "actions_sticky_top": False,
        "language_chooser": True,  # enables language switcher

}

# ... (rest of your existing settings remain the same)

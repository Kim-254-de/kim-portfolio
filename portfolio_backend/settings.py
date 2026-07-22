"""
Django settings for portfolio_backend project.

Environment-driven so the same codebase runs:
  - locally with SQLite + local media (no env vars needed), and
  - in production on Render, with Postgres on Aiven and media on Cloudinary
    (set the env vars described in README.md).
"""

import os
from pathlib import Path

import dj_database_url

try:
    from dotenv import load_dotenv
    load_dotenv()  # loads a local .env file if present; no-op if it isn't
except ImportError:
    pass

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Core / security
# ---------------------------------------------------------------------------

# SECURITY WARNING: keep the secret key used in production secret!
# Falls back to a dev-only key so `runserver` works out of the box locally.
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-ac+p4q%l@mbi6_@u0++(1!es!iz(dj++#1h+=6c9o_t*pz!56w',
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    h.strip() for h in os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',') if h.strip()
]

# Render sets this automatically for every deploy — e.g. my-app.onrender.com
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if o.strip()
]
if RENDER_EXTERNAL_HOSTNAME:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RENDER_EXTERNAL_HOSTNAME}')

# Render terminates TLS at its proxy and forwards plain HTTP internally —
# without this, Django thinks every request is insecure.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True') == 'True'
    # Opt-in: only enable HSTS once you're sure the site (and any custom
    # domain) will always be served over HTTPS — misconfiguring it can
    # lock out plain-HTTP access for the duration below.
    SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', '0'))


# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary_storage',
    'cloudinary',
    'content',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'portfolio_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio_backend.wsgi.application'


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
# Set DATABASE_URL to use Postgres (e.g. your Aiven connection string,
# postgres://user:pass@host:port/dbname?sslmode=require). Aiven requires SSL;
# ssl_require=True below adds sslmode=require automatically if the URL
# doesn't already specify it. With no DATABASE_URL set, falls back to a
# local SQLite file for development.

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static files (CSS, JS) — served by WhiteNoise directly from the app
# ---------------------------------------------------------------------------

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'  # populated by `collectstatic` at deploy time


# ---------------------------------------------------------------------------
# Media files (project screenshots uploaded via /admin/)
# ---------------------------------------------------------------------------
# Set CLOUDINARY_URL (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME) to
# store uploads on Cloudinary. With no Cloudinary env vars set, falls back to
# local disk storage under media/ for development.

CLOUDINARY_URL_ENV = os.environ.get('CLOUDINARY_URL')
USE_CLOUDINARY = bool(CLOUDINARY_URL_ENV or os.environ.get('CLOUDINARY_CLOUD_NAME'))

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {
        'BACKEND': (
            'cloudinary_storage.storage.MediaCloudinaryStorage'
            if USE_CLOUDINARY
            else 'django.core.files.storage.FileSystemStorage'
        ),
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# django-cloudinary-storage's collectstatic override still reads these
# legacy names directly, so keep them in sync with STORAGES above.
DEFAULT_FILE_STORAGE = STORAGES['default']['BACKEND']
STATICFILES_STORAGE = STORAGES['staticfiles']['BACKEND']

if USE_CLOUDINARY and not CLOUDINARY_URL_ENV:
    # Only needed if you set the three separate vars instead of one
    # CLOUDINARY_URL — the cloudinary SDK reads CLOUDINARY_URL automatically
    # when it's present, so this block is the fallback path.
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
        'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
        'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
    }


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

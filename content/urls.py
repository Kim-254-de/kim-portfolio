from django.urls import path
from . import views

urlpatterns = [
    path('site-data/', views.site_data, name='site-data'),
]

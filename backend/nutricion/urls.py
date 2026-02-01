# backend/nutricion/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints originales
    path('calcular-macros/', views.calcular_macros, name='calcular_macros'),
    path('macros-actuales/', views.obtener_macros_actuales, name='macros_actuales'),

    # Endpoint de comidas (GET y POST en la misma dirección)
    # GET  /api/nutricion/comidas/?fecha=2026-01-31  → obtener comidas de un día
    # POST /api/nutricion/comidas/                   → guardar una comida nueva
    path('comidas/', views.comidas_view, name='comidas'),
]
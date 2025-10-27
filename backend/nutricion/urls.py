from django.urls import path
from . import views

urlpatterns = [
    path('calcular-macros/', views.calcular_macros, name='calcular_macros'),
    path('macros-actuales/', views.obtener_macros_actuales, name='macros_actuales'),
]
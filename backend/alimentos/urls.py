from django.urls import path
from . import views

urlpatterns = [
    path('lista/', views.ListaAlimentosView.as_view(), name='lista_alimentos'),
    path('recetas/', views.ListaRecetasView.as_view(), name='lista_recetas'),
]
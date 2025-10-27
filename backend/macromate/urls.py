from django.contrib import admin
from django.urls import path, include
from usuarios.views import (
    registro_usuario, login_usuario, perfil_usuario, 
    logout_usuario, cambiar_contrasena
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/registro/', registro_usuario, name='registro'),
    path('api/usuarios/login/', login_usuario, name='login'),
    path('api/usuarios/perfil/', perfil_usuario, name='perfil'),
    path('api/usuarios/cambiar_contrasena/', cambiar_contrasena, name='cambiar_contrasena'),
    path('api/usuarios/logout/', logout_usuario, name='logout'),
    path('api/nutricion/', include('nutricion.urls')),
]
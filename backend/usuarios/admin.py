from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Perfil, MedidaCorporal, HistorialObjetivo

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):  
    list_display = ('id_usuario', 'nombre_usuario', 'email', 'fecha_creacion', 'is_active')
    list_filter = ('is_active', 'fecha_creacion')
    search_fields = ('nombre_usuario', 'email')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        (None, {'fields': ('nombre_usuario', 'email', 'password')}),
        ('Información importante', {'fields': ('ultima_sesion', 'is_active')}),
    )

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre', 'apellidos', 'peso_actual', 'objetivo')
    list_filter = ('objetivo', 'nivel_actividad', 'genero')
    search_fields = ('nombre', 'apellidos', 'id_usuario__nombre_usuario')

@admin.register(MedidaCorporal)
class MedidaCorporalAdmin(admin.ModelAdmin):
    list_display = ('id_perfil', 'fecha_registro', 'peso', 'porcentaje_grasa')
    list_filter = ('fecha_registro',)
    ordering = ('-fecha_registro',)

@admin.register(HistorialObjetivo)
class HistorialObjetivoAdmin(admin.ModelAdmin):
    list_display = ('id_perfil', 'objetivo_anterior', 'objetivo_nuevo', 'fecha_cambio')
    list_filter = ('objetivo_anterior', 'objetivo_nuevo')
    ordering = ('-fecha_cambio',)
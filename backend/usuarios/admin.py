from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

# Register your models here.

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):  # ← CAMBIADO A ModelAdmin
    list_display = ('id_usuario', 'nombre_usuario', 'email', 'fecha_creacion', 'activo')
    list_filter = ('activo', 'fecha_creacion')
    search_fields = ('nombre_usuario', 'email')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        (None, {'fields': ('nombre_usuario', 'email', 'password')}),
        ('Información importante', {'fields': ('ultima_sesion', 'activo')}),
    )
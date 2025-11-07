from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Perfil, MedidaCorporal, HistorialObjetivo

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):  
    list_display = ('id_usuario', 'nombre_usuario', 'email', 'fecha_creacion', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'fecha_creacion')
    search_fields = ('nombre_usuario', 'email')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        (None, {'fields': ('nombre_usuario', 'email', 'password')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('ultima_sesion', 'fecha_creacion')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('nombre_usuario', 'email', 'password1', 'password2'),
        }),
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
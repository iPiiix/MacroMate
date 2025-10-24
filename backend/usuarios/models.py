from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Create your models here.

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre_usuario, password=None):
        if not email:
            raise ValueError('El usuario debe tener un email')
        
        user = self.model(
            email=self.normalize_email(email),
            nombre_usuario=nombre_usuario,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre_usuario, password=None):
        user = self.create_user(
            email=email,
            nombre_usuario=nombre_usuario,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user

# LUEGO EL MODELO
class Usuario(AbstractBaseUser):
    id_usuario = models.AutoField(primary_key=True)
    nombre_usuario = models.CharField(max_length=50, unique=True, null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True)
    fecha_creacion = models.DateTimeField(null=True, blank=True)
    ultima_sesion = models.DateTimeField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    
    # Campos para permisos
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    
    objects = UsuarioManager()  # ← USA EL MANAGER AQUÍ
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre_usuario']
    
    def __str__(self):
        return self.nombre_usuario
    
    # Métodos de permisos
    def has_perm(self, perm, obj=None):
        return True
    
    def has_module_perms(self, app_label):
        return True
    
    is_staff = models.BooleanField(default=False)  # ← SOLO esto, sin @property
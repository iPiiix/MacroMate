from datetime import date
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

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
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    nombre_usuario = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    ultima_sesion = models.DateTimeField(null=True, blank=True)
    
    # Campos requeridos para AbstractBaseUser
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre_usuario']

    def __str__(self):
        return self.nombre_usuario
    
    class Meta:
        db_table = 'usuarios'

class Perfil(models.Model):
    GENERO_CHOICES = [
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino'),
    ]
    
    NIVEL_ACTIVIDAD_CHOICES = [
        ('sedentario', 'Sedentario'),
        ('ligero', 'Ligero'),
        ('moderado', 'Moderado'),
        ('activo', 'Activo'),
        ('muy_activo', 'Muy Activo'),
    ]
    
    OBJETIVO_CHOICES = [
        ('perdida_peso', 'Pérdida de Peso'),
        ('mantenimiento', 'Mantenimiento'),
        ('ganancia_muscular', 'Ganancia Muscular'),
    ]
    
    id_usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, unique=True)
    nombre = models.CharField(max_length=100, blank=True)
    apellidos = models.CharField(max_length=100, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    genero = models.CharField(max_length=20, choices=GENERO_CHOICES, blank=True)
    altura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # cm
    peso_actual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # kg
    peso_objetivo = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # kg
    nivel_actividad = models.CharField(max_length=20, choices=NIVEL_ACTIVIDAD_CHOICES, default='sedentario')
    objetivo = models.CharField(max_length=20, choices=OBJETIVO_CHOICES, default='mantenimiento')
    bmr = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)  # Tasa Metabólica Basal
    tdee = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)  # Gasto Energético Total
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Perfil de {self.id_usuario.nombre_usuario}"
    
    class Meta:
        db_table = 'perfiles'

def calcular_edad(self):
    if not self.fecha_nacimiento:
        return None
    today = date.today()
    return today.year - self.fecha_nacimiento.year - ((today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))

def calcular_bmr(self):
    if not all([self.peso_actual, self.altura, self.fecha_nacimiento, self.genero]):
        return None
    edad = self.calcular_edad()
    if self.genero == 'masculino':
        bmr = 10 * float(self.peso_actual) + 6.25 * float(self.altura) - 5 * edad + 5
    else:
        bmr = 10 * float(self.peso_actual) + 6.25 * float(self.altura) - 5 * edad - 161
    return bmr

def factor_actividad(self):
    factores = {
        'sedentario': 1.2,
        'ligero': 1.375,
        'moderado': 1.55,
        'activo': 1.725,
        'muy_activo': 1.9,
    }
    return factores.get(self.nivel_actividad, 1.2)

def save(self, *args, **kwargs):
    bmr_calculado = self.calcular_bmr()
    if bmr_calculado:
        self.bmr = Decimal(round(bmr_calculado, 2))
        self.tdee = Decimal(round(bmr_calculado * self.factor_actividad(), 2))
    super().save(*args, **kwargs)

class MedidaCorporal(models.Model):
    id_perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    fecha_registro = models.DateField(auto_now_add=True)
    peso = models.DecimalField(max_digits=5, decimal_places=2)
    porcentaje_grasa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'medidas_corporales'

class HistorialObjetivo(models.Model):
    OBJETIVO_CHOICES = [
        ('perdida_peso', 'Pérdida de Peso'),
        ('mantenimiento', 'Mantenimiento'),
        ('ganancia_muscular', 'Ganancia Muscular'),
    ]
    
    id_perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    objetivo_anterior = models.CharField(max_length=20, choices=OBJETIVO_CHOICES)
    objetivo_nuevo = models.CharField(max_length=20, choices=OBJETIVO_CHOICES)
    peso_en_cambio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fecha_cambio = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'historial_objetivos'
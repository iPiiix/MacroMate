from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Usuario(AbstractUser):
    # Puedes agregar campos adicionales si es necesario
    email = models.EmailField(unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.email
    
class PerfilUsuario(models.Model):
    GENERO_OPCIONES = [
      ('M', 'Masculino'),
      ('F', 'Femenino'),
  ]

    NIVEL_ACTIVIDAD = [
       ('S', 'Sedentario'),
         ('L', 'Ligero'),
         ('M', 'Moderado'),
         ('A', 'Activo'),
         ('E', 'Muy Activo'),
    ]

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    edad = models.IntegerField()
    peso = models.FloatField(help_text="Peso en kg")  # kg
    altura = models.FloatField(help_text="Altura en cm")  # cm
    genero = models.CharField(max_length=20, choices=GENERO_OPCIONES)
    nivel_actividad = models.CharField(max_length=20, choices=NIVEL_ACTIVIDAD)
    bmr = models.FloatField(null=True, blank=True, help_text="Tasa Metabólica Basal")
    tdee = models.FloatField(null=True, blank=True, help_text="Gasto Energético Total Diario")
    objetivo = models.CharField(max_length=50, default="mantener", 
                               help_text="Objetivo: perder, mantener, ganar peso")
    
    def __str__(self):
        return f"Perfil de {self.usuario.email}"
    
    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuario"



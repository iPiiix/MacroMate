from django.db import models

# Create your models here.

from django.db import models
from usuarios.models import Usuario, Perfil

class ConversacionIA(models.Model):
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Conversación {self.id_usuario} - {self.fecha_inicio}"
    
    class Meta:
        db_table = 'conversaciones_ia'

class MensajeIA(models.Model):
    ROL_CHOICES = [
        ('usuario', 'Usuario'),
        ('asistente', 'Asistente'),
    ]
    
    id_conversacion = models.ForeignKey(ConversacionIA, on_delete=models.CASCADE)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)
    mensaje = models.TextField()
    fecha_mensaje = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mensajes_ia'

class RecomendacionIA(models.Model):
    TIPO_CHOICES = [
        ('dieta', 'Dieta'),
        ('receta', 'Receta'),
        ('ejercicio', 'Ejercicio'),
        ('consejo', 'Consejo'),
    ]
    
    id_perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.titulo
    
    class Meta:
        db_table = 'recomendaciones_ia'
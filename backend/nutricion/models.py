from django.db import models
from usuarios.models import Perfil

# Create your models here.

class Macronutrientes(models.Model):
    id_perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    calorias_diarias = models.DecimalField(max_digits=7, decimal_places=2)
    proteinas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbohidratos = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    grasas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    fecha_calculo = models.DateField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Macros {self.id_perfil} - {self.calorias_diarias} kcal"
    
    class Meta:
        db_table = 'macronutrientes'

class RegistroDiario(models.Model):
    id_perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    calorias_consumidas = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    proteinas_consumidas = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    carbohidratos_consumidos = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    grasas_consumidas = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    agua_litros = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'registro_diario'
        unique_together = ['id_perfil', 'fecha']

class ComidaDiaria(models.Model):
    TIPO_COMIDA_CHOICES = [
        ('desayuno', 'Desayuno'),
        ('almuerzo', 'Almuerzo'),
        ('cena', 'Cena'),
        ('snack', 'Snack'),
    ]
    
    id_registro = models.ForeignKey(RegistroDiario, on_delete=models.CASCADE)
    tipo_comida = models.CharField(max_length=20, choices=TIPO_COMIDA_CHOICES)
    nombre = models.CharField(max_length=200, blank=True)
    calorias = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    proteinas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbohidratos = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    grasas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'comidas_diarias'

class AlimentoConsumido(models.Model):
    id_comida = models.ForeignKey(ComidaDiaria, on_delete=models.CASCADE)
    id_alimento = models.ForeignKey('alimentos.Alimento', on_delete=models.CASCADE)
    cantidad_gramos = models.DecimalField(max_digits=6, decimal_places=2)
    
    class Meta:
        db_table = 'alimentos_consumidos'

class Ejercicio(models.Model):
    CATEGORIA_CHOICES = [
        ('cardio', 'Cardio'),
        ('fuerza', 'Fuerza'),
        ('flexibilidad', 'Flexibilidad'),
        ('resistencia', 'Resistencia'),
        ('otro', 'Otro'),
    ]
    
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    calorias_por_hora = models.DecimalField(max_digits=6, decimal_places=2)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'ejercicios'

class RegistroEjercicio(models.Model):
    id_registro = models.ForeignKey(RegistroDiario, on_delete=models.CASCADE)
    id_ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE)
    duracion_minutos = models.IntegerField()
    calorias_quemadas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'registro_ejercicios'
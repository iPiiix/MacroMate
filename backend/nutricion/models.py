from django.db import models
from usuarios.models import Perfil
from datetime import date
from decimal import Decimal

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
    fecha = models.DateField(default=date.today) 
    calorias_consumidas = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    proteinas_consumidas = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    carbohidratos_consumidos = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    grasas_consumidas = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    agua_litros = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    id_macro_objetivo = models.ForeignKey('Macronutrientes', on_delete=models.SET_NULL, null=True, blank=True)
    
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
    tipo_comida = models.CharField(max_length=20, choices=TIPO_COMIDA_CHOICES, default='snack')
    nombre = models.CharField(max_length=200, blank=True)
    calorias = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    proteinas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbohidratos = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    grasas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'comidas_diarias'
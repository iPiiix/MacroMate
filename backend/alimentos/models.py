from django.db import models

# Create your models here.

class CategoriaAlimento(models.Model):
    nombre = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'categorias_alimentos'
        verbose_name_plural = 'Categorías de alimentos'

class Alimento(models.Model):
    id_categoria = models.ForeignKey(CategoriaAlimento, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=200)
    calorias = models.DecimalField(max_digits=6, decimal_places=2)
    proteinas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbohidratos = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    grasas = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    porcion_gramos = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'alimentos'

class Receta(models.Model):
    TIPO_COMIDA_CHOICES = [
        ('desayuno', 'Desayuno'),
        ('almuerzo', 'Almuerzo'),
        ('cena', 'Cena'),
        ('snack', 'Snack'),
    ]
    
    id_usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.SET_NULL, null=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    instrucciones = models.TextField(blank=True)
    porciones = models.IntegerField(default=1)
    calorias_porcion = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    proteinas_porcion = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbohidratos_porcion = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    grasas_porcion = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'recetas'

class IngredienteReceta(models.Model):
    id_receta = models.ForeignKey(Receta, on_delete=models.CASCADE)
    id_alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=6, decimal_places=2)
    
    class Meta:
        db_table = 'ingredientes_receta'
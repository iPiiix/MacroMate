from rest_framework import serializers
from .models import Alimento, Receta, IngredienteReceta, CategoriaAlimento

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaAlimento
        fields = '__all__'

class AlimentoSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(source='id_categoria.nombre', read_only=True)
    
    class Meta:
        model = Alimento
        fields = '__all__'

class IngredienteRecetaSerializer(serializers.ModelSerializer):
    nombre_alimento = serializers.CharField(source='id_alimento.nombre', read_only=True)
    calorias = serializers.DecimalField(source='id_alimento.calorias', max_digits=6, decimal_places=2, read_only=True)
    
    class Meta:
        model = IngredienteReceta
        fields = ['id', 'id_alimento', 'nombre_alimento', 'cantidad', 'calorias']

class RecetaSerializer(serializers.ModelSerializer):
    ingredientes = IngredienteRecetaSerializer(source='ingredientereceta_set', many=True, read_only=True)
    
    class Meta:
        model = Receta
        fields = '__all__'
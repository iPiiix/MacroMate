# backend/nutricion/serializers.py

from rest_framework import serializers
from .models import ComidaDiaria, RegistroDiario


class ComidaDiariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComidaDiaria
        fields = ['id', 'nombre', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'tipo_comida']
        # Solo estos campos son necesarios para el frontend
        # id_registro se asigna automáticamente en la vista


class ComidaDiariaCreateSerializer(serializers.Serializer):
    """
    Serializer especial para crear comidas.
    Recibe los datos que envía el frontend y los valida.
    """
    nombre = serializers.CharField(max_length=200)
    calorias = serializers.FloatField(min_value=0)
    proteinas = serializers.FloatField(min_value=0)
    carbohidratos = serializers.FloatField(min_value=0)
    grasas = serializers.FloatField(min_value=0)
    fecha = serializers.DateField()  # El frontend envía la fecha como YYYY-MM-DD
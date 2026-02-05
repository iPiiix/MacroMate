from rest_framework import serializers
from .models import ComidaDiaria, RegistroDiario


class ComidaDiariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComidaDiaria
        fields = ['id', 'nombre', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'tipo_comida']


class ComidaDiariaCreateSerializer(serializers.Serializer):
    """
    Recibe los datos que envía el frontend y los valida.
    """
    nombre = serializers.CharField(max_length=200)
    calorias = serializers.FloatField(min_value=0)
    proteinas = serializers.FloatField(min_value=0)
    carbohidratos = serializers.FloatField(min_value=0)
    grasas = serializers.FloatField(min_value=0)
    fecha = serializers.DateField(required=False) 
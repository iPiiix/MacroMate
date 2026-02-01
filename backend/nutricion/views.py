# backend/nutricion/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Macronutrientes, ComidaDiaria, RegistroDiario
from .serializers import ComidaDiariaSerializer, ComidaDiariaCreateSerializer
from .utils import calcular_macros_para_perfil
from usuarios.models import Perfil
from django.db import transaction
from datetime import date


# ========================================================
# ENDPOINTS ORIGINALES (no se cambia nada)
# ========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calcular_macros(request):
    """
    Calcula los macronutrientes para el usuario autenticado
    """
    try:
        perfil = Perfil.objects.get(id_usuario=request.user)
        resultado = calcular_macros_para_perfil(perfil)
        
        if 'error' not in resultado:
            with transaction.atomic():
                Macronutrientes.objects.filter(id_perfil=perfil, activo=True).update(activo=False)
                Macronutrientes.objects.create(
                    id_perfil=perfil,
                    calorias_diarias=resultado['calorias_diarias'],
                    proteinas=resultado['proteinas'],
                    carbohidratos=resultado['carbohidratos'],
                    grasas=resultado['grasas'],
                    activo=True
                )
        
        return Response(resultado)
        
    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Primero debe completar su perfil con peso, altura y objetivos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Error en el cálculo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_macros_actuales(request):
    try:
        perfil = Perfil.objects.get(id_usuario=request.user)
        macros = Macronutrientes.objects.filter(id_perfil=perfil, activo=True).first()
        
        if macros:
            return Response({
                'calorias_diarias': macros.calorias_diarias,
                'proteinas': macros.proteinas,
                'carbohidratos': macros.carbohidratos,
                'grasas': macros.grasas,
                'fecha_calculo': macros.fecha_calculo
            })
        else:
            return Response(
                {'error': 'No hay macros calculados. Use el endpoint de cálculo.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Perfil no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )


# ========================================================
# ENDPOINT NUEVO: Comidas diarias
# ========================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comidas_view(request):
    """
    Una sola dirección, dos funciones según el método:
    - GET  /api/nutricion/comidas/?fecha=2026-01-31  → obtener comidas de un día
    - POST /api/nutricion/comidas/                   → guardar una comida nueva
    """
    if request.method == 'GET':
        return _obtener_comidas(request)
    elif request.method == 'POST':
        return _crear_comida(request)


def _obtener_comidas(request):
    """
    Devuelve todas las comidas del usuario en una fecha.
    Si no hay comidas ese día, devuelve lista vacía → el frontend muestra progreso en 0.
    """
    fecha_param = request.query_params.get('fecha')

    if not fecha_param:
        fecha_buscar = date.today()
    else:
        fecha_buscar = fecha_param

    try:
        perfil = Perfil.objects.get(id_usuario=request.user)

        registro = RegistroDiario.objects.filter(
            id_perfil=perfil,
            fecha=fecha_buscar
        ).first()

        if not registro:
            return Response([])

        comidas = ComidaDiaria.objects.filter(id_registro=registro)
        serializer = ComidaDiariaSerializer(comidas, many=True)
        return Response(serializer.data)

    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Perfil no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )


def _crear_comida(request):
    """
    Guarda una comida nueva.
    1. Busca o crea el RegistroDiario de esa fecha
    2. Crea una ComidaDiaria dentro de él
    3. Devuelve la comida creada
    """
    serializer = ComidaDiariaCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        perfil = Perfil.objects.get(id_usuario=request.user)
        fecha = serializer.validated_data['fecha']

        with transaction.atomic():
            registro, creado = RegistroDiario.objects.get_or_create(
                id_perfil=perfil,
                fecha=fecha,
                defaults={
                    'calorias_consumidas': 0,
                    'proteinas_consumidas': 0,
                    'carbohidratos_consumidos': 0,
                    'grasas_consumidas': 0,
                }
            )

            comida = ComidaDiaria.objects.create(
                id_registro=registro,
                nombre=serializer.validated_data['nombre'],
                calorias=serializer.validated_data['calorias'],
                proteinas=serializer.validated_data['proteinas'],
                carbohidratos=serializer.validated_data['carbohidratos'],
                grasas=serializer.validated_data['grasas'],
                tipo_comida='snack'
            )

        return Response(
            ComidaDiariaSerializer(comida).data,
            status=status.HTTP_201_CREATED
        )

    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Perfil no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al guardar comida: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
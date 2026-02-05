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
from datetime import date, datetime
from decimal import Decimal


# ========================================================
# ENDPOINTS 
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
# ENDPOINT: Comidas diarias 
# ========================================================

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def comidas_view(request):
    if request.method == 'GET':
        return _obtener_comidas(request)
    elif request.method == 'POST':
        return _crear_comida(request)
    elif request.method == 'DELETE':
        return _eliminar_comida(request)


def _obtener_comidas(request):

    fecha_param = request.query_params.get('fecha')

    if not fecha_param:
        fecha_buscar = date.today()
    else:
        try:
            fecha_buscar = datetime.strptime(fecha_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    try:
        perfil = Perfil.objects.get(id_usuario=request.user)

        # Buscar o crear el registro diario para esa fecha
        registro, creado = RegistroDiario.objects.get_or_create(
            id_perfil=perfil,
            fecha=fecha_buscar,
            defaults={
                'calorias_consumidas': 0,
                'proteinas_consumidas': 0,
                'carbohidratos_consumidos': 0,
                'grasas_consumidas': 0,
            }
        )

        # Obtener todas las comidas de ese día
        comidas = ComidaDiaria.objects.filter(id_registro=registro)
        serializer = ComidaDiariaSerializer(comidas, many=True)
        
        # Calcular totales del día
        totales = {
            'calorias': float(registro.calorias_consumidas or 0),
            'proteinas': float(registro.proteinas_consumidas or 0),
            'carbohidratos': float(registro.carbohidratos_consumidos or 0),
            'grasas': float(registro.grasas_consumidas or 0)
        }
        
        return Response({
            'comidas': serializer.data,
            'totales': totales,
            'fecha': fecha_buscar
        })

    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Perfil no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )


def _crear_comida(request):
    """
    Guarda una comida nueva y actualiza los totales del día.
    
    Body:
    {
        "nombre": "Pechuga de pollo",
        "calorias": 250.0,
        "proteinas": 30.0,
        "carbohidratos": 0.0,
        "grasas": 5.0,
        "fecha": "2026-02-02"  (opcional, por defecto hoy)
    }
    
    Response:
    {
        "id": 1,
        "nombre": "Pechuga de pollo",
        "calorias": 250.0,
        "proteinas": 30.0,
        "carbohidratos": 0.0,
        "grasas": 5.0,
        "tipo_comida": "snack"
    }
    """
    serializer = ComidaDiariaCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        perfil = Perfil.objects.get(id_usuario=request.user)
        
        # Obtener fecha (hoy si no se especifica)
        fecha_str = serializer.validated_data.get('fecha')
        if fecha_str:
            if isinstance(fecha_str, str):
                fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            else:
                fecha = fecha_str
        else:
            fecha = date.today()

        with transaction.atomic():
            # Buscar o crear el registro diario
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

            # Crear la comida
            comida = ComidaDiaria.objects.create(
                id_registro=registro,
                nombre=serializer.validated_data['nombre'],
                calorias=Decimal(str(serializer.validated_data['calorias'])),
                proteinas=Decimal(str(serializer.validated_data['proteinas'])),
                carbohidratos=Decimal(str(serializer.validated_data['carbohidratos'])),
                grasas=Decimal(str(serializer.validated_data['grasas'])),
                tipo_comida='snack'
            )

            # Actualizar los totales del registro diario
            registro.calorias_consumidas = (registro.calorias_consumidas or 0) + comida.calorias
            registro.proteinas_consumidas = (registro.proteinas_consumidas or 0) + comida.proteinas
            registro.carbohidratos_consumidos = (registro.carbohidratos_consumidos or 0) + comida.carbohidratos
            registro.grasas_consumidas = (registro.grasas_consumidas or 0) + comida.grasas
            registro.save()

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


def _eliminar_comida(request):
    """
    Elimina una comida específica y actualiza los totales del día.
    
    URL: /api/nutricion/comidas/<id>/
    
    Response:
    {
        "message": "Comida eliminada correctamente"
    }
    """
    comida_id = request.query_params.get('id')
    
    if not comida_id:
        return Response(
            {'error': 'ID de comida requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        perfil = Perfil.objects.get(id_usuario=request.user)
        
        # Buscar la comida y verificar que pertenece al usuario
        comida = ComidaDiaria.objects.select_related('id_registro').get(
            id=comida_id,
            id_registro__id_perfil=perfil
        )
        
        with transaction.atomic():
            # Actualizar los totales del registro diario
            registro = comida.id_registro
            registro.calorias_consumidas = (registro.calorias_consumidas or 0) - (comida.calorias or 0)
            registro.proteinas_consumidas = (registro.proteinas_consumidas or 0) - (comida.proteinas or 0)
            registro.carbohidratos_consumidos = (registro.carbohidratos_consumidos or 0) - (comida.carbohidratos or 0)
            registro.grasas_consumidas = (registro.grasas_consumidas or 0) - (comida.grasas or 0)
            
            # Asegurar que no queden valores negativos
            registro.calorias_consumidas = max(0, registro.calorias_consumidas)
            registro.proteinas_consumidas = max(0, registro.proteinas_consumidas)
            registro.carbohidratos_consumidos = max(0, registro.carbohidratos_consumidos)
            registro.grasas_consumidas = max(0, registro.grasas_consumidas)
            
            registro.save()
            
            # Eliminar la comida
            comida.delete()

        return Response(
            {'message': 'Comida eliminada correctamente'},
            status=status.HTTP_200_OK
        )

    except ComidaDiaria.DoesNotExist:
        return Response(
            {'error': 'Comida no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Perfil no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al eliminar comida: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
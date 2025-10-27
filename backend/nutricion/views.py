from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Macronutrientes, Perfil
from .utils import calcular_macros_para_perfil

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calcular_macros(request):
    """
    Calcula los macronutrientes para el usuario autenticado
    """
    try:
        # Obtener perfil del usuario
        perfil = Perfil.objects.get(id_usuario=request.user)
        
        # Calcular macros
        resultado = calcular_macros_para_perfil(perfil)
        
        # Guardar en base de datos si el cálculo fue exitoso
        if 'error' not in resultado:
            Macronutrientes.objects.create(
                id_perfil=perfil,
                calorias_diarias=resultado['calorias_diarias'],
                proteinas=resultado['proteinas'],
                carbohidratos=resultado['carbohidratos'],
                grasas=resultado['grasas']
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
    """
    Obtiene los macronutrientes actuales del usuario
    """
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
            return Response({'message': 'No hay macros calculados. Use el endpoint de cálculo.'})
            
    except Perfil.DoesNotExist:
        return Response(
            {'error': 'Perfil no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
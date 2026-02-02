from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Usuario, Perfil
from .serializers import (
    UsuarioRegistroSerializer, 
    UsuarioLoginSerializer, 
    UsuarioSerializer,
    PerfilSerializer,
    CambiarContrasenaSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def registro_usuario(request):
    serializer = UsuarioRegistroSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic(): # Atomico
                usuario = serializer.save()
                
                Perfil.objects.create(id_usuario=usuario)
                
                refresh = RefreshToken.for_user(usuario)
                
                return Response({
                    'usuario': UsuarioSerializer(usuario).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Usuario registrado exitosamente'
                }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': 'Error creando el perfil de usuario'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_usuario(request):
    serializer = UsuarioLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        usuario = serializer.validated_data['usuario']
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(usuario)
        
        return Response({
            'usuario': UsuarioSerializer(usuario).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login exitoso'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def perfil_usuario(request):
    usuario = request.user
    
    if request.method == 'GET':
        perfil, creado = Perfil.objects.get_or_create(id_usuario=usuario)
        serializer = PerfilSerializer(perfil)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        perfil = Perfil.objects.get(id_usuario=usuario)
        serializer = PerfilSerializer(perfil, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_contrasena(request):
    serializer = CambiarContrasenaSerializer(
        data=request.data, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        usuario = request.user
        nueva_contrasena = serializer.validated_data['nueva_contrasena']
        
        try:
            # Validar la nueva contraseña con los validadores de Django
            validate_password(nueva_contrasena, usuario)
            
            # Cambiar la contraseña
            usuario.set_password(nueva_contrasena)
            usuario.save()
            
            return Response({
                'message': 'Contraseña cambiada exitosamente',
                'detail': 'Tu contraseña ha sido actualizada correctamente'
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({
                'error': 'Error en validación de contraseña',
                'details': list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_usuario(request):
    try:
        RefreshToken_token_value = request.data.get('refresh')
        if RefreshToken_token_value:
            token = RefreshToken(RefreshToken_token_value)
            token.blacklist()
        return Response({'message': 'Sesión cerrada exitosamente'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'error': 'Token inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_usuario(request):
    """
    Elimina completamente la cuenta del usuario autenticado.
    
    Este endpoint:
    1. Elimina el perfil asociado (cascade elimina registros relacionados)
    2. Elimina el usuario
    3. El cliente debe limpiar tokens del localStorage
    
    IMPORTANTE: Esta acción es IRREVERSIBLE
    """
    try:
        usuario = request.user
        
        # Usar transacción atómica para garantizar que todo se elimine o nada
        with transaction.atomic():
            # Eliminar el usuario (el perfil se elimina automáticamente por CASCADE)
            # También se eliminan automáticamente:
            # - Macronutrientes (FK a Perfil)
            # - RegistroDiario (FK a Perfil)
            # - ComidaDiaria (FK a RegistroDiario)
            usuario.delete()
        
        return Response(
            {'message': 'Cuenta eliminada exitosamente'},
            status=status.HTTP_204_NO_CONTENT
        )
        
    except Exception as e:
        return Response(
            {'error': f'Error al eliminar cuenta: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
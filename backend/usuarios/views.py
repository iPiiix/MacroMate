from httpx import request
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

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
        usuario = serializer.save()
        
        # Crear perfil vacío automáticamente
        Perfil.objects.create(id_usuario=usuario)
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(usuario)
        
        return Response({
            'usuario': UsuarioSerializer(usuario).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)
    
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
        RefreshToken = request.data.get('refresh')
        if RefreshToken:
            token = RefreshToken(RefreshToken)
            token.blacklist()
        return Response({'message': 'Logout exitoso'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'error': 'Token inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)             

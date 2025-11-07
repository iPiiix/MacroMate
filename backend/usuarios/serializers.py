from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario, Perfil
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = ('nombre_usuario', 'email', 'password', 'password_confirm')
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("El email ya está en uso")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        usuario = Usuario.objects.create_user(**validated_data)
        return usuario

class UsuarioLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            usuario = authenticate(username=email, password=password)
            if not usuario:
                raise serializers.ValidationError('Credenciales inválidas')
            data['usuario'] = usuario
        return data

class PerfilSerializer(serializers.ModelSerializer):
    nombre_usuario = serializers.CharField(source='id_usuario.nombre_usuario', read_only=True)
    email = serializers.CharField(source='id_usuario.email', read_only=True)
    
    class Meta:
        model = Perfil
        fields = '__all__'
        read_only_fields = ('id_usuario', 'bmr', 'tdee', 'fecha_actualizacion')

class UsuarioSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer(read_only=True)
    
    class Meta:
        model = Usuario
        fields = ('id_usuario', 'nombre_usuario', 'email', 'fecha_creacion', 'perfil')

class CambiarContrasenaSerializer(serializers.Serializer):
    contrasena_actual = serializers.CharField(write_only=True, required=True)
    nueva_contrasena = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirmar_contrasena = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        # Verificar que las nuevas contraseñas coinciden
        if data['nueva_contrasena'] != data['confirmar_contrasena']:
            raise serializers.ValidationError({
                "confirmar_contrasena": "Las nuevas contraseñas no coinciden"
            })
        
        # Verificar que la nueva contraseña es diferente a la actual
        if data['contrasena_actual'] == data['nueva_contrasena']:
            raise serializers.ValidationError({
                "nueva_contrasena": "La nueva contraseña debe ser diferente a la actual"
            })
        
        return data

    def validate_contrasena_actual(self, value):
        usuario = self.context['request'].user
        if not usuario.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta")
        return value

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import ConversacionIA, MensajeIA

# Create your views here.

def generar_respuesta(mensaje_usuario):
    return f"Respuesta generada para: {mensaje_usuario}"

class ChatIAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user

        conversacion = ConversacionIA.objects.filter(id_usuario=usuario, activa=True).first()
        if not conversacion:
            return Response({"conversacion_id": None, "mensajes": []})

        mensajes = MensajeIA.objects.filter(id_conversacion=conversacion).order_by("fecha_mensaje")

        data = [
            {
                "rol": msg.rol,
                "mensaje": msg.mensaje,
                "fecha": msg.fecha_mensaje
            }
            for msg in mensajes
        ]
        return Response({"conversacion_id": conversacion.id, "mensajes": data})

    def post(self, request):
        usuario = request.user
        mensaje_usuario = request.data.get("mensaje", "")

        if not mensaje_usuario.strip():
            return Response({"error": "El mensaje no puede estar vacío."}, status=status.HTTP_400_BAD_REQUEST)

        conversacion = ConversacionIA.objects.filter(id_usuario=usuario, activa=True).first()
        if not conversacion:
            conversacion = ConversacionIA.objects.create(id_usuario=usuario)

        MensajeIA.objects.create(
            id_conversacion=conversacion,
            rol="usuario",
            mensaje=mensaje_usuario
        )

        respuesta = generar_respuesta(mensaje_usuario)

        MensajeIA.objects.create(
            id_conversacion=conversacion,
            rol="asistente",
            mensaje=respuesta
        )

        mensajes = MensajeIA.objects.filter(id_conversacion=conversacion).order_by("fecha_mensaje")

        data = [
            {
                "rol": msg.rol,
                "mensaje": msg.mensaje,
                "fecha": msg.fecha_mensaje
            }
            for msg in mensajes
        ]

        return Response({
            "conversacion_id": conversacion.id,
            "mensajes": data
        }, status=status.HTTP_201_CREATED)

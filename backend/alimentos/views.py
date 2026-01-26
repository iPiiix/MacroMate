from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Alimento, Receta
from .serializers import AlimentoSerializer, RecetaSerializer

class ListaAlimentosView(generics.ListAPIView):
    queryset = Alimento.objects.all()
    serializer_class = AlimentoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'id_categoria__nombre']

class ListaRecetasView(generics.ListAPIView):
    serializer_class = RecetaSerializer
    permission_classes = [IsAuthenticated] # Solo usuarios autenticados
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'descripcion']

    def get_queryset(self):
        return Receta.objects.filter(id_usuario=self.request.user)
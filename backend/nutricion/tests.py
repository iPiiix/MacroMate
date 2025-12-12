from django.test import TestCase
from datetime import date
from unittest.mock import MagicMock
from .utils import calcular_bmr, calcular_tdee, distribuir_macronutrientes, calcular_edad, ajustar_calorias_objetivo

perfil_hombre = MagicMock(
    peso_actual=80.0,
    altura=180.0,
    genero='masculino',
    fecha_nacimiento=date(1995, 1, 1), 
    nivel_actividad='sedentario',
    objetivo='mantenimiento',
    calcular_edad=MagicMock(return_value=30)
)
perfil_hombre.calcular_edad.return_value = 30

perfil_mujer = MagicMock(
    peso_actual=60.0,
    altura=165.0,
    genero='femenino',
    fecha_nacimiento=date(2000, 1, 1), 
    nivel_actividad='muy_activo',
    objetivo='perdida_peso',
    calcular_edad=MagicMock(return_value=25)
)
perfil_mujer.calcular_edad.return_value = 25 

class NutricionUtilsTestCase(TestCase):
    def test_calcular_bmr_male(self):
        bmr = calcular_bmr(perfil_hombre)
        self.assertAlmostEqual(bmr, 1780, delta=1.0)

    def test_calcular_bmr_female(self):
        bmr = calcular_bmr(perfil_mujer)
        self.assertAlmostEqual(bmr, 1345.25, delta=1.0)

    def test_calcular_tdee_sedentario(self):
        bmr = calcular_bmr(perfil_hombre)
        tdee = calcular_tdee(bmr, perfil_hombre.nivel_actividad) 
        self.assertAlmostEqual(tdee, 2136, delta=1.0)
    
    def test_ajustar_calorias_perdida_peso(self):
        tdee = 2500
        objetivo = 'perdida_peso'
        calorias_objetivo = ajustar_calorias_objetivo(tdee, objetivo)

        self.assertAlmostEqual(calorias_objetivo, 2000, delta=1.0)

    def test_distribuir_macronutrientes_ganancia(self):
        calorias_totales = 3000
        objetivo = 'ganancia_muscular' 
        macros = distribuir_macronutrientes(calorias_totales, objetivo)
        
        self.assertAlmostEqual(macros['proteinas'], 225.0, delta=1)
        self.assertAlmostEqual(macros['carbohidratos'], 337.5, delta=1)
        self.assertAlmostEqual(macros['grasas'], 83.3, delta=1)
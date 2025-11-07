from decimal import Decimal
from .models import Perfil

def calcular_bmr(perfil):
    """
    Calcula la Tasa Metabólica Basal (BMR) usando la ecuación de Mifflin-St Jeor
    """
    # ✅ CONVERTIR Decimal a float para evitar errores
    peso = float(perfil.peso_actual) if perfil.peso_actual else 0
    altura = float(perfil.altura) if perfil.altura else 0
    edad = calcular_edad(perfil)
    
    if perfil.genero == 'masculino':
        bmr = (10 * peso) + (6.25 * altura) - (5 * edad) + 5
    elif perfil.genero == 'femenino':
        bmr = (10 * peso) + (6.25 * altura) - (5 * edad) - 161
    else:
        # Valor por defecto para 'otro'
        bmr = (10 * peso) + (6.25 * altura) - (5 * edad) - 78
    
    return float(bmr)

def calcular_edad(perfil):
    """Calcula la edad a partir de la fecha de nacimiento"""
    from datetime import date
    if perfil.fecha_nacimiento:
        today = date.today()
        age = today.year - perfil.fecha_nacimiento.year
        if today.month < perfil.fecha_nacimiento.month or (today.month == perfil.fecha_nacimiento.month and today.day < perfil.fecha_nacimiento.day):
            age -= 1
        return age
    return 30  # Edad por defecto si no está especificada

def calcular_tdee(bmr, nivel_actividad):
    """
    Calcula el Gasto Energético Total Diario (TDEE) basado en el nivel de actividad
    """
    factores_actividad = {
        'sedentario': 1.2,      # Poco o ningún ejercicio
        'ligero': 1.375,        # Ejercicio ligero 1-3 días/semana
        'moderado': 1.55,       # Ejercicio moderado 3-5 días/semana  
        'activo': 1.725,        # Ejercicio duro 6-7 días/semana
        'muy_activo': 1.9       # Ejercicio muy duro y trabajo físico
    }
    
    factor = factores_actividad.get(nivel_actividad, 1.2)
    return float(bmr) * factor  # ✅ Asegurar que bmr es float

def ajustar_calorias_objetivo(tdee, objetivo):
    """
    Ajusta las calorías según el objetivo del usuario
    """
    tdee_float = float(tdee)  # ✅ Convertir a float primero
    
    ajustes = {
        'perdida_peso': tdee_float * 0.8,      # Déficit del 20%
        'mantenimiento': tdee_float,           # Mantener peso
        'ganancia_muscular': tdee_float * 1.1  # Superávit del 10%
    }
    
    return ajustes.get(objetivo, tdee_float)

def distribuir_macronutrientes(calorias_totales, objetivo):
    """
    Distribuye los macronutrientes según las calorías y objetivo
    """
    calorias_float = float(calorias_totales)  # ✅ Convertir a float
    
    if objetivo == 'perdida_peso':
        ratio_proteina = 0.35
        ratio_grasas = 0.25
        ratio_carbohidratos = 0.40
    elif objetivo == 'ganancia_muscular':
        ratio_proteina = 0.30
        ratio_grasas = 0.25
        ratio_carbohidratos = 0.45
    else:  # mantenimiento
        ratio_proteina = 0.25
        ratio_grasas = 0.25
        ratio_carbohidratos = 0.50
    
    # Calcular gramos (1g proteína = 4 cal, 1g carbohidrato = 4 cal, 1g grasa = 9 cal)
    proteinas_gramos = (calorias_float * ratio_proteina) / 4
    grasas_gramos = (calorias_float * ratio_grasas) / 9
    carbohidratos_gramos = (calorias_float * ratio_carbohidratos) / 4
    
    return {
        'proteinas': round(proteinas_gramos, 1),
        'grasas': round(grasas_gramos, 1),
        'carbohidratos': round(carbohidratos_gramos, 1)
    }

def calcular_macros_para_perfil(perfil):
    """
    Función principal que calcula todos los valores nutricionales para un perfil
    """
    # Validar datos mínimos requeridos
    if not perfil.peso_actual or not perfil.altura:
        return {
            'error': 'Se requiere peso y altura para calcular macros',
            'calorias_diarias': 0,
            'proteinas': 0,
            'carbohidratos': 0,
            'grasas': 0,
            'bmr': 0,
            'tdee': 0
        }
    
    # Cálculos paso a paso
    bmr = calcular_bmr(perfil)
    tdee = calcular_tdee(bmr, perfil.nivel_actividad)
    calorias_objetivo = ajustar_calorias_objetivo(tdee, perfil.objetivo)
    macros = distribuir_macronutrientes(calorias_objetivo, perfil.objetivo)
    
    return {
        'calorias_diarias': round(calorias_objetivo),
        'proteinas': macros['proteinas'],
        'carbohidratos': macros['carbohidratos'], 
        'grasas': macros['grasas'],
        'bmr': round(bmr),
        'tdee': round(tdee),
        'message': 'Cálculo completado exitosamente'
    }
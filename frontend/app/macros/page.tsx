'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * MacrosPage - Página de seguimiento de macronutrientes
 * 
 * Esta página:
 * 1. Calcula BMR (Tasa Metabólica Basal) usando la fórmula de Mifflin-St Jeor
 * 2. Calcula TDEE (Total Daily Energy Expenditure) = BMR × factor de actividad
 * 3. Ajusta calorías según el objetivo (déficit/superávit)
 * 4. Calcula distribución de macros según la meta física
 * 5. Permite al usuario registrar comidas
 * 6. Actualiza las barras de progreso en tiempo real
 * 
 * Fórmulas:
 * BMR Hombres = 10 × peso(kg) + 6.25 × altura(cm) - 5 × edad + 5
 * BMR Mujeres = 10 × peso(kg) + 6.25 × altura(cm) - 5 × edad - 161
 * 
 * TDEE = BMR × Factor de actividad:
 * - Sedentario: 1.2
 * - Ligero: 1.375
 * - Moderado: 1.55
 * - Activo: 1.725
 * - Muy activo: 1.9
 */

// Interfaces para tipado
interface UserProfile {
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: 'masculino' | 'femenino';
  altura: number;
  peso_actual: number;
  peso_objetivo: number;
  nivel_actividad: string;
  objetivo: 'perdida_peso' | 'ganancia_muscular' | 'mantenimiento';
}

interface MacroGoals {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

interface MacroProgress {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export default function MacrosPage() {
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [macroGoals, setMacroGoals] = useState<MacroGoals>({
    calorias: 2200,
    proteinas: 160,
    carbohidratos: 220,
    grasas: 70
  });
  
  const [macroProgress, setMacroProgress] = useState<MacroProgress>({
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0
  });
  
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario de añadir comida
  const [foodData, setFoodData] = useState({
    nombre: '',
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: ''
  });

  // ==================== CÁLCULO DE BMR ====================
  
  /**
   * Calcula la Tasa Metabólica Basal usando la fórmula de Mifflin-St Jeor
   * Esta es la cantidad de calorías que el cuerpo quema en reposo
   */
  const calculateBMR = (profile: UserProfile): number => {
    const edad = new Date().getFullYear() - new Date(profile.fecha_nacimiento).getFullYear();
    
    if (profile.genero === 'masculino') {
      // BMR Hombres = 10 × peso + 6.25 × altura - 5 × edad + 5
      return 10 * profile.peso_actual + 6.25 * profile.altura - 5 * edad + 5;
    } else {
      // BMR Mujeres = 10 × peso + 6.25 × altura - 5 × edad - 161
      return 10 * profile.peso_actual + 6.25 * profile.altura - 5 * edad - 161;
    }
  };

  // ==================== CÁLCULO DE TDEE ====================
  
  /**
   * Calcula el Total Daily Energy Expenditure
   * Es la cantidad total de calorías que se queman al día incluyendo actividad física
   */
  const calculateTDEE = (bmr: number, nivelActividad: string): number => {
    const factoresActividad: Record<string, number> = {
      'sedentario': 1.2,      // Poco o ningún ejercicio
      'ligero': 1.375,        // Ejercicio ligero 1-3 días/semana
      'moderado': 1.55,       // Ejercicio moderado 3-5 días/semana
      'activo': 1.725,        // Ejercicio intenso 6-7 días/semana
      'muy_activo': 1.9       // Ejercicio muy intenso, trabajo físico
    };
    
    return bmr * (factoresActividad[nivelActividad] || 1.2);
  };

  // ==================== AJUSTE POR OBJETIVO ====================
  
  /**
   * Ajusta las calorías según el objetivo del usuario
   * - Pérdida de peso: Déficit del 20% (TDEE × 0.8)
   * - Mantenimiento: TDEE sin cambios (TDEE × 1.0)
   * - Ganancia muscular: Superávit del 10% (TDEE × 1.1)
   */
  const adjustCaloriesByGoal = (tdee: number, objetivo: string): number => {
    switch (objetivo) {
      case 'perdida_peso':
        return tdee * 0.8;      // Déficit del 20%
      case 'mantenimiento':
        return tdee * 1.0;      // Sin cambio
      case 'ganancia_muscular':
        return tdee * 1.1;      // Superávit del 10%
      default:
        return tdee;
    }
  };

  // ==================== DISTRIBUCIÓN DE MACROS ====================
  
  /**
   * Calcula la distribución de macronutrientes según el objetivo
   * 
   * Pérdida de peso:
   * - 40% proteínas (para preservar músculo)
   * - 30% carbohidratos (energía moderada)
   * - 30% grasas (saciedad)
   * 
   * Mantenimiento:
   * - 30% proteínas (balance)
   * - 40% carbohidratos (energía óptima)
   * - 30% grasas (hormonas)
   * 
   * Ganancia muscular:
   * - 35% proteínas (construcción muscular)
   * - 45% carbohidratos (energía para entrenar)
   * - 20% grasas (mínimo necesario)
   */
  const calculateMacroDistribution = (calorias: number, objetivo: string): MacroGoals => {
    let proteinPercent = 0.30;
    let carbPercent = 0.40;
    let fatPercent = 0.30;
    
    if (objetivo === 'perdida_peso') {
      proteinPercent = 0.40;
      carbPercent = 0.30;
      fatPercent = 0.30;
    } else if (objetivo === 'ganancia_muscular') {
      proteinPercent = 0.35;
      carbPercent = 0.45;
      fatPercent = 0.20;
    }
    
    // Conversión de calorías a gramos:
    // - 1g proteína = 4 calorías
    // - 1g carbohidrato = 4 calorías
    // - 1g grasa = 9 calorías
    const proteinas = Math.round((calorias * proteinPercent) / 4);
    const carbohidratos = Math.round((calorias * carbPercent) / 4);
    const grasas = Math.round((calorias * fatPercent) / 9);
    
    return {
      calorias: Math.round(calorias),
      proteinas,
      carbohidratos,
      grasas
    };
  };

  // ==================== CARGA INICIAL DE DATOS ====================
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          toast.error('Debes iniciar sesión');
          router.push('/login');
          return;
        }

        // Obtener perfil del usuario
        const response = await fetch('http://localhost:8000/api/usuarios/perfil/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener perfil');
        }

        const profile = await response.json();
        setUserProfile(profile);

        // CALCULAR OBJETIVOS DE MACROS
        const bmr = calculateBMR(profile);
        console.log('BMR calculado:', bmr);
        
        const tdee = calculateTDEE(bmr, profile.nivel_actividad);
        console.log('TDEE calculado:', tdee);
        
        const caloriasAjustadas = adjustCaloriesByGoal(tdee, profile.objetivo);
        console.log('Calorías ajustadas por objetivo:', caloriasAjustadas);
        
        const macros = calculateMacroDistribution(caloriasAjustadas, profile.objetivo);
        console.log('Distribución de macros:', macros);
        
        setMacroGoals(macros);

        // TODO: Obtener progreso del día actual desde el backend
        // Por ahora, usar valores de ejemplo
        setMacroProgress({
          calorias: 600,
          proteinas: 87,
          carbohidratos: 125,
          grasas: 42
        });

        setLoading(false);

      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar datos del perfil');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // ==================== MANEJADORES DE NAVEGACIÓN ====================

  const handlePaginaPrincipalClick = () => {
    router.push('/paginaPrincipal');
  };

  const handleMetasClick = () => {
    router.push('/metas');
  };

  const handleMacrosClick = () => {
    router.push('/macros');
  };

  const handleDietasClick = () => {
    router.push('/dietas');
  };

  const handlePerfilClick = () => {
    router.push('/perfil');
  };

  // ==================== MANEJADORES DE COMIDA ====================

  const handleFoodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodData({
      ...foodData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Añade una comida al progreso diario
   * Actualiza las barras de progreso en tiempo real
   */
  const handleAddFood = () => {
    // Validar que todos los campos estén completos
    if (!foodData.nombre || !foodData.calorias || !foodData.proteinas || 
        !foodData.carbohidratos || !foodData.grasas) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Convertir strings a números
    const newCalorias = parseFloat(foodData.calorias);
    const newProteinas = parseFloat(foodData.proteinas);
    const newCarbohidratos = parseFloat(foodData.carbohidratos);
    const newGrasas = parseFloat(foodData.grasas);

    // Actualizar el progreso
    setMacroProgress(prev => ({
      calorias: prev.calorias + newCalorias,
      proteinas: prev.proteinas + newProteinas,
      carbohidratos: prev.carbohidratos + newCarbohidratos,
      grasas: prev.grasas + newGrasas
    }));

    // TODO: Guardar en el backend
    // const token = localStorage.getItem('access_token');
    // await fetch('http://localhost:8000/api/comidas/', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({...foodData, fecha: new Date().toISOString()})
    // });

    toast.success(`${foodData.nombre} añadido correctamente`);
    
    // Limpiar formulario y cerrar modal
    setFoodData({
      nombre: '',
      calorias: '',
      proteinas: '',
      carbohidratos: '',
      grasas: ''
    });
    setShowAddFoodModal(false);
  };

  // ==================== CÁLCULO DE PORCENTAJES ====================

  /**
   * Calcula el porcentaje de progreso para cada macro
   * Se usa para el ancho de las barras de progreso
   */
  const getProgressPercentage = (current: number, goal: number): number => {
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Máximo 100%
  };

  // ==================== RENDERIZADO ====================

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#2b2b2b',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '20px',
        fontFamily: "'Bungee', sans-serif"
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Bungee', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#2b2b2b',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* ========== HEADER CON NAVEGACIÓN ========== */}
      <header style={{
        backgroundColor: '#222222ff',
        padding: '15px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo MacroMate */}
        <div 
          onClick={handlePaginaPrincipalClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer'
          }}
        >
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#33A6DF',
            letterSpacing: '1px'
          }}>
            M
          </span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000000ff',
            letterSpacing: '1px',
            textShadow: '1px 1px 2px #33A6DF'
          }}>
            ACRO
          </span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#33A6DF',
            letterSpacing: '1px'
          }}>
            M
          </span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000000ff',
            letterSpacing: '1px',
            textShadow: '1px 1px 2px #33A6DF'
          }}>
            ATE
          </span>
        </div>

        {/* Iconos de navegación */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '85px'
        }}>
          <div onClick={handleMetasClick} style={iconContainerStyle}>
            <div style={iconBoxStyle}>
              <Image src="/metas.png" alt="Metas" fill />
            </div>
          </div>

          <div onClick={handleMacrosClick} style={iconContainerStyle}>
            <div style={iconBoxStyle}>
              <Image src="/progresoMacros.png" alt="Macros" fill />
            </div>
          </div>

          <div onClick={handleDietasClick} style={iconContainerStyle}>
            <div style={iconBoxStyle}>
              <Image src="/dietas.png" alt="Dietas" fill />
            </div>
          </div>

          <div onClick={handlePerfilClick} style={iconContainerStyle}>
            <div style={iconBoxStyle}>
              <Image src="/perfil.png" alt="Perfil" fill />
            </div>
          </div>
        </div>
      </header>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <main style={{
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Título y botón añadir comida */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: '2px',
            margin: 0
          }}>
            PROGRESO DE MACROS
          </h1>

          <button
            onClick={() => setShowAddFoodModal(true)}
            style={{
              backgroundColor: '#33A6DF',
              color: '#ffffff',
              padding: '15px 30px',
              borderRadius: '15px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily: "'Bungee', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a8fc7';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#33A6DF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            AÑADIR COMIDA +
          </button>
        </div>

        {/* ========== BARRA DE CALORÍAS ========== */}
        <div style={macroCardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <span style={macroLabelStyle}>CALORÍAS:</span>
            <span style={macroValueStyle}>
              {macroProgress.calorias}/{macroGoals.calorias} KCAL
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.calorias, macroGoals.calorias)}%`,
              backgroundColor: '#ff3838' // Rojo
            }} />
          </div>
        </div>

        {/* ========== BARRA DE PROTEÍNAS ========== */}
        <div style={macroCardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <span style={macroLabelStyle}>PROTEÍNAS:</span>
            <span style={macroValueStyle}>
              {macroProgress.proteinas}/{macroGoals.proteinas}G
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.proteinas, macroGoals.proteinas)}%`,
              backgroundColor: '#00ff00' // Verde
            }} />
          </div>
        </div>

        {/* ========== BARRA DE CARBOHIDRATOS ========== */}
        <div style={macroCardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <span style={macroLabelStyle}>CARBOHIDRATOS:</span>
            <span style={macroValueStyle}>
              {macroProgress.carbohidratos}/{macroGoals.carbohidratos}G
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.carbohidratos, macroGoals.carbohidratos)}%`,
              backgroundColor: '#ffff00' // Amarillo
            }} />
          </div>
        </div>

        {/* ========== BARRA DE GRASAS ========== */}
        <div style={macroCardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <span style={macroLabelStyle}>GRASAS:</span>
            <span style={macroValueStyle}>
              {macroProgress.grasas}/{macroGoals.grasas}G
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.grasas, macroGoals.grasas)}%`,
              backgroundColor: '#ff00ff' // Magenta
            }} />
          </div>
        </div>
      </main>

      {/* ========== MODAL AÑADIR COMIDA ========== */}
      {showAddFoodModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '550px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              marginBottom: '30px',
              letterSpacing: '1px'
            }}>
              AÑADIR COMIDA
            </h2>

            {/* Nombre de la comida */}
            <div style={{ marginBottom: '20px' }}>
              <label style={modalLabelStyle}>NOMBRE DEL ALIMENTO</label>
              <input
                type="text"
                name="nombre"
                value={foodData.nombre}
                onChange={handleFoodInputChange}
                placeholder="Ej: Pechuga de pollo"
                style={modalInputStyle}
              />
            </div>

            {/* Calorías */}
            <div style={{ marginBottom: '20px' }}>
              <label style={modalLabelStyle}>CALORÍAS (kcal)</label>
              <input
                type="number"
                name="calorias"
                value={foodData.calorias}
                onChange={handleFoodInputChange}
                placeholder="250"
                style={modalInputStyle}
              />
            </div>

            {/* Grid de macros */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              marginBottom: '30px'
            }}>
              {/* Proteínas */}
              <div>
                <label style={modalLabelStyle}>PROTEÍNAS (g)</label>
                <input
                  type="number"
                  name="proteinas"
                  value={foodData.proteinas}
                  onChange={handleFoodInputChange}
                  placeholder="30"
                  style={modalInputStyle}
                />
              </div>

              {/* Carbohidratos */}
              <div>
                <label style={modalLabelStyle}>CARBOS (g)</label>
                <input
                  type="number"
                  name="carbohidratos"
                  value={foodData.carbohidratos}
                  onChange={handleFoodInputChange}
                  placeholder="45"
                  style={modalInputStyle}
                />
              </div>

              {/* Grasas */}
              <div>
                <label style={modalLabelStyle}>GRASAS (g)</label>
                <input
                  type="number"
                  name="grasas"
                  value={foodData.grasas}
                  onChange={handleFoodInputChange}
                  placeholder="10"
                  style={modalInputStyle}
                />
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setShowAddFoodModal(false)}
                style={{
                  ...modalButtonStyle,
                  backgroundColor: 'transparent',
                  border: '2px solid #1a1a1a',
                  color: '#1a1a1a'
                }}
              >
                CANCELAR
              </button>

              <button
                onClick={handleAddFood}
                style={{
                  ...modalButtonStyle,
                  backgroundColor: '#33A6DF',
                  color: '#ffffff'
                }}
              >
                AÑADIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ESTILOS REUTILIZABLES ====================

const iconContainerStyle = {
  width: '35px',
  height: '35px',
  position: 'relative' as const,
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};

const iconBoxStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: '#33A6DF',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

const macroCardStyle = {
  backgroundColor: '#1e6b8f',
  borderRadius: '15px',
  padding: '30px 40px',
  marginBottom: '20px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
};

const macroLabelStyle = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  letterSpacing: '1px'
};

const macroValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  letterSpacing: '1px'
};

const progressBarBackgroundStyle = {
  width: '100%',
  height: '40px',
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  overflow: 'hidden' as const,
  position: 'relative' as const
};

const progressBarFillStyle = {
  height: '100%',
  borderRadius: '20px',
  transition: 'width 0.5s ease'
};

const modalLabelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  marginBottom: '8px',
  letterSpacing: '0.5px',
  fontFamily: "'Inter', sans-serif"
};

const modalInputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '2px solid transparent',
  borderRadius: '10px',
  backgroundColor: '#e0e0e0',
  fontSize: '15px',
  color: '#000000',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'all 0.2s ease'
};

const modalButtonStyle = {
  flex: 1,
  padding: '16px',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.5px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: "'Inter', sans-serif",
  textTransform: 'uppercase' as const
};
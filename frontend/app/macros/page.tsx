'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * MacrosPage - Página de seguimiento de macronutrientes
 * 
 * CORRECCIONES APLICADAS:
 * 1. Conversión correcta de strings a números usando Number() o parseFloat()
 * 2. Suma correcta de valores numéricos en lugar de concatenación de strings
 * 3. Validación de valores numéricos antes de procesarlos
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
  
  const [foodData, setFoodData] = useState({
    nombre: '',
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: ''
  });

  // ==================== CÁLCULO DE BMR ====================
  
  const calculateBMR = (profile: UserProfile): number => {
    const edad = new Date().getFullYear() - new Date(profile.fecha_nacimiento).getFullYear();
    
    if (profile.genero === 'masculino') {
      return 10 * profile.peso_actual + 6.25 * profile.altura - 5 * edad + 5;
    } else {
      return 10 * profile.peso_actual + 6.25 * profile.altura - 5 * edad - 161;
    }
  };

  // ==================== CÁLCULO DE TDEE ====================
  
  const calculateTDEE = (bmr: number, nivelActividad: string): number => {
    const factoresActividad: Record<string, number> = {
      'sedentario': 1.2,
      'ligero': 1.375,
      'moderado': 1.55,
      'activo': 1.725,
      'muy_activo': 1.9
    };
    
    return bmr * (factoresActividad[nivelActividad] || 1.2);
  };

  // ==================== AJUSTE POR OBJETIVO ====================
  
  const adjustCaloriesByGoal = (tdee: number, objetivo: string): number => {
    switch (objetivo) {
      case 'perdida_peso':
        return tdee * 0.8;
      case 'mantenimiento':
        return tdee * 1.0;
      case 'ganancia_muscular':
        return tdee * 1.1;
      default:
        return tdee;
    }
  };

  // ==================== DISTRIBUCIÓN DE MACROS ====================
  
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

        const bmr = calculateBMR(profile);
        console.log('BMR calculado:', bmr);
        
        const tdee = calculateTDEE(bmr, profile.nivel_actividad);
        console.log('TDEE calculado:', tdee);
        
        const caloriasAjustadas = adjustCaloriesByGoal(tdee, profile.objetivo);
        console.log('Calorías ajustadas por objetivo:', caloriasAjustadas);
        
        const macros = calculateMacroDistribution(caloriasAjustadas, profile.objetivo);
        console.log('Distribución de macros:', macros);
        
        setMacroGoals(macros);

        const savedProgress = localStorage.getItem('macroProgress');
        if (savedProgress) {
          try {
            const parsedProgress = JSON.parse(savedProgress);
            setMacroProgress({
              calorias: Number(parsedProgress.calorias) || 0,
              proteinas: Number(parsedProgress.proteinas) || 0,
              carbohidratos: Number(parsedProgress.carbohidratos) || 0,
              grasas: Number(parsedProgress.grasas) || 0
            });
          } catch (e) {
            console.error('Error al parsear progreso guardado:', e);
            setMacroProgress({
              calorias: 0,
              proteinas: 0,
              carbohidratos: 0,
              grasas: 0
            });
          }
        }

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

  const handleAddFood = () => {
    if (!foodData.nombre || !foodData.calorias || !foodData.proteinas || 
        !foodData.carbohidratos || !foodData.grasas) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const newCalorias = Number(foodData.calorias);
    const newProteinas = Number(foodData.proteinas);
    const newCarbohidratos = Number(foodData.carbohidratos);
    const newGrasas = Number(foodData.grasas);

    if (isNaN(newCalorias) || isNaN(newProteinas) || isNaN(newCarbohidratos) || isNaN(newGrasas)) {
      toast.error('Por favor ingresa valores numéricos válidos');
      return;
    }

    if (newCalorias < 0 || newProteinas < 0 || newCarbohidratos < 0 || newGrasas < 0) {
      toast.error('Los valores deben ser positivos');
      return;
    }

    setMacroProgress(prev => {
      const newProgress = {
        calorias: Number(prev.calorias) + newCalorias,
        proteinas: Number(prev.proteinas) + newProteinas,
        carbohidratos: Number(prev.carbohidratos) + newCarbohidratos,
        grasas: Number(prev.grasas) + newGrasas
      };
      
      localStorage.setItem('macroProgress', JSON.stringify(newProgress));
      console.log('Nuevo progreso:', newProgress);
      
      return newProgress;
    });

    toast.success(`${foodData.nombre} añadido correctamente`);
    
    setFoodData({
      nombre: '',
      calorias: '',
      proteinas: '',
      carbohidratos: '',
      grasas: ''
    });
    setShowAddFoodModal(false);
  };

  // ==================== FUNCIÓN PARA RESETEAR PROGRESO ====================
  
  const handleResetProgress = () => {
    if (confirm('¿Estás seguro de que quieres resetear el progreso del día?')) {
      setMacroProgress({
        calorias: 0,
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0
      });
      localStorage.removeItem('macroProgress');
      toast.success('Progreso reseteado correctamente');
    }
  };

  // ==================== CÁLCULO DE PORCENTAJES ====================

  const getProgressPercentage = (current: number, goal: number): number => {
    const currentNum = Number(current);
    const goalNum = Number(goal);
    
    if (goalNum === 0) return 0;
    
    const percentage = (currentNum / goalNum) * 100;
    return Math.min(Math.max(percentage, 0), 100);
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
        {/* Título y botones */}
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

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleResetProgress}
              style={{
                backgroundColor: '#e53e3e',
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
                e.currentTarget.style.backgroundColor = '#c53030';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e53e3e';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              RESETEAR
            </button>

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
              {Math.round(Number(macroProgress.calorias))}/{macroGoals.calorias} KCAL
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.calorias, macroGoals.calorias)}%`,
              backgroundColor: '#ff3838'
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
              {Math.round(Number(macroProgress.proteinas))}/{macroGoals.proteinas}G
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.proteinas, macroGoals.proteinas)}%`,
              backgroundColor: '#00ff00'
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
              {Math.round(Number(macroProgress.carbohidratos))}/{macroGoals.carbohidratos}G
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.carbohidratos, macroGoals.carbohidratos)}%`,
              backgroundColor: '#ffff00'
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
              {Math.round(Number(macroProgress.grasas))}/{macroGoals.grasas}G
            </span>
          </div>
          
          <div style={progressBarBackgroundStyle}>
            <div style={{
              ...progressBarFillStyle,
              width: `${getProgressPercentage(macroProgress.grasas, macroGoals.grasas)}%`,
              backgroundColor: '#ff00ff'
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

            <div style={{ marginBottom: '20px' }}>
              <label style={modalLabelStyle}>CALORÍAS (kcal)</label>
              <input
                type="number"
                name="calorias"
                value={foodData.calorias}
                onChange={handleFoodInputChange}
                placeholder="250"
                min="0"
                step="1"
                style={modalInputStyle}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={modalLabelStyle}>PROTEÍNAS (g)</label>
                <input
                  type="number"
                  name="proteinas"
                  value={foodData.proteinas}
                  onChange={handleFoodInputChange}
                  placeholder="30"
                  min="0"
                  step="0.1"
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>CARBOS (g)</label>
                <input
                  type="number"
                  name="carbohidratos"
                  value={foodData.carbohidratos}
                  onChange={handleFoodInputChange}
                  placeholder="45"
                  min="0"
                  step="0.1"
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>GRASAS (g)</label>
                <input
                  type="number"
                  name="grasas"
                  value={foodData.grasas}
                  onChange={handleFoodInputChange}
                  placeholder="10"
                  min="0"
                  step="0.1"
                  style={modalInputStyle}
                />
              </div>
            </div>

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
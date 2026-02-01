'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * MetasPage - Página de selección y cambio de meta física
 */
export default function MetasPage() {
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================
  
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<string | null>(null);

  // ==================== EFECTO INICIAL ====================
  
  useEffect(() => {
    const fetchCurrentGoal = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/usuarios/perfil/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentGoal(data.objetivo);
        }
      } catch (error) {
        console.error('Error al obtener meta actual:', error);
      }
    };

    fetchCurrentGoal();
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

  // ==================== MANEJADORES DE META ====================

  const handleGoalClick = (goal: string) => {
    setSelectedGoal(goal);
    setShowModal(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedGoal) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Debes iniciar sesión');
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/usuarios/perfil/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          objetivo: selectedGoal
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la meta');
      }

      setCurrentGoal(selectedGoal);
      toast.success('¡Meta actualizada exitosamente!');
      setShowModal(false);
      setSelectedGoal(null);

    } catch (error) {
      console.error('Error al cambiar meta:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la meta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChange = () => {
    setShowModal(false);
    setSelectedGoal(null);
  };

  const getGoalName = (goal: string | null) => {
    if (!goal) return '';
    const names: Record<string, string> = {
      'perdida_peso': 'Perder Peso',
      'ganancia_muscular': 'Ganar Masa Muscular',
      'mantenimiento': 'Mantener Físico'
    };
    return names[goal] || goal;
  };

  // ==================== RENDERIZADO ====================

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
          {/* Icono 1: Metas */}
          <div 
            onClick={handleMetasClick}
            style={{
              width: '35px',
              height: '35px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#33A6DF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              <Image 
                src="/metas.png" 
                alt="Metas" 
                fill 
              />
            </div>
          </div>

          {/* Icono 2: Progreso de macros */}
          <div 
            onClick={handleMacrosClick}
            style={{
              width: '35px',
              height: '35px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#33A6DF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              <Image 
                src="/progresoMacros.png" 
                alt="Macros" 
                fill 
              />
            </div>
          </div>

          {/* Icono 3: Perfil */}
          <div 
            onClick={handlePerfilClick}
            style={{
              width: '35px',
              height: '35px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#33A6DF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative', 
              overflow: 'hidden',    
            }}>
              <Image 
                src="/perfil.png" 
                alt="Perfil" 
                fill 
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========== CONTENIDO PRINCIPAL - TARJETAS DE METAS ========== */}
      <main style={{
        padding: '60px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Mostrar meta actual */}
        {currentGoal && (
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            fontSize: '18px',
            color: '#33A6DF',
            fontFamily: "'Inter', sans-serif"
          }}>
            Tu meta actual: <strong>{getGoalName(currentGoal)}</strong>
          </div>
        )}

        {/* ========== GRID DE TARJETAS ========== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* ========== TARJETA 1: PERDER PESO ========== */}
          <div style={{
            backgroundColor: '#33A6DF',
            borderRadius: '30px',
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '400px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            opacity: currentGoal === 'perdida_peso' ? 0.7 : 1
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '20px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              PERDER PESO
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#000000',
              textAlign: 'center',
              lineHeight: '1.6',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '30px',
              fontWeight: '400'
            }}>
              Esta meta está enfocada en reducir el porcentaje de grasa corporal de manera 
              saludable y sostenible. A través de una alimentación equilibrada adaptadas a tu 
              nivel, podrás alcanzar un peso adecuado sin comprometer tu bienestar ni tu masa 
              muscular.
            </p>

            <button
              onClick={() => handleGoalClick('perdida_peso')}
              disabled={currentGoal === 'perdida_peso'}
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '18px 80px',
                borderRadius: '30px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: currentGoal === 'perdida_peso' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                opacity: currentGoal === 'perdida_peso' ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (currentGoal !== 'perdida_peso') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentGoal === 'perdida_peso' ? 'META ACTUAL' : 'COMENZAR'}
            </button>
          </div>

          {/* ========== TARJETA 2: GANAR MASA MUSCULAR ========== */}
          <div style={{
            backgroundColor: '#33A6DF',
            borderRadius: '30px',
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '400px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            opacity: currentGoal === 'ganancia_muscular' ? 0.7 : 1
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '20px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              GANAR MASA MUSCULAR
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#000000',
              textAlign: 'center',
              lineHeight: '1.6',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '30px',
              fontWeight: '400'
            }}>
              El objetivo principal de esta meta es aumentar tu volumen y fuerza muscular 
              mediante una dieta rica en nutrientes esenciales. Aquí encontrarás las pautas 
              necesarias para lograr un crecimiento muscular equilibrado y duradero.
            </p>

            <button
              onClick={() => handleGoalClick('ganancia_muscular')}
              disabled={currentGoal === 'ganancia_muscular'}
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '18px 80px',
                borderRadius: '30px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: currentGoal === 'ganancia_muscular' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                opacity: currentGoal === 'ganancia_muscular' ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (currentGoal !== 'ganancia_muscular') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentGoal === 'ganancia_muscular' ? 'META ACTUAL' : 'COMENZAR'}
            </button>
          </div>
        </div>

        {/* ========== TARJETA 3: MANTENER FÍSICO (CENTRADA) ========== */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#33A6DF',
            borderRadius: '30px',
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '400px',
            width: '48%',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            opacity: currentGoal === 'mantenimiento' ? 0.7 : 1
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '20px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              MANTENER FÍSICO
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#000000',
              textAlign: 'center',
              lineHeight: '1.6',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '30px',
              fontWeight: '400'
            }}>
              Si ya has alcanzado un estado físico con el que te sientes bien, esta meta te ayudará a 
              conservar tus resultados. Aprenderás a equilibrar tu alimentación para mantener tu 
              forma, energía y salud a largo plazo sin caer en excesos ni descuidos.
            </p>

            <button
              onClick={() => handleGoalClick('mantenimiento')}
              disabled={currentGoal === 'mantenimiento'}
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '18px 80px',
                borderRadius: '30px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: currentGoal === 'mantenimiento' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                opacity: currentGoal === 'mantenimiento' ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (currentGoal !== 'mantenimiento') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentGoal === 'mantenimiento' ? 'META ACTUAL' : 'COMENZAR'}
            </button>
          </div>
        </div>
      </main>

      {/* ========== MODAL DE CONFIRMACIÓN ========== */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              marginBottom: '20px',
              letterSpacing: '1px'
            }}>
              CONFIRMAR CAMBIO DE META
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.6',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '30px'
            }}>
              ¿Estás seguro de que quieres cambiar tu meta física a{' '}
              <strong style={{ color: '#33A6DF' }}>
                {getGoalName(selectedGoal)}
              </strong>?
              <br /><br />
              Esto actualizará automáticamente tu perfil y tus recomendaciones nutricionales.
            </p>

            <div style={{
              display: 'flex',
              gap: '15px'
            }}>
              <button
                onClick={handleCancelChange}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: '2px solid #1a1a1a',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'uppercase',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1a1a1a';
                  }
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmChange}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#33A6DF',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'uppercase',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2a8fc7';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#33A6DF';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {loading ? 'Actualizando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANIMACIONES CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * PerfilPage - Página de visualización del perfil del usuario
 */

interface UserProfile {
  nombre: string;
  apellidos: string;
  email: string;
  fecha_nacimiento: string;
  altura: number;
  peso_actual: number;
  nivel_actividad: string;
  objetivo: string;
  genero: 'masculino' | 'femenino';
  fecha_creacion?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bmr, setBmr] = useState<number>(0);
  const [tdee, setTdee] = useState<number>(0);
  const [loggingOut, setLoggingOut] = useState(false);

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

        const calculatedBMR = calculateBMR(profile);
        const calculatedTDEE = calculateTDEE(calculatedBMR, profile.nivel_actividad);
        
        setBmr(calculatedBMR);
        setTdee(calculatedTDEE);

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

  // ==================== CERRAR SESIÓN ====================
  /**
   * handleLogout
   * 
   * El backend usa SimpleJWT con token_blacklist.
   * El endpoint POST /api/usuarios/logout/ espera { refresh: "<refresh_token>" }
   * y blacklistea ese refresh_token en la BD para que no pueda reusarse.
   * 
   * Flujo:
   *  1. POST al endpoint con el refresh_token en el body
   *  2. Si el backend responde OK → token inválido en el servidor
   *  3. Independientemente del resultado, limpiar localStorage
   *     (si el backend falla por red, los tokens ya no son útiles localmente)
   *  4. Toast de confirmación → redirigir a /login
   */
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const accessToken  = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await fetch('http://localhost:8000/api/usuarios/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
        // No se checkea el status: si el blacklist falla, igual cerramos sesión localmente
      }

      // Limpiar todo del cliente
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('macroProgress');

      toast.success('Sesión cerrada correctamente');

      // Pausa corta para que el toast se vea antes de navegar
      setTimeout(() => {
        router.push('/login');
      }, 900);

    } catch (error) {
      // Error de red → igual cerramos sesión localmente
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('macroProgress');
      toast.success('Sesión cerrada correctamente');
      setTimeout(() => {
        router.push('/login');
      }, 900);
    } finally {
      setLoggingOut(false);
    }
  };

  // ==================== FUNCIONES DE FORMATO ====================

  const formatFechaNacimiento = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatFechaCreacion = (fecha?: string): string => {
    if (!fecha) return 'Enero 2025';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatNivelActividad = (nivel: string): string => {
    const niveles: Record<string, string> = {
      'sedentario': 'Sedentario',
      'ligero': 'Ligero',
      'moderado': 'Moderado',
      'activo': 'Activo',
      'muy_activo': 'Muy Activo'
    };
    return niveles[nivel] || nivel;
  };

  const formatObjetivo = (objetivo: string): string => {
    const objetivos: Record<string, string> = {
      'perdida_peso': 'Perder Peso',
      'ganancia_muscular': 'Ganar Masa Muscular',
      'mantenimiento': 'Mantener Físico'
    };
    return objetivos[objetivo] || objetivo;
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
        Cargando perfil...
      </div>
    );
  }

  if (!userProfile) {
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
        Error al cargar perfil
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
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        {/* Tarjeta principal con fondo azul */}
        <div style={{
          backgroundColor: '#33A6DF',
          borderRadius: '30px',
          padding: '50px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Título */}
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '40px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            INFORMACIÓN PERSONAL
          </h1>

          {/* Grid de 2 columnas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }}>
            {/* ========== COLUMNA IZQUIERDA ========== */}
            <div>
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>NOMBRE:</label>
                <div style={inputReadOnlyStyle}>
                  {userProfile.nombre}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>APELLIDO:</label>
                <div style={inputReadOnlyStyle}>
                  {userProfile.apellidos}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>EMAIL:</label>
                <div style={inputReadOnlyStyle}>
                  {userProfile.email}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>FECHA DE NACIMIENTO:</label>
                <div style={inputReadOnlyStyle}>
                  {formatFechaNacimiento(userProfile.fecha_nacimiento)}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>ALTURA:</label>
                <div style={inputReadOnlyStyle}>
                  {userProfile.altura} cm
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>PESO:</label>
                <div style={inputReadOnlyStyle}>
                  {userProfile.peso_actual} kg
                </div>
              </div>
            </div>

            {/* ========== COLUMNA DERECHA ========== */}
            <div>
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>MIEMBRO DESDE:</label>
                <div style={inputReadOnlyStyle}>
                  {formatFechaCreacion(userProfile.fecha_creacion)}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>NIVEL DE ACTIVIDAD:</label>
                <div style={inputReadOnlyStyle}>
                  {formatNivelActividad(userProfile.nivel_actividad)}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>OBJETIVO ACTUAL:</label>
                <div style={inputReadOnlyStyle}>
                  {formatObjetivo(userProfile.objetivo)}
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>BMR (Metabolismo Basal):</label>
                <div style={inputReadOnlyStyle}>
                  {Math.round(bmr)} kcal/día
                </div>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>TDEE (Gasto Total Diario):</label>
                <div style={inputReadOnlyStyle}>
                  {Math.round(tdee)} kcal/día
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== BOTÓN CERRAR SESIÓN ========== */}
        <div style={{
          marginTop: '45px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              backgroundColor: loggingOut ? '#922b21' : '#e74c3c',
              color: '#ffffff',
              padding: '18px 56px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
              fontFamily: "'Bungee', sans-serif",
              opacity: loggingOut ? 0.65 : 1,
              boxShadow: loggingOut
                ? 'none'
                : '0 4px 15px rgba(231, 76, 60, 0.45)',
              transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loggingOut) {
                e.currentTarget.style.backgroundColor = '#c0392b';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.55)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loggingOut) {
                e.currentTarget.style.backgroundColor = '#e74c3c';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.45)';
              }
            }}
            onMouseDown={(e) => {
              if (!loggingOut) {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.35)';
              }
            }}
            onMouseUp={(e) => {
              if (!loggingOut) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.55)';
              }
            }}
          >
            {loggingOut ? 'CERRANDO...' : 'CERRAR SESIÓN'}
          </button>
        </div>
      </main>
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

const fieldContainerStyle = {
  marginBottom: '20px'
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  marginBottom: '8px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  fontFamily: "'Bungee', sans-serif"
};

const inputReadOnlyStyle = {
  width: '100%',
  padding: '14px 20px',
  borderRadius: '12px',
  backgroundColor: '#e0e0e0',
  color: '#1a1a1a',
  fontSize: '16px',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  fontWeight: '500' as const,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: 'none'
};
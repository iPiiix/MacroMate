'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * PerfilPage - Página de visualización y edición del perfil del usuario
 * 
 * NUEVAS FUNCIONALIDADES:
 * - Editar peso actual
 * - Editar nivel de actividad física
 * - Recalcular BMR y TDEE automáticamente
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para edición
  const [editingPeso, setEditingPeso] = useState(false);
  const [editingActividad, setEditingActividad] = useState(false);
  const [tempPeso, setTempPeso] = useState('');
  const [tempActividad, setTempActividad] = useState('');
  const [saving, setSaving] = useState(false);

  // ==================== ELIMINACIÓN DE USUARIO ====================

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/usuarios/eliminar/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cuenta');
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('macroProgress');

      toast.success('Cuenta eliminada correctamente');

      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar cuenta');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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

  // ==================== EDICIÓN DE PESO ====================

  const handleStartEditPeso = () => {
    setTempPeso(userProfile?.peso_actual.toString() || '');
    setEditingPeso(true);
  };

  const handleCancelEditPeso = () => {
    setEditingPeso(false);
    setTempPeso('');
  };

  const handleSavePeso = async () => {
    const nuevoPeso = parseFloat(tempPeso);

    if (isNaN(nuevoPeso) || nuevoPeso <= 0) {
      toast.error('Peso inválido');
      return;
    }

    if (nuevoPeso < 30 || nuevoPeso > 300) {
      toast.error('El peso debe estar entre 30 y 300 kg');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:8000/api/usuarios/perfil/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          peso_actual: nuevoPeso
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar peso');
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);

      // Recalcular BMR y TDEE
      const newBMR = calculateBMR(updatedProfile);
      const newTDEE = calculateTDEE(newBMR, updatedProfile.nivel_actividad);
      setBmr(newBMR);
      setTdee(newTDEE);

      toast.success('Peso actualizado correctamente');
      setEditingPeso(false);
      setTempPeso('');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el peso');
    } finally {
      setSaving(false);
    }
  };

  // ==================== EDICIÓN DE ACTIVIDAD FÍSICA ====================

  const handleStartEditActividad = () => {
    setTempActividad(userProfile?.nivel_actividad || '');
    setEditingActividad(true);
  };

  const handleCancelEditActividad = () => {
    setEditingActividad(false);
    setTempActividad('');
  };

  const handleSaveActividad = async () => {
    if (!tempActividad) {
      toast.error('Selecciona un nivel de actividad');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:8000/api/usuarios/perfil/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nivel_actividad: tempActividad
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar actividad');
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);

      // Recalcular TDEE con nuevo nivel de actividad
      const newBMR = calculateBMR(updatedProfile);
      const newTDEE = calculateTDEE(newBMR, updatedProfile.nivel_actividad);
      setBmr(newBMR);
      setTdee(newTDEE);

      toast.success('Nivel de actividad actualizado');
      setEditingActividad(false);
      setTempActividad('');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la actividad');
    } finally {
      setSaving(false);
    }
  };

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
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('macroProgress');

      toast.success('Sesión cerrada correctamente');

      setTimeout(() => {
        router.push('/login');
      }, 900);

    } catch (error) {
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
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: '#33A6DF',
          borderRadius: '30px',
          padding: '50px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }}>
            {/* COLUMNA IZQUIERDA */}
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

              {/* PESO (editable)*/}
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>PESO:</label>
                {editingPeso ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={tempPeso}
                      onChange={(e) => setTempPeso(e.target.value)}
                      placeholder="Ej: 75"
                      step="0.1"
                      min="30"
                      max="300"
                      disabled={saving}
                      style={{
                        ...inputEditableStyle,
                        flex: 1
                      }}
                    />
                    <button
                      onClick={handleSavePeso}
                      disabled={saving}
                      style={saveButtonStyle}
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEditPeso}
                      disabled={saving}
                      style={cancelButtonStyle}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ ...inputReadOnlyStyle, flex: 1 }}>
                      {userProfile.peso_actual} kg
                    </div>
                    <button
                      onClick={handleStartEditPeso}
                      style={editButtonStyle}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div>
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>MIEMBRO DESDE:</label>
                <div style={inputReadOnlyStyle}>
                  {formatFechaCreacion(userProfile.fecha_creacion)}
                </div>
              </div>

              {/* NIVEL DE ACTIVIDAD (editable) */}
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>NIVEL DE ACTIVIDAD:</label>
                {editingActividad ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                      value={tempActividad}
                      onChange={(e) => setTempActividad(e.target.value)}
                      disabled={saving}
                      style={{
                        ...inputEditableStyle,
                        flex: 1
                      }}
                    >
                      <option value="sedentario">Sedentario</option>
                      <option value="ligero">Ligero</option>
                      <option value="moderado">Moderado</option>
                      <option value="activo">Activo</option>
                      <option value="muy_activo">Muy Activo</option>
                    </select>
                    <button
                      onClick={handleSaveActividad}
                      disabled={saving}
                      style={saveButtonStyle}
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEditActividad}
                      disabled={saving}
                      style={cancelButtonStyle}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ ...inputReadOnlyStyle, flex: 1 }}>
                      {formatNivelActividad(userProfile.nivel_actividad)}
                    </div>
                    <button
                      onClick={handleStartEditActividad}
                      style={editButtonStyle}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                )}
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

        {/* BOTÓN ELIMINAR CUENTA */}
        <div style={{
          marginTop: '45px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            style={{
              backgroundColor: deleting ? '#922b21' : '#c0392b',
              color: '#ffffff',
              padding: '18px 56px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: deleting ? 'not-allowed' : 'pointer',
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
              fontFamily: "'Bungee', sans-serif",
              opacity: deleting ? 0.65 : 1,
              boxShadow: deleting ? 'none' : '0 4px 15px rgba(192, 57, 43, 0.55)',
              transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!deleting) {
                e.currentTarget.style.backgroundColor = '#922b21';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 57, 43, 0.65)';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleting) {
                e.currentTarget.style.backgroundColor = '#c0392b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(192, 57, 43, 0.55)';
              }
            }}
          >
            ELIMINAR CUENTA
          </button>
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
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
              boxShadow: loggingOut ? 'none' : '0 4px 15px rgba(231, 76, 60, 0.45)',
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
          >
            {loggingOut ? 'CERRANDO...' : 'CERRAR SESIÓN'}
          </button>
        </div>
      </main>

      {/* MODAL DE ELIMINACIÓN */}
      {showDeleteModal && (
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
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '550px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                color: '#c0392b'
              }}>
                !
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#c0392b',
                marginBottom: '15px',
                letterSpacing: '1px'
              }}>
                ELIMINAR CUENTA
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6',
                fontFamily: "'Inter', sans-serif"
              }}>
                Esta acción es <strong style={{ color: '#c0392b' }}>IRREVERSIBLE</strong>.
                <br /><br />
                Se eliminarán permanentemente:
              </p>
            </div>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: '30px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#444'
            }}>
              <li style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>-</span>
                Todos tus datos personales
              </li>
              <li style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>-</span>
                Tu historial de macros y comidas
              </li>
              <li style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>-</span>
                Tus objetivos y metas
              </li>
              <li style={{ paddingLeft: '25px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>-</span>
                Tu acceso a la plataforma
              </li>
            </ul>

            <p style={{
              fontSize: '14px',
              color: '#c0392b',
              textAlign: 'center',
              marginBottom: '30px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 'bold'
            }}>
              ¿Estás seguro de eliminar tu cuenta?
            </p>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
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
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'uppercase',
                  opacity: deleting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1a1a1a';
                  }
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: deleting ? '#922b21' : '#c0392b',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'uppercase',
                  opacity: deleting ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = '#922b21';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = '#c0392b';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
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

const inputEditableStyle = {
  width: '100%',
  padding: '14px 20px',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  color: '#1a1a1a',
  fontSize: '16px',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  fontWeight: '500' as const,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '2px solid #33A6DF',
  outline: 'none'
};

const editButtonStyle = {
  padding: '10px 20px',
  borderRadius: '10px',
  backgroundColor: '#33A6DF',
  color: '#ffffff',
  border: 'none',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: "'Inter', sans-serif"
};

const saveButtonStyle = {
  padding: '10px 16px',
  borderRadius: '10px',
  backgroundColor: '#27ae60',
  color: '#ffffff',
  border: 'none',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '45px'
};

const cancelButtonStyle = {
  padding: '10px 16px',
  borderRadius: '10px',
  backgroundColor: '#e74c3c',
  color: '#ffffff',
  border: 'none',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '45px'
};
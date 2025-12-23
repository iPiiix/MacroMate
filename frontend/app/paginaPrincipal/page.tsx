'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * DashboardPage - Página principal provisional después del login
 * 
 * Esta es una página provisional que sirve como punto de llegada después
 * de que el usuario inicie sesión o se registre. En futuras iteraciones,
 * esta página mostrará:
 * - Panel de macros diarios
 * - Resumen de comidas
 * - Gráficos de progreso
 * - Registro rápido de alimentos
 * 
 * Por ahora, muestra:
 * - Mensaje de bienvenida
 * - Información básica del usuario (si está disponible)
 * - Botón de cierre de sesión
 * 
 * Funcionalidades implementadas:
 * - Verificación de autenticación (redirige a login si no hay token)
 * - Carga de datos del perfil desde el backend
 * - Cierre de sesión (elimina tokens y redirige)
 * - Estados de carga y error
 */
export default function DashboardPage() {
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================
  
  /**
   * userData: Almacena la información del usuario obtenida del backend
   * Estructura esperada:
   * {
   *   nombre: string,
   *   apellidos: string,
   *   email: string,
   *   fecha_nacimiento: string,
   *   genero: string,
   *   altura: number,
   *   peso_actual: number,
   *   nivel_actividad: string,
   *   objetivo: string
   * }
   */
  const [userData, setUserData] = useState<any>(null);
  
  /**
   * loading: Indica si se está cargando la información del usuario
   * true durante la petición HTTP al backend
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * error: Almacena mensajes de error si falla la carga de datos
   * null si no hay errores
   */
  const [error, setError] = useState<string | null>(null);

  // ==================== EFECTOS ====================
  
  /**
   * useEffect - Verifica autenticación y carga datos del usuario
   * 
   * Este efecto se ejecuta una vez al montar el componente ([] como dependencia).
   * 
   * Flujo de ejecución:
   * 1. Obtiene el access_token de localStorage
   * 2. Si no hay token, redirige a /login inmediatamente
   * 3. Si hay token, hace petición GET a /api/usuarios/perfil/
   * 4. Si la petición es exitosa, guarda los datos en userData
   * 5. Si falla (401, 403, etc.), redirige a /login
   * 6. Si hay error de red, muestra mensaje de error
   * 7. Siempre detiene el estado de carga al finalizar
   * 
   * Seguridad:
   * - El token JWT se envía en el header Authorization
   * - Si el token es inválido o expiró, el backend responde con 401
   * - En ese caso, redirigimos al login para que el usuario se autentique de nuevo
   */
  useEffect(() => {
    const verificarAutenticacion = async () => {
      // Paso 1: Obtener token de localStorage
      const token = localStorage.getItem('access_token');
      
      // Paso 2: Redirigir si no hay token
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Paso 3: Hacer petición al backend para obtener datos del usuario
        const response = await fetch('http://localhost:8000/api/usuarios/perfil/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,  // Enviar token JWT
            'Content-Type': 'application/json'
          }
        });

        // Paso 4: Procesar respuesta exitosa
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          // Paso 5: Token inválido o expirado - redirigir a login
          console.error('Token inválido o expirado');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
        }
      } catch (err) {
        // Paso 6: Error de red
        console.error('Error al cargar datos del usuario:', err);
        setError('Error al cargar los datos del usuario');
      } finally {
        // Paso 7: Detener carga
        setLoading(false);
      }
    };

    verificarAutenticacion();
  }, [router]);

  // ==================== MANEJADORES ====================

  /**
   * handleLogout - Cierra la sesión del usuario
   * 
   * Flujo:
   * 1. Elimina ambos tokens de localStorage
   * 2. Limpia el estado del usuario
   * 3. Redirige a la página de login
   * 
   * Nota: En una implementación más robusta, también se podría:
   * - Invalidar el refresh_token en el backend
   * - Hacer una petición a un endpoint de logout
   * - Limpiar cualquier caché de datos del usuario
   */
  const handleLogout = () => {
    // Eliminar tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Limpiar estado
    setUserData(null);
    
    // Redirigir a login
    router.push('/login');
  };

  // ==================== RENDERIZADO CONDICIONAL ====================

  /**
   * Estado de carga: Muestra spinner mientras se obtienen los datos
   */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2b2b2b',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f5f5f5',
            borderTop: '4px solid #1a1a1a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#f5f5f5', fontSize: '16px' }}>
            Cargando tu dashboard...
          </p>
        </div>
        
        {/* Animación de spinner */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  /**
   * Estado de error: Muestra mensaje si falló la carga de datos
   */
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2b2b2b',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDERIZADO PRINCIPAL ====================

  return (
    <div style={{
      fontFamily: "'Bungee', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#2b2b2b',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ========== HEADER CON LOGO Y BOTÓN DE LOGOUT ========== */}
      <header style={{
        borderRadius: '0 0 10px 10px',
        backgroundColor: '#ffffff',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',  // Logo a la izquierda, botón a la derecha
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo */}
        <div style={{ width: '60px', height: '40px', position: 'relative' }}>
          <Image 
            src="/Logo.png" 
            alt="MacroMate Logo" 
            fill 
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
          }}
        >
          Cerrar Sesión
        </button>
      </header>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <div style={{
        flex: 1,
        padding: '40px 20px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Tarjeta de bienvenida */}
        <div style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '15px',
            letterSpacing: '2px'
          }}>
            BIENVENIDO, {userData?.nombre?.toUpperCase() || 'USUARIO'}
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Este es tu dashboard provisional. Aquí podrás ver tus macros diarios,
            registrar tus comidas y hacer seguimiento de tu progreso.
          </p>

          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #4caf50'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#2e7d32',
              fontFamily: "'Inter', sans-serif",
              margin: 0
            }}>
              ✓ Has iniciado sesión correctamente. Tu cuenta está lista para usar.
            </p>
          </div>
        </div>

        {/* ========== INFORMACIÓN DEL USUARIO ========== */}
        {/* 
          Esta sección muestra los datos del perfil del usuario
          organizados en una cuadrícula responsive
        */}
        {userData && (
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '25px',
              letterSpacing: '1px'
            }}>
              TU PERFIL
            </h2>

            {/* Grid de información del usuario */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              fontFamily: "'Inter', sans-serif"
            }}>
              {/* Cada campo del perfil */}
              {[
                { label: 'Email', value: userData.email },
                { label: 'Nombre completo', value: `${userData.nombre} ${userData.apellidos}` },
                { label: 'Fecha de nacimiento', value: userData.fecha_nacimiento },
                { label: 'Género', value: userData.genero },
                { label: 'Altura', value: `${userData.altura} cm` },
                { label: 'Peso actual', value: `${userData.peso_actual} kg` },
                { label: 'Nivel de actividad', value: userData.nivel_actividad },
                { label: 'Objetivo', value: userData.objetivo }
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#e0e0e0',
                    padding: '20px',
                    borderRadius: '12px'
                  }}
                >
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: '16px',
                    color: '#1a1a1a',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {item.value || 'No especificado'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== PRÓXIMAS FUNCIONALIDADES ========== */}
        {/* 
          Sección informativa sobre las features que se implementarán
          en futuras versiones del dashboard
        */}
        <div style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '20px',
          padding: '40px',
          marginTop: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '20px',
            letterSpacing: '1px'
          }}>
            PRÓXIMAMENTE
          </h2>

          <ul style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '15px',
            color: '#666',
            lineHeight: '2',
            paddingLeft: '20px'
          }}>
            <li>Panel de macros diarios (proteínas, carbohidratos, grasas)</li>
            <li>Registro rápido de alimentos y comidas</li>
            <li>Historial de comidas del día</li>
            <li>Gráficos de progreso semanal y mensual</li>
            <li>Calculadora de calorías personalizada</li>
            <li>Seguimiento de peso y medidas corporales</li>
            <li>Sugerencias de comidas según tus macros restantes</li>
            <li>Integración con bases de datos de alimentos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
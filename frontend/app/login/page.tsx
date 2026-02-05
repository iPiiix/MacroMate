'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';


export default function LoginPage() {
  // Router de Next.js para navegación programática
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================

  const [loading, setLoading] = useState(false);
  
  /**
   * formData: Almacena las credenciales del usuario
   * - email: Identificador único del usuario
   * - password: Contraseña para autenticación
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // ==================== MANEJADORES DE EVENTOS ====================

  /**
   * handleChange - Actualiza el estado del formulario en tiempo real
   * 
   * @param e - Evento del input que cambió
   * 
   * Este método se ejecuta cada vez que el usuario escribe en un campo.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,  // Mantener el valor del otro campo
      [e.target.name]: e.target.value  // Actualizar solo el campo que cambió
    });
  };

  /**
   * handleSubmit - Procesa el intento de inicio de sesión
   * 
   * @param e - Evento del formulario
   * 
   * Este es el método principal del componente. Realiza todo el proceso de login:
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // FASE 1: VALIDACIÓN FRONTEND
    e.preventDefault();  // Prevenir recarga de página
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;  // Detener ejecución si falta algún campo
    }

    // FASE 2: PETICIÓN AL BACKEND
    setLoading(true);  // Activar estado de carga

    try {
      const loginRes = await fetch('http://localhost:8000/api/usuarios/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();

      // FASE 3: PROCESAMIENTO DE RESPUESTA
      if (!loginRes.ok) {
        // Login falló - mostrar error
        toast.error(loginData.error || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      // Login exitoso 
      localStorage.setItem('access_token', loginData.access);
      
      // Guardar refresh_token si existe 
      if (loginData.refresh) {
        localStorage.setItem('refresh_token', loginData.refresh);
      }

      // Mostrar mensaje de éxito al usuario
      toast.success('¡Bienvenido de vuelta!');
      
      // Esto permite al usuario ver el mensaje de éxito
      setTimeout(() => {
        router.push('/paginaPrincipal');  // Redirigir a¡ página principal
      }, 1000);

    } catch (error) {
      // FASE 4: MANEJO DE ERRORES DE RED
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      // FASE 5: LIMPIEZA
      // Este bloque SIEMPRE se ejecuta, haya éxito o error
      setLoading(false);
    }
  };

  // ==================== RENDERIZADO DEL COMPONENTE ====================

  return (
    <div style={{
      fontFamily: "'Bungee', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#2b2b2b',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      <header style={{
        borderRadius: '0 0 10px 10px',
        backgroundColor: '#ffffff',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ width: '60px', height: '40px', position: 'relative' }}>
          <Image 
            src="/Logo.png" 
            alt="MacroMate Logo" 
            fill 
            style={{ objectFit: 'cover' }}
            priority  // Cargar el logo con alta prioridad
          />
        </div>
      </header>

    
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
       
        <div style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          
          {/* ========== TÍTULO ========== */}
          <h1 style={{
            textAlign: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '10px',
            letterSpacing: '2px'  // Espaciado amplio para efecto robusto
          }}>
            MACROMATE
          </h1>

          <p style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
            marginBottom: '30px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
          }}>
            Inicia sesión en tu cuenta
          </p>

          {/* ========== FORMULARIO DE LOGIN ========== */}
          
          <form onSubmit={handleSubmit}>
            {/* Campo de Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                style={inputStyle}
                autoComplete="email"  // Ayuda a los gestores de contraseñas
              />
            </div>

            {/* Campo de Contraseña */}
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>CONTRASEÑA</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                style={inputStyle}
                autoComplete="current-password"  // Ayuda a los gestores de contraseñas
              />
            </div>

            {/* ========== BOTÓN DE SUBMIT ========== */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '600',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>
          </form>

          {/* ========== ENLACE A REGISTRO ========== */}
          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#666',
            marginTop: '25px',
            fontFamily: "'Inter', sans-serif"
          }}>
            ¿No tienes cuenta?{' '}
            <a
              href="/registro"
              style={{
                color: '#1a1a1a',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderBottom: '2px solid #1a1a1a'
              }}
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== ESTILOS REUTILIZABLES ====================

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  marginBottom: '8px',
  letterSpacing: '0.5px',
  fontFamily: "'Bungee', sans-serif"
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '2px solid transparent',
  borderRadius: '10px',
  backgroundColor: '#e0e0e0',
  fontSize: '15px',
  color: '#000000',
  fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'all 0.2s ease'
};
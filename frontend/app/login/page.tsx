'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * LoginPage - Componente principal de la página de inicio de sesión
 * 
 * Este componente maneja la autenticación de usuarios existentes mediante:
 * 1. Captura de credenciales (email y contraseña)
 * 2. Envío de petición al backend para validar credenciales
 * 3. Almacenamiento de tokens JWT en localStorage
 * 4. Redirección al dashboard tras login exitoso
 * 
 * Flujo de autenticación:
 * 1. Usuario ingresa email y contraseña
 * 2. Se valida que ambos campos estén completos
 * 3. Se envía POST a /api/usuarios/login/
 * 4. Si las credenciales son correctas:
 *    - Se reciben tokens JWT (access y refresh)
 *    - Se almacenan en localStorage
 *    - Se redirige a /dashboard
 * 5. Si las credenciales son incorrectas:
 *    - Se muestra mensaje de error
 *    - El usuario puede intentar de nuevo
 */
export default function LoginPage() {
  // Router de Next.js para navegación programática
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================
  
  /**
   * loading: Indica si hay una petición HTTP en curso
   * - true: Muestra "INICIANDO SESIÓN..." y deshabilita el botón
   * - false: Muestra "INICIAR SESIÓN" y permite interacción
   * 
   * Esto previene múltiples envíos del formulario mientras se procesa una petición
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * formData: Almacena las credenciales del usuario
   * - email: Identificador único del usuario
   * - password: Contraseña para autenticación
   * 
   * Estos campos se enviarán al backend para validación
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
   * Actualiza el estado con el nuevo valor, manteniendo el otro campo intacto.
   * 
   * Ejemplo de flujo:
   * 1. Usuario escribe "j" en el campo email
   * 2. handleChange se ejecuta con e.target.name = "email" y e.target.value = "j"
   * 3. formData se actualiza a { email: "j", password: "" }
   * 4. El componente se re-renderiza con el nuevo valor
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
   * Este es el método principal del componente. Realiza todo el proceso
   * de autenticación en varias fases:
   * 
   * FASE 1: VALIDACIÓN FRONTEND
   * - Previene el comportamiento por defecto del formulario (recarga de página)
   * - Verifica que ambos campos estén completos
   * - Si falta algún campo, muestra toast de error y detiene el proceso
   * 
   * FASE 2: PETICIÓN AL BACKEND
   * - Activa el estado de carga (loading = true)
   * - Envía POST a http://localhost:8000/api/usuarios/login/
   * - Headers: Content-Type application/json
   * - Body: { email, password } en formato JSON
   * - Espera la respuesta del backend
   * 
   * FASE 3: PROCESAMIENTO DE RESPUESTA
   * - Si la respuesta NO es ok (status 400, 401, etc.):
   *   - Extrae el mensaje de error del backend
   *   - Muestra toast con el error (ej: "Credenciales incorrectas")
   *   - Detiene el estado de carga
   *   - Permite al usuario intentar de nuevo
   * 
   * - Si la respuesta es ok (status 200):
   *   - Extrae los tokens JWT de la respuesta
   *   - Guarda access_token en localStorage (obligatorio)
   *   - Guarda refresh_token en localStorage si existe (opcional)
   *   - Muestra toast de éxito
   *   - Redirige a /dashboard después de 1 segundo
   * 
   * FASE 4: MANEJO DE ERRORES DE RED
   * - Si hay un error de conexión (servidor caído, timeout, etc.)
   * - Se captura en el catch
   * - Se muestra mensaje indicando problema de conexión
   * 
   * FASE 5: LIMPIEZA
   * - El bloque finally siempre se ejecuta
   * - Detiene el estado de carga
   * - Esto asegura que el botón siempre vuelva a estar habilitado
   * 
   * Tokens JWT explicados:
   * - access_token: Token de corta duración (15-30 minutos típicamente)
   *   Se envía en cada petición al backend para autenticar al usuario
   *   Formato del header: Authorization: Bearer <access_token>
   * 
   * - refresh_token: Token de larga duración (7-30 días típicamente)
   *   Se usa para obtener un nuevo access_token cuando expire
   *   Más seguro porque no se envía en cada petición
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

      // Login exitoso - guardar tokens y redirigir
      
      // Guardar access_token (obligatorio)
      // Este token se usará para autenticar peticiones al backend
      localStorage.setItem('access_token', loginData.access);
      
      // Guardar refresh_token si existe (opcional pero recomendado)
      // Este token permite renovar el access_token cuando expire
      if (loginData.refresh) {
        localStorage.setItem('refresh_token', loginData.refresh);
      }

      // Mostrar mensaje de éxito al usuario
      toast.success('¡Bienvenido de vuelta!');
      
      // Esperar 1 segundo antes de redirigir
      // Esto permite al usuario ver el mensaje de éxito
      setTimeout(() => {
        router.push('/paginaPrincipal');  // Redirigir al dashboard
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
      {/* ========== HEADER CON LOGO ========== */}
      {/* 
        Header fijo con el logo de la aplicación
        - Fondo blanco para contraste con el fondo oscuro
        - Bordes redondeados en la parte inferior
        - Sombra para darle profundidad
      */}
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

      {/* ========== CONTENEDOR PRINCIPAL ========== */}
      {/* 
        Contenedor centrado vertical y horizontalmente
        - flex: 1 hace que ocupe todo el espacio disponible
        - Centrado con flexbox (align-items y justify-content)
      */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        {/* ========== TARJETA DE LOGIN ========== */}
        {/* 
          Tarjeta con el formulario de login
          - Fondo claro (#f5f5f5) que contrasta con el fondo oscuro
          - Bordes redondeados generosos (20px)
          - Sombra pronunciada para efecto de elevación
          - Max-width de 450px para mantener legibilidad
        */}
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
          {/* 
            Formulario controlado por React
            - onSubmit maneja el envío del formulario
            - Todos los inputs están controlados por el estado formData
          */}
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
            {/* 
              Botón que cambia según el estado de carga:
              - Texto: "INICIAR SESIÓN" → "INICIANDO SESIÓN..."
              - Cursor: pointer → not-allowed
              - Opacidad: 1 → 0.6
              - Deshabilitado mientras loading es true
              
              Esto proporciona feedback visual y previene múltiples envíos
            */}
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
          {/* 
            Enlace para usuarios nuevos que necesitan crear cuenta
            - Estilo coherente con el resto de la UI
            - Border-bottom en lugar de text-decoration para mejor control visual
          */}
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

/**
 * labelStyle - Estilo para etiquetas de formulario
 * 
 * - Fuente Bungee para mantener consistencia con el branding
 * - Mayúsculas para dar aspecto de "título de sección"
 * - Espaciado de letras para mejorar legibilidad
 * - Color negro sólido para máximo contraste
 */
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  marginBottom: '8px',
  letterSpacing: '0.5px',
  fontFamily: "'Bungee', sans-serif"
};

/**
 * inputStyle - Estilo para campos de entrada
 * 
 * - Fondo gris claro (#e0e0e0) para diferenciar del fondo de la tarjeta
 * - Sin borde visible (border transparent) para look más limpio
 * - Padding generoso (14px 16px) para facilitar interacción táctil
 * - Fuente Inter para mejor legibilidad en texto de entrada
 * - Transición suave para efectos hover futuros
 * - box-sizing: border-box para que el padding no afecte el width
 */
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
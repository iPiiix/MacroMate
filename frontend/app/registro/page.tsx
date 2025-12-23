'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * RegistroPage - Componente principal de la página de registro
 * 
 * Este componente maneja el proceso completo de registro de usuario en 3 pasos:
 * - Paso 1: Datos personales (nombre y apellidos)
 * - Paso 2: Credenciales de cuenta (email y contraseña)
 * - Paso 3: Datos físicos (fecha nacimiento, género, altura, peso, nivel actividad, objetivo)
 * 
 * Flujo de registro:
 * 1. Usuario completa los 3 pasos del formulario
 * 2. Se hace POST a /api/usuarios/registro/ para crear la cuenta
 * 3. Se hace POST a /api/usuarios/login/ para autenticar automáticamente
 * 4. Se hace PUT a /api/usuarios/perfil/ para actualizar datos del perfil
 * 5. Se redirige al dashboard tras registro exitoso
 */
export default function RegistroPage() {
  // Router de Next.js para navegación programática
  const router = useRouter();
  
  // ==================== ESTADOS DEL COMPONENTE ====================
  
  /**
   * loading: Indica si hay una petición HTTP en curso
   * Se usa para deshabilitar botones y mostrar indicadores de carga
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * showSuccess: Controla la visualización del mensaje de éxito
   * Se activa cuando el registro se completa correctamente
   */
  const [showSuccess, setShowSuccess] = useState(false);
  
  /**
   * errors: Almacena mensajes de error por campo
   * Estructura: { nombreCampo: 'mensaje de error' }
   * Ejemplo: { email: 'Este email ya está registrado' }
   */
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  /**
   * currentStep: Controla qué paso del formulario se muestra (1, 2 o 3)
   * - 1: Datos personales
   * - 2: Credenciales
   * - 3: Datos físicos
   */
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * formData: Almacena todos los datos del formulario
   * Este objeto contiene todos los campos que el usuario debe completar
   */
  const [formData, setFormData] = useState({
    nombre: '',              // Nombre del usuario
    apellidos: '',           // Apellidos del usuario
    email: '',               // Email (usado como identificador único)
    password: '',            // Contraseña (mínimo 8 caracteres)
    password_confirm: '',    // Confirmación de contraseña
    fechaNacimiento: '',     // Formato: YYYY-MM-DD
    genero: '',              // 'masculino' o 'femenino'
    altura: '',              // En centímetros
    pesoActual: '',          // En kilogramos
    nivel_actividad: 'sedentario',  // Nivel de actividad física
    objetivo: 'mantenimiento'       // Objetivo del usuario
  });

  // ==================== MANEJADORES DE EVENTOS ====================

  /**
   * handleChange - Actualiza el estado del formulario cuando el usuario escribe
   * 
   * @param e - Evento del input o select que cambió
   * 
   * Funcionamiento:
   * 1. Actualiza el valor del campo en formData
   * 2. Si ese campo tenía un error, lo limpia del estado de errores
   * 
   * Esto proporciona feedback inmediato al usuario: cuando corrige un campo
   * con error, el mensaje de error desaparece automáticamente
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpiar error del campo si existe
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  /**
   * nextStep - Avanza al siguiente paso del formulario
   * 
   * Validaciones por paso:
   * - Paso 1: Verifica que nombre y apellidos no estén vacíos
   * - Paso 2: Valida email, contraseña y confirmación de contraseña
   *   - Verifica que las contraseñas coincidan
   *   - Verifica que la contraseña tenga al menos 8 caracteres
   * 
   * Si las validaciones fallan, muestra el error y no avanza.
   * Si pasan, limpia los errores y avanza al siguiente paso.
   */
  const nextStep = () => {
    // VALIDACIÓN PASO 1: Datos personales
    if (currentStep === 1) {
      if (!formData.nombre || !formData.apellidos) {
        setErrors({ general: 'Por favor, completa tu nombre y apellidos.' });
        return;
      }
    } 
    
    // VALIDACIÓN PASO 2: Credenciales de cuenta
    else if (currentStep === 2) {
      // Verificar que todos los campos estén completos
      if (!formData.email || !formData.password || !formData.password_confirm) {
        setErrors({ general: 'Todos los campos de cuenta son obligatorios.' });
        return;
      }
      
      // Verificar que las contraseñas coincidan
      if (formData.password !== formData.password_confirm) {
        setErrors({ password: 'Las contraseñas no coinciden.' });
        return;
      }
      
      // Verificar longitud mínima de contraseña
      if (formData.password.length < 8) {
        setErrors({ password: 'La contraseña debe tener al menos 8 caracteres.' });
        return;
      }
    }
    
    // Si todas las validaciones pasan, limpiar errores y avanzar
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  /**
   * prevStep - Retrocede al paso anterior del formulario
   * 
   * Limpia los errores al retroceder para que el usuario
   * no vea mensajes de error de pasos futuros
   */
  const prevStep = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * handleSubmit - Procesa el registro completo del usuario
   * 
   * Este es el método más importante del componente. Realiza todo el flujo
   * de registro en 4 fases:
   * 
   * FASE 1: CREAR CUENTA
   * - Envía POST a /api/usuarios/registro/ con email y contraseña
   * - Si falla, muestra los errores del backend
   * - Si hay error en email o contraseña, retrocede al paso 2
   * 
   * FASE 2: LOGIN AUTOMÁTICO
   * - Envía POST a /api/usuarios/login/ con las mismas credenciales
   * - Si falla, informa que la cuenta se creó pero no pudo iniciar sesión
   * - Si tiene éxito, guarda los tokens JWT en localStorage
   * 
   * FASE 3: ACTUALIZAR PERFIL
   * - Envía PUT a /api/usuarios/perfil/ con todos los datos del usuario
   * - Usa el token JWT obtenido en fase 2 para autenticación
   * - Convierte altura y peso a números con parseFloat
   * - Si falla, registra el error en consola (pero el registro ya está completo)
   * 
   * FASE 4: REDIRECCIÓN
   * - Muestra mensaje de éxito
   * - Espera 2 segundos
   * - Redirige a /dashboard
   * 
   * Manejo de errores:
   * - Errores de red: Muestra mensaje de error de conexión
   * - Errores del backend: Extrae y muestra mensajes específicos por campo
   * - Todos los errores se registran en consola para debugging
   */
  const handleSubmit = async () => {
    // Validar que todos los campos del paso 3 estén completos
    if (!formData.fechaNacimiento || !formData.genero || !formData.altura || !formData.pesoActual) {
      setErrors({ general: 'Por favor, completa todos los datos físicos.' });
      return;
    }

    // Iniciar proceso de carga
    setLoading(true);
    setErrors({});

    try {
      // ========== FASE 1: CREAR CUENTA EN EL BACKEND ==========
      console.log(' Iniciando registro...');
      
      const registroRes = await fetch('http://localhost:8000/api/usuarios/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: formData.email,  // Usamos email como nombre de usuario
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm
        })
      });

      const userData = await registroRes.json();
      console.log('Respuesta registro:', userData);

      // Si el registro falla, procesar y mostrar errores
      if (!registroRes.ok) {
        console.error(' Error en registro:', userData);
        
        // Crear objeto de errores a partir de la respuesta del backend
        const newErrors: Record<string, string> = {};
        
        // El backend puede devolver errores como strings o arrays
        if (userData.email) {
          newErrors.email = Array.isArray(userData.email) 
            ? userData.email[0] 
            : userData.email;
        }
        if (userData.password) {
          newErrors.password = Array.isArray(userData.password) 
            ? userData.password[0] 
            : userData.password;
        }
        if (userData.non_field_errors) {
          newErrors.general = Array.isArray(userData.non_field_errors) 
            ? userData.non_field_errors[0] 
            : userData.non_field_errors;
        }
        
        setErrors(newErrors);
        
        // Si el error es en email o contraseña, volver al paso 2
        if (newErrors.email || newErrors.password) {
          setCurrentStep(2);
        }
        
        setLoading(false);
        return;
      }

      // ========== FASE 2: LOGIN AUTOMÁTICO ==========
      console.log(' Iniciando sesión automática...');
      
      const loginRes = await fetch('http://localhost:8000/api/usuarios/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();
      console.log(' Respuesta login:', loginData);

      if (!loginRes.ok) {
        console.error(' Error en login:', loginData);
        setErrors({ 
          general: 'Cuenta creada pero no se pudo iniciar sesión automáticamente.' 
        });
        setLoading(false);
        return;
      }

      // Guardar tokens JWT en localStorage para mantener la sesión
      // access_token: Token de acceso (corta duración, ~15-30 min)
      // refresh_token: Token para renovar el access_token (larga duración, ~7-30 días)
      const token = loginData.access;
      localStorage.setItem('access_token', token);
      if (loginData.refresh) {
        localStorage.setItem('refresh_token', loginData.refresh);
      }

      // ========== FASE 3: ACTUALIZAR PERFIL CON DATOS FÍSICOS ==========
      console.log(' Actualizando perfil...');
      
      const perfilRes = await fetch('http://localhost:8000/api/usuarios/perfil/', {
        method: 'PUT',  // PUT porque estamos actualizando un recurso existente
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Incluir token JWT para autenticación
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fechaNacimiento,
          genero: formData.genero,
          altura: parseFloat(formData.altura),        // Convertir a número
          peso_actual: parseFloat(formData.pesoActual), // Convertir a número
          peso_objetivo: parseFloat(formData.pesoActual), // Por ahora igual al actual
          nivel_actividad: formData.nivel_actividad,
          objetivo: formData.objetivo
        })
      });

      const perfilData = await perfilRes.json();
      console.log(' Respuesta perfil:', perfilData);

      // Si falla la actualización del perfil, lo registramos pero no bloqueamos
      // porque el usuario ya está registrado y autenticado
      if (!perfilRes.ok) {
        console.error(' Error actualizando perfil:', perfilData);
      }

      // ========== FASE 4: MOSTRAR ÉXITO Y REDIRIGIR ==========
      console.log(' ¡Registro completado!');
      setShowSuccess(true);
      
      // Esperar 2 segundos antes de redirigir para que el usuario
      // vea el mensaje de éxito
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      // Capturar errores de red (servidor no disponible, timeout, etc.)
      console.error(' Error fatal:', error);
      setErrors({
        general: 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8000'
      });
    } finally {
      // Siempre detener el indicador de carga, independientemente del resultado
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
      {/* HEADER CON LOGO */}
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
            style={{ objectFit: 'cover', borderRadius: '%' }}
            priority
          />
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL DEL FORMULARIO */}
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
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          
          {/* TÍTULO DE LA APLICACIÓN */}
          <h1 style={{
            textAlign: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '10px',
            letterSpacing: '2px'
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
            Crea tu cuenta en 3 simples pasos
          </p>

          {/* ========== INDICADOR DE PROGRESO DE PASOS ========== */}
          {/* 
            Este componente visual muestra al usuario en qué paso está
            y cuántos pasos faltan. Incluye:
            - Línea de progreso horizontal
            - Círculos numerados para cada paso
            - Etiquetas descriptivas
          */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px',
            position: 'relative'
          }}>
            {/* Línea de fondo (gris) */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15%',
              right: '15%',
              height: '3px',
              backgroundColor: '#e0e0e0',
              zIndex: 0
            }}>
              {/* Línea de progreso (negra) - crece según el paso actual */}
              <div style={{
                height: '100%',
                backgroundColor: '#1a1a1a',
                width: `${((currentStep - 1) / 2) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            {/* Generar los 3 círculos de paso */}
            {[1, 2, 3].map(step => (
              <div key={step} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 1
              }}>
                {/* Círculo numerado */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  // Cambiar color según si el paso está completado/actual
                  backgroundColor: currentStep >= step ? '#1a1a1a' : '#e0e0e0',
                  color: currentStep >= step ? '#fff' : '#999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {step}
                </div>
                {/* Etiqueta del paso */}
                <span style={{
                  fontSize: '10px',
                  marginTop: '8px',
                  color: currentStep >= step ? '#1a1a1a' : '#999',
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'center'
                }}>
                  {step === 1 ? 'Datos' : step === 2 ? 'Cuenta' : 'Físico'}
                </span>
              </div>
            ))}
          </div>

          {/* ========== MENSAJE DE ÉXITO ========== */}
          {/* Se muestra cuando el registro se completa correctamente */}
          {showSuccess && (
            <div style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              animation: 'slideIn 0.3s ease',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              ✓ ¡Registro exitoso! Redirigiendo...
            </div>
          )}

          {/* ========== MENSAJE DE ERROR GENERAL ========== */}
          {/* Se muestra para errores que no son específicos de un campo */}
          {errors.general && (
            <div style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif"
            }}>
              {errors.general}
            </div>
          )}

          {/* ========== PASO 1: DATOS PERSONALES ========== */}
          {/* Captura nombre y apellidos del usuario */}
          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>NOMBRE</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  style={inputStyle}
                />
                {errors.nombre && <span style={errorTextStyle}>{errors.nombre}</span>}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>APELLIDOS</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Tus apellidos"
                  style={inputStyle}
                />
              </div>
              
              <button onClick={nextStep} style={buttonPrimaryStyle}>
                CONTINUAR →
              </button>
            </div>
          )}

          {/* ========== PASO 2: CREDENCIALES DE CUENTA ========== */}
          {/* Captura email y contraseña con confirmación */}
          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  style={inputStyle}
                />
                {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>CONTRASEÑA</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  style={inputStyle}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>CONFIRMAR CONTRASEÑA</label>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  style={inputStyle}
                />
                {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
              </div>
              
              {/* Botones de navegación */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={prevStep} style={buttonSecondaryStyle}>
                  ← ATRÁS
                </button>
                <button onClick={nextStep} style={buttonPrimaryStyle}>
                  CONTINUAR →
                </button>
              </div>
            </div>
          )}

          {/* ========== PASO 3: DATOS FÍSICOS ========== */}
          {/* 
            Captura información para cálculo de macros y calorías:
            - Fecha de nacimiento (para calcular edad)
            - Género (afecta TMB)
            - Altura y peso (para calcular IMC y TMB)
            - Nivel de actividad (multiplicador de calorías)
            - Objetivo (déficit/superávit calórico)
          */}
          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>FECHA DE NACIMIENTO</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>GÉNERO</label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              {/* Grid de 2 columnas para altura y peso */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={labelStyle}>ALTURA (cm)</label>
                  <input
                    type="number"
                    name="altura"
                    value={formData.altura}
                    onChange={handleChange}
                    placeholder="170"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>PESO (kg)</label>
                  <input
                    type="number"
                    name="pesoActual"
                    value={formData.pesoActual}
                    onChange={handleChange}
                    placeholder="70"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>NIVEL DE ACTIVIDAD</label>
                <select
                  name="nivel_actividad"
                  value={formData.nivel_actividad}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="sedentario">Sedentario</option>
                  <option value="ligero">Ligero</option>
                  <option value="moderado">Moderado</option>
                  <option value="activo">Activo</option>
                  <option value="muy_activo">Muy Activo</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>OBJETIVO</label>
                <select
                  name="objetivo"
                  value={formData.objetivo}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="perdida_peso">Pérdida de peso</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="ganancia_muscular">Ganancia muscular</option>
                </select>
              </div>

              {/* Botones de navegación final */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={prevStep} style={buttonSecondaryStyle}>
                  ← ATRÁS
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    ...buttonPrimaryStyle,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'REGISTRANDO...' : 'COMPLETAR ✓'}
                </button>
              </div>
            </div>
          )}

          {/* ENLACE A LOGIN */}
          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#666',
            marginTop: '25px',
            fontFamily: "'Inter', sans-serif"
          }}>
            ¿Ya tienes cuenta?{' '}
            <a
              href="/login"
              style={{
                color: '#1a1a1a',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderBottom: '2px solid #1a1a1a'
              }}
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </div>

      {/* ANIMACIONES CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// ==================== ESTILOS REUTILIZABLES ====================

/**
 * Estilo para etiquetas de formulario
 * - Fuente Bungee para mantener consistencia con el branding
 * - Mayúsculas y espaciado de letras para aspecto robusto
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
 * Estilo para inputs y selects
 * - Fondo gris claro (#e0e0e0) para contraste suave
 * - Sin borde visible normalmente (border transparent)
 * - Padding generoso para facilitar interacción táctil
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
  transition: 'all 0.2s ease',
  cursor: 'pointer'
};

/**
 * Estilo para botón primario (acciones principales)
 * - Fondo negro sólido para máximo contraste
 * - Texto blanco en mayúsculas
 * - Crece con flex: 1 para ocupar espacio disponible
 */
const buttonPrimaryStyle = {
  flex: 1,
  padding: '16px',
  border: 'none',
  borderRadius: '10px',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: "'Inter', sans-serif",
  fontWeight: '600'
};

/**
 * Estilo para botón secundario (acciones de retroceso)
 * - Fondo transparente con borde negro
 * - Menos prominente que el botón primario
 */
const buttonSecondaryStyle = {
  flex: 1,
  padding: '16px',
  border: '2px solid #1a1a1a',
  borderRadius: '10px',
  backgroundColor: 'transparent',
  color: '#1a1a1a',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: "'Inter', sans-serif",
  fontWeight: '600'
};

/**
 * Estilo para mensajes de error
 * - Color rojo para indicar problema
 * - Tamaño pequeño para no dominar la UI
 */
const errorTextStyle = {
  color: '#d32f2f',
  fontSize: '12px',
  marginTop: '5px',
  display: 'block',
  fontFamily: "'Inter', sans-serif"
};
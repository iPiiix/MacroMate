'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    password_confirm: '',
    fechaNacimiento: '',
    genero: '',
    altura: '',
    pesoActual: '',
    nivel_actividad: 'sedentario',
    objetivo: 'mantenimiento'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpiar error del campo actual
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const nextStep = () => {
    // Validación Paso 1
    if (currentStep === 1) {
      if (!formData.nombre || !formData.apellidos) {
        setErrors({ general: 'Por favor, completa tu nombre y apellidos.' });
        return;
      }
    } 
    
    // Validación Paso 2
    else if (currentStep === 2) {
      if (!formData.email || !formData.password || !formData.password_confirm) {
        setErrors({ general: 'Todos los campos de cuenta son obligatorios.' });
        return;
      }
      if (formData.password !== formData.password_confirm) {
        setErrors({ password: 'Las contraseñas no coinciden.' });
        return;
      }
      if (formData.password.length < 8) {
        setErrors({ password: 'La contraseña debe tener al menos 8 caracteres.' });
        return;
      }
    }
    
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validación Paso 3
    if (!formData.fechaNacimiento || !formData.genero || !formData.altura || !formData.pesoActual) {
      setErrors({ general: 'Por favor, completa todos los datos físicos.' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // PASO 1: Registrar usuario
      console.log(' Iniciando registro...');
      const registroRes = await fetch('http://localhost:8000/api/usuarios/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: formData.email,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm
        })
      });

      const userData = await registroRes.json();
      console.log(' Respuesta registro:', userData);

      if (!registroRes.ok) {
        console.error(' Error en registro:', userData);
        const newErrors: Record<string, string> = {};
        
        if (userData.email) newErrors.email = Array.isArray(userData.email) ? userData.email[0] : userData.email;
        if (userData.password) newErrors.password = Array.isArray(userData.password) ? userData.password[0] : userData.password;
        if (userData.non_field_errors) newErrors.general = Array.isArray(userData.non_field_errors) ? userData.non_field_errors[0] : userData.non_field_errors;
        
        setErrors(newErrors);
        
        if (newErrors.email || newErrors.password) {
          setCurrentStep(2);
        }
        
        setLoading(false);
        return;
      }

      // PASO 2: Hacer login automático
      console.log('Iniciando sesión automática...');
      const loginRes = await fetch('http://localhost:8000/api/usuarios/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();
      console.log('Respuesta login:', loginData);

      if (!loginRes.ok) {
        console.error(' Error en login:', loginData);
        setErrors({ general: 'Cuenta creada pero no se pudo iniciar sesión automáticamente.' });
        setLoading(false);
        return;
      }

      // Guardar tokens
      const token = loginData.access;
      localStorage.setItem('access_token', token);
      if (loginData.refresh) {
        localStorage.setItem('refresh_token', loginData.refresh);
      }

      // PASO 3: Actualizar perfil con datos adicionales
      console.log('👤 Actualizando perfil...');
      const perfilRes = await fetch('http://localhost:8000/api/usuarios/perfil/', {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fechaNacimiento,
          genero: formData.genero,
          altura: parseFloat(formData.altura),
          peso_actual: parseFloat(formData.pesoActual),
          peso_objetivo: parseFloat(formData.pesoActual),
          nivel_actividad: formData.nivel_actividad,
          objetivo: formData.objetivo
        })
      });

      const perfilData = await perfilRes.json();
      console.log('Respuesta perfil:', perfilData);

      if (!perfilRes.ok) {
        console.error('Error actualizando perfil:', perfilData);
        // Aunque falle el perfil, el usuario ya está registrado
        console.warn('Usuario creado, pero hubo un error guardando tus datos físicos. Por favor ve a "Mi Perfil" para completarlos');
      }

      // MOSTRAR MENSAJE DE ÉXITO
      console.log('¡Registro completado!');
      setShowSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error fatal:', error);
      setErrors({
        general: 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8000'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Bungee', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#2b2b2b',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER */}
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

      {/* CONTENIDO PRINCIPAL */}
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
          
          {/* TÍTULO */}
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

          {/* INDICADOR DE PASOS */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15%',
              right: '15%',
              height: '3px',
              backgroundColor: '#e0e0e0',
              zIndex: 0
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#1a1a1a',
                width: `${((currentStep - 1) / 2) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            {[1, 2, 3].map(step => (
              <div key={step} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
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

          {/* MENSAJE DE ÉXITO */}
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
              ✓ ¡Registro exitoso! Redirigiendo al dashboard...
            </div>
          )}

          {/* MENSAJE DE ERROR GENERAL */}
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

          {/* PASO 1: DATOS PERSONALES */}
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

          {/* PASO 2: CUENTA */}
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

          {/* PASO 3: DATOS FÍSICOS */}
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

          {/* PIE DE FORMULARIO */}
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

// ==================== ESTILOS ====================

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  marginBottom: '8px',
  letterSpacing: '0.5px',
  fontFamily: "'Bungee', sans-serif" // Solo los labels mantienen Bungee
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
  transition: 'all 0.2s ease',
  cursor: 'pointer'
};

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

const errorTextStyle = {
  color: '#d32f2f',
  fontSize: '12px',
  marginTop: '5px',
  display: 'block',
  fontFamily: "'Inter', sans-serif"
};
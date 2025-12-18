'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
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
    pesoActual: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.nombre || !formData.apellidos) return;
    } else if (currentStep === 2) {
      if (!formData.email || !formData.password || !formData.password_confirm) return;
      if (formData.password !== formData.password_confirm) {
        setErrors({ password: 'Las contraseñas no coinciden' });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.fechaNacimiento || !formData.genero || !formData.altura || !formData.pesoActual) {
      setErrors({ general: 'Por favor, completa todos los datos físicos antes de finalizar.' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const registroRes = await fetch('http://localhost:8000/api/usuarios/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: formData.email, // Django pide nombre_usuario (Unique)
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm
        })
      });

      const userData = await registroRes.json();

      if (!registroRes.ok) {
        const newErrors = {};
        if (userData.email) { newErrors.email = userData.email[0]; setCurrentStep(2); }
        if (userData.nombre_usuario) { newErrors.email = "Este correo ya está registrado"; setCurrentStep(2); }
        if (userData.password) { newErrors.password = userData.password[0]; setCurrentStep(2); }
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const loginRes = await fetch('http://localhost:8000/api/usuarios/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        const token = loginData.access || loginData.token;
        localStorage.setItem('access_token', token);
        if (loginData.refresh) localStorage.setItem('refresh_token', loginData.refresh);

        await fetch('http://localhost:8000/api/usuarios/perfil/', {
          method: 'POST',
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
            nivel_actividad: 'sedentario',
            objetivo: 'mantenimiento'
          })
        });

        setShowSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setErrors({ general: 'Usuario creado, pero hubo un problema al iniciar sesión automáticamente.' });
      }

    } catch (error) {
      setErrors({
        general: 'Error de conexión. Verifica que el servidor Django esté activo.'
      });
      console.error('Error:', error);
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
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', letterSpacing: '2px' }}>
            MACROMATE
          </h1>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '30px', fontFamily: 'Arial, sans-serif' }}>
            Crea tu cuenta en 3 simples pasos
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '15%', right: '15%', height: '3px', backgroundColor: '#e0e0e0', zIndex: 0 }}>
              <div style={{ height: '100%', backgroundColor: '#1a1a1a', width: `${((currentStep - 1) / 2) * 100}%`, transition: 'width 0.3s ease' }} />
            </div>

            {[1, 2, 3].map(step => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: currentStep >= step ? '#1a1a1a' : '#e0e0e0',
                  color: currentStep >= step ? '#fff' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s ease', fontFamily: 'Arial, sans-serif'
                }}>
                  {step}
                </div>
                <span style={{ fontSize: '10px', marginTop: '8px', color: currentStep >= step ? '#1a1a1a' : '#999', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
                  {step === 1 ? 'Datos' : step === 2 ? 'Cuenta' : 'Físico'}
                </span>
              </div>
            ))}
          </div>

          {showSuccess && (
            <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif', animation: 'slideIn 0.3s ease' }}>
              ✓ ¡Registro exitoso! Redirigiendo...
            </div>
          )}

          {errors.general && (
            <div style={{ backgroundColor: '#f44336', color: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
              {errors.general}
            </div>
          )}

          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>NOMBRE</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" required style={inputStyle} />
                {errors.nombre && <span style={errorTextStyle}>{errors.nombre}</span>}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>APELLIDOS</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Tus apellidos" required style={inputStyle} />
              </div>
              <button onClick={nextStep} style={buttonPrimaryStyle}>CONTINUAR →</button>
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>EMAIL</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required style={inputStyle} />
                {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>CONTRASEÑA</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>CONFIRMAR CONTRASEÑA</label>
                <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} placeholder="Repite tu contraseña" required style={inputStyle} />
                {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={prevStep} style={buttonSecondaryStyle}>← ATRÁS</button>
                <button onClick={nextStep} style={buttonPrimaryStyle}>CONTINUAR →</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>FECHA DE NACIMIENTO</label>
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>GÉNERO</label>
                <select name="genero" value={formData.genero} onChange={handleChange} required style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>ALTURA (cm)</label>
                  <input type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="170" step="0.01" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>PESO (kg)</label>
                  <input type="number" name="pesoActual" value={formData.pesoActual} onChange={handleChange} placeholder="70" step="0.01" required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={prevStep} style={buttonSecondaryStyle}>← ATRÁS</button>
                <button onClick={handleSubmit} disabled={loading} style={buttonPrimaryStyle}>
                  {loading ? 'REGISTRANDO...' : 'COMPLETAR ✓'}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '25px', fontFamily: 'Arial, sans-serif' }}>
            ¿Ya tienes cuenta? <a href="/login" style={{ color: '#1a1a1a', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid #1a1a1a' }}>Inicia sesión</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// Estilos reutilizables
const inputStyle = {
  width: '100%', padding: '14px 16px', border: '2px solid transparent', borderRadius: '10px',
  backgroundColor: '#e0e0e0', fontSize: '15px', color: '#000000', fontFamily: 'Arial, sans-serif',
  outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease'
};

const buttonPrimaryStyle = {
  flex: 1, padding: '16px', border: 'none', borderRadius: '10px', backgroundColor: '#1a1a1a',
  color: '#fff', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer'
};

const buttonSecondaryStyle = {
  flex: 1, padding: '16px', border: '2px solid #1a1a1a', borderRadius: '10px', backgroundColor: 'transparent',
  color: '#1a1a1a', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer'
};

const errorTextStyle = { color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block', fontFamily: 'Arial, sans-serif' };
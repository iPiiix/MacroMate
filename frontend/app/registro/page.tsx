'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FormErrors {
  nombre?: string;
  apellidos?: string;
  email?: string;
  password?: string;
  fechaNacimiento?: string;
  genero?: string;
  altura?: string;
  pesoActual?: string;
  general?: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/usuarios/registro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: formData.nombre,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          perfil: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            fecha_nacimiento: formData.fechaNacimiento,
            genero: formData.genero,
            altura: parseFloat(formData.altura),
            peso_actual: parseFloat(formData.pesoActual)
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar tokens
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
        }

        // Mostrar mensaje de éxito
        setShowSuccess(true);

        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Manejar errores del backend
        const newErrors: FormErrors = {};
        
        if (data.email) newErrors.email = data.email[0];
        if (data.password) newErrors.password = data.password[0];
        if (data.nombre_usuario) newErrors.nombre = data.nombre_usuario[0];
        if (data.perfil?.altura) newErrors.altura = data.perfil.altura[0];
        if (data.perfil?.peso_actual) newErrors.pesoActual = data.perfil.peso_actual[0];
        
        setErrors(newErrors);
      }
    } catch (error) {
      setErrors({
        general: 'Error de conexión. Verifica que el servidor Django esté corriendo en http://localhost:8000'
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Bungee', Arial, sans-serif",
      backgroundColor: '#2b2b2b',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        borderRadius: '0 0 10px 10px',
        backgroundColor: '#ffffff',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          width: '60px',
          height: '40px',
          position: 'relative'
        }}>
          <Image
            src="/Logo.png"
            alt="MacroMate Logo"
            fill
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </header>

      {/* Contenedor Principal */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '75px 20px'
      }}>
        {/* Tarjeta del Formulario */}
        <div style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '450px'
        }}>
          <h1 style={{
            textAlign: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '30px',
            letterSpacing: '2px'
          }}>
            MACROMATE
          </h1>

          {/* Mensaje de Éxito */}
          {showSuccess && (
            <div style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              ¡Registro exitoso! Redirigiendo...
            </div>
          )}

          {/* Mensaje de Error General */}
          {errors.general && (
            <div style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Nombre:
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.nombre && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.nombre}
                </span>
              )}
            </div>

            {/* Apellidos */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Apellidos:
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.apellidos && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.apellidos}
                </span>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Correo electrónico:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.email && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Contraseña:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.password && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Confirmar Contraseña:
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Fecha de nacimiento:
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.fechaNacimiento && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.fechaNacimiento}
                </span>
              )}
            </div>

            {/* Género */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Género:
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
              {errors.genero && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.genero}
                </span>
              )}
            </div>

            {/* Altura */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Altura (cm):
              </label>
              <input
                type="number"
                name="altura"
                value={formData.altura}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.altura && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.altura}
                </span>
              )}
            </div>

            {/* Peso Actual */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Peso actual (kg):
              </label>
              <input
                type="number"
                name="pesoActual"
                value={formData.pesoActual}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {errors.pesoActual && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.pesoActual}
                </span>
              )}
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading ? '#666' : '#1a1a1a',
                color: '#fff',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                fontFamily: "'Bungee', Arial, sans-serif"
              }}
            >
              {loading ? 'REGISTRANDO...' : 'CONFIRMAR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
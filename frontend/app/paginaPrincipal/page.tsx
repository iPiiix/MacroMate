'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * HomePage - Página de inicio de MacroMate
 * 
 * Esta es la landing page principal que muestra:
 * - Header con navegación a diferentes secciones
 * - Sección hero con mensaje motivacional
 * - Sección de seguimiento de progreso
 * - Sección de planificación de comidas
 * - Footer con información y enlaces
 * 
 * Diseño: Fondo oscuro (#2b2b2b) con secciones destacadas
 */
export default function HomePage() {
  const router = useRouter();

  // ==================== MANEJADORES DE NAVEGACIÓN ====================

  /**
   * Navega a la página de inicio
   */
  const handlePaginaPrincipalClick = () => {
    router.push('/paginaPrincipal');
  };

  /**
   * Navega a la sección de dietas
   */
  const handleDietasClick = () => {
    router.push('/dietas');
  };

  /**
   * Navega al perfil del usuario
   * Icono: Usuario/perfil
   */
  const handlePerfilClick = () => {
    router.push('/perfil');
  };

  /**
   * Navega a la sección de objetivos/metas
   * Asociado al icono del músculo en la primera sección
   */
  const handleMetasClick = () => {
    router.push('/metas');
  };

  /**
   * Navega a la sección de seguimiento diario
   * Asociado al icono del calendario en la segunda sección
   */
  const handleMacrosClick = () => {
    router.push('/macros');
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
      {/*
        Header fijo con logo y 4 iconos de navegación
        - Logo MacroMate (izquierda)
        - 4 iconos de navegación (derecha)
        Todos los iconos son clickeables y redirigen a su página correspondiente
      */}
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
        {/* Logo MacroMate - Clickeable para volver al inicio */}
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
            //Animaciones
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
            }}><Image 
                  src="/metas.png" 
                  alt="Inicio" 
                  fill 
                /></div>
          </div>

          {/* Icono 2: Progreso de macros*/}
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
                  alt="Recetas" 
                  fill 
                />
            </div>
          </div>

          {/* Icono 3: Nutrición*/}
          <div 
            onClick={handleDietasClick}
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
                  src="/dietas.png" 
                  alt="Nutrición" 
                  fill 
                />
            </div>
          </div>

          {/* Icono 4: Perfil*/}
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

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <main style={{
        padding: '60px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* ========== SECCIÓN 1: METAS ========== */}
      
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '80px',
          alignItems: 'center'
        }}>
          {/* Columna izquierda: Icono y texto */}
          <div>
            {/* Icono de metas */}
            <div 
              onClick={handleMetasClick}
              style={{
                width: '80px',
                height: '80px',
                position: 'relative',
                marginBottom: '30px',
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
              {
                  <Image 
                    src="/metas.png" 
                    alt="Objetivos" 
                    fill 
                    style={{ objectFit: 'contain' }}
                  />
              }
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#4a9eff',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}></div>
            </div>

            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '1px'
            }}>
              LA META LA PONES TÚ...
            </h1>

            {/* Texto descriptivo */}
            <p style={{
              fontSize: '15px',
              color: '#cccccc',
              lineHeight: '1.8',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '300'
            }}>
              Este es el objetivo donde definirás cuál será tu ideal de desarrollo 
              físico. Este ideal se volverá el objetivo que 
              lucharás por alcanzar para que tu cuerpo refleje al máximo todos los 
              sacrificios que has tomado. La plataforma junto con las herramientas a las 
              cuales puedes tener acceso, estará aquí para que puedas desafiar lo que crees 
              es imposible con tu cuerpo y demostrar que eres fuerte y decidido, 
              enfrentándote y dándote cuenta de que eres mucho más que lo que crees de 
              ti mismo. 
            </p>
          </div>

          {/* Columna derecha: Imagen de Metas*/}
          <div style={{
            width: '100%',
            height: '400px',
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            {
                <Image 
                  src="/goal.png" 
                  alt="Culturistas" 
                  fill 
                  style={{ objectFit: 'contain' }}
                />   
            }
          
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}></div>
          </div>
        </section>

        {/* ========== SECCIÓN 2: TÚ PROGRESO DÍA A DÍA ========== */}
        
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          marginBottom: '80px',
          alignItems: 'center'
        }}>
          {/* Columna izquierda */}
          <div style={{
            width: '100%',
            height: '370px',
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            {
                <Image 
                  src="/macros.png" 
                  alt="Progreso" 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
            }
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}></div>
          </div>

          {/* Columna derecha: Icono y texto */}
          <div>
            {/* Icono de macros */}
            <div 
              onClick={handleMacrosClick}
              style={{
                width: '80px',
                height: '80px',
                position: 'relative',
                marginBottom: '30px',
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
              {
                  <Image 
                    src="/progresoMacros.png" 
                    alt="Progreso Diario" 
                    fill 
                    style={{ objectFit: 'contain' }}
                  />
              }
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#4a9eff',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}></div>
            </div>

            {/* Título */}
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '1px'
            }}>
              TÚ PROGRESO DÍA A DÍA
            </h2>

            {/* Texto descriptivo */}
            <p style={{
              fontSize: '15px',
              color: '#cccccc',
              lineHeight: '1.8',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '300'
            }}>
              Aquí es donde tu compromiso se cristaliza en resultados reales. Registra tus 
              comidas cada día de la semana sin fallar y te garantizaremos tu espacio para 
              que mantengas el control de tu vida y puedas comprobar algo muy especial 
              respecto a lo que estás haciendo al obtener peso, masa y medida y tomar la 
              decisión completa de cumplir con tu sueño.
            </p>
          </div>
        </section>

        {/* ========== SECCIÓN 3: TU COMBUSTIBLE PARA EL CAMBIO ========== */}
      
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '60px',
          alignItems: 'center'
        }}>
          {/* Columna izquierda: Icono y texto */}
          <div>
            {/* Icono de dietas */}
            <div 
              onClick={handleDietasClick}
              style={{
                width: '80px',
                height: '80px',
                position: 'relative',
                marginBottom: '30px',
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
              {
                  <Image 
                    src="/dietas.png" 
                    alt="Comidas" 
                    fill 
                    style={{ objectFit: 'contain' }}
                  />
              }
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#4a9eff',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}></div>
            </div>

            {/* Título */}
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '1px'
            }}>
              TU COMBUSTIBLE PARA EL CAMBIO
            </h2>

            {/* Texto descriptivo */}
            <p style={{
              fontSize: '15px',
              color: '#cccccc',
              lineHeight: '1.8',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '300'
            }}>
              No es falta de comer menos, sino de comer mejor. Aquí encontrarás cómo 
              transformar tus hábitos alimenticios en una estructura bien planeada de ayuno 
              y de recibo. Con cada recomendación diseñada para tu máximo rendimiento y 
              un perfil que se adhiere a tu objetivo. Nunca se debe sentirse como una dieta, 
              sino como tu primera experiencia en alimentarte de forma equilibrada con 
              nutrición.
            </p>
          </div>

          {/* Columna derecha: Grid de imágenes de comidas (3x3) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px'
          }}>
            {/* Columna derecha: Imagen de Dietas */}
          <div style={{
            width: '380px',
            height: '400px',
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            {
                <Image 
                  src="/dietas2.png" 
                  alt="Dietas" 
                  fill 
                  style={{ objectFit: 'contain' }}
                />   
            }

            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}></div>
          </div>
          </div>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
  
      <footer style={{
        backgroundColor: '#1a1a1a',
        padding: '40px 40px 30px',
        borderTop: '1px solid #333'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Copyright y texto legal */}
          <p style={{
            fontSize: '12px',
            color: '#888',
            marginBottom: '15px',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.6'
          }}>
            © 2025 MacroMate. Todos los derechos reservados.
            <br />
            Te informo de nuestra privacidad y claridad lector para quien eres libre consciencia 
            en el uso que le dar y que esto no sustituya la atención médica de un profesional.
          </p>

          {/* Enlaces */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <a 
              style={{
                fontSize: '12px',
                color: '#4a9eff',
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif",
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6bb3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4a9eff';
              }}
            >
              📧 Contacto: 13763596@murciaeduca.es
            </a>
            <a 
              style={{
                fontSize: '12px',
                color: '#4a9eff',
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif",
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6bb3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4a9eff';
              }}
            >
              📞 Tel: +34 622 81 062
            </a>
            
          </div>
        </div>
      </footer>
    </div>
  );
}
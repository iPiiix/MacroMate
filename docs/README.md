<div align="center">

# MacroMate - Smart Nutrition


![Django](https://img.shields.io/badge/Django-5.2.7-green?logo=django)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![Python](https://img.shields.io/badge/Python-3.11-yellow?logo=python)

**Sistema inteligente de seguimiento nutricional con recomendaciones de IA**

*Proyecto Académico 2025-2026 - Desarrollo de Aplicaciones Multiplataforma*

</div>

## Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Instalación Rápida](#-instalación-rápida)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Equipo](#-equipo)
- [Contacto](#-contacto)

## Características

### Funcionalidades Principales
- **Dashboard Nutricional** - Seguimiento en tiempo real de calorías y macronutrientes
- **Asistente IA** - Recomendaciones personalizadas con OpenAI GPT-4
- **Progreso Visual** - Gráficos interactivos de evolución física y nutricional
- **Perfiles Personalizados** - Cálculo automático de BMR, TDEE y macros según objetivos
- **Base de Datos de Alimentos** - Catálogo extenso con información nutricional

### Para el Proyecto Académico
- **Arquitectura Moderna** - Separación clara entre frontend y backend
- **Autenticación JWT** - Sistema seguro de usuarios y permisos
- **Contenerización** - Entorno reproducible con Docker
- **Documentación Completa** - Cobertura técnica y de usuario

## Arquitectura

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React + Vite + Tailwind CSS | 18.x |
| **Backend** | Django + Django REST Framework | 5.2.7 |
| **Base de Datos** | MySQL 8.0 | 8.0 |
| **Autenticación** | JWT Tokens | - |
| **Contenerización** | Docker + Docker Compose | - |
| **IA** | OpenAI API (GPT-4) | - |

## Instalación Rápida

### Prerrequisitos
- **Docker** y **Docker Compose**
- **Python 3.11+**
- **Node.js 18+** 

### Instalación con Docker 

```bash
# 1. Clonar el repositorio
git clone https://github.com/tuusuario/macromate.git
cd MacroMate

# 2. Iniciar servicios con Docker
docker-compose up -d

# 3. Verificar que los servicios estén corriendo
docker ps

# INSTALACIÓN MANUAL [DESARROLLO]

# 1. Clonar repositorio
git clone https://github.com/tuusuario/macromate.git
cd MacroMate

# 2. Configurar entorno virtual Python
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar base de datos MySQL
cd backend
python manage.py migrate

# 5. Crear superusuario
python manage.py createsuperuser

# 6. Iniciar servidor de desarrollo
python manage.py runserver
```

# 👥 Equipo

## Desarrolladores Del Proyecto

- Santiago Pérez Guerrero
- Juan José Cardona Ospina

## Información Académica

IES Infanta Elena  
Desarrollo de Aplicaciones Multiplataforma  
Año Académico 2025-2026

##### Presentado ante el: Equipo Docente del Departamento de Informática

>Proyecto desarrollado como parte de la formación académica en desarrollo software multiplataforma

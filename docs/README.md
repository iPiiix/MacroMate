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

>Proyecto desarrollado como parte de la formación académica en desarrollo software multiplataforma

<footer class="bg-gray-900 text-white py-12 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Grid principal -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <!-- Columna 1: Información del proyecto -->
            <div class="col-span-1 md:col-span-2">
                <div class="flex items-center mb-4">
                    <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg mr-3"></div>
                    <h3 class="text-xl font-bold">MacroMate</h3>
                </div>
                <p class="text-gray-300 mb-4 max-w-md">
                    Sistema inteligente de seguimiento nutricional desarrollado como proyecto académico 
                    para el ciclo formativo de Desarrollo de Aplicaciones Multiplataforma.
                </p>
                <div class="flex space-x-4">
                    <a href="#" class="text-gray-400 hover:text-white transition-colors">
                        <span class="sr-only">GitHub</span>
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                    <a href="#" class="text-gray-400 hover:text-white transition-colors">
                        <span class="sr-only">Documentación</span>
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </a>
                </div>
            </div>
            <div>
                <h4 class="text-lg font-semibold mb-4">Académico</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Documentación Técnica</a></li>
                    <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Memoria del Proyecto</a></li>
                    <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Presentación</a></li>
                    <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Repositorio</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-lg font-semibold mb-4">Contacto</h4>
                <ul class="space-y-2">
                    <li class="flex items-center text-gray-300">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                        </svg>
                        proyecto@macromate.dev
                    </li>
                    <li class="flex items-center text-gray-300">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        IES Infanta Elena
                    </li>
                </ul>
            </div>
        </div>
        <div class="border-t border-gray-700 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <!-- Copyright y créditos -->
                <div class="text-gray-400 text-sm mb-4 md:mb-0">
                    <p>&copy; 2025 MacroMate - Smart Nutrition. Proyecto académico.</p>
                    <p class="mt-1">Desarrollado por Santiago Pérez y Juan José Cardona</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Django 5.2.7
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        React 18
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        MySQL 8.0
                    </span>
                </div>
            </div>
        </div>
    </div>
</footer>

# MacroMate: Plataforma de Gestión Nutricional
### Proyecto de Fin de Ciclo – Desarrollo de Aplicaciones Multiplataforma

![Django](https://img.shields.io/badge/Backend-Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_13-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/Core-Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)

---

## Resumen del Proyecto

**MacroMate** es una aplicación web *Full-Stack* desarrollada como proyecto final para el ciclo de Desarrollo de Aplicaciones Multiplataforma (DAM).

El objetivo principal de este proyecto es demostrar la capacidad de integración entre un backend robusto basado en **Python/Django** y un frontend moderno y reactivo construido con **Next.js**. La aplicación permite a los usuarios gestionar su perfil antropométrico, calcular automáticamente sus necesidades calóricas (BMR/TDEE) mediante algoritmos validados y realizar un seguimiento de su ingesta de macronutrientes.

---

## Objetivos 

Este desarrollo persigue los siguientes hitos técnicos y educativos:

1.  **Desacoplamiento de Arquitectura**: Implementación de una arquitectura Cliente-Servidor separada, comunicándose exclusivamente mediante **API REST** (JSON).
2.  **Seguridad Avanzada**: Implementación de autenticación *stateless* mediante **JWT (JSON Web Tokens)** con rotación de tokens y listas negras de revocación.
3.  **Algoritmia en Backend**: Desarrollo de lógica de negocio compleja en el servidor (fórmulas Mifflin-St Jeor) en lugar de delegar cálculos críticos al cliente.
4.  **Gestión de Estado**: Uso de Hooks y Context API en React para el manejo de sesiones y datos de usuario.
5.  **Persistencia de Datos**: Diseño de un modelo relacional normalizado (SQLite para desarrollo) gestionado a través del ORM de Django.

---

## Stack 

| Capa | Tecnología | Justificación Técnica |
| :--- | :--- | :--- |
| **Backend** | Django 5.x + DRF | Framework de alto nivel que garantiza seguridad por defecto y rapidez en el desarrollo de APIs. |
| **Frontend** | Next.js 13+ (App Router) | Permite renderizado híbrido y optimización de rutas, estándar actual en la industria React. |
| **Base de Datos** | SQLite | Base de datos relacional ligera, ideal para prototipado y portabilidad del proyecto académico. |
| **Estilos** | Tailwind CSS | Framework de utilidades para un diseño responsivo sin sobrecarga de archivos CSS. |
| **Control de Versiones** | Git / GitHub | Gestión de ramas y control de cambios colaborativo. |

---

## Arquitectura Principal del Sistema

El proyecto sigue una estructura modular. A continuación se detalla la organización del código fuente entregado:

```text
MacroMate/
├── backend/                  # Servidor API (Django)
│   ├── macromate/            # Configuración global (settings, cors, jwt)
│   ├── usuarios/             # App: Modelos personalizados (Usuario, Perfil) y Auth
│   ├── nutricion/            # App: Lógica de cálculo (utils.py) y endpoints de macros
│   ├── alimentos/            # App: Base de datos de alimentos
│   └── manage.py             # Script de gestión del framework
│
├── app/                      # Cliente Web (Next.js)
│   ├── (auth)/               # Rutas de autenticación (Login/Registro)
│   ├── dashboard/            # Panel principal de usuario
│   ├── perfil/               # Formularios de edición de datos físicos
│   └── components/           # Componentes reutilizables (UI)
│
├── database/                 # Esquema de base de datos (migrations)
│     └── init.sql            # Script de inicialización (SQLite)
└── docs/                     # Documentación técnica y memoria


```
---

## Guia de Despliegue
Para la evaluación del proyecto, se recomienda seguir los siguientes pasos de instalación manual para garantizar la correcta configuración del entorno.

Requisitos previos:
  - Python 3.11+
  - Node.js 18+

1 - Inicialización del Backend 
```bash
# Acceder al directorio del servidor
cd backend

# Crear entorno virtual (Recomendado)
python -m venv venv
# Activar: .\venv\Scripts\activate (Windows) o source venv/bin/activate (Mac/Linux)

# Instalar dependencias del proyecto
pip install -r requirements.txt

# Aplicar el esquema de base de datos
python manage.py migrate

# Crear administrador para el panel de control
python manage.py createsuperuser

# Iniciar el servidor de desarrollo (Puerto 8000)
python manage.py runserver
```
2 - Inicialización del Frontend
```bash 
# En una nueva terminal, acceder a la raíz del frontend (donde está package.json)

# Instalar dependencias de Node
npm install next

# Iniciar el servidor de desarrollo (Puerto 3000)
npm run dev
```
---

## Autores 
Proyecto Integrado - Curso 2025/2026 IES Infanta Elena - Desarrollo de Aplicaciones Multiplataforma

- Santiago Pérez Guerrero
- Juan José Cardona Ospina

>---
> **Nota**: Este proyecto es una entrega académica y no debe ser utilizado con fines comerciales sin la debida autorización de los autores. Cualquier uso indebido será responsabilidad exclusiva del usuario.
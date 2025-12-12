# MacroMate MVP – Smart Nutrition

**Django · React · SQLite/MySQL · Python**

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)


Sistema mínimo viable (MVP) para seguimiento nutricional y cálculo de macronutrientes.

Proyecto Académico – Desarrollo de Aplicaciones Multiplataforma
Curso 2025–2026

---

## Enfoque del MVP

MacroMate evoluciona a una versión **MVP** con un objetivo claro: **menos funcionalidades, mayor estabilidad y calidad técnica**.

Se prioriza:

* Correcto funcionamiento 
* Código mantenible y comprensible
* Funcionalidades nucleares bien implementadas

Todo lo no crítico (gamificación avanzada, recetas complejas, IA conversacional persistente, etc.) queda fuera de esta iteración.

---

## Funcionalidades Incluidas

### Features Introducidas

* **Autenticación de usuarios**

  * Registro, login y logout
  * Gestión básica de perfil

* **Perfil nutricional**

  * Datos físicos del usuario
  * Selección de objetivo (pérdida, mantenimiento, ganancia)

* **Cálculo automático**

  * BMR (Tasa Metabólica Basal)
  * TDEE (Gasto Energético Total Diario)
  * Calorías y macronutrientes diarios

* **Dashboard básico**

  * Visualización de calorías y macros
  * Estado diario de consumo (resumen)

### Lo que ya no se va a incluir en el MVP

* Chatbot IA persistente
* Sistema de gamificación
* Registro detallado de recetas
* Seguimiento avanzado de ejercicios
* Recomendaciones automáticas 

Estas funcionalidades quedan documentadas pero sin implementar

---

## Arquitectura

Arquitectura **frontend / backend desacoplada**, orientada a simplicidad y claridad.

### Stack Tecnológico

| Capa                 | Tecnología                             |
| -------------------- | -------------------------------------- |
| Frontend             | React + Vite + Tailwind CSS            |
| Backend              | Django + Django REST Framework         |
| Base de Datos        | SQLite (desarrollo)                    |
| Autenticación        | JWT (SimpleJWT)                        |
| Control de versiones | Git + GitHub                           |

---

## Estructura del Proyecto

```
MacroMate/
├── backend/
│   ├── users/
│   ├── profiles/
│   ├── nutrition/
│   ├── config/
│   └── manage.py
├── docs/
│   └── README.md
│ 
├── frontend/

>Frontend no esta realizado todavia

```

---

## Instalación Rápida (Desarrollo)

### Prerrequisitos

* Python 3.11+
* Node.js 18+
* Git

### Backend

```bash
# Clonar repositorio
cd MacroMate/backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```


---

## Objetivo Académico

Este MVP está diseñado para:

* Demostrar dominio del stack full‑stack
* Aplicar arquitectura limpia y modular
* Cumplir requisitos funcionales clave sin sobreingeniería

Se ha priorizado la calidad tecnologica y estabilidad sobre la cantidad de funcionalidades

---


## Equipo

* **Santiago Pérez Guerrero**
* **Juan José Cardona Ospina**

IES Infanta Elena
Desarrollo de Aplicaciones Multiplataforma
Curso 2025–2026

---

## Contacto

Email: [1913555@alu.murciaeduca.es](mailto:1913555@alu.murciaeduca.es)

Email: [13763596@alu.murciaeduca.es](mailto:13763596@alu.murciaeduca.es)

Institución: IES Infanta Elena [https://iesinfantaelena.es](https://iesinfantaelena.es)

---

## Licencia
Licencia documentada en el archivo **LICENSE.md**

© 2025–2026 MacroMate – Smart Nutrition
Proyecto académico desarrollado para fines educativos. 

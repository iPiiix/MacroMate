@echo off
title MacroMate - Instalación Inicial

echo ========================================
echo    MACROMATE - INSTALACION INICIAL
echo ========================================
echo.

REM Verificar Python
echo Verificando Python...
python --version >nul 2>&1 || (
    echo [ERROR] Python no está instalado o no está en PATH.
    echo Por favor, instala Python desde https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Verificar Node.js
echo Verificando Node.js...
node --version >nul 2>&1 || (
    echo [ERROR] Node.js no está instalado.
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONFIGURANDO BACKEND (Django)
echo ========================================
echo.

REM 1. Crear entorno virtual
echo [1/7] Creando entorno virtual...
if exist venv (
    echo El entorno virtual ya existe. Saltando...
) else (
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual
        pause
        exit /b 1
    )
    echo Entorno virtual creado correctamente.
)

REM 2. Activar entorno virtual
echo [2/7] Activando entorno virtual...
call venv\Scripts\activate
if errorlevel 1 (
    echo [ERROR] No se pudo activar el entorno virtual
    pause
    exit /b 1
)

REM 3. Actualizar pip
echo [3/7] Actualizando pip...
python -m pip install --upgrade pip

REM 4. Instalar dependencias de Python
echo [4/7] Instalando dependencias de Python...
if exist backend\requirements.txt (
    pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo [ERROR] Error al instalar dependencias de Python
        pause
        exit /b 1
    )
) else (
    echo [ERROR] No se encuentra backend\requirements.txt
    pause
    exit /b 1
)

REM 5. Configurar base de datos
echo [5/7] Configurando base de datos...
cd backend
python manage.py makemigrations
python manage.py migrate
if errorlevel 1 (
    echo [ERROR] Error al aplicar migraciones
    cd ..
    pause
    exit /b 1
)

REM 6. Crear superusuario
echo [6/7] Creando superusuario (admin@macromate.com)...
echo from django.contrib.auth import get_user_model; User=get_user_model(); User.objects.filter(email='admin@macromate.com').exists() or User.objects.create_superuser('admin','admin@macromate.com','admin123') | python manage.py shell

cd ..

echo.
echo ========================================
echo   CONFIGURANDO FRONTEND (Next.js)
echo ========================================
echo.

REM 7. Instalar dependencias de Node.js
echo [7/7] Instalando dependencias de Node.js...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias de Node.js
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   INSTALACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Credenciales del superusuario:
echo   Email: admin@macromate.com
echo   Password: admin123
echo.
echo Para iniciar el proyecto ejecuta: start.bat
echo ========================================
pause
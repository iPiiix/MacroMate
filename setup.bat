@echo off
title MacroMate - Instalación Inicial
color 0A


echo       MACROMATE - INSTALACION INICIAL
echo.

REM Verificar Python
python --version >nul 2>&1 || 
(echo [ERROR] Python no está instalado o no está en PATH.
    pause
    exit /b
)

REM 1. Crear entorno virtual
echo [1/6] Creando entorno virtual...
if exist venv (
    echo El entorno virtual ya existe.
) else (
    python -m venv venv 
)

REM 2. Activar entorno virtual
echo [2/6] Activando entorno virtual...
call venv\Scripts\activate

REM 3. Instalar dependencias
echo [3/6] Instalando dependencias...
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

REM 4. Aplicar migraciones
echo [4/6] Configurando base de datos...
cd backend
python manage.py makemigrations
python manage.py migrate

REM 5. Crear superusuario automático
echo [5/6] Creando superusuario (admin@macromate.com)...
python manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model(); \
User.objects.filter(username='admin').exists() or (u:=User.objects.create_superuser('admin','admin@macromate.com','admin123'))"

REM 6. Mostrar resumen
echo.
echo.
echo INSTALACION COMPLETADA CORRECTAMENTE
echo.
echo Usuario: admin
echo Contraseña: admin123
cd ..
pause

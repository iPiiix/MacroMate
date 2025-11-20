@echo off
title MacroMate - Desarrollo Automático

echo      MACROMATE - DESARROLLO AUTOMATICO
echo.

REM 1. Activar entorno virtual
if not exist venv (
    echo [ERROR] No existe entorno virtual. Ejecuta setup.bat primero.
    pause
    exit /b
)
call venv\Scripts\activate

REM 2. Ir a backend
cd backend

REM 3. Migraciones automáticas
echo [1/3] Aplicando migraciones...
python manage.py makemigrations >nul
python manage.py migrate

REM 4. Iniciar servidor
echo [2/3] Iniciando servidor Django...
echo ========================================
echo   Servidor: http://localhost:8000
echo   Admin:    http://localhost:8000/admin
echo   API:      http://localhost:8000/api/usuarios/registro/
echo ========================================
echo [3/3] Presiona CTRL+C para detener el servidor.
python manage.py runserver
cd ..
pause

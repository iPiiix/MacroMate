@echo off
title MacroMate - Iniciando Servicios

echo ========================================
echo    MACROMATE - INICIO DE SERVICIOS
echo ========================================
echo.

REM Verificar que estamos en la raíz del proyecto
if not exist "backend" (
    echo [ERROR] No se encuentra la carpeta 'backend'
    echo Por favor, ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] No se encuentra la carpeta 'frontend'
    echo Por favor, ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo [1/2] Iniciando Backend (Django)...
echo.
start "MacroMate Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

echo [2/2] Iniciando Frontend (Next.js)...
echo.
timeout /t 3 /nobreak > nul
start "MacroMate Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   SERVICIOS INICIADOS CORRECTAMENTE
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Presiona CTRL+C en cada ventana para detener
echo ========================================
pause
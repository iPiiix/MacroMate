@echo off
echo ========================================
echo    MACROMATE - Desarrollo Automatico
echo ========================================

REM Activar entorno virtual
echo [1/4] Activando entorno virtual...
venv\Scripts\activate

REM Ir a carpeta backend
echo [2/4] Navegando a backend...
cd backend

REM Aplicar migraciones
echo [3/4] Aplicando migraciones...
python manage.py makemigrations
python manage.py migrate

REM Iniciar servidor
echo [4/4] Iniciando servidor...
echo ========================================
echo   Servidor listo en: http://localhost:8000
echo   Admin: http://localhost:8000/admin
echo   API: http://localhost:8000/api/usuarios/registro/
echo ========================================
python manage.py runserver
pause
@echo off
echo ========================================
echo    MACROMATE - Instalacion Inicial
echo ========================================

REM Crear entorno virtual
echo [1/5] Creando entorno virtual...
python -m venv venv

REM Activar entorno virtual
echo [2/5] Activando entorno virtual...
venv\Scripts\activate

REM Instalar dependencias
echo [3/5] Instalando dependencias...
pip install --upgrade pip
pip install -r backend\requirements.txt

REM Aplicar migraciones
echo [4/5] Configurando base de datos...
cd backend
python manage.py makemigrations
python manage.py migrate

REM Crear superusuario
echo [5/5] Creando superusuario...
python manage.py createsuperuser --username=admin --email=admin@macromate.com --noinput
echo Contrasena temporal: admin123
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.get(username='admin'); u.set_password('admin123'); u.save()"

echo ========================================
echo    INSTALACION COMPLETADA!
echo ========================================
echo Comandos utiles:
echo   start.bat    - Iniciar desarrollo
echo   setup.bat    - Reinstalar
echo ========================================
cd ..
pause
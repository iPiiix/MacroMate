CREATE DATABASE IF NOT EXISTS macromate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE macromate;

-- ==========================================
-- MÓDULO 1: USUARIOS Y PERFILES
-- ==========================================

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    fecha_creacion DATETIME(6) NOT NULL,
    ultima_sesion DATETIME(6) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE perfiles (
    id_perfil INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NULL,
    genero VARCHAR(20) NULL,
    altura DECIMAL(5,2) NULL, -- cm
    peso_actual DECIMAL(5,2) NULL, -- kg
    nivel_actividad VARCHAR(20) DEFAULT 'sedentario',
    objetivo VARCHAR(20) DEFAULT 'mantenimiento',
    bmr DECIMAL(7,2) NULL,
    tdee DECIMAL(7,2) NULL,
    fecha_actualizacion DATETIME(6) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ==========================================
-- MÓDULO 2: REGISTRO DIARIO 
-- ==========================================

CREATE TABLE macronutrientes (
    id_macro INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    calorias_diarias DECIMAL(7,2) NOT NULL,
    proteinas DECIMAL(6,2) NULL,
    carbohidratos DECIMAL(6,2) NULL,
    grasas DECIMAL(6,2) NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE
);

CREATE TABLE registro_diario (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    id_macro_objetivo INT NULL,
    fecha DATE NOT NULL,
    calorias_consumidas DECIMAL(7,2) DEFAULT 0,
    proteinas_consumidas DECIMAL(6,2) DEFAULT 0,
    carbohidratos_consumidos DECIMAL(6,2) DEFAULT 0,
    grasas_consumidas DECIMAL(6,2) DEFAULT 0,
    agua_litros DECIMAL(4,2) DEFAULT 0,
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
    FOREIGN KEY (id_macro_objetivo) REFERENCES macronutrientes(id_macro) ON DELETE SET NULL,
    UNIQUE KEY unique_registro_perfil_fecha (id_perfil, fecha)
);

CREATE TABLE comidas_diarias (
    id_comida INT PRIMARY KEY AUTO_INCREMENT,
    id_registro INT NOT NULL,
    tipo_comida VARCHAR(20) NOT NULL DEFAULT 'snack', 
    nombre VARCHAR(200) NOT NULL, 
    calorias DECIMAL(7,2) NULL,
    proteinas DECIMAL(6,2) NULL,
    carbohidratos DECIMAL(6,2) NULL,
    grasas DECIMAL(6,2) NULL,
    FOREIGN KEY (id_registro) REFERENCES registro_diario(id_registro) ON DELETE CASCADE
);
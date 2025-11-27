-- BASE DE DATOS MACROMATE - 
-- Proyecto Académico 2025-2026
-- Autores: Juan José Cardona Ospina, Santiago Pérez Guerrero

CREATE DATABASE IF NOT EXISTS macromate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE macromate;

-- MÓDULO 1: USUARIOS Y AUTENTICACIÓN
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sesion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
) COMMENT='Usuarios del sistema';

CREATE TABLE sesiones (
    id_sesion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) COMMENT='Control de sesiones activas';


-- MÓDULO 2: PERFILES
CREATE TABLE perfiles (
    id_perfil INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT UNIQUE NOT NULL,
    nombre VARCHAR(100),
    apellidos VARCHAR(100),
    fecha_nacimiento DATE,
    genero ENUM('masculino', 'femenino', 'otro'),
    altura DECIMAL(5,2), -- cm
    peso_actual DECIMAL(5,2), -- kg
    peso_objetivo DECIMAL(5,2), -- kg
    nivel_actividad ENUM('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo') DEFAULT 'sedentario',
    objetivo ENUM('perdida_peso', 'mantenimiento', 'ganancia_muscular') DEFAULT 'mantenimiento',
    bmr DECIMAL(7,2), -- Tasa Metabólica Basal
    tdee DECIMAL(7,2), -- Gasto Energético Total Diario
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) COMMENT='Perfiles de usuario';

CREATE TABLE medidas_corporales (
    id_medida INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    fecha_registro DATE DEFAULT (CURRENT_DATE),
    peso DECIMAL(5,2) NOT NULL,
    porcentaje_grasa DECIMAL(4,2),
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
    INDEX idx_perfil_fecha (id_perfil, fecha_registro)
) COMMENT='Seguimiento de peso y grasa corporal';

CREATE TABLE historial_objetivos (
    id_historial INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    objetivo_anterior ENUM('perdida_peso', 'mantenimiento', 'ganancia_muscular'),
    objetivo_nuevo ENUM('perdida_peso', 'mantenimiento', 'ganancia_muscular'),
    peso_en_cambio DECIMAL(5,2),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE
) COMMENT='Historial de cambios de objetivos';


-- MÓDULO 3: MACRONUTRIENTES
CREATE TABLE macronutrientes (
    id_macro INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    calorias_diarias DECIMAL(7,2) NOT NULL,
    proteinas DECIMAL(6,2),
    carbohidratos DECIMAL(6,2),
    grasas DECIMAL(6,2),
    fecha_calculo DATE DEFAULT (CURRENT_DATE),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
    INDEX idx_perfil_activo (id_perfil, activo)
) COMMENT='Macronutrientes calculados';


-- MÓDULO 4: ALIMENTOS Y RECETAS
CREATE TABLE categorias_alimentos (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
) COMMENT='Categorías de alimentos';

CREATE TABLE alimentos (
    id_alimento INT PRIMARY KEY AUTO_INCREMENT,
    id_categoria INT,
    nombre VARCHAR(200) NOT NULL,
    calorias DECIMAL(6,2) NOT NULL,
    proteinas DECIMAL(6,2),
    carbohidratos DECIMAL(6,2),
    grasas DECIMAL(6,2),
    porcion_gramos DECIMAL(6,2) DEFAULT 100,
    FOREIGN KEY (id_categoria) REFERENCES categorias_alimentos(id_categoria),
    INDEX idx_nombre (nombre)
) COMMENT='Base de datos de alimentos';

CREATE TABLE recetas (
    id_receta INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    instrucciones TEXT,
    porciones INT DEFAULT 1,
    calorias_porcion DECIMAL(7,2),
    proteinas_porcion DECIMAL(6,2),
    carbohidratos_porcion DECIMAL(6,2),
    grasas_porcion DECIMAL(6,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) COMMENT='Recetas de usuarios';

CREATE TABLE ingredientes_receta (
    id_ingrediente INT PRIMARY KEY AUTO_INCREMENT,
    id_receta INT NOT NULL,
    id_alimento INT NOT NULL,
    cantidad DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_alimento) REFERENCES alimentos(id_alimento)
) COMMENT='Ingredientes de cada receta';


-- MÓDULO 5: REGISTRO DIARIO
CREATE TABLE registro_diario (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    fecha DATE DEFAULT (CURRENT_DATE),
    calorias_consumidas DECIMAL(7,2) DEFAULT 0,
    proteinas_consumidas DECIMAL(6,2) DEFAULT 0,
    carbohidratos_consumidos DECIMAL(6,2) DEFAULT 0,
    grasas_consumidas DECIMAL(6,2) DEFAULT 0,
    agua_litros DECIMAL(4,2) DEFAULT 0,
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
    UNIQUE KEY unique_registro (id_perfil, fecha),
    INDEX idx_perfil_fecha (id_perfil, fecha)
) COMMENT='Registro diario de nutrición';

CREATE TABLE comidas_diarias (
    id_comida INT PRIMARY KEY AUTO_INCREMENT,
    id_registro INT NOT NULL,
    tipo_comida ENUM('desayuno', 'almuerzo', 'comida', 'merienda', 'cena', 'snack') NOT NULL,
    nombre VARCHAR(100),
    calorias DECIMAL(7,2),
    proteinas DECIMAL(6,2),
    carbohidratos DECIMAL(6,2),
    grasas DECIMAL(6,2),
    FOREIGN KEY (id_registro) REFERENCES registro_diario(id_registro) ON DELETE CASCADE
) COMMENT='Comidas del día';

CREATE TABLE alimentos_consumidos (
    id_consumo INT PRIMARY KEY AUTO_INCREMENT,
    id_comida INT NOT NULL,
    id_alimento INT NOT NULL,
    cantidad_gramos DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (id_comida) REFERENCES comidas_diarias(id_comida) ON DELETE CASCADE,
    FOREIGN KEY (id_alimento) REFERENCES alimentos(id_alimento)
) COMMENT='Alimentos en cada comida';

CREATE TABLE ejercicios (
    id_ejercicio INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    categoria ENUM('cardio', 'fuerza', 'flexibilidad', 'resistencia', 'otro'),
    calorias_por_hora DECIMAL(6,2)
) COMMENT='Catálogo de ejercicios';

CREATE TABLE registro_ejercicios (
    id_registro_ejercicio INT PRIMARY KEY AUTO_INCREMENT,
    id_registro INT NOT NULL,
    id_ejercicio INT NOT NULL,
    duracion_minutos INT NOT NULL,
    calorias_quemadas DECIMAL(6,2),
    FOREIGN KEY (id_registro) REFERENCES registro_diario(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_ejercicio) REFERENCES ejercicios(id_ejercicio)
) COMMENT='Ejercicios realizados';


-- MÓDULO 6: INTELIGENCIA ARTIFICIAL
CREATE TABLE conversaciones_ia (
    id_conversacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) COMMENT='Conversaciones con chatbot IA';

CREATE TABLE mensajes_ia (
    id_mensaje INT PRIMARY KEY AUTO_INCREMENT,
    id_conversacion INT NOT NULL,
    rol ENUM('usuario', 'asistente') NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conversacion) REFERENCES conversaciones_ia(id_conversacion) ON DELETE CASCADE
) COMMENT='Mensajes del chatbot';

CREATE TABLE recomendaciones_ia (
    id_recomendacion INT PRIMARY KEY AUTO_INCREMENT,
    id_perfil INT NOT NULL,
    tipo ENUM('dieta', 'receta', 'ejercicio', 'consejo'),
    titulo VARCHAR(200),
    contenido TEXT,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE
) COMMENT='Recomendaciones generadas por IA';


-- MÓDULO 7: GAMIFICACIÓN
CREATE TABLE logros (
    id_logro INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    puntos INT DEFAULT 0
) COMMENT='Logros disponibles';

CREATE TABLE logros_usuario (
    id_logro_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_logro INT NOT NULL,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_logro) REFERENCES logros(id_logro),
    UNIQUE KEY unique_logro (id_usuario, id_logro)
) COMMENT='Logros desbloqueados';

CREATE TABLE rachas (
    id_racha INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT UNIQUE NOT NULL,
    dias_consecutivos INT DEFAULT 0,
    record_dias INT DEFAULT 0,
    fecha_ultima_actividad DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) COMMENT='Sistema de rachas';


-- VISTAS PRINCIPALES
CREATE VIEW vista_usuario_completo AS
SELECT 
    u.id_usuario,
    u.nombre_usuario,
    u.email,
    p.nombre,
    p.apellidos,
    p.peso_actual,
    p.peso_objetivo,
    p.objetivo,
    p.bmr,
    p.tdee,
    m.calorias_diarias,
    m.proteinas,
    m.carbohidratos,
    m.grasas,
    r.dias_consecutivos
FROM usuarios u
LEFT JOIN perfiles p ON u.id_usuario = p.id_usuario
LEFT JOIN macronutrientes m ON p.id_perfil = m.id_perfil AND m.activo = TRUE
LEFT JOIN rachas r ON u.id_usuario = r.id_usuario
WHERE u.activo = TRUE;

CREATE VIEW vista_progreso_peso AS
SELECT 
    mc.id_perfil,
    mc.fecha_registro,
    mc.peso,
    mc.porcentaje_grasa,
    LAG(mc.peso) OVER (PARTITION BY mc.id_perfil ORDER BY mc.fecha_registro) as peso_anterior,
    mc.peso - LAG(mc.peso) OVER (PARTITION BY mc.id_perfil ORDER BY mc.fecha_registro) as cambio_peso
FROM medidas_corporales mc
ORDER BY mc.id_perfil, mc.fecha_registro DESC;

CREATE VIEW vista_adherencia_macros AS
SELECT 
    rd.id_perfil,
    rd.fecha,
    m.calorias_diarias as calorias_objetivo,
    rd.calorias_consumidas,
    ROUND((rd.calorias_consumidas / m.calorias_diarias * 100), 1) as porcentaje_calorias,
    m.proteinas as proteinas_objetivo,
    rd.proteinas_consumidas,
    ROUND((rd.proteinas_consumidas / m.proteinas * 100), 1) as porcentaje_proteinas,
    m.carbohidratos as carbohidratos_objetivo,
    rd.carbohidratos_consumidos,
    m.grasas as grasas_objetivo,
    rd.grasas_consumidas
FROM registro_diario rd
JOIN perfiles p ON rd.id_perfil = p.id_perfil
JOIN macronutrientes m ON p.id_perfil = m.id_perfil AND m.activo = TRUE
WHERE rd.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY rd.id_perfil, rd.fecha DESC;


-- Categorías de alimentos
INSERT INTO categorias_alimentos (nombre) VALUES
('Frutas'),
('Verduras'),
('Proteínas'),
('Lácteos'),
('Cereales'),
('Legumbres'),
('Frutos Secos'),
('Grasas Saludables');

-- Alimentos básicos
INSERT INTO alimentos (id_categoria, nombre, calorias, proteinas, carbohidratos, grasas, porcion_gramos) VALUES
(1, 'Manzana', 52, 0.3, 14, 0.2, 100), 
(1, 'Plátano', 89, 1.1, 23, 0.3, 100),
(1, 'Naranja', 47, 0.9, 12, 0.1, 100),
(1, 'Fresas', 32, 0.7, 8, 0.3, 100),
(1, 'Uvas', 69, 0.7, 18, 0.2, 100),
(1, 'Piña', 50, 0.5, 13, 0.1, 100),
(1, 'Mango', 60, 0.8, 15, 0.4, 100),
(2, 'Lechuga', 15, 1.4, 2.9, 0.2, 100),
(2, 'Zanahoria', 41, 0.9, 10, 0.2, 100),
(2, 'Brócoli', 34, 2.8, 7, 0.4, 100),
(2, 'Espinacas', 23, 2.9, 3.6, 0.4, 100),
(2, 'Tomate', 18, 0.9, 3.9, 0.2, 100),
(3, 'Pechuga de Pollo', 165, 31, 0, 3.6, 100),
(3, 'Ternera', 250, 26, 0, 15, 100),
(3, 'Pavo', 135, 30, 0, 1, 100),
(3, 'Huevo', 155, 13, 1.1, 11, 100),
(3, 'Salmón', 208, 20, 0, 13, 100),
(3, 'Atún', 116, 26, 0, 0.8, 100),
(4, 'Leche Desnatada', 34, 3.4, 5, 0.1, 100),
(4, 'Leche Entera', 61, 3.2, 5, 3.3, 100),
(4, 'Leche Semidesnatada', 45, 3.4, 5, 1.6, 100),
(4, 'Queso Cheddar', 403, 25, 1.3, 33, 100),
(4, 'Kefir', 41, 3.3, 4, 1, 100),
(4, 'Yogur Natural', 61, 3.5, 4.7, 3.3, 100),
(4, 'Queso Fresco', 174, 11, 3.4, 13, 100),
(5, 'Arroz Cocido', 130, 2.7, 28, 0.3, 100),
(5, 'Pan Integral', 247, 8.5, 49, 3.4, 100),
(5, 'Pasta Cocida', 131, 5, 25, 0.9, 100),
(5, 'Avena', 389, 16.9, 66, 6.9, 100),
(6, 'Lentejas', 116, 9, 20, 0.4, 100),
(6, 'Garbanzos', 164, 8.9, 27, 2.6, 100),
(7, 'Almendras', 579, 21, 22, 50, 100),
(7, 'Nueces', 654, 15, 14, 65, 100),
(8, 'Aceite de Oliva', 884, 0, 0, 100, 100),
(8, 'Aguacate', 160, 2, 9, 15, 100),
(8, 'Mantequilla de Maní', 588, 25, 20, 50, 100),
(8, 'Mantequilla', 717, 0.9, 0.1, 81, 100),
(8, 'Aceite de Coco', 862, 0, 0, 100, 100);

-- Ejercicios comunes
INSERT INTO ejercicios (nombre, categoria, calorias_por_hora) VALUES
('Caminar', 'cardio', 280),
('Correr', 'cardio', 600),
('Natación', 'cardio', 500),
('Ciclismo', 'cardio', 450),
('Pesas', 'fuerza', 360),
('Yoga', 'flexibilidad', 200),
('HIIT', 'cardio', 700);

-- Logros
INSERT INTO logros (nombre, descripcion, puntos) VALUES
('Primer Día', 'Registra tu primer día', 10),
('Consistencia de 3 Días', 'Cumple tus macros 3 días seguidos', 30),
('Una Semana', 'Mantén 7 días consecutivos', 50),
('Un Mes', 'Mantén 30 días consecutivos', 200),
('Pérdida 5kg', 'Pierde 5kg de peso', 150),
('Ganancia 5kg', 'Gana 5kg', 150),
('Maestro MacroMate', 'Consigue una racha de un año', 100);


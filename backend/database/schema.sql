-- =====================================================================
-- BarberManager - Esquema de Base de Datos
-- Sistema Web de Gestión para Kenneth's Barber
-- =====================================================================
-- Cubre las tablas necesarias para los 27 requerimientos funcionales
-- (RF01-RF27) descritos en docs/Documento_Formal.md, organizados por
-- módulo: autenticación, clientes, agenda/citas, servicios, productos,
-- apartados y reportes.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS barbermanager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE barbermanager;

-- ---------------------------------------------------------------------
-- Módulo: Autenticación / Gestión de Clientes (RF01-RF08)
-- ---------------------------------------------------------------------
-- email y password_hash son NULL para clientes registrados manualmente por el
-- admin/barbero (RF04) que aún no tienen una cuenta para iniciar sesión en la
-- plataforma. Los clientes que se autoregistran (RF/auth) siempre tienen ambos.
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  rol ENUM('admin', 'barbero', 'cliente') NOT NULL DEFAULT 'cliente',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Módulo: Servicios (RF17-RF18)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  duracion_minutos INT NOT NULL DEFAULT 30,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Módulo: Productos (RF19-RF22)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  precio DECIMAL(10, 2) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Módulo: Agenda y Citas (RF09-RF16)
-- ---------------------------------------------------------------------

-- Horario semanal recurrente del barbero (RF15)
-- dia_semana: 0 = Domingo ... 6 = Sábado
CREATE TABLE IF NOT EXISTS disponibilidad_horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana TINYINT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  CHECK (dia_semana BETWEEN 0 AND 6)
) ENGINE=InnoDB;

-- Excepciones puntuales a la disponibilidad (vacaciones, horarios extra) (RF15)
CREATE TABLE IF NOT EXISTS disponibilidad_excepciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tipo ENUM('bloqueo', 'extra') NOT NULL,
  motivo VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Citas reservadas (RF09-RF14, RF16)
CREATE TABLE IF NOT EXISTS citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  servicio_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
  notas VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_citas_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_citas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_citas_cliente (cliente_id),
  INDEX idx_citas_fecha_estado (fecha, estado)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Módulo: Apartados (RF23-RF25)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS apartados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  producto_id INT NOT NULL,
  monto_total DECIMAL(10, 2) NOT NULL,
  saldo_pendiente DECIMAL(10, 2) NOT NULL,
  estado ENUM('activo', 'pagado', 'cancelado') NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_apartados_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_apartados_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_apartados_cliente (cliente_id),
  INDEX idx_apartados_estado (estado)
) ENGINE=InnoDB;

-- Abonos realizados sobre un apartado (RF24)
CREATE TABLE IF NOT EXISTS abonos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apartado_id INT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_abonos_apartado FOREIGN KEY (apartado_id) REFERENCES apartados(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Módulo: Notificaciones
-- ---------------------------------------------------------------------
-- Notificaciones en el sistema para usuarios (ej. cancelación de citas
-- por bloqueo de horario del administrador).
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  mensaje VARCHAR(255) NOT NULL,
  cita_id INT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_notificaciones_cita FOREIGN KEY (cita_id) REFERENCES citas(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_notificaciones_usuario (usuario_id, leida)
) ENGINE=InnoDB;

-- =====================================================================
-- Datos semilla (seed data)
-- =====================================================================

-- Servicios actuales de la barbería
INSERT INTO servicios (nombre, precio, duracion_minutos) VALUES
  ('Corte de cabello', 5000.00, 30),
  ('Corte de barba', 2000.00, 30)
ON DUPLICATE KEY UPDATE nombre = nombre;

-- Usuario administrador inicial
-- Email: admin@barbermanager.com
-- Password: Admin123!  (cambiar en producción)
-- El hash fue generado con bcryptjs (10 salt rounds)
INSERT INTO usuarios (nombre, telefono, email, password_hash, rol) VALUES
  ('Kenneth Rodríguez', '6406-3210', 'admin@barbermanager.com',
   '$2a$10$TwEOBkfnAOEgWZjh.DIe6O5a61W3P3dKRQI.r4N3Mo9xTfh7qy29K', 'admin')
ON DUPLICATE KEY UPDATE nombre = nombre;

-- Horario semanal por defecto: Lunes a Sábado, 8:00am - 6:00pm
INSERT INTO disponibilidad_horarios (dia_semana, hora_inicio, hora_fin) VALUES
  (1, '08:00:00', '18:00:00'),
  (2, '08:00:00', '18:00:00'),
  (3, '08:00:00', '18:00:00'),
  (4, '08:00:00', '18:00:00'),
  (5, '08:00:00', '18:00:00'),
  (6, '08:00:00', '18:00:00');

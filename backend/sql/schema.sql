CREATE DATABASE IF NOT EXISTS vitrina_empresarial;
USE vitrina_empresarial;

CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS microtienda (
    id_microtienda INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    sector_economico VARCHAR(100),
    whatsapp VARCHAR(20),
    redes_sociales TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT UNIQUE,
    id_categoria INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE IF NOT EXISTS producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INT DEFAULT 0,
    imagen_url TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_microtienda INT,
    id_categoria INT,
    FOREIGN KEY (id_microtienda) REFERENCES microtienda(id_microtienda),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE IF NOT EXISTS calificacion (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
    nombre_visitante VARCHAR(100) DEFAULT 'Visitante',
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_producto INT,
    id_microtienda INT,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_microtienda) REFERENCES microtienda(id_microtienda)
);

ALTER TABLE calificacion
ADD COLUMN IF NOT EXISTS nombre_visitante VARCHAR(100) DEFAULT 'Visitante';

CREATE TABLE IF NOT EXISTS pqrs (
    id_pqrs INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('PETICION','QUEJA','RECLAMO','SUGERENCIA'),
    nombre VARCHAR(100),
    correo VARCHAR(100),
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'PENDIENTE'
);

CREATE TABLE IF NOT EXISTS metrica (
    id_metrica INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('VISITA','CLIC','INTERACCION'),
    referencia VARCHAR(50),
    id_referencia INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rol (nombre)
SELECT 'ADMINISTRADOR'
WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre = 'ADMINISTRADOR'
);

INSERT INTO rol (nombre)
SELECT 'EMPRENDEDOR'
WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre = 'EMPRENDEDOR'
);

INSERT INTO categoria (nombre)
SELECT 'Moda'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Moda'
);

INSERT INTO categoria (nombre)
SELECT 'Salud y Belleza'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Salud y Belleza'
);

INSERT INTO categoria (nombre)
SELECT 'Alimentos'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Alimentos'
);

INSERT INTO categoria (nombre)
SELECT 'Servicios'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Servicios'
);

INSERT INTO categoria (nombre)
SELECT 'Hogar'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Hogar'
);

INSERT INTO categoria (nombre)
SELECT 'Restaurantes'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Restaurantes'
);

INSERT INTO usuario (nombre, correo, password, id_rol)
SELECT 'Admin', 'admin@demo.com', SHA2('123456', 256), r.id_rol
FROM rol r
WHERE r.nombre = 'ADMINISTRADOR'
  AND NOT EXISTS (
      SELECT 1 FROM usuario WHERE correo = 'admin@demo.com'
  );

INSERT INTO usuario (nombre, correo, password, id_rol)
SELECT 'Emprendedor Demo', 'emprendedor@demo.com', SHA2('123456', 256), r.id_rol
FROM rol r
WHERE r.nombre = 'EMPRENDEDOR'
  AND NOT EXISTS (
      SELECT 1 FROM usuario WHERE correo = 'emprendedor@demo.com'
  );

INSERT INTO microtienda (nombre, descripcion, sector_economico, whatsapp, id_usuario, id_categoria)
SELECT 'Tienda Demo', 'Venta de productos de prueba', 'Comercio', '3001234567', u.id_usuario, c.id_categoria
FROM usuario u
JOIN categoria c ON c.nombre = 'Moda'
WHERE u.correo = 'emprendedor@demo.com'
  AND NOT EXISTS (
      SELECT 1 FROM microtienda WHERE nombre = 'Tienda Demo'
  );

INSERT INTO producto (nombre, descripcion, precio, stock, id_microtienda, id_categoria)
SELECT 'Producto Demo', 'Descripcion de prueba', 50000, 10, m.id_microtienda, c.id_categoria
FROM microtienda m
JOIN categoria c ON c.nombre = 'Moda'
WHERE m.nombre = 'Tienda Demo'
  AND NOT EXISTS (
      SELECT 1 FROM producto WHERE nombre = 'Producto Demo'
  );

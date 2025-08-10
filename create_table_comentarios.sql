-- Crear tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estrellas INTEGER NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    comentario TEXT NOT NULL,
    ver BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_comentarios_ver ON comentarios(ver);
CREATE INDEX IF NOT EXISTS idx_comentarios_fecha ON comentarios(fecha_creacion);

-- Comentarios sobre la tabla
COMMENT ON TABLE comentarios IS 'Tabla para almacenar comentarios de clientes';
COMMENT ON COLUMN comentarios.nombre IS 'Nombre del cliente que deja el comentario';
COMMENT ON COLUMN comentarios.estrellas IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN comentarios.comentario IS 'Texto del comentario del cliente';
COMMENT ON COLUMN comentarios.ver IS 'Indica si el comentario es visible en el frontend público';
COMMENT ON COLUMN comentarios.fecha_creacion IS 'Fecha y hora de creación del comentario';
COMMENT ON COLUMN comentarios.fecha_actualizacion IS 'Fecha y hora de última actualización';

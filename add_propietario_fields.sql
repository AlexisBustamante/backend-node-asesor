-- Agregar campo id_propietario a las tablas existentes
-- Este script debe ejecutarse para migrar la base de datos actual

-- 1. Agregar id_propietario a la tabla cotizacion
ALTER TABLE cotizacion 
ADD COLUMN IF NOT EXISTS id_propietario INTEGER NOT NULL DEFAULT 1;

-- 2. Agregar id_propietario a la tabla comentarios
ALTER TABLE comentarios 
ADD COLUMN IF NOT EXISTS id_propietario INTEGER NOT NULL DEFAULT 1;

-- 3. Crear índices para optimizar consultas por propietario
CREATE INDEX IF NOT EXISTS idx_cotizacion_propietario ON cotizacion(id_propietario);
CREATE INDEX IF NOT EXISTS idx_comentarios_propietario ON comentarios(id_propietario);

-- 4. Crear índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_cotizacion_propietario_fecha ON cotizacion(id_propietario, fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_comentarios_propietario_ver ON comentarios(id_propietario, ver);

-- 5. Agregar foreign key constraints (opcional, para integridad referencial)
-- ALTER TABLE cotizacion ADD CONSTRAINT fk_cotizacion_propietario 
--   FOREIGN KEY (id_propietario) REFERENCES users(id) ON DELETE CASCADE;
-- 
-- ALTER TABLE comentarios ADD CONSTRAINT fk_comentarios_propietario 
--   FOREIGN KEY (id_propietario) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Actualizar registros existentes (si hay datos previos)
-- UPDATE cotizacion SET id_propietario = 1 WHERE id_propietario IS NULL;
-- UPDATE comentarios SET id_propietario = 1 WHERE id_propietario IS NULL;

COMMENT ON COLUMN cotizacion.id_propietario IS 'ID del usuario propietario de la página web';
COMMENT ON COLUMN comentarios.id_propietario IS 'ID del usuario propietario de la página web';

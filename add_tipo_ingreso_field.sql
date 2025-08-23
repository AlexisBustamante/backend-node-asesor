-- =====================================================
-- AGREGAR CAMPO TIPO_INGRESO A LA TABLA COTIZACION
-- Ejecutar este comando para agregar el nuevo campo
-- =====================================================

-- Agregar el campo tipo_ingreso
ALTER TABLE cotizacion 
ADD COLUMN tipo_ingreso VARCHAR(100);

-- Crear un índice para mejorar el rendimiento de consultas por tipo_ingreso
CREATE INDEX idx_cotizacion_tipo_ingreso ON cotizacion(tipo_ingreso);

-- Actualizar registros existentes con un valor por defecto (opcional)
-- UPDATE cotizacion SET tipo_ingreso = 'No especificado' WHERE tipo_ingreso IS NULL;

-- Verificar que el campo se agregó correctamente
SELECT 
    'CAMPO TIPO_INGRESO AGREGADO EXITOSAMENTE' as mensaje,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
AND column_name = 'tipo_ingreso';

-- Mostrar la estructura completa actualizada de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
ORDER BY ordinal_position;

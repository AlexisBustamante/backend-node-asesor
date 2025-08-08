-- =====================================================
-- AGREGAR CAMPO PROCEDENCIA A LA TABLA COTIZACION
-- Ejecutar este comando para agregar el nuevo campo
-- =====================================================

-- Agregar el campo procedencia como VARCHAR(255) que permite NULL
ALTER TABLE cotizacion 
ADD COLUMN procedencia VARCHAR(255);

-- Verificar que el campo se agregó correctamente
SELECT 
    'CAMPO PROCEDENCIA AGREGADO EXITOSAMENTE' as mensaje,
    column_name,
    data_type,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
AND column_name = 'procedencia';

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

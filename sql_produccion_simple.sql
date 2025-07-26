-- =====================================================
-- SCRIPT SQL SIMPLE PARA PRODUCCIÓN
-- Ejecutar estos comandos uno por uno en tu base de datos
-- =====================================================

-- PASO 1: Agregar nuevos campos
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS numero_cargas INTEGER DEFAULT 0;
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edades_cargas TEXT;

-- PASO 2: Agregar campo isapre (si no existe)
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS isapre VARCHAR(100);

-- PASO 3: Migrar datos de isapre_actual a isapre (si existe isapre_actual)
UPDATE cotizacion SET isapre = isapre_actual WHERE isapre IS NULL AND isapre_actual IS NOT NULL;

-- PASO 4: Agregar campo valor_mensual (si no existe)
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS valor_mensual VARCHAR(50);

-- PASO 5: Migrar datos de cuanto_paga a valor_mensual (si existe cuanto_paga)
UPDATE cotizacion SET valor_mensual = cuanto_paga WHERE valor_mensual IS NULL AND cuanto_paga IS NOT NULL;

-- PASO 6: Agregar campo clinica (si no existe)
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS clinica VARCHAR(100);

-- PASO 7: Migrar datos de clinica_preferencia a clinica (si existe clinica_preferencia)
UPDATE cotizacion SET clinica = clinica_preferencia WHERE clinica IS NULL AND clinica_preferencia IS NOT NULL;

-- PASO 8: Agregar campo renta (si no existe)
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS renta VARCHAR(50);

-- PASO 9: Migrar datos de renta_imponible a renta (si existe renta_imponible)
UPDATE cotizacion SET renta = renta_imponible WHERE renta IS NULL AND renta_imponible IS NOT NULL;

-- PASO 10: Verificar estructura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
ORDER BY ordinal_position; 
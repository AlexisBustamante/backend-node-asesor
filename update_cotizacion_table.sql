-- Script para actualizar la tabla cotizacion con los nuevos campos del frontend
-- Ejecutar este script en tu base de datos PostgreSQL

-- 1. Agregar nuevos campos
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS numero_cargas INTEGER DEFAULT 0;
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edades_cargas TEXT;

-- 2. Agregar campos renombrados para compatibilidad
-- Verificar si existe isapre_actual y agregar isapre
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'isapre_actual') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'isapre') THEN
            ALTER TABLE cotizacion ADD COLUMN isapre VARCHAR(100);
            UPDATE cotizacion SET isapre = isapre_actual WHERE isapre IS NULL;
            RAISE NOTICE 'Campo "isapre" agregado y migrado desde isapre_actual';
        END IF;
    END IF;
END $$;

-- Verificar si existe cuanto_paga y agregar valor_mensual
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'cuanto_paga') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'valor_mensual') THEN
            ALTER TABLE cotizacion ADD COLUMN valor_mensual VARCHAR(50);
            UPDATE cotizacion SET valor_mensual = cuanto_paga WHERE valor_mensual IS NULL;
            RAISE NOTICE 'Campo "valor_mensual" agregado y migrado desde cuanto_paga';
        END IF;
    END IF;
END $$;

-- Verificar si existe clinica_preferencia y agregar clinica
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'clinica_preferencia') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'clinica') THEN
            ALTER TABLE cotizacion ADD COLUMN clinica VARCHAR(100);
            UPDATE cotizacion SET clinica = clinica_preferencia WHERE clinica IS NULL;
            RAISE NOTICE 'Campo "clinica" agregado y migrado desde clinica_preferencia';
        END IF;
    END IF;
END $$;

-- Verificar si existe renta_imponible y agregar renta
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'renta_imponible') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'renta') THEN
            ALTER TABLE cotizacion ADD COLUMN renta VARCHAR(50);
            UPDATE cotizacion SET renta = renta_imponible WHERE renta IS NULL;
            RAISE NOTICE 'Campo "renta" agregado y migrado desde renta_imponible';
        END IF;
    END IF;
END $$;

-- 3. Verificar la estructura final de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
ORDER BY ordinal_position;

-- 4. Mostrar un resumen de los cambios
SELECT 
    'Tabla cotizacion actualizada exitosamente' as mensaje,
    COUNT(*) as total_campos
FROM information_schema.columns 
WHERE table_name = 'cotizacion'; 
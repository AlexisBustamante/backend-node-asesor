-- =====================================================
-- SCRIPT SQL PARA ACTUALIZAR TABLA COTIZACION EN PRODUCCIÓN
-- Ejecutar estos comandos en tu base de datos PostgreSQL de producción
-- =====================================================

-- 1. AGREGAR NUEVOS CAMPOS
-- =====================================================
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS numero_cargas INTEGER DEFAULT 0;
ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edades_cargas TEXT;

-- 2. MIGRAR CAMPOS EXISTENTES (COMPATIBILIDAD)
-- =====================================================

-- Migrar isapre_actual a isapre
DO $$
BEGIN
    -- Verificar si existe isapre_actual
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'isapre_actual') THEN
        -- Verificar si NO existe isapre
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'isapre') THEN
            -- Agregar campo isapre
            ALTER TABLE cotizacion ADD COLUMN isapre VARCHAR(100);
            -- Migrar datos
            UPDATE cotizacion SET isapre = isapre_actual WHERE isapre IS NULL;
            RAISE NOTICE 'Campo "isapre" agregado y migrado desde isapre_actual';
        ELSE
            RAISE NOTICE 'Campo "isapre" ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'Campo "isapre_actual" no existe, no es necesario migrar';
    END IF;
END $$;

-- Migrar cuanto_paga a valor_mensual
DO $$
BEGIN
    -- Verificar si existe cuanto_paga
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'cuanto_paga') THEN
        -- Verificar si NO existe valor_mensual
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'valor_mensual') THEN
            -- Agregar campo valor_mensual
            ALTER TABLE cotizacion ADD COLUMN valor_mensual VARCHAR(50);
            -- Migrar datos
            UPDATE cotizacion SET valor_mensual = cuanto_paga WHERE valor_mensual IS NULL;
            RAISE NOTICE 'Campo "valor_mensual" agregado y migrado desde cuanto_paga';
        ELSE
            RAISE NOTICE 'Campo "valor_mensual" ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'Campo "cuanto_paga" no existe, no es necesario migrar';
    END IF;
END $$;

-- Migrar clinica_preferencia a clinica
DO $$
BEGIN
    -- Verificar si existe clinica_preferencia
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'clinica_preferencia') THEN
        -- Verificar si NO existe clinica
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'clinica') THEN
            -- Agregar campo clinica
            ALTER TABLE cotizacion ADD COLUMN clinica VARCHAR(100);
            -- Migrar datos
            UPDATE cotizacion SET clinica = clinica_preferencia WHERE clinica IS NULL;
            RAISE NOTICE 'Campo "clinica" agregado y migrado desde clinica_preferencia';
        ELSE
            RAISE NOTICE 'Campo "clinica" ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'Campo "clinica_preferencia" no existe, no es necesario migrar';
    END IF;
END $$;

-- Migrar renta_imponible a renta
DO $$
BEGIN
    -- Verificar si existe renta_imponible
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'renta_imponible') THEN
        -- Verificar si NO existe renta
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotizacion' AND column_name = 'renta') THEN
            -- Agregar campo renta
            ALTER TABLE cotizacion ADD COLUMN renta VARCHAR(50);
            -- Migrar datos
            UPDATE cotizacion SET renta = renta_imponible WHERE renta IS NULL;
            RAISE NOTICE 'Campo "renta" agregado y migrado desde renta_imponible';
        ELSE
            RAISE NOTICE 'Campo "renta" ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'Campo "renta_imponible" no existe, no es necesario migrar';
    END IF;
END $$;

-- 3. VERIFICAR ESTRUCTURA FINAL
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
ORDER BY ordinal_position;

-- 4. RESUMEN DE CAMBIOS
-- =====================================================
SELECT 
    'TABLA COTIZACION ACTUALIZADA EXITOSAMENTE' as mensaje,
    COUNT(*) as total_campos,
    CURRENT_TIMESTAMP as fecha_actualizacion
FROM information_schema.columns 
WHERE table_name = 'cotizacion';

-- 5. VERIFICAR DATOS MIGRADOS
-- =====================================================
SELECT 
    'Verificación de datos migrados:' as verificacion,
    COUNT(*) as total_registros,
    COUNT(edad) as registros_con_edad,
    COUNT(numero_cargas) as registros_con_cargas,
    COUNT(edades_cargas) as registros_con_edades_cargas
FROM cotizacion; 
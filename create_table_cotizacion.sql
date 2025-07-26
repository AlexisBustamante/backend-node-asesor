-- =====================================================
-- CREATE TABLE COTIZACION - VERSIÓN ACTUALIZADA
-- Ejecutar este comando para crear la tabla desde cero
-- =====================================================

CREATE TABLE cotizacion (
    id SERIAL PRIMARY KEY,
    cotizacion_id VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    edad INTEGER,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    isapre VARCHAR(100) NOT NULL,
    valor_mensual VARCHAR(50),
    clinica VARCHAR(100) NOT NULL,
    renta VARCHAR(50) NOT NULL,
    numero_cargas INTEGER DEFAULT 0,
    edades_cargas TEXT,
    mensaje TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_cotizacion_estado ON cotizacion(estado);
CREATE INDEX idx_cotizacion_fecha ON cotizacion(fecha_envio);
CREATE INDEX idx_cotizacion_email ON cotizacion(email);

-- Verificar que la tabla se creó correctamente
SELECT 
    'TABLA COTIZACION CREADA EXITOSAMENTE' as mensaje,
    COUNT(*) as total_campos
FROM information_schema.columns 
WHERE table_name = 'cotizacion';

-- Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
ORDER BY ordinal_position; 
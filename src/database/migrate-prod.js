const { query } = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Iniciando migraciones de producción...');

    // Crear tabla de roles si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla roles creada/verificada');

    // Crear tabla de usuarios si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        rut VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada/verificada');

    // Crear tabla de cotizaciones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS cotizacion (
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
        procedencia VARCHAR(255),
        estado VARCHAR(20) DEFAULT 'pendiente',
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla cotizacion creada/verificada');

    // Crear tabla de comentarios si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        estrellas INTEGER NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
        comentario TEXT NOT NULL,
        ver BOOLEAN DEFAULT false,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla comentarios creada/verificada');

    // Crear índices para comentarios
    await query(`CREATE INDEX IF NOT EXISTS idx_comentarios_ver ON comentarios(ver);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_comentarios_fecha ON comentarios(fecha_creacion);`);
    console.log('✅ Índices de comentarios creados/verificados');

    // Actualizar tabla cotizacion con nuevos campos si es necesario
    await updateCotizacionTable();

    // Crear tabla de tokens de refresh si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla refresh_tokens creada/verificada');

    // Crear índice para refresh_tokens
    await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);`);
    console.log('✅ Índice refresh_tokens creado/verificado');

    // Insertar roles básicos si no existen
    await query(`
      INSERT INTO roles (name, description) 
      VALUES 
        ('admin', 'Administrador del sistema'),
        ('supervisor', 'Supervisor de asesores'),
        ('asesor', 'Asesor de seguros')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Roles básicos insertados/verificados');

    // Crear usuario admin por defecto si no existe
    const bcrypt = require('bcryptjs');
    const adminPassword = process.env.ADMIN_PASSWORD || '9z2fvdm4';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await query(`
      INSERT INTO users (rut, email, password_hash, first_name, last_name, role_id, is_active, email_verified)
      VALUES (
        'admin',
        'desdevnode1@gmail.com',
        $1,
        'Administrador',
        'Sistema',
        (SELECT id FROM roles WHERE name = 'admin'),
        true,
        true
      )
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    console.log('✅ Usuario admin creado/verificado');

    console.log('🎉 Migraciones completadas exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
};

// Función para actualizar la tabla cotizacion con nuevos campos
const updateCotizacionTable = async () => {
  try {
    console.log('🔄 Actualizando tabla cotizacion con nuevos campos...');

    // Verificar si los campos ya existen antes de agregarlos
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name IN ('edad', 'numero_cargas', 'edades_cargas', 'procedencia')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);

    // Agregar campo edad si no existe
    if (!existingColumns.includes('edad')) {
      await query(`ALTER TABLE cotizacion ADD COLUMN edad INTEGER;`);
      console.log('✅ Campo "edad" agregado');
    }

    // Agregar campo numero_cargas si no existe
    if (!existingColumns.includes('numero_cargas')) {
      await query(`ALTER TABLE cotizacion ADD COLUMN numero_cargas INTEGER DEFAULT 0;`);
      console.log('✅ Campo "numero_cargas" agregado');
    }

    // Agregar campo edades_cargas si no existe
    if (!existingColumns.includes('edades_cargas')) {
      await query(`ALTER TABLE cotizacion ADD COLUMN edades_cargas TEXT;`);
      console.log('✅ Campo "edades_cargas" agregado');
    }

    // Agregar campo procedencia si no existe
    if (!existingColumns.includes('procedencia')) {
      await query(`ALTER TABLE cotizacion ADD COLUMN procedencia VARCHAR(255);`);
      console.log('✅ Campo "procedencia" agregado');
    }

    // Renombrar campos existentes para mantener compatibilidad
    // Verificar si existe isapre_actual y renombrarlo a isapre si es necesario
    const checkIsapreActual = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'isapre_actual'
    `);

    if (checkIsapreActual.rows.length > 0) {
      // Verificar si ya existe el campo isapre
      const checkIsapre = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'cotizacion' 
        AND column_name = 'isapre'
      `);

      if (checkIsapre.rows.length === 0) {
        await query(`ALTER TABLE cotizacion ADD COLUMN isapre VARCHAR(100);`);
        await query(`UPDATE cotizacion SET isapre = isapre_actual WHERE isapre IS NULL;`);
        console.log('✅ Campo "isapre" agregado y migrado desde isapre_actual');
      }
    }

    // Verificar si existe cuanto_paga y renombrarlo a valor_mensual si es necesario
    const checkCuantoPaga = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'cuanto_paga'
    `);

    if (checkCuantoPaga.rows.length > 0) {
      // Verificar si ya existe el campo valor_mensual
      const checkValorMensual = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'cotizacion' 
        AND column_name = 'valor_mensual'
      `);

      if (checkValorMensual.rows.length === 0) {
        await query(`ALTER TABLE cotizacion ADD COLUMN valor_mensual VARCHAR(50);`);
        await query(`UPDATE cotizacion SET valor_mensual = cuanto_paga WHERE valor_mensual IS NULL;`);
        console.log('✅ Campo "valor_mensual" agregado y migrado desde cuanto_paga');
      }
    }

    // Verificar si existe clinica_preferencia y renombrarlo a clinica si es necesario
    const checkClinicaPreferencia = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'clinica_preferencia'
    `);

    if (checkClinicaPreferencia.rows.length > 0) {
      // Verificar si ya existe el campo clinica
      const checkClinica = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'cotizacion' 
        AND column_name = 'clinica'
      `);

      if (checkClinica.rows.length === 0) {
        await query(`ALTER TABLE cotizacion ADD COLUMN clinica VARCHAR(100);`);
        await query(`UPDATE cotizacion SET clinica = clinica_preferencia WHERE clinica IS NULL;`);
        console.log('✅ Campo "clinica" agregado y migrado desde clinica_preferencia');
      }
    }

    // Verificar si existe renta_imponible y renombrarlo a renta si es necesario
    const checkRentaImponible = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'renta_imponible'
    `);

    if (checkRentaImponible.rows.length > 0) {
      // Verificar si ya existe el campo renta
      const checkRenta = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'cotizacion' 
        AND column_name = 'renta'
      `);

      if (checkRenta.rows.length === 0) {
        await query(`ALTER TABLE cotizacion ADD COLUMN renta VARCHAR(50);`);
        await query(`UPDATE cotizacion SET renta = renta_imponible WHERE renta IS NULL;`);
        console.log('✅ Campo "renta" agregado y migrado desde renta_imponible');
      }
    }

    console.log('✅ Actualización de tabla cotizacion completada');
  } catch (error) {
    console.error('❌ Error actualizando tabla cotizacion:', error);
    throw error;
  }
};

// Ejecutar migraciones si se llama directamente
if (require.main === module) {
  runMigrations().then(() => {
    console.log('✅ Migraciones finalizadas');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error en migraciones:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations }; 
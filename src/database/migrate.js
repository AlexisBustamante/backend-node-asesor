const { query } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Iniciando migración de base de datos...');

    // Tabla de roles
    await query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        rut VARCHAR(12) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        region VARCHAR(100),
        comuna VARCHAR(100),
        role_id INTEGER REFERENCES roles(id),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de tokens de refresh
    await query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de clientes
    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        rut VARCHAR(12) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        region VARCHAR(100),
        comuna VARCHAR(100),
        birth_date DATE,
        gender VARCHAR(10),
        occupation VARCHAR(100),
        income_level VARCHAR(50),
        family_members INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de aseguradoras
    await query(`
      CREATE TABLE IF NOT EXISTS insurance_companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        rut VARCHAR(12) UNIQUE NOT NULL,
        website VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de planes de seguro
    await query(`
      CREATE TABLE IF NOT EXISTS insurance_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        company_id INTEGER REFERENCES insurance_companies(id),
        plan_type VARCHAR(100) NOT NULL,
        coverage_details JSONB,
        monthly_premium DECIMAL(10,2),
        annual_premium DECIMAL(10,2),
        deductible DECIMAL(10,2),
        copay_percentage DECIMAL(5,2),
        max_coverage DECIMAL(12,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de cotizaciones
    await query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        advisor_id INTEGER REFERENCES users(id),
        plan_id INTEGER REFERENCES insurance_plans(id),
        quote_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        total_premium DECIMAL(10,2),
        coverage_amount DECIMAL(12,2),
        additional_benefits JSONB,
        notes TEXT,
        valid_until DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de cotizaciones web (formulario público)
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
      );
    `);

    // Tabla de pólizas
    await query(`
      CREATE TABLE IF NOT EXISTS policies (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id),
        policy_number VARCHAR(100) UNIQUE NOT NULL,
        client_id INTEGER REFERENCES clients(id),
        advisor_id INTEGER REFERENCES users(id),
        plan_id INTEGER REFERENCES insurance_plans(id),
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE NOT NULL,
        end_date DATE,
        premium_amount DECIMAL(10,2) NOT NULL,
        payment_frequency VARCHAR(20) DEFAULT 'monthly',
        coverage_details JSONB,
        documents JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de seguimiento de clientes
    await query(`
      CREATE TABLE IF NOT EXISTS client_follow_ups (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        advisor_id INTEGER REFERENCES users(id),
        follow_up_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        scheduled_date TIMESTAMP,
        completed_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para mejorar rendimiento
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_rut ON users(rut);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_clients_rut ON clients(rut);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_cotizacion_estado ON cotizacion(estado);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_cotizacion_fecha ON cotizacion(fecha_envio);`);

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
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

// Ejecutar migración si se llama directamente
if (require.main === module) {
  createTables()
    .then(() => updateCotizacionTable())
    .then(() => {
      console.log('🎉 Base de datos configurada correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error configurando la base de datos:', error);
      process.exit(1);
    });
}

module.exports = { createTables, updateCotizacionTable }; 
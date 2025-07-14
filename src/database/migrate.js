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
        telefono VARCHAR(30) NOT NULL,
        email VARCHAR(100) NOT NULL,
        isapre_actual VARCHAR(100) NOT NULL,
        cuanto_paga VARCHAR(50) NOT NULL,
        clinica_preferencia VARCHAR(100) NOT NULL,
        renta_imponible VARCHAR(50) NOT NULL,
        mensaje TEXT,
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

// Ejecutar migración si se llama directamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Base de datos configurada correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error configurando la base de datos:', error);
      process.exit(1);
    });
}

module.exports = { createTables }; 
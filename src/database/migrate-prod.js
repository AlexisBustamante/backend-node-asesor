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
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        isapre_actual VARCHAR(100) NOT NULL,
        cuanto_paga VARCHAR(50) NOT NULL,
        clinica_preferencia VARCHAR(100) NOT NULL,
        renta_imponible VARCHAR(50) NOT NULL,
        mensaje TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente',
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla cotizacion creada/verificada');

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
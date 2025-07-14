const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando población de datos iniciales...');

    // Crear roles
    const roles = [
      {
        name: 'admin',
        description: 'Administrador del sistema con acceso completo',
        permissions: ['users:read', 'users:write', 'users:delete', 'clients:read', 'clients:write', 'clients:delete', 'quotes:read', 'quotes:write', 'quotes:delete', 'policies:read', 'policies:write', 'policies:delete']
      },
      {
        name: 'asesor',
        description: 'Asesor de seguros médicos',
        permissions: ['clients:read', 'clients:write', 'quotes:read', 'quotes:write', 'policies:read', 'policies:write']
      },
      {
        name: 'supervisor',
        description: 'Supervisor de asesores',
        permissions: ['users:read', 'clients:read', 'clients:write', 'quotes:read', 'quotes:write', 'policies:read', 'policies:write']
      }
    ];

    for (const role of roles) {
      await query(
        'INSERT INTO roles (name, description, permissions) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [role.name, role.description, JSON.stringify(role.permissions)]
      );
    }

    // Obtener ID del rol admin
    const adminRole = await query('SELECT id FROM roles WHERE name = $1', ['admin']);
    const asesorRole = await query('SELECT id FROM roles WHERE name = $1', ['asesor']);

    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 12);
    await query(`
      INSERT INTO users (rut, email, password_hash, first_name, last_name, phone, role_id, email_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO NOTHING
    `, [
      '12345678-9',
      'admin@asesoriaseguros.cl',
      adminPassword,
      'Administrador',
      'Sistema',
      '+56912345678',
      adminRole.rows[0]?.id,
      true,
      true
    ]);

    // Crear asesor de ejemplo
    const asesorPassword = await bcrypt.hash('asesor123', 12);
    await query(`
      INSERT INTO users (rut, email, password_hash, first_name, last_name, phone, role_id, email_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO NOTHING
    `, [
      '98765432-1',
      'asesor@asesoriaseguros.cl',
      asesorPassword,
      'Juan',
      'Pérez',
      '+56987654321',
      asesorRole.rows[0]?.id,
      true,
      true
    ]);

    // Crear aseguradoras de ejemplo
    const insuranceCompanies = [
      {
        name: 'Banmédica',
        rut: '96.571.200-9',
        website: 'https://www.banmedica.cl',
        phone: '+562 2420 5000',
        email: 'contacto@banmedica.cl',
        address: 'Av. Apoquindo 3846, Las Condes, Santiago'
      },
      {
        name: 'Colmena Golden Cross',
        rut: '96.571.200-8',
        website: 'https://www.colmena.cl',
        phone: '+562 2420 4000',
        email: 'contacto@colmena.cl',
        address: 'Av. Providencia 1111, Providencia, Santiago'
      },
      {
        name: 'Consalud',
        rut: '96.571.200-7',
        website: 'https://www.consalud.cl',
        phone: '+562 2420 3000',
        email: 'contacto@consalud.cl',
        address: 'Av. Las Condes 12345, Las Condes, Santiago'
      },
      {
        name: 'Cruz Blanca',
        rut: '96.571.200-6',
        website: 'https://www.cruzblanca.cl',
        phone: '+562 2420 2000',
        email: 'contacto@cruzblanca.cl',
        address: 'Av. Vitacura 1234, Las Condes, Santiago'
      },
      {
        name: 'Fonasa',
        rut: '61.070.200-1',
        website: 'https://www.fonasa.cl',
        phone: '+562 2420 1000',
        email: 'contacto@fonasa.cl',
        address: 'Av. Libertador Bernardo O\'Higgins 1234, Santiago'
      }
    ];

    for (const company of insuranceCompanies) {
      await query(`
        INSERT INTO insurance_companies (name, rut, website, phone, email, address)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (rut) DO NOTHING
      `, [company.name, company.rut, company.website, company.phone, company.email, company.address]);
    }

    // Obtener IDs de aseguradoras
    const companies = await query('SELECT id, name FROM insurance_companies');

    // Crear planes de seguro de ejemplo
    const plans = [
      {
        name: 'Plan Premium Banmédica',
        description: 'Cobertura completa con acceso a red de clínicas premium',
        company_id: companies.rows.find(c => c.name === 'Banmédica')?.id,
        plan_type: 'Premium',
        coverage_details: {
          hospitalizacion: '100%',
          consultas_medicas: 'Sin copago',
          examenes: '100%',
          medicamentos: '80%',
          urgencias: '100%'
        },
        monthly_premium: 150000,
        annual_premium: 1800000,
        deductible: 0,
        copay_percentage: 0,
        max_coverage: 50000000
      },
      {
        name: 'Plan Básico Colmena',
        description: 'Cobertura básica con copagos moderados',
        company_id: companies.rows.find(c => c.name === 'Colmena Golden Cross')?.id,
        plan_type: 'Básico',
        coverage_details: {
          hospitalizacion: '90%',
          consultas_medicas: 'Con copago',
          examenes: '80%',
          medicamentos: '60%',
          urgencias: '90%'
        },
        monthly_premium: 80000,
        annual_premium: 960000,
        deductible: 50000,
        copay_percentage: 20,
        max_coverage: 30000000
      },
      {
        name: 'Plan Familiar Consalud',
        description: 'Plan familiar con cobertura para hasta 6 integrantes',
        company_id: companies.rows.find(c => c.name === 'Consalud')?.id,
        plan_type: 'Familiar',
        coverage_details: {
          hospitalizacion: '95%',
          consultas_medicas: 'Sin copago',
          examenes: '90%',
          medicamentos: '70%',
          urgencias: '95%',
          integrantes_max: 6
        },
        monthly_premium: 200000,
        annual_premium: 2400000,
        deductible: 25000,
        copay_percentage: 10,
        max_coverage: 40000000
      }
    ];

    for (const plan of plans) {
      if (plan.company_id) {
        await query(`
          INSERT INTO insurance_plans (name, description, company_id, plan_type, coverage_details, monthly_premium, annual_premium, deductible, copay_percentage, max_coverage)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          plan.name,
          plan.description,
          plan.company_id,
          plan.plan_type,
          JSON.stringify(plan.coverage_details),
          plan.monthly_premium,
          plan.annual_premium,
          plan.deductible,
          plan.copay_percentage,
          plan.max_coverage
        ]);
      }
    }

    // Crear cliente de ejemplo
    const adminUser = await query('SELECT id FROM users WHERE email = $1', ['admin@asesoriaseguros.cl']);
    
    await query(`
      INSERT INTO clients (rut, first_name, last_name, email, phone, address, region, comuna, birth_date, gender, occupation, income_level, family_members, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (rut) DO NOTHING
    `, [
      '15.678.901-2',
      'María',
      'González',
      'maria.gonzalez@email.com',
      '+56912345678',
      'Av. Providencia 1234, Depto 45',
      'Metropolitana',
      'Providencia',
      '1985-03-15',
      'Femenino',
      'Ingeniera Comercial',
      'Medio-Alto',
      3,
      adminUser.rows[0]?.id
    ]);

    console.log('✅ Datos iniciales poblados exitosamente');
    console.log('📋 Credenciales de acceso:');
    console.log('   Admin: admin@asesoriaseguros.cl / admin123');
    console.log('   Asesor: asesor@asesoriaseguros.cl / asesor123');

  } catch (error) {
    console.error('❌ Error poblando datos iniciales:', error);
    throw error;
  }
};

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Base de datos poblada correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error poblando la base de datos:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testCotizacionNumeros() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Probando validación de campos numéricos...');
    
    // Caso 1: Campos numéricos válidos
    console.log('\n✅ Caso 1: Campos numéricos válidos');
    const cotizacionValida = {
      nombre: 'Juan Pérez',
      apellidos: 'González',
      edad: '35',
      telefono: '+56912345678',
      email: 'juan@test.com',
      isapre: 'Banmédica',
      valor_mensual: '50000',
      clinica: 'Clínica Alemana',
      renta: '1500000',
      numero_cargas: '2',
      edades_cargas: '8, 12',
      mensaje: 'Test de validación',
      procedencia: 'Test',
      tipo_ingreso: 'Dependiente'
    };
    
    console.log('Datos de prueba:', cotizacionValida);
    
    // Caso 2: Campos numéricos vacíos (deberían convertirse a null)
    console.log('\n⚠️  Caso 2: Campos numéricos vacíos');
    const cotizacionConVacios = {
      nombre: 'María López',
      apellidos: 'Rodríguez',
      edad: '',
      telefono: '',
      email: 'maria@test.com',
      isapre: 'Fonasa',
      valor_mensual: '',
      clinica: 'Clínica Las Condes',
      renta: '',
      numero_cargas: '',
      edades_cargas: '',
      mensaje: 'Test con campos vacíos',
      procedencia: 'Test',
      tipo_ingreso: 'Independiente'
    };
    
    console.log('Datos de prueba:', cotizacionConVacios);
    
    // Caso 3: Campos numéricos inválidos
    console.log('\n❌ Caso 3: Campos numéricos inválidos');
    const cotizacionInvalida = {
      nombre: 'Pedro García',
      apellidos: 'Martínez',
      edad: 'abc',
      telefono: '+56987654321',
      email: 'pedro@test.com',
      isapre: 'Colmena',
      valor_mensual: 'xyz',
      clinica: 'Clínica Santa María',
      renta: 'def',
      numero_cargas: 'ghi',
      edades_cargas: '5, 10',
      mensaje: 'Test con datos inválidos',
      procedencia: 'Test',
      tipo_ingreso: 'Dependiente'
    };
    
    console.log('Datos de prueba:', cotizacionInvalida);
    
    console.log('\n📋 Resumen de pruebas:');
    console.log('✅ Caso 1: Debería funcionar correctamente');
    console.log('⚠️  Caso 2: Debería funcionar (campos vacíos se convierten a null)');
    console.log('❌ Caso 3: Debería fallar con validación de tipos');
    
    console.log('\n💡 Para probar realmente, ejecuta el servidor y envía requests POST a:');
    console.log('   - /api/cotizaciones (caso público)');
    console.log('   - /api/cotizaciones/admin (caso admin)');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
testCotizacionNumeros().catch(console.error);

const { query } = require('./src/config/database');

async function migrateTipoIngreso() {
  try {
    console.log('🔄 Iniciando migración para agregar campo tipo_ingreso...');
    
    // Verificar si el campo ya existe
    const checkField = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'tipo_ingreso'
    `);
    
    if (checkField.rows.length > 0) {
      console.log('✅ El campo tipo_ingreso ya existe en la tabla cotizacion');
      return;
    }
    
    // Agregar el campo tipo_ingreso
    console.log('📝 Agregando campo tipo_ingreso...');
    await query(`
      ALTER TABLE cotizacion 
      ADD COLUMN tipo_ingreso VARCHAR(100)
    `);
    
    // Crear índice para mejorar rendimiento
    console.log('🔍 Creando índice para tipo_ingreso...');
    await query(`
      CREATE INDEX idx_cotizacion_tipo_ingreso ON cotizacion(tipo_ingreso)
    `);
    
    // Verificar que se agregó correctamente
    const verifyField = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'tipo_ingreso'
    `);
    
    if (verifyField.rows.length > 0) {
      console.log('✅ Campo tipo_ingreso agregado exitosamente');
      console.log('📊 Detalles del campo:', verifyField.rows[0]);
    } else {
      throw new Error('No se pudo verificar que el campo se agregó correctamente');
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateTipoIngreso()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateTipoIngreso };

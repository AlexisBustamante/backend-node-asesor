/**
 * Script de migración para agregar soporte multi-tenant
 * Agrega el campo id_propietario a las tablas cotizacion y comentarios
 */

const { query } = require('../config/database');

const migrateMultiTenant = async () => {
  try {
    console.log('🚀 Iniciando migración multi-tenant...');

    // 1. Agregar id_propietario a la tabla cotizacion
    console.log('📝 Agregando id_propietario a tabla cotizacion...');
    await query(`
      ALTER TABLE cotizacion 
      ADD COLUMN IF NOT EXISTS id_propietario INTEGER NOT NULL DEFAULT 1
    `);
    console.log('✅ Campo id_propietario agregado a cotizacion');

    // 2. Agregar id_propietario a la tabla comentarios
    console.log('📝 Agregando id_propietario a tabla comentarios...');
    await query(`
      ALTER TABLE comentarios 
      ADD COLUMN IF NOT EXISTS id_propietario INTEGER NOT NULL DEFAULT 1
    `);
    console.log('✅ Campo id_propietario agregado a comentarios');

    // 3. Crear índices para optimizar consultas por propietario
    console.log('🔍 Creando índices para optimización...');
    
    await query(`CREATE INDEX IF NOT EXISTS idx_cotizacion_propietario ON cotizacion(id_propietario);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_comentarios_propietario ON comentarios(id_propietario);`);
    
    // Índices compuestos para consultas frecuentes
    await query(`CREATE INDEX IF NOT EXISTS idx_cotizacion_propietario_fecha ON cotizacion(id_propietario, fecha_envio);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_comentarios_propietario_ver ON comentarios(id_propietario, ver);`);
    
    console.log('✅ Índices creados exitosamente');

    // 4. Actualizar registros existentes (asignar propietario por defecto)
    console.log('🔄 Actualizando registros existentes...');
    
    const cotizacionesResult = await query(`
      UPDATE cotizacion 
      SET id_propietario = 1 
      WHERE id_propietario IS NULL OR id_propietario = 0
    `);
    console.log(`✅ ${cotizacionesResult.rowCount} cotizaciones actualizadas`);

    const comentariosResult = await query(`
      UPDATE comentarios 
      SET id_propietario = 1 
      WHERE id_propietario IS NULL OR id_propietario = 0
    `);
    console.log(`✅ ${comentariosResult.rowCount} comentarios actualizados`);

    // 5. Verificar la migración
    console.log('🔍 Verificando migración...');
    
    const cotizacionesCount = await query(`
      SELECT COUNT(*) as total FROM cotizacion WHERE id_propietario IS NOT NULL
    `);
    console.log(`📊 Total cotizaciones con propietario: ${cotizacionesCount.rows[0].total}`);

    const comentariosCount = await query(`
      SELECT COUNT(*) as total FROM comentarios WHERE id_propietario IS NOT NULL
    `);
    console.log(`📊 Total comentarios con propietario: ${comentariosCount.rows[0].total}`);

    console.log('🎉 Migración multi-tenant completada exitosamente!');
    console.log('');
    console.log('📋 Resumen de cambios:');
    console.log('   ✅ Campo id_propietario agregado a tabla cotizacion');
    console.log('   ✅ Campo id_propietario agregado a tabla comentarios');
    console.log('   ✅ Índices de optimización creados');
    console.log('   ✅ Registros existentes actualizados');
    console.log('');
    console.log('🚀 El sistema ahora soporta múltiples páginas web!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
};

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateMultiTenant()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateMultiTenant };

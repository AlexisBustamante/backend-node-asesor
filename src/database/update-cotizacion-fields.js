const { query } = require('../config/database');

const updateCotizacionFields = async () => {
  try {
    console.log('🔄 Iniciando actualización de campos de la tabla cotizacion...');

    // 1. Agregar nuevos campos
    console.log('📝 Agregando nuevos campos...');
    
    await query(`ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edad INTEGER;`);
    console.log('✅ Campo "edad" agregado/verificado');
    
    await query(`ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS numero_cargas INTEGER DEFAULT 0;`);
    console.log('✅ Campo "numero_cargas" agregado/verificado');
    
    await query(`ALTER TABLE cotizacion ADD COLUMN IF NOT EXISTS edades_cargas TEXT;`);
    console.log('✅ Campo "edades_cargas" agregado/verificado');

    // 2. Verificar y migrar campos existentes
    console.log('🔄 Verificando campos existentes...');

    // Verificar si existe isapre_actual y agregar isapre
    const checkIsapreActual = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'isapre_actual'
    `);

    if (checkIsapreActual.rows.length > 0) {
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
      } else {
        console.log('ℹ️ Campo "isapre" ya existe');
      }
    }

    // Verificar si existe cuanto_paga y agregar valor_mensual
    const checkCuantoPaga = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'cuanto_paga'
    `);

    if (checkCuantoPaga.rows.length > 0) {
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
      } else {
        console.log('ℹ️ Campo "valor_mensual" ya existe');
      }
    }

    // Verificar si existe clinica_preferencia y agregar clinica
    const checkClinicaPreferencia = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'clinica_preferencia'
    `);

    if (checkClinicaPreferencia.rows.length > 0) {
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
      } else {
        console.log('ℹ️ Campo "clinica" ya existe');
      }
    }

    // Verificar si existe renta_imponible y agregar renta
    const checkRentaImponible = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'renta_imponible'
    `);

    if (checkRentaImponible.rows.length > 0) {
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
      } else {
        console.log('ℹ️ Campo "renta" ya existe');
      }
    }

    // 3. Mostrar estructura final de la tabla
    console.log('\n📋 Estructura final de la tabla cotizacion:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      ORDER BY ordinal_position
    `);

    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // 4. Resumen
    const totalFields = await query(`
      SELECT COUNT(*) as total
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion'
    `);

    console.log(`\n🎉 Actualización completada exitosamente!`);
    console.log(`📊 Total de campos en la tabla: ${totalFields.rows[0].total}`);

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  updateCotizacionFields()
    .then(() => {
      console.log('✅ Script de actualización completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { updateCotizacionFields }; 
const { query } = require('./src/config/database');

const addProcedenciaField = async () => {
  try {
    console.log('🔄 Iniciando migración para agregar campo procedencia...');

    // Verificar si el campo procedencia ya existe
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'procedencia'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ El campo "procedencia" ya existe en la tabla cotizacion');
      return;
    }

    // Agregar el campo procedencia
    await query(`
      ALTER TABLE cotizacion 
      ADD COLUMN procedencia VARCHAR(255)
    `);

    console.log('✅ Campo "procedencia" agregado exitosamente');

    // Verificar que el campo se agregó correctamente
    const verifyColumn = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      AND column_name = 'procedencia'
    `);

    if (verifyColumn.rows.length > 0) {
      const column = verifyColumn.rows[0];
      console.log('✅ Verificación exitosa:');
      console.log(`   - Nombre: ${column.column_name}`);
      console.log(`   - Tipo: ${column.data_type}`);
      console.log(`   - Permite NULL: ${column.is_nullable}`);
      console.log(`   - Longitud máxima: ${column.character_maximum_length}`);
    }

    // Mostrar la estructura completa actualizada de la tabla
    const tableStructure = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'cotizacion' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura actualizada de la tabla cotizacion:');
    tableStructure.rows.forEach(row => {
      console.log(`   ${row.ordinal_position}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
};

// Ejecutar migración si se llama directamente
if (require.main === module) {
  addProcedenciaField()
    .then(() => {
      console.log('✅ Proceso finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { addProcedenciaField };

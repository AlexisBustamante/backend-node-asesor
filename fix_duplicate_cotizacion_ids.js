const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDuplicateCotizacionIds() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando IDs duplicados de cotizaciones...');
    
    // Buscar IDs duplicados
    const duplicateQuery = `
      SELECT cotizacion_id, COUNT(*) as count
      FROM cotizacion 
      GROUP BY cotizacion_id 
      HAVING COUNT(*) > 1
      ORDER BY cotizacion_id
    `;
    
    const duplicateResult = await client.query(duplicateQuery);
    
    if (duplicateResult.rows.length === 0) {
      console.log('✅ No se encontraron IDs duplicados');
      return;
    }
    
    console.log(`⚠️  Se encontraron ${duplicateResult.rows.length} IDs duplicados:`);
    
    for (const row of duplicateResult.rows) {
      console.log(`   - ${row.cotizacion_id}: ${row.count} cotizaciones`);
      
      // Obtener todas las cotizaciones con este ID
      const cotizacionesQuery = `
        SELECT id, cotizacion_id, nombre, apellidos, email, fecha_envio
        FROM cotizacion 
        WHERE cotizacion_id = $1
        ORDER BY id
      `;
      
      const cotizacionesResult = await client.query(cotizacionesQuery, [row.cotizacion_id]);
      
      // Generar nuevos IDs únicos para las cotizaciones duplicadas (excepto la primera)
      for (let i = 1; i < cotizacionesResult.rows.length; i++) {
        const cotizacion = cotizacionesResult.rows[i];
        const fecha = new Date(cotizacion.fecha_envio);
        const fechaStr = fecha.getFullYear().toString() + 
                        (fecha.getMonth() + 1).toString().padStart(2, '0') + 
                        fecha.getDate().toString().padStart(2, '0');
        
        // Obtener el siguiente número disponible para esta fecha
        const maxQuery = `
          SELECT COALESCE(MAX(CAST(SUBSTRING(cotizacion_id FROM 19) AS INTEGER)), 0) as max_num
          FROM cotizacion 
          WHERE cotizacion_id LIKE $1
        `;
        
        const maxResult = await client.query(maxQuery, [`COT-${fechaStr}-%`]);
        const nuevoNumero = (maxResult.rows[0].max_num + 1).toString().padStart(4, '0');
        const nuevoId = `COT-${fechaStr}-${nuevoNumero}`;
        
        // Actualizar el ID de la cotización
        const updateQuery = `
          UPDATE cotizacion 
          SET cotizacion_id = $1 
          WHERE id = $2
        `;
        
        await client.query(updateQuery, [nuevoId, cotizacion.id]);
        console.log(`     ✅ Cotización ID ${cotizacion.id}: ${cotizacion.cotizacion_id} → ${nuevoId}`);
      }
    }
    
    console.log('\n✅ Proceso de corrección completado');
    
    // Verificar que no queden duplicados
    const finalCheck = await client.query(duplicateQuery);
    if (finalCheck.rows.length === 0) {
      console.log('✅ Verificación final: No quedan IDs duplicados');
    } else {
      console.log('❌ Verificación final: Aún hay IDs duplicados');
    }
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
fixDuplicateCotizacionIds().catch(console.error);

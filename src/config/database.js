const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
 //ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
 
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Evento para manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection
}; 
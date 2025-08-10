const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Reiniciando servidor para limpiar rate limiting...');

// Detener el servidor actual (si está corriendo)
const stopCommand = process.platform === 'win32' ? 'taskkill /f /im node.exe' : 'pkill -f "node.*server.js"';

exec(stopCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('ℹ️ No se encontró un servidor corriendo o ya se detuvo');
  } else {
    console.log('✅ Servidor detenido');
  }
  
  // Esperar un momento y reiniciar
  setTimeout(() => {
    console.log('🚀 Reiniciando servidor...');
    
    const startCommand = 'npm start';
    const child = exec(startCommand, { cwd: __dirname });
    
    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    child.on('close', (code) => {
      console.log(`Servidor terminado con código ${code}`);
    });
    
    console.log('✅ Servidor reiniciado. El rate limiting ha sido limpiado.');
    console.log('💡 Ahora puedes intentar hacer las peticiones nuevamente.');
    
  }, 2000);
});

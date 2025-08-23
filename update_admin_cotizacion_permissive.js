// Script para hacer más permisiva la función crearCotizacionAdmin y actualizarCotizacion
// Este archivo se puede eliminar después de aplicar las actualizaciones

const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'src', 'controllers', 'cotizacionController.js');

// Leer el archivo actual
let content = fs.readFileSync(controllerPath, 'utf8');

// Actualizar la validación de campos requeridos en crearCotizacionAdmin
content = content.replace(
  /\/\/ Validar campos requeridos \(verificando que no estén vacíos\)\s+if \(!nombre \|\| nombre\.trim\(\) === '' \|\| \s+!edad \|\| edad\.toString\(\)\.trim\(\) === '' \|\| \s+!telefono \|\| telefono\.toString\(\)\.trim\(\) === '' \|\| \s+!isapre \|\| isapre\.trim\(\) === '' \|\| \s+!clinica \|\| clinica\.trim\(\) === '' \|\| \s+!renta \|\| renta\.toString\(\)\.trim\(\) === ''\) \{\s+return res\.status\(400\)\.json\(\{\s+success: false,\s+message: 'Todos los campos marcados con \* son obligatorios'\s+\}\);\s+\}/g,
  `// Validar solo nombre como campo obligatorio (más permisivo para admin)
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre es el único campo obligatorio'
      });
    }`
);

// Actualizar la validación de longitud del nombre en crearCotizacionAdmin
content = content.replace(
  /\/\/ Validar longitud del nombre\s+if \(nombre\.trim\(\)\.length < 2 \|\| nombre\.trim\(\)\.length > 150\) \{\s+return res\.status\(400\)\.json\(\{\s+success: false,\s+message: 'El nombre debe tener entre 2 y 150 caracteres'\s+\}\);\s+\}/g,
  `// Validar longitud del nombre (más permisivo para admin)
    if (nombre.trim().length < 1 || nombre.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'El nombre debe tener entre 1 y 200 caracteres'
      });
    }`
);

// Actualizar las validaciones de actualizarCotizacionValidation para ser más permisivas
content = content.replace(
  /body\('nombre'\)\s+\.optional\(\)\s+\.trim\(\)\s+\.isLength\(\{ min: 2, max: 150 \}\)\s+\.withMessage\('El nombre debe tener entre 2 y 150 caracteres'\)/g,
  `body('nombre')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El nombre debe tener entre 1 y 200 caracteres')`
);

content = content.replace(
  /body\('isapre'\)\s+\.optional\(\)\s+\.trim\(\)\s+\.isLength\(\{ min: 2, max: 100 \}\)\s+\.withMessage\('La ISAPRE debe tener entre 2 y 100 caracteres'\)/g,
  `body('isapre')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('La ISAPRE debe tener entre 1 y 150 caracteres')`
);

content = content.replace(
  /body\('clinica'\)\s+\.optional\(\)\s+\.trim\(\)\s+\.isLength\(\{ min: 2, max: 100 \}\)\s+\.withMessage\('La clínica debe tener entre 2 y 100 caracteres'\)/g,
  `body('clinica')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('La clínica debe tener entre 1 y 150 caracteres')`
);

// Hacer más permisivas las validaciones de números
content = content.replace(
  /body\('edad'\)\s+\.optional\(\)\s+\.isNumeric\(\)\s+\.withMessage\('La edad debe ser un número'\)/g,
  `body('edad')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 150;
    })
    .withMessage('La edad debe ser un número entre 0 y 150')`
);

content = content.replace(
  /body\('valor_mensual'\)\s+\.optional\(\)\s+\.isNumeric\(\)\s+\.withMessage\('El valor mensual debe ser un número'\)/g,
  `body('valor_mensual')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('El valor mensual debe ser un número positivo')`
);

content = content.replace(
  /body\('renta'\)\s+\.optional\(\)\s+\.isNumeric\(\)\s+\.withMessage\('La renta debe ser un número'\)/g,
  `body('renta')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('La renta debe ser un número positivo')`
);

content = content.replace(
  /body\('numero_cargas'\)\s+\.optional\(\)\s+\.isNumeric\(\)\s+\.withMessage\('El número de cargas debe ser un número'\)/g,
  `body('numero_cargas')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 20;
    })
    .withMessage('El número de cargas debe ser un número entre 0 y 20')`
);

// Hacer más permisiva la validación de teléfono
content = content.replace(
  /body\('telefono'\)\s+\.optional\(\)\s+\.matches\(\/^\+?\[0-9\\s\\-\\(\\)\]\+\$\/\)\s+\.withMessage\('Formato de teléfono inválido'\)/g,
  `body('telefono')
    .optional()
    .trim()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      // Permitir cualquier formato de teléfono
      return value.length >= 1 && value.length <= 50;
    })
    .withMessage('El teléfono debe tener entre 1 y 50 caracteres')`
);

// Hacer más permisiva la validación de email
content = content.replace(
  /body\('email'\)\s+\.optional\(\)\s+\.isEmail\(\)\s+\.normalizeEmail\(\)\s+\.withMessage\('Email inválido'\)/g,
  `body('email')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      // Validación básica de email más permisiva
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || value.length === 0;
    })
    .withMessage('Email inválido o dejar vacío')`
);

// Escribir el archivo actualizado
fs.writeFileSync(controllerPath, content, 'utf8');

console.log('✅ Funciones de cotización actualizadas para ser más permisivas');
console.log('📝 Cambios realizados:');
console.log('   - Solo el nombre es obligatorio en crearCotizacionAdmin');
console.log('   - Validación del nombre: 1-200 caracteres (antes: 2-150)');
console.log('   - Validaciones de edición más flexibles:');
console.log('     * ISAPRE y Clínica: 1-150 caracteres (antes: 2-100)');
console.log('     * Edad: 0-150 (antes: solo numérico)');
console.log('     * Valor mensual y renta: números positivos');
console.log('     * Número de cargas: 0-20');
console.log('     * Teléfono: formato más permisivo (1-50 caracteres)');
console.log('     * Email: validación más flexible');
console.log('   - Todos los demás campos son opcionales');
console.log('   - Más flexibilidad para administradores');

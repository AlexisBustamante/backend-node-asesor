const fs = require('fs').promises;
const path = require('path');

/**
 * Renderiza un archivo HTML desde la carpeta views
 * @param {string} filename - Nombre del archivo HTML (sin extensión)
 * @param {Object} data - Datos para reemplazar en el template
 * @returns {Promise<string>} - Contenido HTML renderizado
 */
const renderHTML = async (filename, data = {}) => {
  try {
    const filePath = path.join(__dirname, '../views', `${filename}.html`);
    let html = await fs.readFile(filePath, 'utf8');
    
    // Reemplazar variables en el template si se proporcionan datos
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, data[key]);
      });
    }
    
    return html;
  } catch (error) {
    console.error(`Error renderizando HTML ${filename}:`, error);
    throw new Error(`No se pudo cargar la plantilla ${filename}`);
  }
};

/**
 * Renderiza la página de email verificado exitosamente
 * @param {Object} data - Datos adicionales para la página
 * @returns {Promise<string>} - HTML de la página de éxito
 */
const renderEmailVerified = async (data = {}) => {
  return await renderHTML('emailVerified', data);
};

/**
 * Renderiza la página de error en verificación de email
 * @param {Object} data - Datos adicionales para la página
 * @returns {Promise<string>} - HTML de la página de error
 */
const renderEmailVerificationError = async (data = {}) => {
  return await renderHTML('emailVerificationError', data);
};

module.exports = {
  renderHTML,
  renderEmailVerified,
  renderEmailVerificationError
}; 
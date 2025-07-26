const fs = require('fs').promises;
const path = require('path');
const emailConfig = require('../config/emailConfig');

/**
 * Renderiza un template HTML reemplazando las variables con los datos proporcionados
 * @param {string} templatePath - Ruta al archivo template
 * @param {object} data - Datos para reemplazar en el template
 * @returns {string} - HTML renderizado
 */
const renderTemplate = async (templatePath, data) => {
  try {
    // Leer el template
    const template = await fs.readFile(templatePath, 'utf8');
    
    // Reemplazar las variables del template
    let html = template;
    
    // Reemplazar variables simples
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] || '');
    });
    
    // Reemplazar condicionales {{#if campo}}...{{/if}}
    html = html.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, field, content) => {
      return data[field] ? content : '';
    });
    
    return html;
  } catch (error) {
    console.error('Error renderizando template:', error);
    throw error;
  }
};

/**
 * Renderiza el email de confirmación para el cliente
 * @param {object} cotizacionData - Datos de la cotización
 * @returns {string} - HTML del email
 */
const renderEmailCliente = async (cotizacionData) => {
  const templatePath = path.join(__dirname, '../views/emailCotizacionCliente.html');
  // Agregar la URL del logo a los datos
  const dataWithLogo = {
    ...cotizacionData,
    logoUrl: emailConfig.logoUrl
  };
  return await renderTemplate(templatePath, dataWithLogo);
};

/**
 * Renderiza el email de notificación para el administrador
 * @param {object} cotizacionData - Datos de la cotización
 * @returns {string} - HTML del email
 */
const renderEmailAdmin = async (cotizacionData) => {
  const templatePath = path.join(__dirname, '../views/emailCotizacionAdmin.html');
  // Agregar la URL del logo a los datos
  const dataWithLogo = {
    ...cotizacionData,
    logoUrl: emailConfig.logoUrl
  };
  return await renderTemplate(templatePath, dataWithLogo);
};

module.exports = {
  renderTemplate,
  renderEmailCliente,
  renderEmailAdmin
}; 
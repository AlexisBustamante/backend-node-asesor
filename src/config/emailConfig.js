// Configuración para emails
const emailConfig = {
  // URL del logo - puedes cambiar esta URL por la de tu logo
  logoUrl: process.env.LOGO_URL || 'https://i.imgur.com/LOGO_ID.png',
  
  // Configuración de colores
  colors: {
    primary: '#3f7575',
    secondary: '#f8f9fa',
    accent: '#fff3cd'
  },
  
  // Información de contacto
  contact: {
    email: 'pamela.munozc@consalud.cl',
    phone: '+56 9 4809 9714',
    name: 'Pamela Cossio',
    title: 'Asesora de Salud Previsional'
  }
};

module.exports = emailConfig; 
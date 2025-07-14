const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Enviar email de verificación
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verifica tu cuenta - Asesoría Seguros',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
            <h1>Asesoría Seguros</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2>¡Hola ${firstName}!</h2>
            
            <p>Gracias por registrarte en nuestro sistema de asesoría de seguros médicos.</p>
            
            <p>Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente botón:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verificar Email
              </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #3498db;">${verificationUrl}</p>
            
            <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
            
            <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 12px; color: #666;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de verificación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return false;
  }
};

// Enviar email de restablecimiento de contraseña
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Restablecer Contraseña - Asesoría Seguros',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #e74c3c; color: white; padding: 20px; text-align: center;">
            <h1>Restablecer Contraseña</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2>¡Hola ${firstName}!</h2>
            
            <p>Has solicitado restablecer tu contraseña en nuestro sistema de asesoría de seguros.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #e74c3c;">${resetUrl}</p>
            
            <p><strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.</p>
            
            <p>Si no solicitaste este restablecimiento, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 12px; color: #666;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de restablecimiento enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email de restablecimiento:', error);
    return false;
  }
};

// Enviar email de bienvenida
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido a Asesoría Seguros!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #27ae60; color: white; padding: 20px; text-align: center;">
            <h1>¡Bienvenido!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2>¡Hola ${firstName}!</h2>
            
            <p>¡Tu cuenta ha sido verificada exitosamente!</p>
            
            <p>Ya puedes acceder a nuestro sistema de asesoría de seguros médicos y comenzar a:</p>
            
            <ul>
              <li>Gestionar clientes</li>
              <li>Crear cotizaciones</li>
              <li>Administrar pólizas</li>
              <li>Realizar seguimientos</li>
            </ul>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <p>¡Gracias por confiar en nosotros!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 12px; color: #666;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de bienvenida enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return false;
  }
};

// Enviar email de notificación de nueva cotización
const sendQuoteNotification = async (email, firstName, quoteNumber, clientName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Nueva Cotización ${quoteNumber} - Asesoría Seguros`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f39c12; color: white; padding: 20px; text-align: center;">
            <h1>Nueva Cotización</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2>¡Hola ${firstName}!</h2>
            
            <p>Se ha creado una nueva cotización en el sistema:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Número de Cotización:</strong> ${quoteNumber}</p>
              <p><strong>Cliente:</strong> ${clientName}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
            </div>
            
            <p>Accede al sistema para revisar los detalles y proceder con la cotización.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="font-size: 12px; color: #666;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de notificación de cotización enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email de notificación:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendQuoteNotification
}; 
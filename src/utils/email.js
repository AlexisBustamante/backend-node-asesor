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

// Plantilla base para emails
const createEmailTemplate = (content, title, icon = null) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background-color: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #e2e8f0;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                color: #1E3A8A;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #64748b;
                font-size: 16px;
            }
            .icon-section {
                text-align: center;
                margin: 30px 0;
            }
            .icon-section svg {
                width: 64px;
                height: 64px;
            }
            .content {
                text-align: center;
                margin-bottom: 30px;
            }
            .title {
                color: #1E3A8A;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 15px;
            }
            .description {
                color: #64748b;
                font-size: 16px;
                margin-bottom: 20px;
            }
            .cta-button {
                display: inline-block;
                background-color: #1E3A8A;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 500;
                transition: background-color 0.3s ease;
                margin: 10px 5px;
            }
            .cta-button:hover {
                background-color: #1e40af;
            }
            .cta-button.secondary {
                background-color: #64748b;
            }
            .cta-button.secondary:hover {
                background-color: #475569;
            }
            .cta-button.danger {
                background-color: #dc2626;
            }
            .cta-button.danger:hover {
                background-color: #b91c1c;
            }
            .cta-button.success {
                background-color: #059669;
            }
            .cta-button.success:hover {
                background-color: #047857;
            }
            .info-box {
                background-color: #f1f5f9;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .info-box h3 {
                color: #1E3A8A;
                margin-bottom: 10px;
                font-size: 18px;
            }
            .info-box p {
                margin: 5px 0;
                color: #64748b;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 14px;
            }
            .contact-info {
                margin-top: 20px;
                padding: 20px;
                background-color: #f1f5f9;
                border-radius: 8px;
            }
            .contact-info h3 {
                color: #1E3A8A;
                margin-bottom: 10px;
                font-size: 18px;
            }
            .contact-info p {
                margin: 5px 0;
                color: #64748b;
            }
            .link-text {
                word-break: break-all;
                color: #1E3A8A;
                font-size: 14px;
                background-color: #f8fafc;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Pamela Cossio</div>
                <div class="subtitle">Asesoría Previsional</div>
            </div>

            ${icon ? `
            <div class="icon-section">
                ${icon}
            </div>
            ` : ''}

            <div class="content">
                ${content}
            </div>

            <div class="contact-info">
                <h3>¿Necesitas ayuda?</h3>
                <p><strong>Email:</strong> pamela@asesoriaprevisional.cl</p>
                <p><strong>Teléfono:</strong> +56 9 1234 5678</p>
                <p><strong>Horario:</strong> Lunes a Viernes 9:00 - 18:00</p>
            </div>

            <div class="footer">
                <p>© 2025 Pamela Cossio - Asesoría Previsional. Todos los derechos reservados.</p>
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Enviar email de verificación
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.BACK_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const icon = `
      <svg fill="currentColor" viewBox="0 0 20 20" style="color: #1E3A8A;">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
      </svg>
    `;
    
    const content = `
      <h1 class="title">¡Verifica tu cuenta!</h1>
      <p class="description">
        ¡Hola ${firstName}! Gracias por registrarte en nuestra asesoría previsional.
        Para completar tu registro, necesitamos verificar tu dirección de email.
      </p>
      
      <a href="${verificationUrl}" class="cta-button">
        Verificar Email
      </a>
      
      <p class="description" style="margin-top: 20px;">
        O copia y pega este enlace en tu navegador:
      </p>
      <p class="link-text">${verificationUrl}</p>
      
      <div class="info-box">
        <h3>Información importante:</h3>
        <p>• Este enlace expirará en 24 horas por motivos de seguridad</p>
        <p>• Si no solicitaste esta verificación, puedes ignorar este email</p>
        <p>• Una vez verificado, podrás acceder a todos nuestros servicios</p>
      </div>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verifica tu cuenta - Asesoría Previsional',
      html: createEmailTemplate(content, 'Verificación de Email', icon)
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
    
    const resetUrl = `${process.env.BACK_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const icon = `
      <svg fill="currentColor" viewBox="0 0 20 20" style="color: #dc2626;">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
      </svg>
    `;
    
    const content = `
      <h1 class="title">Restablecer Contraseña</h1>
      <p class="description">
        ¡Hola ${firstName}! Has solicitado restablecer tu contraseña en nuestra asesoría previsional.
      </p>
      
      <a href="${resetUrl}" class="cta-button danger">
        Restablecer Contraseña
      </a>
      
      <p class="description" style="margin-top: 20px;">
        O copia y pega este enlace en tu navegador:
      </p>
      <p class="link-text">${resetUrl}</p>
      
      <div class="info-box">
        <h3>Información de seguridad:</h3>
        <p>• Este enlace expirará en 1 hora por motivos de seguridad</p>
        <p>• Si no solicitaste este restablecimiento, ignora este email</p>
        <p>• Tu contraseña actual permanecerá sin cambios</p>
      </div>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Restablecer Contraseña - Asesoría Previsional',
      html: createEmailTemplate(content, 'Restablecer Contraseña', icon)
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
    
    const icon = `
      <svg fill="currentColor" viewBox="0 0 20 20" style="color: #059669;">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
    `;
    
    const content = `
      <h1 class="title">¡Bienvenido a nuestra asesoría!</h1>
      <p class="description">
        ¡Hola ${firstName}! Tu cuenta ha sido verificada exitosamente.
        Ya puedes acceder a todos los servicios de nuestra asesoría previsional.
      </p>
      
      <a href="${process.env.BACK_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="cta-button success">
        Acceder a tu cuenta
      </a>
      
      <div class="info-box">
        <h3>¿Qué puedes hacer ahora?</h3>
        <p>• Acceder a tu panel de usuario</p>
        <p>• Solicitar cotizaciones de seguros</p>
        <p>• Gestionar tus pólizas existentes</p>
        <p>• Contactar a nuestros asesores</p>
      </div>
      
      <p class="description">
        ¡Gracias por confiar en nosotros para tus necesidades previsionales!
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido a Asesoría Previsional!',
      html: createEmailTemplate(content, 'Bienvenida', icon)
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
    
    const icon = `
      <svg fill="currentColor" viewBox="0 0 20 20" style="color: #f59e0b;">
        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
      </svg>
    `;
    
    const content = `
      <h1 class="title">Nueva Cotización Recibida</h1>
      <p class="description">
        ¡Hola ${firstName}! Se ha creado una nueva cotización en el sistema.
      </p>
      
      <div class="info-box">
        <h3>Detalles de la cotización:</h3>
        <p><strong>Número de Cotización:</strong> ${quoteNumber}</p>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
        <p><strong>Estado:</strong> Pendiente de revisión</p>
      </div>
      
      <a href="${process.env.BACK_URL_PROD || process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/cotizaciones" class="cta-button">
        Revisar Cotización
      </a>
      
      <p class="description" style="margin-top: 20px;">
        Accede al sistema para revisar los detalles y proceder con la cotización.
      </p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Nueva Cotización ${quoteNumber} - Asesoría Previsional`,
      html: createEmailTemplate(content, 'Nueva Cotización', icon)
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
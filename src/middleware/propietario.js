/**
 * Middleware para manejar el id_propietario en requests multi-tenant
 * Extrae el id_propietario de headers o query parameters
 */

const extractPropietario = (req, res, next) => {
  try {
    // Prioridad 1: Header X-Propietario-ID
    let idPropietario = req.headers['x-propietario-id'];
    
    // Prioridad 2: Query parameter propietario_id
    if (!idPropietario) {
      idPropietario = req.query.propietario_id;
    }
    
    // Prioridad 3: Body parameter propietario_id (para POST/PUT)
    if (!idPropietario && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      idPropietario = req.body.propietario_id;
    }
    
    // Validar que sea un número válido
    if (idPropietario) {
      const parsedId = parseInt(idPropietario);
      if (isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de propietario inválido'
        });
      }
      req.idPropietario = parsedId;
    } else {
      // Valor por defecto para compatibilidad
      req.idPropietario = 1;
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware extractPropietario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para validar que el usuario autenticado sea el propietario
 * Solo para rutas que requieren autenticación
 */
const validatePropietario = (req, res, next) => {
  try {
    // Verificar que el usuario autenticado sea el propietario
    if (req.user && req.user.id !== req.idPropietario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a estos datos'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware validatePropietario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para rutas públicas que solo filtran por propietario
 */
const filterByPropietario = (req, res, next) => {
  // Para rutas públicas, solo filtramos por propietario
  // No validamos permisos de usuario
  next();
};

module.exports = {
  extractPropietario,
  validatePropietario,
  filterByPropietario
};

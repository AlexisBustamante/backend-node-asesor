const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');

// Generar token de acceso
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Generar token de refresh
const generateRefreshToken = (userId) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  return {
    token: refreshToken,
    expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 días
  };
};

// Guardar refresh token en base de datos
const saveRefreshToken = async (userId, refreshToken, expiresAt) => {
  try {
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshToken, expiresAt]
    );
    return true;
  } catch (error) {
    console.error('Error guardando refresh token:', error);
    return false;
  }
};

// Verificar refresh token
const verifyRefreshToken = async (refreshToken) => {
  try {
    const result = await query(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const tokenData = result.rows[0];
    
    // Verificar si el token ha expirado
    if (new Date() > new Date(tokenData.expires_at)) {
      // Eliminar token expirado
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      return null;
    }

    return tokenData.user_id;
  } catch (error) {
    console.error('Error verificando refresh token:', error);
    return null;
  }
};

// Eliminar refresh token
const deleteRefreshToken = async (refreshToken) => {
  try {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    return true;
  } catch (error) {
    console.error('Error eliminando refresh token:', error);
    return false;
  }
};

// Eliminar todos los refresh tokens de un usuario
const deleteAllUserRefreshTokens = async (userId) => {
  try {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return true;
  } catch (error) {
    console.error('Error eliminando refresh tokens del usuario:', error);
    return false;
  }
};

// Limpiar tokens expirados
const cleanupExpiredTokens = async () => {
  try {
    await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    return true;
  } catch (error) {
    console.error('Error limpiando tokens expirados:', error);
    return false;
  }
};

// Generar tokens para un usuario
const generateTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshTokenData = generateRefreshToken(userId);
  
  const saved = await saveRefreshToken(
    userId, 
    refreshTokenData.token, 
    refreshTokenData.expiresAt
  );

  if (!saved) {
    throw new Error('Error guardando refresh token');
  }

  return {
    accessToken,
    refreshToken: refreshTokenData.token,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  };
};

// Refrescar tokens
const refreshTokens = async (refreshToken) => {
  const userId = await verifyRefreshToken(refreshToken);
  
  if (!userId) {
    throw new Error('Refresh token inválido o expirado');
  }

  // Eliminar el refresh token actual
  await deleteRefreshToken(refreshToken);

  // Generar nuevos tokens
  return await generateTokens(userId);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  cleanupExpiredTokens,
  generateTokens,
  refreshTokens
}; 
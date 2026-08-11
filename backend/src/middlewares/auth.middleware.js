const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/user.model');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

async function authenticate(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'No autorizado: sesión no iniciada' });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado: sesión inválida o expirada' });
  }

  // Se revalida contra la BD en cada request (en vez de confiar solo en el JWT) para
  // que desactivar un usuario corte su acceso de inmediato, no hasta que expire el token.
  const user = await userModel.findById(payload.id);
  if (!user || !user.activo) {
    return res.status(401).json({ message: 'No autorizado: sesión inválida o expirada' });
  }

  if (!SAFE_METHODS.has(req.method)) {
    const csrfCookie = req.cookies?.csrfToken;
    const csrfHeader = req.headers['x-csrf-token'];
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: 'Token CSRF inválido o ausente' });
    }
  }

  req.user = { id: user.id, nombre: user.nombre, rol: user.rol };
  return next();
}

module.exports = { authenticate };

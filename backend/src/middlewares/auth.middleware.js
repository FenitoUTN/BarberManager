const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/user.model');
const { verifyCsrf } = require('./csrf.middleware');

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

  req.user = { id: user.id, nombre: user.nombre, rol: user.rol };

  // La sesión ya está verificada; ahora corresponde comprobar el CSRF en los métodos
  // que modifican estado.
  return verifyCsrf(req, res, next);
}

module.exports = { authenticate };

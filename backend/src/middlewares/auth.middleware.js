const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'No autorizado: token no proporcionado' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, nombre: payload.nombre, rol: payload.rol };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado: token inválido o expirado' });
  }
}

module.exports = { authenticate };

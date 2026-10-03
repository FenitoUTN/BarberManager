// Verificación CSRF por cookie doble (double-submit).
//
// Vive separada de la autenticación porque son dos cosas distintas: que una petición
// sea legítima (autenticada) no implica que venga del propio sitio. Aquí se comprueba
// que los métodos que modifican estado incluyan el valor de la cookie `csrfToken` en
// la cabecera `X-CSRF-Token`. La cookie es legible por JS justamente para eso: sin
// `httpOnly`, el frontend puede copiarla en cada llamada (ver frontend/src/api/axiosClient.js).
//
// `sameSite: 'lax'` ya cubre la mayoría del problema, pero no todos los navegadores
// ni todos los flujos de navegación, así que la comprobación explícita se mantiene.

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'Token CSRF inválido o ausente' });
  }

  return next();
}

module.exports = { verifyCsrf };
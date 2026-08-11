const { validationResult } = require('express-validator');

// Corta la cadena con 400 si algún validador de express-validator falló. Se coloca
// en las rutas justo después de los validadores, para no repetir este chequeo en
// cada función de controlador.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
  }
  return next();
}

module.exports = { validate };

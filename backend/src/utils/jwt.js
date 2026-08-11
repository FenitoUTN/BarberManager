const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. La aplicación no puede iniciar de forma segura.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

const DURATION_UNITS_MS = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

// Convierte valores tipo "8h"/"30m"/"7d" (formato de JWT_EXPIRES_IN) a milisegundos,
// para usarlos como maxAge de la cookie de sesión.
function expiresInMs() {
  const match = /^(\d+)(s|m|h|d)$/.exec(JWT_EXPIRES_IN);
  if (match) {
    return Number(match[1]) * DURATION_UNITS_MS[match[2]];
  }
  const asNumber = Number(JWT_EXPIRES_IN);
  if (!Number.isNaN(asNumber)) {
    return asNumber * 1000; // jsonwebtoken interpreta números planos como segundos
  }
  return DURATION_UNITS_MS.h * 8; // fallback: 8h
}

module.exports = { generateToken, verifyToken, expiresInMs };

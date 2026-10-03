const test = require('node:test');
const assert = require('node:assert/strict');

// utils/jwt.js se niega a arrancar sin JWT_SECRET, así que hay que definirlo antes
// de importar el módulo.
process.env.JWT_SECRET = 'secreto-de-prueba-para-tests';
process.env.JWT_EXPIRES_IN = '8h';

const JWT_PATH = require.resolve('../src/utils/jwt');

// El módulo lee la configuración una sola vez al cargarse, que es el comportamiento
// correcto. Para probar cada valor hay que recargarlo en limpio, no mutar
// process.env después: eso no cambiaría nada y el test daría un falso verde.
function cargarConJwtExpiresIn(valor) {
  const original = process.env.JWT_EXPIRES_IN;
  try {
    process.env.JWT_EXPIRES_IN = valor;
    delete require.cache[JWT_PATH];
    return require('../src/utils/jwt');
  } finally {
    process.env.JWT_EXPIRES_IN = original;
    delete require.cache[JWT_PATH];
  }
}

const { generateToken, verifyToken } = require('../src/utils/jwt');

test('el token firmado se verifica y conserva la carga útil', () => {
  const token = generateToken({ id: 7, rol: 'admin' });
  const payload = verifyToken(token);

  assert.equal(payload.id, 7);
  assert.equal(payload.rol, 'admin');
});

test('un token firmado con otra clave no se acepta', () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 7, rol: 'admin' }, 'otra-clave-distinta');

  assert.throws(() => verifyToken(token), /invalid signature/);
});

test('un token con la carga útil manipulada no se acepta', () => {
  const token = generateToken({ id: 7, rol: 'cliente' });
  const [header, , signature] = token.split('.');

  // Se conserva la firma original pero se sustituye el cuerpo por uno con más
  // privilegios. Si la firma no cubriera la carga útil, esto dejaría pasar un
  // escalation de privilegios a admin.
  const payloadFalsificado = Buffer.from(JSON.stringify({ id: 1, rol: 'admin' })).toString(
    'base64url'
  );

  assert.throws(() => verifyToken(`${header}.${payloadFalsificado}.${signature}`));
});

test('un token sin firma no se acepta', () => {
  const token = generateToken({ id: 7, rol: 'cliente' });
  assert.throws(() => verifyToken(token.split('.').slice(0, 2).join('.')));
});

test('la expiración por defecto son 8 horas en milisegundos', () => {
  assert.equal(cargarConJwtExpiresIn('8h').expiresInMs(), 8 * 60 * 60 * 1000);
});

test('convierte las unidades de duración de JWT a milisegundos', () => {
  const casos = [
    ['30m', 30 * 60 * 1000],
    ['7d', 7 * 24 * 60 * 60 * 1000],
    ['45s', 45 * 1000],
    ['2h', 2 * 60 * 60 * 1000],
  ];

  for (const [valor, esperado] of casos) {
    assert.equal(
      cargarConJwtExpiresIn(valor).expiresInMs(),
      esperado,
      `falló la conversión de ${valor}`
    );
  }
});

test('un número plano se interpreta como segundos, igual que jsonwebtoken', () => {
  assert.equal(cargarConJwtExpiresIn('3600').expiresInMs(), 3600 * 1000);
});

test('un valor no reconocible cae en 8 horas en vez de romper', () => {
  assert.equal(cargarConJwtExpiresIn('no-es-una-duracion').expiresInMs(), 8 * 60 * 60 * 1000);
});

test('sin JWT_SECRET el módulo se niega a cargar', () => {
  const original = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    delete require.cache[JWT_PATH];
    assert.throws(() => require('../src/utils/jwt'), /JWT_SECRET no está definido/);
  } finally {
    process.env.JWT_SECRET = original;
    delete require.cache[JWT_PATH];
  }
});
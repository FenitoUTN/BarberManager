const test = require('node:test');
const assert = require('node:assert/strict');

const { errorHandler } = require('../src/middlewares/error.middleware');

function mockRes() {
  return {
    headersSent: false,
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// Silencia el console.error del handler para que la salida del test siga siendo legible.
function silenceConsole(fn) {
  const original = console.error;
  console.error = () => {};
  try {
    return fn();
  } finally {
    console.error = original;
  }
}

test('un error 5xx no filtra el mensaje interno al cliente', () => {
  const res = mockRes();
  silenceConsole(() => {
    errorHandler(new Error('ER_PARSE_ERROR near usuarios.password_hash'), {}, res, () => {});
  });

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Error interno del servidor');
  assert.ok(
    !JSON.stringify(res.body).includes('password_hash'),
    'el detalle interno no debe aparecer en la respuesta'
  );
});

test('un error 4xx conserva su mensaje pensado para el usuario', () => {
  const res = mockRes();
  silenceConsole(() => {
    errorHandler(
      Object.assign(new Error('Apartado no encontrado'), { status: 404 }),
      {},
      res,
      () => {}
    );
  });

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, 'Apartado no encontrado');
});

test('un error con status 503 explícito también se enmascara', () => {
  const res = mockRes();
  silenceConsole(() => {
    errorHandler(
      Object.assign(new Error('pool exhausted, user root@localhost'), { status: 503 }),
      {},
      res,
      () => {}
    );
  });

  assert.equal(res.statusCode, 503);
  assert.equal(res.body.message, 'Error interno del servidor');
});

test('respuesta ya enviada: delega en next en lugar de escribir dos veces', () => {
  const res = mockRes();
  res.headersSent = true;
  let delegated = null;

  silenceConsole(() => {
    errorHandler(new Error('tarde'), {}, res, (err) => {
      delegated = err;
    });
  });

  assert.equal(delegated.message, 'tarde');
  assert.equal(res.body, null, 'no debe intentar escribir en una respuesta ya enviada');
});

test('un 4xx sin mensaje cae en un texto genérico', () => {
  const res = mockRes();
  silenceConsole(() => {
    errorHandler(Object.assign(new Error(''), { status: 400 }), {}, res, () => {});
  });

  assert.equal(res.statusCode, 400);
  assert.ok(res.body.message.length > 0);
});
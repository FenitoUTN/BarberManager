const test = require('node:test');
const assert = require('node:assert/strict');

const { verifyCsrf } = require('../src/middlewares/csrf.middleware');

function mockRes() {
  return {
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

function mockReq({ method = 'POST', cookies = {}, csrfHeader } = {}) {
  const headers = {};
  if (csrfHeader !== undefined) {
    headers['x-csrf-token'] = csrfHeader;
  }
  return { method, cookies, headers };
}

test('deja pasar los métodos seguros sin exigir token', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS']) {
    const res = mockRes();
    let passed = false;
    verifyCsrf(mockReq({ method }), res, () => {
      passed = true;
    });
    assert.equal(passed, true, `${method} debe pasar`);
    assert.equal(res.statusCode, null, `${method} no debe escribir respuesta`);
  }
});

test('rechaza un método de escritura sin cookie de token', () => {
  const res = mockRes();
  let passed = false;
  verifyCsrf(mockReq({ method: 'POST', csrfHeader: 'abc' }), res, () => {
    passed = true;
  });
  assert.equal(passed, false);
  assert.equal(res.statusCode, 403);
});

test('rechaza un método de escritura sin cabecera', () => {
  const res = mockRes();
  let passed = false;
  verifyCsrf(mockReq({ method: 'POST', cookies: { csrfToken: 'abc' } }), res, () => {
    passed = true;
  });
  assert.equal(passed, false);
  assert.equal(res.statusCode, 403);
});

test('rechaza cuando la cabecera no coincide con la cookie', () => {
  const res = mockRes();
  let passed = false;
  verifyCsrf(
    mockReq({ method: 'POST', cookies: { csrfToken: 'abc' }, csrfHeader: 'otro' }),
    res,
    () => {
      passed = true;
    }
  );
  assert.equal(passed, false);
  assert.equal(res.statusCode, 403);
});

test('acepta cuando la cabecera coincide con la cookie', () => {
  const res = mockRes();
  let passed = false;
  verifyCsrf(
    mockReq({ method: 'POST', cookies: { csrfToken: 'abc' }, csrfHeader: 'abc' }),
    res,
    () => {
      passed = true;
    }
  );
  assert.equal(passed, true);
  assert.equal(res.statusCode, null);
});

test('cubre los métodos de escritura que usa la API', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const res = mockRes();
    verifyCsrf(mockReq({ method, cookies: { csrfToken: 'abc' }, csrfHeader: 'otro' }), res, () => {});
    assert.equal(res.statusCode, 403, `${method} debe exigir token`);
  }
});
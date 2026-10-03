const test = require('node:test');
const assert = require('node:assert/strict');

const {
  paginatedQuery,
  buildPaginationMeta,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require('../src/utils/pagination');

function fakePool() {
  const calls = [];
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params });
      // La primera consulta del helper es el COUNT, la segunda el SELECT paginado.
      if (sql.includes('COUNT(*)')) {
        return [[{ total: 250 }], []];
      }
      return [[], []];
    },
  };
}

test('sin paginación devuelve todos los resultados y no agrega LIMIT', async () => {
  const pool = fakePool();
  const { rows, total } = await paginatedQuery(pool, {
    baseQuery: 'SELECT * FROM usuarios',
    countQuery: 'SELECT COUNT(*) AS total FROM usuarios',
    where: "WHERE rol = 'cliente'",
    params: [],
    orderBy: 'ORDER BY nombre ASC',
    page: undefined,
    pageSize: undefined,
  });

  assert.equal(total, 250);
  assert.deepEqual(rows, []);
  assert.ok(!pool.calls[1].sql.includes('LIMIT'), 'no debe inyectar LIMIT sin paginación');
});

test('con paginación agrega LIMIT y OFFSET parametrizados', async () => {
  const pool = fakePool();
  await paginatedQuery(pool, {
    baseQuery: 'SELECT * FROM usuarios',
    countQuery: 'SELECT COUNT(*) AS total FROM usuarios',
    where: "WHERE rol = 'cliente'",
    params: ['activo'],
    orderBy: 'ORDER BY nombre ASC',
    page: 3,
    pageSize: 20,
  });

  const sql = pool.calls[1].sql;
  assert.ok(sql.includes('LIMIT ? OFFSET ?'));
  // pageSize, offset y el parámetro original, en ese orden.
  assert.deepEqual(pool.calls[1].params, ['activo', 20, 40]);
});

test('el tamaño de página se acota al máximo permitido', async () => {
  const pool = fakePool();
  await paginatedQuery(pool, {
    baseQuery: 'SELECT * FROM usuarios',
    countQuery: 'SELECT COUNT(*) AS total FROM usuarios',
    where: '',
    params: [],
    orderBy: '',
    page: 1,
    pageSize: 100000,
  });

  assert.equal(pool.calls[1].params[0], MAX_PAGE_SIZE);
});

test('la página nunca baja de 1, para que OFFSET no sea negativo', async () => {
  const pool = fakePool();
  await paginatedQuery(pool, {
    baseQuery: 'SELECT * FROM usuarios',
    countQuery: 'SELECT COUNT(*) AS total FROM usuarios',
    where: '',
    params: [],
    orderBy: '',
    page: -5,
    pageSize: 10,
  });

  assert.deepEqual(pool.calls[1].params, [10, 0]);
});

test('buildPaginationMeta calcula el total de páginas', () => {
  const meta = buildPaginationMeta(1, 20, 250);
  assert.deepEqual(meta, { page: 1, pageSize: 20, total: 250, totalPages: 13 });
});

test('buildPaginationMeta nunca reporta cero páginas', () => {
  const meta = buildPaginationMeta(1, 20, 0);
  assert.equal(meta.totalPages, 1);
});

test('el tamaño por defecto está dentro del máximo', () => {
  assert.ok(DEFAULT_PAGE_SIZE <= MAX_PAGE_SIZE);
});
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Ejecuta un COUNT(*) y, si se pidió paginación (page/pageSize), un SELECT con
// LIMIT/OFFSET; si no se pidió, devuelve todas las filas (mismo comportamiento que
// antes de agregar paginación, para no romper llamadores que no la necesitan, como
// los reportes).
async function paginatedQuery(pool, { baseQuery, countQuery, where, params, orderBy, page, pageSize }) {
  const [countRows] = await pool.query(`${countQuery} ${where}`, params);
  const total = countRows[0].total;

  let limitClause = '';
  const queryParams = [...params];
  if (page && pageSize) {
    const safePageSize = Math.min(Number(pageSize), MAX_PAGE_SIZE);
    const safePage = Math.max(Number(page), 1);
    limitClause = ' LIMIT ? OFFSET ?';
    queryParams.push(safePageSize, (safePage - 1) * safePageSize);
  }

  const [rows] = await pool.query(`${baseQuery} ${where} ${orderBy}${limitClause}`, queryParams);
  return { rows, total };
}

function buildPaginationMeta(page, pageSize, total) {
  const safePageSize = Math.min(Number(pageSize), MAX_PAGE_SIZE);
  const safePage = Math.max(Number(page), 1);
  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.max(Math.ceil(total / safePageSize), 1),
  };
}

module.exports = { paginatedQuery, buildPaginationMeta, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };

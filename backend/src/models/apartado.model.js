const pool = require('../config/db');
const { paginatedQuery } = require('../utils/pagination');

const SELECT_FIELDS = `
  a.id, a.cliente_id, a.producto_id, a.monto_total, a.saldo_pendiente, a.estado,
  a.created_at, a.updated_at,
  u.nombre AS cliente_nombre, u.telefono AS cliente_telefono,
  p.nombre AS producto_nombre, p.precio AS producto_precio
`;

const BASE_QUERY = `
  SELECT ${SELECT_FIELDS}
  FROM apartados a
  JOIN usuarios u ON u.id = a.cliente_id
  JOIN productos p ON p.id = a.producto_id
`;

async function findById(id) {
  const [rows] = await pool.query(`${BASE_QUERY} WHERE a.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

// RF25 / RF27 - listado de apartados (con filtros opcionales). Sin page/pageSize
// devuelve todos los resultados (lo usa el reporte de apartados activos); con
// page/pageSize pagina el listado (lo usa la pantalla de apartados).
async function listAll({ estado, clienteId, page, pageSize } = {}) {
  const conditions = [];
  const params = [];

  if (estado) {
    conditions.push('a.estado = ?');
    params.push(estado);
  }
  if (clienteId) {
    conditions.push('a.cliente_id = ?');
    params.push(clienteId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return paginatedQuery(pool, {
    baseQuery: BASE_QUERY,
    countQuery: 'SELECT COUNT(*) AS total FROM apartados a',
    where,
    params,
    orderBy: 'ORDER BY a.created_at DESC',
    page,
    pageSize,
  });
}

// RF23 - registrar apartado de producto
async function create({ clienteId, productoId, montoTotal }) {
  const [result] = await pool.query(
    'INSERT INTO apartados (cliente_id, producto_id, monto_total, saldo_pendiente) VALUES (?, ?, ?, ?)',
    [clienteId, productoId, montoTotal, montoTotal]
  );
  return findById(result.insertId);
}

async function listAbonos(apartadoId) {
  const [rows] = await pool.query(
    'SELECT id, apartado_id, monto, fecha, created_at FROM abonos WHERE apartado_id = ? ORDER BY fecha ASC, id ASC',
    [apartadoId]
  );
  return rows;
}

// RF24 - registrar abono a apartado (actualiza saldo y estado de forma transaccional).
// El saldo y el estado se re-validan dentro de la transacción, después de adquirir el
// lock de fila (FOR UPDATE), para evitar que dos abonos concurrentes pasen ambos el
// chequeo "monto <= saldo_pendiente" leyendo el mismo saldo desatualizado, o que un
// abono se registre sobre un apartado que fue cancelado justo antes de esta llamada.
async function addAbono(apartadoId, { monto, fecha }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT saldo_pendiente, estado FROM apartados WHERE id = ? LIMIT 1 FOR UPDATE',
      [apartadoId]
    );
    const apartado = rows[0];
    if (!apartado) {
      throw Object.assign(new Error('Apartado no encontrado'), { status: 404 });
    }
    if (apartado.estado !== 'activo') {
      throw Object.assign(new Error('El apartado no está activo'), { status: 400 });
    }

    const saldoActual = Number(apartado.saldo_pendiente);
    if (Number(monto) > saldoActual) {
      throw Object.assign(new Error('El abono no puede ser mayor al saldo pendiente'), {
        status: 400,
      });
    }

    await connection.query(
      'INSERT INTO abonos (apartado_id, monto, fecha) VALUES (?, ?, ?)',
      [apartadoId, monto, fecha]
    );

    const nuevoSaldo = saldoActual - Number(monto);
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'activo';

    await connection.query(
      'UPDATE apartados SET saldo_pendiente = ?, estado = ? WHERE id = ?',
      [nuevoSaldo, nuevoEstado, apartadoId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findById(apartadoId);
}

module.exports = { findById, listAll, create, listAbonos, addAbono };

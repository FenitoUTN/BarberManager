const pool = require('../config/db');

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

// RF25 / RF27 - listado de apartados (con filtros opcionales)
async function listAll({ estado, clienteId } = {}) {
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
  const [rows] = await pool.query(
    `${BASE_QUERY} ${where} ORDER BY a.created_at DESC`,
    params
  );
  return rows;
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

// RF24 - registrar abono a apartado (actualiza saldo y estado de forma transaccional)
async function addAbono(apartadoId, { monto, fecha }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'INSERT INTO abonos (apartado_id, monto, fecha) VALUES (?, ?, ?)',
      [apartadoId, monto, fecha]
    );

    const [rows] = await connection.query(
      'SELECT saldo_pendiente FROM apartados WHERE id = ? LIMIT 1 FOR UPDATE',
      [apartadoId]
    );
    const saldoActual = rows[0].saldo_pendiente;

    const nuevoSaldo = Math.max(0, Number(saldoActual) - Number(monto));
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

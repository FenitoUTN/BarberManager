const pool = require('../config/db');
const { rangesOverlap, timeToMinutes } = require('../utils/time');

const SELECT_FIELDS = `
  c.id, c.cliente_id, c.servicio_id, c.fecha, c.hora_inicio, c.hora_fin, c.estado, c.notas,
  c.created_at, c.updated_at,
  u.nombre AS cliente_nombre, u.telefono AS cliente_telefono,
  s.nombre AS servicio_nombre, s.precio AS servicio_precio, s.duracion_minutos
`;

const BASE_QUERY = `
  SELECT ${SELECT_FIELDS}
  FROM citas c
  JOIN usuarios u ON u.id = c.cliente_id
  JOIN servicios s ON s.id = c.servicio_id
`;

async function findById(id) {
  const [rows] = await pool.query(`${BASE_QUERY} WHERE c.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

// RF13 - citas de un día específico
async function listByDate(fecha) {
  const [rows] = await pool.query(
    `${BASE_QUERY} WHERE c.fecha = ? ORDER BY c.hora_inicio ASC`,
    [fecha]
  );
  return rows;
}

// RF14 - historial general con filtros opcionales
async function listAll({ desde, hasta, estado, clienteId } = {}) {
  const conditions = [];
  const params = [];

  if (desde) {
    conditions.push('c.fecha >= ?');
    params.push(desde);
  }
  if (hasta) {
    conditions.push('c.fecha <= ?');
    params.push(hasta);
  }
  if (estado) {
    conditions.push('c.estado = ?');
    params.push(estado);
  }
  if (clienteId) {
    conditions.push('c.cliente_id = ?');
    params.push(clienteId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `${BASE_QUERY} ${where} ORDER BY c.fecha DESC, c.hora_inicio DESC`,
    params
  );
  return rows;
}

// RF16 - citas de un cliente
async function listByClient(clienteId) {
  const [rows] = await pool.query(
    `${BASE_QUERY} WHERE c.cliente_id = ? ORDER BY c.fecha DESC, c.hora_inicio DESC`,
    [clienteId]
  );
  return rows;
}

// RF12 - verifica si ya existe una cita activa que se solape con el horario indicado
async function hasOverlap(fecha, horaInicio, horaFin, excludeId = null) {
  const params = [fecha];
  let query = `
    SELECT hora_inicio, hora_fin FROM citas
    WHERE fecha = ? AND estado IN ('pendiente', 'confirmada')
  `;

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);

  const startMin = timeToMinutes(horaInicio);
  const endMin = timeToMinutes(horaFin);

  return rows.some((row) =>
    rangesOverlap(startMin, endMin, timeToMinutes(row.hora_inicio), timeToMinutes(row.hora_fin))
  );
}

// RF10 - reservar cita
async function create({ clienteId, servicioId, fecha, horaInicio, horaFin, notas }) {
  const [result] = await pool.query(
    'INSERT INTO citas (cliente_id, servicio_id, fecha, hora_inicio, hora_fin, notas) VALUES (?, ?, ?, ?, ?, ?)',
    [clienteId, servicioId, fecha, horaInicio, horaFin, notas || null]
  );
  return findById(result.insertId);
}

async function updateEstado(id, estado) {
  await pool.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, id]);
  return findById(id);
}

module.exports = {
  findById,
  listByDate,
  listAll,
  listByClient,
  hasOverlap,
  create,
  updateEstado,
};

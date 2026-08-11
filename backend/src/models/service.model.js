const pool = require('../config/db');

const PUBLIC_FIELDS = 'id, nombre, precio, duracion_minutos, activo, created_at, updated_at';

// RF17 - catálogo de servicios (todos los roles ven solo los activos; admin/barbero
// puede pedir includeInactive para gestión).
async function listServices({ includeInactive = false } = {}) {
  const where = includeInactive ? '' : 'WHERE activo = 1';
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM servicios ${where} ORDER BY id ASC`
  );
  return rows;
}

async function findServiceById(id) {
  const [rows] = await pool.query('SELECT * FROM servicios WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

// RF17 - registrar servicio
async function createService({ nombre, precio, duracion_minutos }) {
  const [result] = await pool.query(
    'INSERT INTO servicios (nombre, precio, duracion_minutos) VALUES (?, ?, ?)',
    [nombre, precio, duracion_minutos]
  );
  return findServiceById(result.insertId);
}

// RF18 - editar servicio
async function updateService(id, { nombre, precio, duracion_minutos }) {
  await pool.query(
    'UPDATE servicios SET nombre = ?, precio = ?, duracion_minutos = ? WHERE id = ?',
    [nombre, precio, duracion_minutos, id]
  );
  return findServiceById(id);
}

// RF18 - eliminar servicio (baja lógica)
async function setServiceActive(id, activo) {
  await pool.query('UPDATE servicios SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
  return findServiceById(id);
}

module.exports = {
  listServices,
  findServiceById,
  createService,
  updateService,
  setServiceActive,
};

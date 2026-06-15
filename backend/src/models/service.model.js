const pool = require('../config/db');

async function listActiveServices() {
  const [rows] = await pool.query(
    'SELECT id, nombre, precio, duracion_minutos FROM servicios WHERE activo = 1 ORDER BY id ASC'
  );
  return rows;
}

async function findServiceById(id) {
  const [rows] = await pool.query('SELECT * FROM servicios WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

module.exports = { listActiveServices, findServiceById };

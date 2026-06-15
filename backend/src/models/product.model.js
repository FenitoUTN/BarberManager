const pool = require('../config/db');

const PUBLIC_FIELDS = 'id, nombre, descripcion, precio, activo, created_at, updated_at';

async function listProducts({ includeInactive = false } = {}) {
  const conditions = [];
  if (!includeInactive) {
    conditions.push('activo = 1');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM productos ${where} ORDER BY nombre ASC`
  );
  return rows;
}

async function findProductById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM productos WHERE id = ? LIMIT 1`, [
    id,
  ]);
  return rows[0] || null;
}

async function createProduct({ nombre, descripcion, precio }) {
  const [result] = await pool.query(
    'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)',
    [nombre, descripcion || null, precio]
  );
  return findProductById(result.insertId);
}

async function updateProduct(id, { nombre, descripcion, precio }) {
  await pool.query(
    'UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?',
    [nombre, descripcion || null, precio, id]
  );
  return findProductById(id);
}

async function setProductActive(id, activo) {
  await pool.query('UPDATE productos SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
  return findProductById(id);
}

module.exports = {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  setProductActive,
};

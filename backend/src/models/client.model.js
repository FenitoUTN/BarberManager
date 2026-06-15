const pool = require('../config/db');

const PUBLIC_FIELDS = 'id, nombre, telefono, email, rol, activo, created_at, updated_at';

async function listClients({ search, includeInactive = false } = {}) {
  const conditions = ["rol = 'cliente'"];
  const params = [];

  if (!includeInactive) {
    conditions.push('activo = 1');
  }

  if (search) {
    conditions.push('(nombre LIKE ? OR telefono LIKE ? OR email LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM usuarios WHERE ${conditions.join(' AND ')} ORDER BY nombre ASC`,
    params
  );
  return rows;
}

async function findClientById(id) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM usuarios WHERE id = ? AND rol = 'cliente' LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function createClient({ nombre, telefono, email }) {
  const [result] = await pool.query(
    "INSERT INTO usuarios (nombre, telefono, email, rol) VALUES (?, ?, ?, 'cliente')",
    [nombre, telefono, email || null]
  );
  return findClientById(result.insertId);
}

async function updateClient(id, { nombre, telefono, email }) {
  await pool.query(
    "UPDATE usuarios SET nombre = ?, telefono = ?, email = ? WHERE id = ? AND rol = 'cliente'",
    [nombre, telefono, email || null, id]
  );
  return findClientById(id);
}

async function setClientActive(id, activo) {
  await pool.query("UPDATE usuarios SET activo = ? WHERE id = ? AND rol = 'cliente'", [
    activo ? 1 : 0,
    id,
  ]);
  return findClientById(id);
}

module.exports = {
  listClients,
  findClientById,
  findByEmail,
  createClient,
  updateClient,
  setClientActive,
};

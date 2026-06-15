const pool = require('../config/db');

const PUBLIC_FIELDS = 'id, nombre, telefono, email, rol, activo, created_at, updated_at';

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM usuarios WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ nombre, telefono, email, passwordHash, rol = 'cliente' }) {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, telefono, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
    [nombre, telefono, email, passwordHash, rol]
  );
  return findById(result.insertId);
}

module.exports = { findByEmail, findById, createUser };

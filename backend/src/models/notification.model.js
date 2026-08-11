const pool = require('../config/db');

async function create({ usuarioId, tipo, mensaje, citaId = null }) {
  const [result] = await pool.query(
    'INSERT INTO notificaciones (usuario_id, tipo, mensaje, cita_id) VALUES (?, ?, ?, ?)',
    [usuarioId, tipo, mensaje, citaId]
  );
  const [rows] = await pool.query('SELECT * FROM notificaciones WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function listByUser(usuarioId) {
  const [rows] = await pool.query(
    'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY created_at DESC LIMIT 50',
    [usuarioId]
  );
  return rows;
}

async function countUnread(usuarioId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leida = 0',
    [usuarioId]
  );
  return rows[0].total;
}

async function markAsRead(id, usuarioId) {
  await pool.query('UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?', [
    id,
    usuarioId,
  ]);
}

async function markAllAsRead(usuarioId) {
  await pool.query('UPDATE notificaciones SET leida = 1 WHERE usuario_id = ? AND leida = 0', [
    usuarioId,
  ]);
}

module.exports = { create, listByUser, countUnread, markAsRead, markAllAsRead };

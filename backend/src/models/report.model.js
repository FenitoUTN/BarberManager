const pool = require('../config/db');

// RF26 - resumen de citas agrupado por día
async function getCitasResumenPorDia({ desde, hasta }) {
  const [rows] = await pool.query(
    `SELECT
       fecha,
       COUNT(*) AS total,
       SUM(estado = 'pendiente') AS pendientes,
       SUM(estado = 'confirmada') AS confirmadas,
       SUM(estado = 'completada') AS completadas,
       SUM(estado = 'cancelada') AS canceladas
     FROM citas
     WHERE fecha BETWEEN ? AND ?
     GROUP BY fecha
     ORDER BY fecha ASC`,
    [desde, hasta]
  );
  return rows;
}

module.exports = { getCitasResumenPorDia };

const pool = require('../config/db');
const { timeToMinutes, minutesToTime, addMinutesToTime, rangesOverlap } = require('../utils/time');
const { todayISO, nowMinutesSinceMidnight } = require('../utils/datetime');

const SLOT_STEP_MINUTES = 30;

async function getWeeklySchedule() {
  const [rows] = await pool.query(
    'SELECT id, dia_semana, hora_inicio, hora_fin, activo FROM disponibilidad_horarios ORDER BY dia_semana ASC, hora_inicio ASC'
  );
  return rows;
}

// Reemplaza por completo el horario semanal con la lista recibida (RF15).
async function replaceWeeklySchedule(schedule) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM disponibilidad_horarios');

    for (const item of schedule) {
      await connection.query(
        'INSERT INTO disponibilidad_horarios (dia_semana, hora_inicio, hora_fin, activo) VALUES (?, ?, ?, ?)',
        [item.dia_semana, item.hora_inicio, item.hora_fin, item.activo ?? 1]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getWeeklySchedule();
}

async function listExceptions({ desde, hasta } = {}) {
  const conditions = [];
  const params = [];

  if (desde) {
    conditions.push('fecha >= ?');
    params.push(desde);
  }
  if (hasta) {
    conditions.push('fecha <= ?');
    params.push(hasta);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT id, fecha, hora_inicio, hora_fin, tipo, motivo, created_at FROM disponibilidad_excepciones ${where} ORDER BY fecha ASC, hora_inicio ASC`,
    params
  );
  return rows;
}

// RF15 - crea una excepción y, si es un bloqueo, cancela las citas solapadas y genera
// sus notificaciones dentro de la MISMA transacción. Antes estos tres pasos (insertar
// excepción, cancelar citas, notificar) eran queries independientes: si la notificación
// fallaba a mitad de camino, las citas ya quedaban canceladas en firme sin que el
// cliente se enterara.
async function createException({ fecha, hora_inicio, hora_fin, tipo, motivo }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO disponibilidad_excepciones (fecha, hora_inicio, hora_fin, tipo, motivo) VALUES (?, ?, ?, ?, ?)',
      [fecha, hora_inicio, hora_fin, tipo, motivo || null]
    );
    const [excRows] = await connection.query(
      'SELECT * FROM disponibilidad_excepciones WHERE id = ?',
      [result.insertId]
    );
    const excepcion = excRows[0];

    let citasCanceladas = [];
    if (tipo === 'bloqueo') {
      const [citasRows] = await connection.query(
        `SELECT c.id, c.cliente_id, c.fecha, c.hora_inicio, c.hora_fin, s.nombre AS servicio_nombre
         FROM citas c
         JOIN servicios s ON s.id = c.servicio_id
         WHERE c.fecha = ? AND c.estado IN ('pendiente', 'confirmada')`,
        [fecha]
      );

      const startMin = timeToMinutes(hora_inicio);
      const endMin = timeToMinutes(hora_fin);
      citasCanceladas = citasRows.filter((row) =>
        rangesOverlap(startMin, endMin, timeToMinutes(row.hora_inicio), timeToMinutes(row.hora_fin))
      );

      if (citasCanceladas.length > 0) {
        const ids = citasCanceladas.map((cita) => cita.id);
        await connection.query("UPDATE citas SET estado = 'cancelada' WHERE id IN (?)", [ids]);

        for (const cita of citasCanceladas) {
          const fechaLabel = new Date(`${cita.fecha}T00:00:00`).toLocaleDateString('es-CR');
          const horaLabel = cita.hora_inicio.slice(0, 5);
          const motivoTxt = motivo ? ` (${motivo})` : '';
          const mensaje = `Tu cita del ${fechaLabel} a las ${horaLabel} para ${cita.servicio_nombre} fue cancelada porque el local bloqueó ese horario${motivoTxt}.`;
          await connection.query(
            'INSERT INTO notificaciones (usuario_id, tipo, mensaje, cita_id) VALUES (?, ?, ?, ?)',
            [cita.cliente_id, 'cita_cancelada', mensaje, cita.id]
          );
        }
      }
    }

    await connection.commit();
    return { excepcion, citasCanceladas };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteException(id) {
  await pool.query('DELETE FROM disponibilidad_excepciones WHERE id = ?', [id]);
}

// RF09 - calcula los horarios disponibles para una fecha y un servicio,
// considerando el horario semanal, las excepciones y las citas ya reservadas.
async function getAvailableSlots(fecha, servicio) {
  const dayOfWeek = new Date(`${fecha}T00:00:00`).getDay();
  const duracion = servicio.duracion_minutos;

  const [scheduleRows] = await pool.query(
    'SELECT hora_inicio, hora_fin FROM disponibilidad_horarios WHERE dia_semana = ? AND activo = 1',
    [dayOfWeek]
  );

  const exceptions = await listExceptions({ desde: fecha, hasta: fecha });
  const blocks = exceptions.filter((e) => e.tipo === 'bloqueo');
  const extras = exceptions.filter((e) => e.tipo === 'extra');

  const ranges = [...scheduleRows, ...extras].map((r) => ({
    inicio: timeToMinutes(r.hora_inicio),
    fin: timeToMinutes(r.hora_fin),
  }));

  const blockRanges = blocks.map((b) => ({
    inicio: timeToMinutes(b.hora_inicio),
    fin: timeToMinutes(b.hora_fin),
  }));

  const [citasRows] = await pool.query(
    "SELECT hora_inicio, hora_fin FROM citas WHERE fecha = ? AND estado IN ('pendiente', 'confirmada')",
    [fecha]
  );
  const busyRanges = citasRows.map((c) => ({
    inicio: timeToMinutes(c.hora_inicio),
    fin: timeToMinutes(c.hora_fin),
  }));

  const isToday = fecha === todayISO();
  const currentMinutes = isToday ? nowMinutesSinceMidnight() : 0;

  const slots = [];

  for (const range of ranges) {
    for (
      let start = range.inicio;
      start + duracion <= range.fin;
      start += SLOT_STEP_MINUTES
    ) {
      const end = start + duracion;

      if (isToday && start <= currentMinutes) continue;

      const blocked = blockRanges.some((b) => rangesOverlap(start, end, b.inicio, b.fin));
      if (blocked) continue;

      const busy = busyRanges.some((b) => rangesOverlap(start, end, b.inicio, b.fin));
      if (busy) continue;

      slots.push(minutesToTime(start));
    }
  }

  return [...new Set(slots)].sort();
}

module.exports = {
  getWeeklySchedule,
  replaceWeeklySchedule,
  listExceptions,
  createException,
  deleteException,
  getAvailableSlots,
  addMinutesToTime,
};

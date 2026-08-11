const availabilityModel = require('../models/availability.model');
const serviceModel = require('../models/service.model');

// RF15 - obtener horario semanal
async function getWeeklySchedule(req, res, next) {
  try {
    const horario = await availabilityModel.getWeeklySchedule();
    return res.json({ horario });
  } catch (error) {
    return next(error);
  }
}

// RF15 - actualizar horario semanal
async function updateWeeklySchedule(req, res, next) {
  try {
    const horario = await availabilityModel.replaceWeeklySchedule(req.body.horario);
    return res.json({ horario });
  } catch (error) {
    return next(error);
  }
}

// RF15 - listar excepciones de disponibilidad
async function listExceptions(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const excepciones = await availabilityModel.listExceptions({ desde, hasta });
    return res.json({ excepciones });
  } catch (error) {
    return next(error);
  }
}

// RF15 - crear excepción (bloqueo u horario extra). Si es un bloqueo, cancela
// automáticamente las citas que caigan dentro del rango bloqueado y notifica
// a cada cliente afectado, todo en una sola transacción (ver availability.model.js).
async function createException(req, res, next) {
  try {
    const { excepcion, citasCanceladas } = await availabilityModel.createException(req.body);

    return res.status(201).json({ excepcion, citasCanceladas: citasCanceladas.length });
  } catch (error) {
    return next(error);
  }
}

// RF15 - eliminar excepción
async function deleteException(req, res, next) {
  try {
    await availabilityModel.deleteException(req.params.id);
    return res.json({ message: 'Excepción eliminada correctamente' });
  } catch (error) {
    return next(error);
  }
}

// RF09 - obtener horarios disponibles para una fecha y servicio
async function getSlots(req, res, next) {
  try {
    const { fecha, servicioId } = req.query;
    const servicio = await serviceModel.findServiceById(servicioId);
    if (!servicio || !servicio.activo) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const slots = await availabilityModel.getAvailableSlots(fecha, servicio);
    return res.json({ fecha, servicioId: Number(servicioId), slots });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWeeklySchedule,
  updateWeeklySchedule,
  listExceptions,
  createException,
  deleteException,
  getSlots,
};

const { validationResult } = require('express-validator');
const appointmentModel = require('../models/appointment.model');
const availabilityModel = require('../models/availability.model');
const serviceModel = require('../models/service.model');
const clientModel = require('../models/client.model');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    return false;
  }
  return true;
}

// RF10 - Reservar cita (también cubre RF12 - validar duplicidad/solapamiento)
async function create(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { servicio_id, fecha, hora_inicio, notas } = req.body;

    let clienteId;
    if (req.user.rol === 'cliente') {
      clienteId = req.user.id;
    } else {
      if (!req.body.cliente_id) {
        return res.status(400).json({ message: 'Debe indicar el cliente para la cita' });
      }
      const cliente = await clientModel.findClientById(req.body.cliente_id);
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      clienteId = cliente.id;
    }

    const servicio = await serviceModel.findServiceById(servicio_id);
    if (!servicio || !servicio.activo) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const horaFin = availabilityModel.addMinutesToTime(hora_inicio, servicio.duracion_minutos);

    // Rechaza fechas pasadas
    const citaDateTime = new Date(`${fecha}T${hora_inicio}`);
    if (citaDateTime < new Date()) {
      return res.status(400).json({ message: 'No se puede reservar una cita en el pasado' });
    }

    // RF12 - validar que el horario no se solape con otra cita activa
    const overlap = await appointmentModel.hasOverlap(fecha, hora_inicio, horaFin);
    if (overlap) {
      return res.status(409).json({ message: 'El horario seleccionado ya no está disponible' });
    }

    const cita = await appointmentModel.create({
      clienteId,
      servicioId: servicio.id,
      fecha,
      horaInicio: hora_inicio,
      horaFin,
      notas,
    });

    return res.status(201).json({ cita });
  } catch (error) {
    return next(error);
  }
}

// RF13/RF14 - listar citas (día específico o historial con filtros), admin/barbero
async function list(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { fecha, desde, hasta, estado, clienteId } = req.query;

    const citas = fecha
      ? await appointmentModel.listByDate(fecha)
      : await appointmentModel.listAll({ desde, hasta, estado, clienteId });

    return res.json({ citas });
  } catch (error) {
    return next(error);
  }
}

// RF16 - citas del cliente autenticado
async function listMine(req, res, next) {
  try {
    const citas = await appointmentModel.listByClient(req.user.id);
    return res.json({ citas });
  } catch (error) {
    return next(error);
  }
}

// RF11 - cancelar cita
async function cancel(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const cita = await appointmentModel.findById(id);
    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (req.user.rol === 'cliente') {
      if (cita.cliente_id !== req.user.id) {
        return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
      }

      const citaDateTime = new Date(`${cita.fecha}T${cita.hora_inicio}`);
      if (citaDateTime <= new Date()) {
        return res.status(400).json({ message: 'No se puede cancelar una cita que ya pasó' });
      }
    }

    if (cita.estado === 'cancelada') {
      return res.status(400).json({ message: 'La cita ya está cancelada' });
    }
    if (cita.estado === 'completada') {
      return res.status(400).json({ message: 'No se puede cancelar una cita completada' });
    }

    const updated = await appointmentModel.updateEstado(id, 'cancelada');
    return res.json({ cita: updated });
  } catch (error) {
    return next(error);
  }
}

// Admin/barbero - actualizar estado de una cita (confirmar, completar, cancelar)
async function updateEstado(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const { estado } = req.body;

    const cita = await appointmentModel.findById(id);
    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    const updated = await appointmentModel.updateEstado(id, estado);
    return res.json({ cita: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, listMine, cancel, updateEstado };

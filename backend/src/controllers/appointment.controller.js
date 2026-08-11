const appointmentModel = require('../models/appointment.model');
const availabilityModel = require('../models/availability.model');
const serviceModel = require('../models/service.model');
const clientModel = require('../models/client.model');
const { isBeforeNow, isAtOrBeforeNow } = require('../utils/datetime');
const { DEFAULT_PAGE_SIZE, buildPaginationMeta } = require('../utils/pagination');

// Máquina de estados de una cita: solo estas transiciones están permitidas.
// 'cancelada' y 'completada' son estados finales.
const TRANSICIONES_VALIDAS = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['completada', 'cancelada'],
  cancelada: [],
  completada: [],
};

// RF10 - Reservar cita (también cubre RF12 - validar duplicidad/solapamiento)
async function create(req, res, next) {
  try {
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

    // Rechaza fechas pasadas (comparado contra la hora actual del negocio, no del servidor)
    if (isBeforeNow(fecha, hora_inicio)) {
      return res.status(400).json({ message: 'No se puede reservar una cita en el pasado' });
    }

    // RF09/RF15 - el horario debe caer dentro de la disponibilidad publicada
    // (horario semanal + excepciones); antes solo se validaba en el frontend.
    const slots = await availabilityModel.getAvailableSlots(fecha, servicio);
    if (!slots.includes(hora_inicio)) {
      return res.status(409).json({ message: 'El horario seleccionado no está disponible' });
    }

    // RF12 - el solapamiento se valida de forma atómica dentro del modelo (lock por fecha)
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
    const { fecha, desde, hasta, estado, clienteId } = req.query;

    if (fecha) {
      const citas = await appointmentModel.listByDate(fecha);
      return res.json({ citas });
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    const { rows, total } = await appointmentModel.listAll({
      desde,
      hasta,
      estado,
      clienteId,
      page,
      pageSize,
    });
    return res.json({ citas: rows, pagination: buildPaginationMeta(page, pageSize, total) });
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
    const { id } = req.params;
    const cita = await appointmentModel.findById(id);
    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (req.user.rol === 'cliente') {
      if (cita.cliente_id !== req.user.id) {
        return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
      }

      if (isAtOrBeforeNow(cita.fecha, cita.hora_inicio)) {
        return res.status(400).json({ message: 'No se puede cancelar una cita que ya pasó' });
      }
    }

    if (!TRANSICIONES_VALIDAS[cita.estado]?.includes('cancelada')) {
      const message =
        cita.estado === 'cancelada'
          ? 'La cita ya está cancelada'
          : 'No se puede cancelar una cita completada';
      return res.status(400).json({ message });
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
    const { id } = req.params;
    const { estado } = req.body;

    const cita = await appointmentModel.findById(id);
    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (!TRANSICIONES_VALIDAS[cita.estado]?.includes(estado)) {
      return res.status(400).json({
        message: `No se puede cambiar el estado de "${cita.estado}" a "${estado}"`,
      });
    }

    const updated = await appointmentModel.updateEstado(id, estado);
    return res.json({ cita: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, listMine, cancel, updateEstado };

const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createAppointmentValidator,
  listAppointmentsValidator,
  idParamValidator,
  updateEstadoValidator,
} = require('../validators/appointment.validator');

const router = express.Router();

router.use(authenticate);

// RF13/RF14 - listar citas del día o historial con filtros (admin/barbero)
router.get(
  '/',
  authorize('admin', 'barbero'),
  listAppointmentsValidator,
  validate,
  appointmentController.list
);

// RF16 - citas del cliente autenticado
router.get('/mias', appointmentController.listMine);

// RF10/RF12 - reservar cita
router.post('/', createAppointmentValidator, validate, appointmentController.create);

// RF11 - cancelar cita
router.patch('/:id/cancelar', idParamValidator, validate, appointmentController.cancel);

// Admin/barbero - actualizar estado (confirmar, completar, cancelar)
router.patch(
  '/:id/estado',
  authorize('admin', 'barbero'),
  updateEstadoValidator,
  validate,
  appointmentController.updateEstado
);

module.exports = router;

const { body, query, param } = require('express-validator');
const { paginationValidator } = require('./pagination.validator');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createAppointmentValidator = [
  body('servicio_id').isInt().withMessage('Debe seleccionar un servicio válido'),
  body('fecha').matches(DATE_REGEX).withMessage('La fecha debe tener el formato YYYY-MM-DD'),
  body('hora_inicio').matches(TIME_REGEX).withMessage('Hora de inicio inválida'),
  body('notas').optional().trim().isLength({ max: 255 }),
  body('cliente_id').optional().isInt().withMessage('Cliente inválido'),
];

const listAppointmentsValidator = [
  query('fecha').optional().matches(DATE_REGEX).withMessage('Fecha inválida'),
  query('desde').optional().matches(DATE_REGEX).withMessage('Fecha "desde" inválida'),
  query('hasta').optional().matches(DATE_REGEX).withMessage('Fecha "hasta" inválida'),
  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'cancelada', 'completada'])
    .withMessage('Estado inválido'),
  query('clienteId').optional().isInt().withMessage('Cliente inválido'),
  ...paginationValidator,
];

const idParamValidator = [param('id').isInt().withMessage('Id inválido')];

const updateEstadoValidator = [
  param('id').isInt().withMessage('Id inválido'),
  body('estado')
    .isIn(['pendiente', 'confirmada', 'cancelada', 'completada'])
    .withMessage('Estado inválido'),
];

module.exports = {
  createAppointmentValidator,
  listAppointmentsValidator,
  idParamValidator,
  updateEstadoValidator,
};

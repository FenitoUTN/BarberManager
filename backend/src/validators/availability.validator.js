const { body, query, param } = require('express-validator');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const slotsValidator = [
  query('fecha').matches(DATE_REGEX).withMessage('La fecha debe tener el formato YYYY-MM-DD'),
  query('servicioId').isInt().withMessage('Debe indicar un servicio válido'),
];

const weeklyScheduleValidator = [
  body('horario').isArray({ min: 0 }).withMessage('El horario debe ser una lista'),
  body('horario.*.dia_semana')
    .isInt({ min: 0, max: 6 })
    .withMessage('El día de la semana debe estar entre 0 y 6'),
  body('horario.*.hora_inicio').matches(TIME_REGEX).withMessage('Hora de inicio inválida'),
  body('horario.*.hora_fin').matches(TIME_REGEX).withMessage('Hora de fin inválida'),
  body('horario.*.activo').optional().isBoolean(),
];

const exceptionsQueryValidator = [
  query('desde').optional().matches(DATE_REGEX).withMessage('Fecha "desde" inválida'),
  query('hasta').optional().matches(DATE_REGEX).withMessage('Fecha "hasta" inválida'),
];

const createExceptionValidator = [
  body('fecha').matches(DATE_REGEX).withMessage('La fecha debe tener el formato YYYY-MM-DD'),
  body('hora_inicio').matches(TIME_REGEX).withMessage('Hora de inicio inválida'),
  body('hora_fin').matches(TIME_REGEX).withMessage('Hora de fin inválida'),
  body('tipo').isIn(['bloqueo', 'extra']).withMessage('Tipo inválido'),
  body('motivo').optional().trim(),
];

const idParamValidator = [param('id').isInt().withMessage('Id inválido')];

module.exports = {
  slotsValidator,
  weeklyScheduleValidator,
  exceptionsQueryValidator,
  createExceptionValidator,
  idParamValidator,
};

const { body, param, query } = require('express-validator');

const createServiceValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número válido'),
  body('duracion_minutos')
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un número de minutos válido'),
];

const updateServiceValidator = [
  param('id').isInt().withMessage('Id inválido'),
  ...createServiceValidator,
];

const idParamValidator = [param('id').isInt().withMessage('Id inválido')];

const listServicesValidator = [query('includeInactive').optional().isBoolean()];

module.exports = {
  createServiceValidator,
  updateServiceValidator,
  idParamValidator,
  listServicesValidator,
};

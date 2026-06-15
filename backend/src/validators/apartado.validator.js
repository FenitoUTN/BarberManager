const { body, param, query } = require('express-validator');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createApartadoValidator = [
  body('cliente_id').isInt().withMessage('Cliente inválido'),
  body('producto_id').isInt().withMessage('Producto inválido'),
  body('monto_total')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El monto total debe ser un número válido'),
];

const addAbonoValidator = [
  param('id').isInt().withMessage('Id inválido'),
  body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser un número válido'),
  body('fecha').optional().matches(DATE_REGEX).withMessage('Fecha inválida'),
];

const idParamValidator = [param('id').isInt().withMessage('Id inválido')];

const listApartadosValidator = [
  query('estado')
    .optional()
    .isIn(['activo', 'pagado', 'cancelado'])
    .withMessage('Estado inválido'),
  query('clienteId').optional().isInt().withMessage('Cliente inválido'),
];

module.exports = {
  createApartadoValidator,
  addAbonoValidator,
  idParamValidator,
  listApartadosValidator,
};

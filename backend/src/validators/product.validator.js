const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').optional({ checkFalsy: true }).trim(),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número válido'),
];

const updateProductValidator = [
  param('id').isInt().withMessage('Id inválido'),
  ...createProductValidator,
];

const idParamValidator = [param('id').isInt().withMessage('Id inválido')];

const listProductsValidator = [query('includeInactive').optional().isBoolean()];

module.exports = {
  createProductValidator,
  updateProductValidator,
  idParamValidator,
  listProductsValidator,
};

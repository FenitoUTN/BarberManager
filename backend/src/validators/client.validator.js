const { body, param, query } = require('express-validator');

const createClientValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un correo válido')
    .normalizeEmail(),
];

const updateClientValidator = [
  param('id').isInt().withMessage('Id inválido'),
  ...createClientValidator,
];

const idParamValidator = [param('id').isInt().withMessage('Id inválido')];

const listClientsValidator = [query('search').optional().trim()];

module.exports = {
  createClientValidator,
  updateClientValidator,
  idParamValidator,
  listClientsValidator,
};

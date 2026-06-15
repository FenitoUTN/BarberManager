const { body } = require('express-validator');

const registerValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio'),
  body('email').trim().isEmail().withMessage('Debe proporcionar un correo válido').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Debe proporcionar un correo válido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = { registerValidator, loginValidator };

const { query } = require('express-validator');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const citasPorDiaValidator = [
  query('desde').optional().matches(DATE_REGEX).withMessage('Fecha "desde" inválida'),
  query('hasta').optional().matches(DATE_REGEX).withMessage('Fecha "hasta" inválida'),
];

module.exports = { citasPorDiaValidator };

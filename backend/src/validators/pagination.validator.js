const { query } = require('express-validator');

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Tamaño de página inválido'),
];

module.exports = { paginationValidator };

const { validationResult } = require('express-validator');
const reportModel = require('../models/report.model');
const apartadoModel = require('../models/apartado.model');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    return false;
  }
  return true;
}

// RF26 - resumen de citas por día
async function citasPorDia(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const today = new Date().toISOString().slice(0, 10);
    const desde = req.query.desde || today;
    const hasta = req.query.hasta || desde;

    const resumen = await reportModel.getCitasResumenPorDia({ desde, hasta });
    return res.json({ resumen });
  } catch (error) {
    return next(error);
  }
}

// RF27 - listado de apartados activos
async function apartadosActivos(req, res, next) {
  try {
    const apartados = await apartadoModel.listAll({ estado: 'activo' });
    return res.json({ apartados });
  } catch (error) {
    return next(error);
  }
}

module.exports = { citasPorDia, apartadosActivos };

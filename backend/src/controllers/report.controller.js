const reportModel = require('../models/report.model');
const apartadoModel = require('../models/apartado.model');
const { todayISO } = require('../utils/datetime');

// RF26 - resumen de citas por día
async function citasPorDia(req, res, next) {
  try {
    const desde = req.query.desde || todayISO();
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
    const { rows } = await apartadoModel.listAll({ estado: 'activo' });
    return res.json({ apartados: rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = { citasPorDia, apartadosActivos };

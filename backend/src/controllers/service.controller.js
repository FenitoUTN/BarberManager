const serviceModel = require('../models/service.model');

// RF17 - Visualizar catálogo de servicios
async function list(req, res, next) {
  try {
    const isStaff = req.user.rol === 'admin' || req.user.rol === 'barbero';
    const includeInactive = isStaff && req.query.includeInactive === 'true';

    const services = await serviceModel.listServices({ includeInactive });
    return res.json({ services });
  } catch (error) {
    return next(error);
  }
}

// RF17 - Registrar servicio
async function create(req, res, next) {
  try {
    const { nombre, precio, duracion_minutos } = req.body;
    const service = await serviceModel.createService({ nombre, precio, duracion_minutos });
    return res.status(201).json({ service });
  } catch (error) {
    return next(error);
  }
}

// RF18 - Editar servicio
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await serviceModel.findServiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const { nombre, precio, duracion_minutos } = req.body;
    const service = await serviceModel.updateService(id, { nombre, precio, duracion_minutos });
    return res.json({ service });
  } catch (error) {
    return next(error);
  }
}

// RF18 - Eliminar servicio (baja lógica)
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await serviceModel.findServiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    await serviceModel.setServiceActive(id, false);
    return res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, update, remove };

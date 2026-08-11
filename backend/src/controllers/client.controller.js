const clientModel = require('../models/client.model');
const { DEFAULT_PAGE_SIZE, buildPaginationMeta } = require('../utils/pagination');

function canAccessClient(reqUser, clientId) {
  if (reqUser.rol === 'admin' || reqUser.rol === 'barbero') return true;
  return reqUser.rol === 'cliente' && Number(reqUser.id) === Number(clientId);
}

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    const { rows, total } = await clientModel.listClients({ search, page, pageSize });
    return res.json({ clients: rows, pagination: buildPaginationMeta(page, pageSize, total) });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;

    if (!canAccessClient(req.user, id)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }

    const client = await clientModel.findClientById(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    return res.json({ client });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { nombre, telefono, email } = req.body;

    if (email) {
      const existing = await clientModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
      }
    }

    const client = await clientModel.createClient({ nombre, telefono, email });
    return res.status(201).json({ client });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;

    if (!canAccessClient(req.user, id)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }

    const existingClient = await clientModel.findClientById(id);
    if (!existingClient) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const { nombre, telefono, email } = req.body;

    if (email && email !== existingClient.email) {
      const emailOwner = await clientModel.findByEmail(email);
      if (emailOwner && emailOwner.id !== existingClient.id) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
      }
    }

    const client = await clientModel.updateClient(id, { nombre, telefono, email });
    return res.json({ client });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const existingClient = await clientModel.findClientById(id);
    if (!existingClient) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await clientModel.setClientActive(id, false);
    return res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, getById, create, update, remove };

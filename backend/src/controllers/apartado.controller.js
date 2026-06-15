const { validationResult } = require('express-validator');
const apartadoModel = require('../models/apartado.model');
const productModel = require('../models/product.model');
const clientModel = require('../models/client.model');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    return false;
  }
  return true;
}

// RF23 - Registrar apartado de producto (admin/barbero)
async function create(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { cliente_id, producto_id, monto_total } = req.body;

    const cliente = await clientModel.findClientById(cliente_id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const producto = await productModel.findProductById(producto_id);
    if (!producto || !producto.activo) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const montoTotal = monto_total !== undefined ? monto_total : producto.precio;

    const apartado = await apartadoModel.create({
      clienteId: cliente.id,
      productoId: producto.id,
      montoTotal,
    });

    return res.status(201).json({ apartado });
  } catch (error) {
    return next(error);
  }
}

// RF25/RF27 - Visualizar apartados (saldo pendiente / listado de activos)
async function list(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { estado } = req.query;

    let clienteId = req.query.clienteId;
    if (req.user.rol === 'cliente') {
      clienteId = req.user.id;
    }

    const apartados = await apartadoModel.listAll({ estado, clienteId });
    return res.json({ apartados });
  } catch (error) {
    return next(error);
  }
}

// Detalle de un apartado con su historial de abonos
async function getOne(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const apartado = await apartadoModel.findById(id);
    if (!apartado) {
      return res.status(404).json({ message: 'Apartado no encontrado' });
    }

    if (req.user.rol === 'cliente' && apartado.cliente_id !== req.user.id) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }

    const abonos = await apartadoModel.listAbonos(id);
    return res.json({ apartado, abonos });
  } catch (error) {
    return next(error);
  }
}

// RF24 - Registrar abono a apartado (admin/barbero)
async function addAbono(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const { monto, fecha } = req.body;

    const apartado = await apartadoModel.findById(id);
    if (!apartado) {
      return res.status(404).json({ message: 'Apartado no encontrado' });
    }

    if (apartado.estado !== 'activo') {
      return res.status(400).json({ message: 'El apartado no está activo' });
    }

    if (Number(monto) > Number(apartado.saldo_pendiente)) {
      return res.status(400).json({ message: 'El abono no puede ser mayor al saldo pendiente' });
    }

    const updated = await apartadoModel.addAbono(id, {
      monto,
      fecha: fecha || new Date().toISOString().slice(0, 10),
    });

    return res.status(201).json({ apartado: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, getOne, addAbono };

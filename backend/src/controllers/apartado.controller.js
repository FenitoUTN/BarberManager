const apartadoModel = require('../models/apartado.model');
const productModel = require('../models/product.model');
const clientModel = require('../models/client.model');
const { todayISO } = require('../utils/datetime');
const { DEFAULT_PAGE_SIZE, buildPaginationMeta } = require('../utils/pagination');

// RF23 - Registrar apartado de producto (admin/barbero)
async function create(req, res, next) {
  try {
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
    const { estado } = req.query;

    let clienteId = req.query.clienteId;
    if (req.user.rol === 'cliente') {
      clienteId = req.user.id;
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    const { rows, total } = await apartadoModel.listAll({ estado, clienteId, page, pageSize });
    return res.json({ apartados: rows, pagination: buildPaginationMeta(page, pageSize, total) });
  } catch (error) {
    return next(error);
  }
}

// Detalle de un apartado con su historial de abonos
async function getOne(req, res, next) {
  try {
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

// RF24 - Registrar abono a apartado (admin/barbero). La validación de existencia,
// estado activo y saldo disponible ocurre de forma atómica dentro de
// apartadoModel.addAbono (bajo el lock de fila de la transacción), evitando que dos
// abonos concurrentes lean el mismo saldo desactualizado.
async function addAbono(req, res, next) {
  try {
    const { id } = req.params;
    const { monto, fecha } = req.body;

    const updated = await apartadoModel.addAbono(id, {
      monto,
      fecha: fecha || todayISO(),
    });

    return res.status(201).json({ apartado: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, getOne, addAbono };

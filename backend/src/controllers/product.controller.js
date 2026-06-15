const { validationResult } = require('express-validator');
const productModel = require('../models/product.model');

// RF22 - Visualizar catálogo de productos
async function list(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    }

    const isStaff = req.user.rol === 'admin' || req.user.rol === 'barbero';
    const includeInactive = isStaff && req.query.includeInactive === 'true';

    const products = await productModel.listProducts({ includeInactive });
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
}

// RF19 - Registrar producto
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    }

    const { nombre, descripcion, precio } = req.body;
    const product = await productModel.createProduct({ nombre, descripcion, precio });
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
}

// RF20 - Editar producto
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    }

    const { id } = req.params;
    const existing = await productModel.findProductById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const { nombre, descripcion, precio } = req.body;
    const product = await productModel.updateProduct(id, { nombre, descripcion, precio });
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
}

// RF21 - Eliminar producto (baja lógica)
async function remove(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    }

    const { id } = req.params;
    const existing = await productModel.findProductById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await productModel.setProductActive(id, false);
    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, update, remove };

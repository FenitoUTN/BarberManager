const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createProductValidator,
  updateProductValidator,
  idParamValidator,
  listProductsValidator,
} = require('../validators/product.validator');

const router = express.Router();

router.use(authenticate);

// RF22 - Visualizar catálogo de productos
router.get('/', listProductsValidator, validate, productController.list);

// RF19 - Registrar producto
router.post(
  '/',
  authorize('admin', 'barbero'),
  createProductValidator,
  validate,
  productController.create
);

// RF20 - Editar producto
router.put(
  '/:id',
  authorize('admin', 'barbero'),
  updateProductValidator,
  validate,
  productController.update
);

// RF21 - Eliminar producto
router.delete(
  '/:id',
  authorize('admin', 'barbero'),
  idParamValidator,
  validate,
  productController.remove
);

module.exports = router;

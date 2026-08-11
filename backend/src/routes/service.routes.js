const express = require('express');
const serviceController = require('../controllers/service.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createServiceValidator,
  updateServiceValidator,
  idParamValidator,
  listServicesValidator,
} = require('../validators/service.validator');

const router = express.Router();

router.use(authenticate);

// RF17 - Visualizar catálogo de servicios
router.get('/', listServicesValidator, validate, serviceController.list);

// RF17 - Registrar servicio
router.post(
  '/',
  authorize('admin', 'barbero'),
  createServiceValidator,
  validate,
  serviceController.create
);

// RF18 - Editar servicio
router.put(
  '/:id',
  authorize('admin', 'barbero'),
  updateServiceValidator,
  validate,
  serviceController.update
);

// RF18 - Eliminar servicio
router.delete(
  '/:id',
  authorize('admin', 'barbero'),
  idParamValidator,
  validate,
  serviceController.remove
);

module.exports = router;

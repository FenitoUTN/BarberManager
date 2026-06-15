const express = require('express');
const apartadoController = require('../controllers/apartado.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  createApartadoValidator,
  addAbonoValidator,
  idParamValidator,
  listApartadosValidator,
} = require('../validators/apartado.validator');

const router = express.Router();

router.use(authenticate);

// RF25/RF27 - Visualizar apartados (propios para clientes, todos para admin/barbero)
router.get('/', listApartadosValidator, apartadoController.list);

// Detalle de un apartado con historial de abonos
router.get('/:id', idParamValidator, apartadoController.getOne);

// RF23 - Registrar apartado de producto
router.post(
  '/',
  authorize('admin', 'barbero'),
  createApartadoValidator,
  apartadoController.create
);

// RF24 - Registrar abono a apartado
router.post(
  '/:id/abonos',
  authorize('admin', 'barbero'),
  addAbonoValidator,
  apartadoController.addAbono
);

module.exports = router;

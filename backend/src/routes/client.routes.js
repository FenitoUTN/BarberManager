const express = require('express');
const clientController = require('../controllers/client.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  createClientValidator,
  updateClientValidator,
  idParamValidator,
  listClientsValidator,
} = require('../validators/client.validator');

const router = express.Router();

router.use(authenticate);

// RF07 - Listar y buscar clientes
router.get('/', authorize('admin', 'barbero'), listClientsValidator, clientController.list);

// RF04 - Registrar cliente
router.post('/', authorize('admin', 'barbero'), createClientValidator, clientController.create);

// RF08 - Visualizar perfil de cliente (admin/barbero, o el propio cliente)
router.get('/:id', idParamValidator, clientController.getById);

// RF05 - Editar información de cliente (admin/barbero, o el propio cliente)
router.put('/:id', updateClientValidator, clientController.update);

// RF06 - Eliminar cliente (baja lógica)
router.delete('/:id', authorize('admin'), idParamValidator, clientController.remove);

module.exports = router;

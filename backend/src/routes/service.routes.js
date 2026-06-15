const express = require('express');
const serviceController = require('../controllers/service.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// RF17 - Visualizar catálogo de servicios
router.get('/', authenticate, serviceController.list);

module.exports = router;

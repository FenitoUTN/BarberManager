const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { citasPorDiaValidator } = require('../validators/report.validator');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'barbero'));

// RF26 - resumen de citas por día
router.get('/citas-por-dia', citasPorDiaValidator, validate, reportController.citasPorDia);

// RF27 - listado de apartados activos
router.get('/apartados-activos', reportController.apartadosActivos);

module.exports = router;

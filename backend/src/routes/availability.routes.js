const express = require('express');
const availabilityController = require('../controllers/availability.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  slotsValidator,
  weeklyScheduleValidator,
  exceptionsQueryValidator,
  createExceptionValidator,
  idParamValidator,
} = require('../validators/availability.validator');

const router = express.Router();

router.use(authenticate);

// RF09 - horarios disponibles para reservar (todos los roles autenticados)
router.get('/slots', slotsValidator, availabilityController.getSlots);

// RF15 - horario semanal del barbero
router.get('/horarios', availabilityController.getWeeklySchedule);
router.put(
  '/horarios',
  authorize('admin', 'barbero'),
  weeklyScheduleValidator,
  availabilityController.updateWeeklySchedule
);

// RF15 - excepciones (bloqueos / horarios extra)
router.get(
  '/excepciones',
  authorize('admin', 'barbero'),
  exceptionsQueryValidator,
  availabilityController.listExceptions
);
router.post(
  '/excepciones',
  authorize('admin', 'barbero'),
  createExceptionValidator,
  availabilityController.createException
);
router.delete(
  '/excepciones/:id',
  authorize('admin', 'barbero'),
  idParamValidator,
  availabilityController.deleteException
);

module.exports = router;

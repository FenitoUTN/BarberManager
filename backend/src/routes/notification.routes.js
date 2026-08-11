const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.put('/leidas', notificationController.markAllRead);
router.put('/:id/leida', notificationController.markRead);

module.exports = router;

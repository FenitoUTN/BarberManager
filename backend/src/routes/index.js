const express = require('express');
const authRoutes = require('./auth.routes');
const clientRoutes = require('./client.routes');
const serviceRoutes = require('./service.routes');
const availabilityRoutes = require('./availability.routes');
const appointmentRoutes = require('./appointment.routes');
const productRoutes = require('./product.routes');
const apartadoRoutes = require('./apartado.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/clientes', clientRoutes);
router.use('/servicios', serviceRoutes);
router.use('/disponibilidad', availabilityRoutes);
router.use('/citas', appointmentRoutes);
router.use('/productos', productRoutes);
router.use('/apartados', apartadoRoutes);
router.use('/reportes', reportRoutes);

module.exports = router;

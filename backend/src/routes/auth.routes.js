const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { verifyCsrf } = require('../middlewares/csrf.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
// Logout no exige sesión: su trabajo es borrar las cookies, y tiene que poder
// ejecutarse también cuando el token ya expiró. Lo que sí exige es la verificación
// CSRF, para que un sitio externo no pueda cerrar la sesión de alguien.
router.post('/logout', verifyCsrf, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;

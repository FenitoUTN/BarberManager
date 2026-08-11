const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// La sesión viaja en una cookie httpOnly (ver auth.controller.js), por lo que el
// origin de CORS no puede ser '*' cuando se usan credentials. En producción es
// obligatorio definir CORS_ORIGIN explícitamente; en desarrollo cae al puerto por
// defecto de Vite.
const corsOrigin =
  process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173');
if (process.env.NODE_ENV === 'production' && !corsOrigin) {
  throw new Error('CORS_ORIGIN debe estar definido en producción (requerido para cookies de sesión).');
}

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Intente de nuevo más tarde.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de registro. Intente de nuevo más tarde.' },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);

app.use('/api', apiRoutes);

const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

app.get('*', (req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ message: 'Recurso no encontrado' });
    }
  });
});

app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

app.use(errorHandler);

module.exports = app;

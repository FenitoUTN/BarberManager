const serviceModel = require('../models/service.model');

async function list(req, res, next) {
  try {
    const services = await serviceModel.listActiveServices();
    return res.json({ services });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list };

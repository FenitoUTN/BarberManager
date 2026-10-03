// Los errores 4xx son previstos: la capa de controladores los lanza con un mensaje
//pensado para el usuario ("Apartado no encontrado", "El abono no puede superar el
// saldo pendiente"), así que se devuelven tal cual. Los 5xx son inesperados y sus
// mensajes traen detalle interno (SQL, rutas, valores), por lo que nunca salen hacia
// el cliente: se registran en el servidor y se responde con un mensaje genérico.
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ message: 'Error interno del servidor' });
  }

  return res.status(status).json({ message: err.message || 'Solicitud inválida' });
}

module.exports = { errorHandler };

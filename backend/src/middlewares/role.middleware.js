function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }
    return next();
  };
}

module.exports = { authorize };

const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, expiresInMs } = require('../utils/jwt');
const { generateCsrfToken } = require('../utils/csrf');

function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function cookieOptions() {
  const maxAge = expiresInMs();
  const secure = process.env.NODE_ENV === 'production';
  return { maxAge, secure, sameSite: 'lax', path: '/' };
}

function setSessionCookies(res, token) {
  const options = cookieOptions();
  res.cookie('token', token, { ...options, httpOnly: true });
  res.cookie('csrfToken', generateCsrfToken(), { ...options, httpOnly: false });
}

function clearSessionCookies(res) {
  res.clearCookie('token', { path: '/' });
  res.clearCookie('csrfToken', { path: '/' });
}

async function register(req, res, next) {
  try {
    const { nombre, telefono, email, password } = req.body;

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo' });
    }

    const passwordHash = await hashPassword(password);
    const user = await userModel.createUser({
      nombre,
      telefono,
      email,
      passwordHash,
      rol: 'cliente',
    });

    const token = generateToken({ id: user.id, nombre: user.nombre, rol: user.rol });
    setSessionCookies(res, token);

    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken({ id: user.id, nombre: user.nombre, rol: user.rol });
    setSessionCookies(res, token);

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res) {
  // El backend ahora emite la sesión como cookie httpOnly: cerrar sesión requiere
  // limpiar esas cookies en el servidor (el cliente ya no puede borrarlas por JS).
  clearSessionCookies(res);
  return res.json({ message: 'Sesión cerrada correctamente' });
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, logout, me };

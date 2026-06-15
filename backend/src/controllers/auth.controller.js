const { validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    }

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

    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
    }

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

    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res) {
  // El sistema usa JWT sin estado en el servidor: cerrar sesión consiste en
  // que el cliente descarte el token almacenado.
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

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona nombre, email y contraseña'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una cuenta con este correo'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'client'
    });

    // Crear perfil de cliente
    await Client.create({
      userId: user._id
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        trialStatus: user.getTrialStatus()
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor. Intenta nuevamente.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona email y contraseña'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Correo o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Correo o contraseña incorrectos'
      });
    }

    // Actualizar último login
    user.lastLogin = Date.now();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        trialStatus: user.getTrialStatus()
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor. Intenta nuevamente.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed,
        subscribedAt: user.subscribedAt,
        registeredAt: user.registeredAt,
        trialStatus: user.getTrialStatus()
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información del usuario'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );

    // Actualizar también datos del cliente si existen
    if (phone || address) {
      await Client.findOneAndUpdate(
        { userId: req.user._id },
        { phone, address },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Perfil actualizado',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando perfil'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Cambiar contraseña
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Proporciona la contraseña actual y la nueva'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error cambiando contraseña'
    });
  }
});

module.exports = router;

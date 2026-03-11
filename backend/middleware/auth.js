const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Email del admin autorizado (debe coincidir con el frontend)
const ADMIN_EMAIL = 'cristoferagurto2@gmail.com';

// Verificar token JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar si es un token de admin local (generado en frontend cuando backend no disponible)
      if (token.startsWith('admin_local_')) {
        // Token especial para admin - crear usuario admin temporal
        req.user = {
          _id: 'admin_local_id',
          email: ADMIN_EMAIL,
          name: 'Administrador',
          role: 'admin',
          isActive: true
        };
        return next();
      }

      // Verificar token JWT normal
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Obtener usuario del token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuario desactivado'
        });
      }

      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado, token no proporcionado'
    });
  }
};

// Verificar si es admin (incluye admin local)
const adminOnly = (req, res, next) => {
  // Verificar si es admin por role o por email de admin
  if (req.user && (req.user.role === 'admin' || req.user.email === ADMIN_EMAIL)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo administradores.'
    });
  }
};

// Verificar si es el propio usuario o admin
const ownerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user._id.toString() === req.params.clientId)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo el propietario o administradores.'
    });
  }
};

// Verificar trial activo o suscripción
const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Admin siempre tiene acceso
    if (user.role === 'admin') {
      return next();
    }

    // Verificar si está suscrito
    if (user.isSubscribed) {
      return next();
    }

    // Verificar trial
    const trialStatus = user.getTrialStatus();
    
    if (!trialStatus.isTrialActive) {
      return res.status(403).json({
        success: false,
        error: 'Período de prueba expirado. Por favor suscríbete.',
        trialExpired: true,
        daysRemaining: 0
      });
    }

    // Si el trial está por expirar (menos de 3 días), agregar advertencia
    if (trialStatus.daysRemaining <= 3) {
      req.trialWarning = {
        daysRemaining: trialStatus.daysRemaining,
        message: `Tu período de prueba expira en ${trialStatus.daysRemaining} días`
      };
    }

    next();
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return res.status(500).json({
      success: false,
      error: 'Error verificando suscripción'
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  ownerOrAdmin,
  checkSubscription
};

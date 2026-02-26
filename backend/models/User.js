const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscribedAt: {
    type: Date,
    default: null
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener días restantes de trial
userSchema.methods.getTrialStatus = function() {
  const TRIAL_DAYS = 7;
  const registeredAt = this.registeredAt;
  const now = new Date();
  const trialEndDate = new Date(registeredAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
  
  return {
    isTrialActive: daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    trialEndDate: trialEndDate.toISOString(),
    isSubscribed: this.isSubscribed
  };
};

module.exports = mongoose.model('User', userSchema);

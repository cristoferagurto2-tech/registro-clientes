const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dni: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  businessName: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  trialEndDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  totalDocuments: {
    type: Number,
    default: 0
  },
  totalRecords: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Middleware para actualizar lastActivity
clientSchema.pre('save', function(next) {
  this.lastActivity = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);

const mongoose = require('mongoose');

const cellEditSchema = new mongoose.Schema({
  rowIndex: {
    type: Number,
    required: true
  },
  colIndex: {
    type: Number,
    required: true
  },
  value: {
    type: String,
    default: ''
  }
}, { _id: false });

const documentTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la plantilla es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  headers: [{
    type: String
  }],
  data: [{
    type: [mongoose.Schema.Types.Mixed]
  }],
  completedData: [cellEditSchema],
  originalFile: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para obtener rápidamente la plantilla oficial
documentTemplateSchema.index({ isOfficial: 1, isActive: 1 });

// Middleware para asegurar que solo haya una plantilla oficial
documentTemplateSchema.pre('save', async function(next) {
  if (this.isOfficial && this.isActive) {
    // Desactivar otras plantillas oficiales
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isOfficial: true },
      { $set: { isOfficial: false } }
    );
  }
  next();
});

// Método estático para obtener la plantilla oficial
documentTemplateSchema.statics.getOfficialTemplate = async function() {
  return await this.findOne({ isOfficial: true, isActive: true });
};

module.exports = mongoose.model('DocumentTemplate', documentTemplateSchema);

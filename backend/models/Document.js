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

const documentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del cliente es obligatorio']
  },
  month: {
    type: String,
    required: [true, 'El mes es obligatorio'],
    enum: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
  },
  year: {
    type: Number,
    default: 2026
  },
  headers: [{
    type: String
  }],
  data: [{
    type: [mongoose.Schema.Types.Mixed]
  }],
  completedData: [cellEditSchema],
  originalFile: {
    type: String, // Base64 del archivo original
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados
// Un cliente solo puede tener un documento por mes
// Eliminar restricción de unicidad para permitir múltiples versiones
documentSchema.index({ clientId: 1, month: 1, year: 1 });

// Middleware para actualizar lastModified
documentSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Método para obtener datos fusionados
documentSchema.methods.getMergedData = function() {
  const mergedData = this.data.map((row, rowIndex) => {
    return row.map((cell, colIndex) => {
      const edit = this.completedData.find(
        edit => edit.rowIndex === rowIndex && edit.colIndex === colIndex
      );
      return edit ? edit.value : cell;
    });
  });
  
  return {
    headers: this.headers,
    data: mergedData
  };
};

module.exports = mongoose.model('Document', documentSchema);

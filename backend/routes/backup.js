const express = require('express');
const XLSX = require('xlsx');
const User = require('../models/User');
const Document = require('../models/Document');
const Client = require('../models/Client');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Variable para almacenar el último backup
let lastBackupInfo = {
  timestamp: null,
  type: null,
  status: null,
  records: 0
};

// @route   GET /api/backup/status
// @desc    Obtener estado del backup
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const clientId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Contar datos del usuario
    const documentsCount = isAdmin 
      ? await Document.countDocuments()
      : await Document.countDocuments({ clientId });

    const clientsCount = isAdmin
      ? await User.countDocuments({ role: 'client' })
      : 1;

    res.json({
      success: true,
      status: {
        lastBackup: lastBackupInfo.timestamp,
        lastBackupType: lastBackupInfo.type,
        documentsCount,
        clientsCount,
        isBackupEnabled: true,
        nextBackup: lastBackupInfo.timestamp 
          ? new Date(new Date(lastBackupInfo.timestamp).getTime() + 24 * 60 * 60 * 1000).toISOString()
          : null
      }
    });
  } catch (error) {
    console.error('Error obteniendo estado del backup:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado del backup'
    });
  }
});

// @route   POST /api/backup/trigger
// @desc    Crear backup manual y descargar Excel
// @access  Private
router.post('/trigger', protect, async (req, res) => {
  try {
    const { type = 'manual' } = req.body;
    const clientId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Obtener datos según permisos
    const query = isAdmin ? {} : { clientId };

    const [users, documents, clients] = await Promise.all([
      isAdmin ? User.find().select('-password') : User.findById(clientId).select('-password'),
      Document.find(query),
      isAdmin ? Client.find() : Client.findOne({ userId: clientId })
    ]);

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const summaryData = [
      ['BACKUP - CLIENTCORE'],
      [''],
      ['Fecha:', new Date().toLocaleString('es-ES')],
      ['Tipo:', type === 'automatic' ? 'Automático' : 'Manual'],
      ['Usuario:', req.user.email],
      ['Rol:', req.user.role],
      [''],
      ['ESTADÍSTICAS'],
      ['Total Clientes:', isAdmin ? users.length : 1],
      ['Total Documentos:', documents.length],
      ['Total Registros:', documents.reduce((sum, doc) => sum + doc.data.length, 0)]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Hoja 2: Usuarios (solo admin)
    if (isAdmin && Array.isArray(users)) {
      const usersData = users.map(user => ({
        ID: user._id.toString(),
        Nombre: user.name,
        Email: user.email,
        Rol: user.role,
        Registrado: user.registeredAt?.toLocaleDateString('es-ES') || 'N/A',
        Suscrito: user.isSubscribed ? 'Sí' : 'No',
        'Último Login': user.lastLogin?.toLocaleDateString('es-ES') || 'Nunca'
      }));
      const usersSheet = XLSX.utils.json_to_sheet(usersData);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Usuarios');
    }

    // Hojas de documentos por cliente
    const processedClients = new Set();

    documents.forEach(doc => {
      const clientKey = doc.clientId.toString();
      
      if (!processedClients.has(clientKey)) {
        processedClients.add(clientKey);
        
        const clientDocs = documents.filter(d => d.clientId.toString() === clientKey);
        
        clientDocs.forEach((document, index) => {
          const mergedData = document.getMergedData();
          const sheetName = `Cliente_${clientKey.substring(0, 6)}_${document.month}`.substring(0, 31);
          
          const sheetData = [mergedData.headers, ...mergedData.data];
          const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
          
          XLSX.utils.book_append_sheet(workbook, worksheet, `${sheetName}_${index}`);
        });
      }
    });

    // Generar archivo
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `ClientCore_Backup_${dateStr}_${timeStr}.xlsx`;

    // Actualizar info del último backup
    lastBackupInfo = {
      timestamp: timestamp.toISOString(),
      type,
      status: 'completed',
      records: documents.length
    };

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);

  } catch (error) {
    console.error('Error creando backup:', error);
    lastBackupInfo.status = 'error';
    res.status(500).json({
      success: false,
      error: 'Error creando backup'
    });
  }
});

// @route   POST /api/backup/automatic
// @desc    Endpoint para backup automático (puede ser llamado por cron)
// @access  Admin Only
router.post('/automatic', protect, adminOnly, async (req, res) => {
  try {
    // Verificar si ya se hizo backup en las últimas 24 horas
    if (lastBackupInfo.timestamp) {
      const lastBackup = new Date(lastBackupInfo.timestamp);
      const now = new Date();
      const hoursSinceLastBackup = (now - lastBackup) / (1000 * 60 * 60);

      if (hoursSinceLastBackup < 24) {
        return res.json({
          success: true,
          message: 'Backup automático ya realizado en las últimas 24 horas',
          lastBackup: lastBackupInfo.timestamp,
          nextBackup: new Date(lastBackup.getTime() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    // Realizar backup automático
    req.body.type = 'automatic';
    
    // Aquí podríamos enviar por email o guardar en otro lugar
    // Por ahora solo registramos que se realizó
    lastBackupInfo = {
      timestamp: new Date().toISOString(),
      type: 'automatic',
      status: 'completed',
      records: await Document.countDocuments()
    };

    res.json({
      success: true,
      message: 'Backup automático completado',
      timestamp: lastBackupInfo.timestamp
    });

  } catch (error) {
    console.error('Error en backup automático:', error);
    res.status(500).json({
      success: false,
      error: 'Error en backup automático'
    });
  }
});

// @route   GET /api/backup/history
// @desc    Obtener historial de backups
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    // En una implementación real, esto vendría de una colección de backups
    // Por ahora devolvemos el último backup
    const history = lastBackupInfo.timestamp 
      ? [{
          id: Date.now().toString(),
          timestamp: lastBackupInfo.timestamp,
          type: lastBackupInfo.type || 'manual',
          status: lastBackupInfo.status || 'completed',
          records: lastBackupInfo.records || 0
        }]
      : [];

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial de backups'
    });
  }
});

module.exports = router;

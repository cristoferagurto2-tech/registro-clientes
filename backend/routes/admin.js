const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const Client = require('../models/Client');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/clients
// @desc    Obtener todos los clientes
// @access  Admin Only
router.get('/clients', protect, adminOnly, async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .sort({ registeredAt: -1 });

    // Obtener información adicional de cada cliente
    const clientsWithDetails = await Promise.all(
      clients.map(async (client) => {
        const clientInfo = await Client.findOne({ userId: client._id });
        const documentsCount = await Document.countDocuments({ clientId: client._id });
        const trialStatus = client.getTrialStatus();

        return {
          id: client._id,
          name: client.name,
          email: client.email,
          registeredAt: client.registeredAt,
          lastLogin: client.lastLogin,
          isSubscribed: client.isSubscribed,
          subscribedAt: client.subscribedAt,
          trialStatus,
          documentsCount,
          phone: clientInfo?.phone || '',
          address: clientInfo?.address || ''
        };
      })
    );

    res.json({
      success: true,
      count: clients.length,
      clients: clientsWithDetails
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo lista de clientes'
    });
  }
});

// @route   GET /api/admin/clients/:clientId
// @desc    Obtener detalles de un cliente específico
// @access  Admin Only
router.get('/clients/:clientId', protect, adminOnly, async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await User.findById(clientId).select('-password');
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    const clientInfo = await Client.findOne({ userId: client._id });
    const documents = await Document.find({ clientId: client._id });
    const trialStatus = client.getTrialStatus();

    res.json({
      success: true,
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        role: client.role,
        registeredAt: client.registeredAt,
        lastLogin: client.lastLogin,
        isSubscribed: client.isSubscribed,
        subscribedAt: client.subscribedAt,
        trialStatus,
        phone: clientInfo?.phone || '',
        address: clientInfo?.address || '',
        businessName: clientInfo?.businessName || '',
        notes: clientInfo?.notes || ''
      },
      documents: documents.map(doc => ({
        id: doc._id,
        month: doc.month,
        year: doc.year,
        lastModified: doc.lastModified
      }))
    });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información del cliente'
    });
  }
});

// @route   GET /api/admin/clients/:clientId/documents
// @desc    Obtener todos los documentos de un cliente
// @access  Admin Only
router.get('/clients/:clientId/documents', protect, adminOnly, async (req, res) => {
  try {
    const { clientId } = req.params;

    // Verificar que el cliente existe
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    const documents = await Document.find({ clientId });

    res.json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        month: doc.month,
        year: doc.year,
        headers: doc.headers,
        data: doc.getMergedData().data,
        completedData: doc.completedData,
        lastModified: doc.lastModified,
        uploadedAt: doc.uploadedAt
      }))
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo documentos del cliente'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Obtener dashboard global (todos los clientes)
// @access  Admin Only
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // Estadísticas generales
    const totalClients = await User.countDocuments({ role: 'client' });
    const subscribedClients = await User.countDocuments({ role: 'client', isSubscribed: true });
    const totalDocuments = await Document.countDocuments();

    // Clientes activos (que han hecho login en los últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeClients = await User.countDocuments({
      role: 'client',
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Documentos por mes
    const documentsByMonth = await Document.aggregate([
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Clientes nuevos por mes
    const clientsByMonth = await User.aggregate([
      {
        $match: { role: 'client' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$registeredAt' },
            month: { $month: '$registeredAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: {
        totalClients,
        subscribedClients,
        totalDocuments,
        activeClients,
        conversionRate: totalClients > 0 
          ? ((subscribedClients / totalClients) * 100).toFixed(1) 
          : 0
      },
      documentsByMonth,
      clientsByMonth
    });
  } catch (error) {
    console.error('Error obteniendo dashboard admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo dashboard de administración'
    });
  }
});

// @route   PUT /api/admin/clients/:clientId/subscribe
// @desc    Suscribir/desuscribir un cliente manualmente
// @access  Admin Only
router.put('/clients/:clientId/subscribe', protect, adminOnly, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { isSubscribed } = req.body;

    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    client.isSubscribed = isSubscribed;
    if (isSubscribed) {
      client.subscribedAt = new Date();
    } else {
      client.subscribedAt = null;
    }

    await client.save();

    res.json({
      success: true,
      message: isSubscribed 
        ? 'Cliente suscrito correctamente' 
        : 'Suscripción cancelada',
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        isSubscribed: client.isSubscribed
      }
    });
  } catch (error) {
    console.error('Error actualizando suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando suscripción del cliente'
    });
  }
});

// @route   DELETE /api/admin/clients/:clientId
// @desc    Eliminar un cliente y todos sus datos
// @access  Admin Only
router.delete('/clients/:clientId', protect, adminOnly, async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Eliminar documentos del cliente
    await Document.deleteMany({ clientId });

    // Eliminar perfil de cliente
    await Client.deleteOne({ userId: clientId });

    // Eliminar usuario
    await User.findByIdAndDelete(clientId);

    res.json({
      success: true,
      message: 'Cliente y todos sus datos eliminados correctamente'
    });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando cliente'
    });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Crear usuario administrador (solo para setup inicial)
// @access  Public (solo si no hay admins)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Verificar secret key (debe coincidir con variable de entorno)
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Clave secreta inválida'
      });
    }

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un administrador'
      });
    }

    // Crear admin
    const admin = await User.create({
      name: name || 'Administrador',
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isSubscribed: true
    });

    res.status(201).json({
      success: true,
      message: 'Administrador creado correctamente',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error creando admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando administrador'
    });
  }
});

module.exports = router;

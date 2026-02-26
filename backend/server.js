const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Importar rutas
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const backupRoutes = require('./routes/backup');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // En producción especifica tu dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/backup', backupRoutes);

// Configuración de multer para recibir archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG o PDF'), false);
    }
  }
});

// Configuración de Nodemailer con Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Endpoint para enviar comprobantes de pago
app.post('/api/send-payment', upload.single('comprobante'), async (req, res) => {
  try {
    const { planName, planPrice, clientEmail } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se recibió ningún archivo' 
      });
    }

    // Configurar el email
    const mailOptions = {
      from: {
        name: 'ClientCore - Pagos',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER, // Tu correo
      subject: `💰 Nuevo Pago Recibido - ${planName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <h2 style="color: #2563eb; margin-bottom: 20px; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
            💰 Nuevo Pago Recibido
          </h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 10px 0; font-size: 16px;">
              <strong style="color: #374151;">Plan Contratado:</strong> 
              <span style="color: #2563eb; font-weight: 600;">${planName}</span>
            </p>
            <p style="margin: 10px 0; font-size: 16px;">
              <strong style="color: #374151;">Monto:</strong> 
              <span style="color: #16a34a; font-weight: 600;">S/ ${planPrice}.00</span>
            </p>
            <p style="margin: 10px 0; font-size: 16px;">
              <strong style="color: #374151;">Email del Cliente:</strong> 
              <span style="color: #6b7280;">${clientEmail}</span>
            </p>
            <p style="margin: 10px 0; font-size: 16px;">
              <strong style="color: #374151;">Fecha:</strong> 
              <span style="color: #6b7280;">${new Date().toLocaleString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </p>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; color: #166534; font-weight: 600;">
              ✅ El comprobante de pago está adjunto a este correo.
            </p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
            Este mensaje fue enviado automáticamente desde ClientCore<br>
            © 2026 ClientCore - Todos los derechos reservados
          </p>
        </div>
      `,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype
        }
      ]
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Comprobante enviado correctamente' 
    });

  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al enviar el comprobante. Intenta nuevamente.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    database: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Error interno del servidor' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`);
  console.log(`📧 Configurado para enviar emails a: ${process.env.EMAIL_USER || 'No configurado'}`);
  console.log(`🌐 MongoDB URI configurada: ${process.env.MONGODB_URI ? 'Sí' : 'No'}`);
});

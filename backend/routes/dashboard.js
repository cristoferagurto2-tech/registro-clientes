const express = require('express');
const Document = require('../models/Document');
const { protect, ownerOrAdmin, checkSubscription } = require('../middleware/auth');

const router = express.Router();

// Función para parsear números en formato español/latinoamericano
// Maneja: 1.234,56 (mil doscientos) o 1,234.56 o 1234,56 o 1234.56
function parseNumberES(value) {
  if (!value) return 0;
  
  const str = value.toString().trim();
  
  // Si tiene ambos separadores (coma y punto)
  if (str.includes(',') && str.includes('.')) {
    // Determinar cuál es el separador decimal (el último)
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Formato: 1.234,56 (coma es decimal)
      return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      // Formato: 1,234.56 (punto es decimal)
      return parseFloat(str.replace(/,/g, '')) || 0;
    }
  }
  
  // Si solo tiene coma
  if (str.includes(',')) {
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Probablemente es decimal: 1234,56
      return parseFloat(str.replace(',', '.')) || 0;
    } else {
      // Probablemente es separador de miles: 1,234
      return parseFloat(str.replace(/,/g, '')) || 0;
    }
  }
  
  // Si solo tiene punto
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Probablemente es decimal: 1234.56
      return parseFloat(str) || 0;
    } else {
      // Probablemente es separador de miles: 1.234 o 5.000
      // En formato español, el punto es separador de miles
      return parseFloat(str.replace(/\./g, '')) || 0;
    }
  }
  
  // Sin separadores
  return parseFloat(str) || 0;
}

// Productos disponibles
const productosList = [
  'Préstamo personal',
  'Crédito de consumo',
  'Tarjeta de crédito',
  'Préstamo vehicular (automotriz)',
  'Crédito hipotecario',
  'Microcrédito'
];

const mesesList = [
  'enero 2026', 'febrero 2026', 'marzo 2026', 'abril 2026',
  'mayo 2026', 'junio 2026', 'julio 2026', 'agosto 2026',
  'septiembre 2026', 'octubre 2026', 'noviembre 2026', 'diciembre 2026'
];

// @route   GET /api/dashboard/summary
// @desc    Obtener resumen general del dashboard
// @access  Private
router.get('/summary', protect, checkSubscription, async (req, res) => {
  try {
    const clientId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Si es admin, obtener todos los documentos
    // Si es cliente, solo los suyos
    const query = isAdmin ? {} : { clientId };

    const documents = await Document.find(query);

    // Calcular estadísticas
    let totalClientes = 0;
    let montoTotal = 0;
    let totalGanancias = 0;
    let sumaPonderadaTasas = 0;
    let sumaMontos = 0;

    const processedRows = [];

    documents.forEach(doc => {
      const mergedData = doc.getMergedData();
      
      mergedData.data.forEach(row => {
        // Verificar si la fila tiene DNI (columna 2)
        if (row[2] && row[2].toString().trim() !== '') {
          totalClientes++;

          // Monto (columna 6)
          const monto = parseNumberES(row[6]);
          montoTotal += monto;
          sumaMontos += monto;

          // Tasa (columna 7)
          const tasa = parseNumberES(row[7]);
          sumaPonderadaTasas += tasa * monto;

          // Ganancias (columna 10)
          const ganancia = parseNumberES(row[10]);
          totalGanancias += ganancia;

          processedRows.push({
            fecha: row[0],
            mes: row[1],
            dni: row[2],
            nombre: row[3],
            producto: row[5],
            monto,
            tasa,
            ganancia,
            observacion: row[9]
          });
        }
      });
    });

    // Calcular promedio ponderado de tasas
    const promedioTasa = sumaMontos > 0 ? (sumaPonderadaTasas / sumaMontos) : 0;

    res.json({
      success: true,
      summary: {
        totalClientes,
        montoTotal: parseFloat(montoTotal.toFixed(2)),
        promedioTasa: parseFloat(promedioTasa.toFixed(2)),
        totalGanancias: parseFloat(totalGanancias.toFixed(2)),
        totalDocuments: documents.length
      },
      trialWarning: req.trialWarning || null
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo resumen del dashboard'
    });
  }
});

// @route   GET /api/dashboard/by-months
// @desc    Obtener análisis por meses
// @access  Private
router.get('/by-months', protect, checkSubscription, async (req, res) => {
  try {
    const clientId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { clientId };

    const documents = await Document.find(query);

    // Inicializar datos por mes
    const porMeses = mesesList.map(mesCompleto => {
      const mes = mesCompleto.split(' ')[0]; // Extraer solo el nombre del mes
      return {
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        clientes: 0,
        monto: 0,
        ganancias: 0
      };
    });

    documents.forEach(doc => {
      const mergedData = doc.getMergedData();
      const mesIndex = mesesList.findIndex(m => 
        m.toLowerCase().includes(doc.month.toLowerCase())
      );

      if (mesIndex >= 0) {
        mergedData.data.forEach(row => {
          if (row[2] && row[2].toString().trim() !== '') {
            porMeses[mesIndex].clientes++;

            porMeses[mesIndex].monto += parseNumberES(row[6]);
            porMeses[mesIndex].ganancias += parseNumberES(row[10]);
          }
        });
      }
    });

    // Redondear valores
    porMeses.forEach(mes => {
      mes.monto = parseFloat(mes.monto.toFixed(2));
      mes.ganancias = parseFloat(mes.ganancias.toFixed(2));
    });

    res.json({
      success: true,
      porMeses,
      trialWarning: req.trialWarning || null
    });
  } catch (error) {
    console.error('Error obteniendo análisis por meses:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo análisis por meses'
    });
  }
});

// @route   GET /api/dashboard/by-products
// @desc    Obtener conteo por productos
// @access  Private
router.get('/by-products', protect, checkSubscription, async (req, res) => {
  try {
    const clientId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { clientId };

    const documents = await Document.find(query);

    // Inicializar conteo por producto
    const porProductos = productosList.map(producto => ({
      producto,
      total: 0
    }));

    documents.forEach(doc => {
      const mergedData = doc.getMergedData();
      
      mergedData.data.forEach(row => {
        if (row[2] && row[2].toString().trim() !== '') {
          const productoCell = row[5] ? row[5].toString().toLowerCase().trim() : '';
          
          const productIndex = productosList.findIndex(p => 
            p.toLowerCase() === productoCell
          );
          
          if (productIndex >= 0) {
            porProductos[productIndex].total++;
          }
        }
      });
    });

    res.json({
      success: true,
      porProductos,
      trialWarning: req.trialWarning || null
    });
  } catch (error) {
    console.error('Error obteniendo análisis por productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo análisis por productos'
    });
  }
});

// @route   GET /api/dashboard/by-days/:month
// @desc    Obtener análisis por días de un mes específico
// @access  Private
router.get('/by-days/:month', protect, checkSubscription, async (req, res) => {
  try {
    const { month } = req.params;
    const clientId = req.user._id;

    const document = await Document.findOne({
      clientId,
      month,
      year: 2026
    });

    if (!document) {
      return res.json({
        success: true,
        porDias: []
      });
    }

    const mergedData = document.getMergedData();
    const resumenPorDia = {};

    mergedData.data.forEach(row => {
      const fecha = row[0]; // Columna 0 es la fecha
      if (!fecha || !row[2]) return;

      // Extraer día de la fecha (formato: 2026-01-15)
      const dia = fecha.toString().split('-')[2] || fecha.toString();

      if (!resumenPorDia[dia]) {
        resumenPorDia[dia] = {
          dia,
          clientes: 0,
          monto: 0,
          ganancias: 0
        };
      }

      resumenPorDia[dia].clientes++;

      resumenPorDia[dia].monto += parseNumberES(row[6]);
      resumenPorDia[dia].ganancias += parseNumberES(row[10]);
    });

    // Convertir a array y ordenar por día
    const porDias = Object.values(resumenPorDia)
      .sort((a, b) => parseInt(a.dia) - parseInt(b.dia))
      .map(dia => ({
        ...dia,
        monto: parseFloat(dia.monto.toFixed(2)),
        ganancias: parseFloat(dia.ganancias.toFixed(2))
      }));

    res.json({
      success: true,
      porDias,
      trialWarning: req.trialWarning || null
    });
  } catch (error) {
    console.error('Error obteniendo análisis por días:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo análisis por días'
    });
  }
});

// @route   GET /api/dashboard/full
// @desc    Obtener dashboard completo (todas las estadísticas)
// @access  Private
router.get('/full', protect, checkSubscription, async (req, res) => {
  try {
    const clientId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { clientId };

    const documents = await Document.find(query);

    // Calcular todas las estadísticas
    let totalClientes = 0;
    let montoTotal = 0;
    let totalGanancias = 0;
    let sumaPonderadaTasas = 0;
    let sumaMontos = 0;

    // Por meses
    const porMeses = mesesList.map(mesCompleto => {
      const mes = mesCompleto.split(' ')[0];
      return {
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        clientes: 0,
        monto: 0,
        ganancias: 0
      };
    });

    // Por productos
    const porProductos = productosList.map(producto => ({
      producto,
      total: 0
    }));

    documents.forEach(doc => {
      const mergedData = doc.getMergedData();
      const mesIndex = mesesList.findIndex(m => 
        m.toLowerCase().includes(doc.month.toLowerCase())
      );

      mergedData.data.forEach(row => {
        if (row[2] && row[2].toString().trim() !== '') {
          // Totales generales
          totalClientes++;

          const monto = parseNumberES(row[6]);
          montoTotal += monto;
          sumaMontos += monto;

          const tasa = parseNumberES(row[7]);
          sumaPonderadaTasas += tasa * monto;

          const ganancia = parseNumberES(row[10]);
          totalGanancias += ganancia;

          // Por meses
          if (mesIndex >= 0) {
            porMeses[mesIndex].clientes++;
            porMeses[mesIndex].monto += monto;
            porMeses[mesIndex].ganancias += ganancia;
          }

          // Por productos
          const productoCell = row[5] ? row[5].toString().toLowerCase().trim() : '';
          const productIndex = productosList.findIndex(p => 
            p.toLowerCase() === productoCell
          );
          if (productIndex >= 0) {
            porProductos[productIndex].total++;
          }
        }
      });
    });

    // Calcular promedio ponderado
    const promedioTasa = sumaMontos > 0 ? (sumaPonderadaTasas / sumaMontos) : 0;

    // Redondear valores
    porMeses.forEach(mes => {
      mes.monto = parseFloat(mes.monto.toFixed(2));
      mes.ganancias = parseFloat(mes.ganancias.toFixed(2));
    });

    res.json({
      success: true,
      dashboard: {
        totalClientes,
        montoTotal: parseFloat(montoTotal.toFixed(2)),
        promedioTasa: parseFloat(promedioTasa.toFixed(2)),
        totalGanancias: parseFloat(totalGanancias.toFixed(2)),
        totalDocuments: documents.length,
        porMeses,
        porProductos
      },
      trialWarning: req.trialWarning || null
    });
  } catch (error) {
    console.error('Error obteniendo dashboard completo:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo dashboard completo'
    });
  }
});

module.exports = router;

const express = require('express');
const Document = require('../models/Document');
const { protect, ownerOrAdmin, checkSubscription } = require('../middleware/auth');

const router = express.Router();

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
          const montoStr = row[6] ? row[6].toString().replace(/[^0-9.-]/g, '') : '0';
          const monto = parseFloat(montoStr) || 0;
          montoTotal += monto;
          sumaMontos += monto;

          // Tasa (columna 7)
          const tasaStr = row[7] ? row[7].toString().replace(/[^0-9.-]/g, '') : '0';
          const tasa = parseFloat(tasaStr) || 0;
          sumaPonderadaTasas += tasa * monto;

          // Ganancias (columna 10)
          const gananciaStr = row[10] ? row[10].toString().replace(/[^0-9.-]/g, '') : '0';
          const ganancia = parseFloat(gananciaStr) || 0;
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

            const montoStr = row[6] ? row[6].toString().replace(/[^0-9.-]/g, '') : '0';
            porMeses[mesIndex].monto += parseFloat(montoStr) || 0;

            const gananciaStr = row[10] ? row[10].toString().replace(/[^0-9.-]/g, '') : '0';
            porMeses[mesIndex].ganancias += parseFloat(gananciaStr) || 0;
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

      const montoStr = row[6] ? row[6].toString().replace(/[^0-9.-]/g, '') : '0';
      resumenPorDia[dia].monto += parseFloat(montoStr) || 0;

      const gananciaStr = row[10] ? row[10].toString().replace(/[^0-9.-]/g, '') : '0';
      resumenPorDia[dia].ganancias += parseFloat(gananciaStr) || 0;
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

          const montoStr = row[6] ? row[6].toString().replace(/[^0-9.-]/g, '') : '0';
          const monto = parseFloat(montoStr) || 0;
          montoTotal += monto;
          sumaMontos += monto;

          const tasaStr = row[7] ? row[7].toString().replace(/[^0-9.-]/g, '') : '0';
          const tasa = parseFloat(tasaStr) || 0;
          sumaPonderadaTasas += tasa * monto;

          const gananciaStr = row[10] ? row[10].toString().replace(/[^0-9.-]/g, '') : '0';
          const ganancia = parseFloat(gananciaStr) || 0;
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

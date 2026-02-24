import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Aplicar el plugin autoTable a jsPDF
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import './DocumentEditor.css';

export default function DocumentEditor({ month }) {
  const { user, isReadOnlyMode, getTrialStatus } = useAuth();
  const { getMergedData, updateCompletedData, downloadOriginalFile } = useDocuments();
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Estado para el color del PDF (por defecto verde)
  const [pdfColor, setPdfColor] = useState(() => {
    const savedColor = localStorage.getItem('pdfHeaderColor');
    return savedColor ? JSON.parse(savedColor) : [22, 163, 74]; // Verde por defecto
  });
  
  // Colores predefinidos
  const predefinedColors = {
    'Verde': [22, 163, 74],
    'Azul': [37, 99, 235],
    'Rojo': [239, 68, 68],
    'Naranja': [249, 115, 22],
    'Morado': [147, 51, 234],
    'Rosa': [236, 72, 153],
    'Gris': [75, 85, 99],
    'Negro': [0, 0, 0]
  };

  const clientId = user?.id;

  // Columnas exactas del Excel
  const defaultHeaders = [
    'Fecha',
    'Mes',
    'DNI',
    'Nombre y Apellidos',
    'Celular',
    'Producto',
    'Monto',
    'Tasa',
    'Lugar',
    'Observación',
    'Ganancias'
  ];

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

  // Función para obtener los días del mes según calendario 2026
  const getDiasDelMes = (mes) => {
    const meses30 = ['abril', 'junio', 'septiembre', 'noviembre'];
    const mesLower = mes.toLowerCase();
    
    if (mesLower === 'febrero') {
      // 2026 no es bisiesto, febrero tiene 28 días
      return 28;
    } else if (meses30.includes(mesLower)) {
      return 30;
    } else {
      return 31;
    }
  };

  // Generar opciones de días para el mes actual
  const getOpcionesDias = () => {
    const diasEnMes = getDiasDelMes(month);
    const opciones = [];
    for (let i = 1; i <= diasEnMes; i++) {
      opciones.push(i.toString().padStart(2, '0'));
    }
    return opciones;
  };

  useEffect(() => {
    if (!clientId) return;
    
    const merged = getMergedData(clientId, month);
    if (merged) {
      // Usar los headers del documento o los default
      const docHeaders = merged.headers.length > 0 ? merged.headers : defaultHeaders;
      setHeaders(docHeaders);
      
      // Asegurar que haya al menos 50 filas de datos
      let tableData = [...merged.data];
      const numColumns = docHeaders.length;
      
      // Si hay menos de 50 filas, agregar filas vacías
      while (tableData.length < 50) {
        tableData.push(new Array(numColumns).fill(''));
      }
      
      // Asegurar que todas las filas tengan el número correcto de columnas
      tableData = tableData.map(row => {
        if (row.length < numColumns) {
          return [...row, ...new Array(numColumns - row.length).fill('')];
        }
        return row;
      });
      
      setData(tableData);
      
      const initialEdits = {};
      const mesAutomatico = month.toLowerCase() + ' 2026';
      tableData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          let value = cell;
          // La columna Mes (columna 1) se asigna automáticamente según el mes seleccionado
          if (colIndex === 1) {
            value = mesAutomatico;
          }
          // Formatear Monto (columna 6) y Ganancias (columna 10) con puntos
          if ((colIndex === 6 || colIndex === 10) && value) {
            value = formatNumberWithDots(String(value));
          }
          // Asegurar que el valor sea un string
          initialEdits[`${rowIndex}-${colIndex}`] = value !== null && value !== undefined ? String(value) : '';
        });
      });
      setEditedData(initialEdits);
    }
  }, [month, clientId, getMergedData]);

  // Función para formatear números con separadores de miles (puntos)
  const formatNumberWithDots = (value) => {
    // Remover todo excepto números
    const numbersOnly = value.replace(/[^0-9]/g, '');
    // Formatear con puntos cada 3 dígitos
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const key = `${rowIndex}-${colIndex}`;
    
    // Si es columna de Monto (6) o Ganancias (10), formatear con puntos
    let processedValue = value;
    if ((colIndex === 6 || colIndex === 10) && value) {
      processedValue = formatNumberWithDots(value);
    }
    
    setEditedData(prev => ({
      ...prev,
      [key]: processedValue
    }));

    // Si cambia la fecha (columna 0), actualizar mes automáticamente (columna 1)
    if (colIndex === 0 && value) {
      const fecha = new Date(value);
      if (!isNaN(fecha)) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const mesNombre = meses[fecha.getMonth()] + ' 2026';
        setEditedData(prev => ({
          ...prev,
          [`${rowIndex}-1`]: mesNombre
        }));
      }
    }
  };

  const handleSave = async () => {
    if (!clientId) return;
    
    setSaving(true);
    
    // Guardar en el contexto (para el documento)
    Object.entries(editedData).forEach(([key, value]) => {
      const [rowIndex, colIndex] = key.split('-').map(Number);
      updateCompletedData(clientId, month, rowIndex, colIndex, value);
    });

    // Actualizar el estado local data para que se vean los cambios en la página
    setData(prevData => {
      const newData = [...prevData];
      Object.entries(editedData).forEach(([key, value]) => {
        const [rowIndex, colIndex] = key.split('-').map(Number);
        if (newData[rowIndex]) {
          newData[rowIndex] = [...newData[rowIndex]];
          newData[rowIndex][colIndex] = value;
        }
      });
      return newData;
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSaving(false);
    setLastSaved(new Date());
  };

  // Función para obtener el color según la observación
  const getRowColor = (row) => {
    const observacion = String(row[9] || '').toLowerCase().trim();
    
    if (observacion.includes('cobro')) {
      return '#fef3c7'; // Amarillo
    } else if (observacion.includes('pendiente') || observacion.includes('espera')) {
      return '#dcfce7'; // Verde
    } else if (observacion.includes('cancelado')) {
      return '#fee2e2'; // Rojo
    }
    return 'transparent';
  };
  
  // Función para cambiar el color del PDF
  const handleColorChange = (colorName, colorRGB) => {
    setPdfColor(colorRGB);
    localStorage.setItem('pdfHeaderColor', JSON.stringify(colorRGB));
    alert(`Color cambiado a ${colorName}. Los cambios se verán en el próximo PDF.`);
  };

  // Calcular análisis tipo Dashboard
  const dashboard = useMemo(() => {
    // Obtener datos actuales con ediciones
    const currentData = data ? data.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        return editedData[key] !== undefined ? editedData[key] : cell;
      });
    }).filter(row => row[2] && row[2] !== '') : []; // Filtrar filas con DNI (columna 2)

    if (currentData.length === 0) {
      return {
        totalClientes: 0,
        montoTotal: 0,
        promedioTasa: 0,
        totalGanancias: 0,
        porMeses: mesesList.map(m => ({ mes: m, clientes: 0, monto: 0, ganancias: 0 })),
        porProductos: productosList.map(p => ({ producto: p, total: 0 }))
      };
    }

    // Resumen General
    const totalClientes = currentData.length;
    const montoTotal = currentData.reduce((sum, row) => {
      const monto = parseFloat(String(row[6]).replace(/[^0-9.-]/g, '')) || 0;
      return sum + monto;
    }, 0);
    
    // Calcular promedio ponderado de tasas (ponderado por el monto)
    const tasasConMontos = currentData.map(row => {
      const tasa = parseFloat(String(row[7]).replace(/[^0-9.-]/g, '')) || 0;
      const monto = parseFloat(String(row[6]).replace(/[^0-9.-]/g, '')) || 0;
      return { tasa, monto };
    }).filter(item => item.tasa > 0 && item.monto > 0);
    
    const totalMonto = tasasConMontos.reduce((sum, item) => sum + item.monto, 0);
    const sumaPonderada = tasasConMontos.reduce((sum, item) => sum + (item.tasa * item.monto), 0);
    const promedioTasa = totalMonto > 0 ? (sumaPonderada / totalMonto) : 0;
    
    const totalGanancias = currentData.reduce((sum, row) => {
      const ganancia = parseFloat(String(row[10]).replace(/[^0-9.-]/g, '')) || 0;
      return sum + ganancia;
    }, 0);

    // Resumen por Meses
    const porMeses = mesesList.map(mes => {
      const filasMes = currentData.filter(row => {
        const mesRow = String(row[1]).toLowerCase().trim();
        return mesRow === mes;
      });
      
      return {
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        clientes: filasMes.length,
        monto: filasMes.reduce((sum, row) => {
          const monto = parseFloat(String(row[6]).replace(/[^0-9.-]/g, '')) || 0;
          return sum + monto;
        }, 0),
        ganancias: filasMes.reduce((sum, row) => {
          const ganancia = parseFloat(String(row[10]).replace(/[^0-9.-]/g, '')) || 0;
          return sum + ganancia;
        }, 0)
      };
    });

    // Productos y Conteo
    const porProductos = productosList.map(prod => {
      const count = currentData.filter(row => 
        String(row[5]).toLowerCase().trim() === prod.toLowerCase()
      ).length;
      return {
        producto: prod,
        total: count
      };
    });

    return {
      totalClientes,
      montoTotal,
      promedioTasa,
      totalGanancias,
      porMeses,
      porProductos
    };
  }, [data, editedData]);

  // Generar y descargar PDF con los datos y análisis
  const handleDownload = () => {
    if (!clientId) {
      alert('Error: No se pudo identificar el cliente');
      return;
    }
    
    // Verificar si hay datos para descargar
    if (!data || data.length === 0) {
      alert('No hay datos para descargar. Primero complete algunos registros.');
      return;
    }
    
    try {
      // Primero guardar los datos actuales
      Object.entries(editedData).forEach(([key, value]) => {
        const [rowIndex, colIndex] = key.split('-').map(Number);
        updateCompletedData(clientId, month, rowIndex, colIndex, value);
      });

      // Crear PDF
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.text(`Registro de Clientes - ${month} 2026`, 148, 15, { align: 'center' });
      
      // Cliente
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Cliente: ${user?.name || 'N/A'}`, 14, 25);
      doc.text(`Fecha de descarga: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Preparar datos de la tabla - solo filas que tengan al menos un dato
      const tableData = [];
      const rowStyles = [];
      
      data.forEach((row, rowIndex) => {
        const rowData = row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const value = editedData[key] !== undefined ? editedData[key] : cell;
          return value !== null && value !== undefined && value !== 'undefined' ? String(value) : '';
        });
        
        // Solo incluir filas que tengan datos
        if (rowData.some(cell => cell !== '')) {
          tableData.push(rowData);
          
          // Calcular color según observación (columna 9)
          const observacion = String(rowData[9] || '').toLowerCase().trim();
          let fillColor = null;
          
          if (observacion.includes('cobro')) {
            fillColor = [254, 243, 199]; // Amarillo
          } else if (observacion.includes('pendiente') || observacion.includes('espera')) {
            fillColor = [220, 252, 231]; // Verde
          } else if (observacion.includes('cancelado')) {
            fillColor = [254, 226, 226]; // Rojo
          }
          
          rowStyles.push(fillColor);
        }
      });
      
      // Si no hay datos filtrados, mostrar mensaje
      if (tableData.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.text('No hay registros de clientes para mostrar', 148, 50, { align: 'center' });
        doc.save(`Clientes_${month}_2026.pdf`);
        setLastSaved(new Date());
        return;
      }
      
      // Agregar tabla de clientes
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Lista de Clientes', 14, 40);
      
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 45,
        theme: 'grid',
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          overflow: 'linebreak',
          fillColor: [255, 255, 255], // Fondo blanco para TODOS los datos
          textColor: [0, 0, 0] // Texto negro
        },
        headStyles: { 
          fillColor: pdfColor, // Verde para encabezados (Fecha, Mes, DNI, etc.)
          textColor: 255, // Texto blanco
          fontStyle: 'bold'
        },
        // Sin bodyStyles - todos los datos tendrán fondo blanco uniforme
        margin: { top: 45 }
      });
      
      // Agregar Dashboard en nueva página
      doc.addPage();
      
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138);
      doc.text('Dashboard - Análisis de Datos', 148, 15, { align: 'center' });
      
      // Resumen General
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Resumen General', 14, 30);
      
      const summaryData = [
        ['Total de Clientes', dashboard?.totalClientes?.toString() || '0'],
        ['Monto Total (S/)', `S/ ${(dashboard?.montoTotal || 0).toFixed(2)}`],
        ['Promedio Ponderado (%)', `${(dashboard?.promedioTasa || 0).toFixed(2)}%`],
        ['Total Ganancias (S/)', `S/ ${(dashboard?.totalGanancias || 0).toFixed(2)}`]
      ];
      
      doc.autoTable({
        body: summaryData,
        startY: 35,
        theme: 'grid',
        styles: { 
          fontSize: 10, 
          cellPadding: 3,
          fillColor: [255, 255, 255]
        },
        columnStyles: {
          0: { fillColor: pdfColor, textColor: 255, fontStyle: 'bold' },
          1: { fillColor: [255, 255, 255] }
        }
      });
      
      // Resumen por Meses
      const mesesY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80;
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Resumen por Meses', 14, mesesY);
      
      const mesesData = dashboard?.porMeses?.map(m => [
        m.mes,
        m.clientes.toString(),
        `S/ ${m.monto.toFixed(2)}`,
        `S/ ${m.ganancias.toFixed(2)}`
      ]) || [];
      
      doc.autoTable({
        head: [['Mes', 'Clientes', 'Monto Total (S/)', 'Ganancias (S/)']],
        body: mesesData,
        startY: mesesY + 5,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 2,
          fillColor: [255, 255, 255]
        },
        headStyles: { fillColor: pdfColor, textColor: 255 }
      });
      
      // Calcular y agregar resumen por días
      const diasData = calcularResumenPorDias(tableData).map(dia => [
        dia.dia,
        dia.clientes.toString(),
        `S/ ${dia.monto.toFixed(2)}`,
        `S/ ${dia.ganancias.toFixed(2)}`
      ]);
      
      if (diasData.length > 0) {
        const diasY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 100;
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text(`Resumen por Días - ${month} 2026`, 14, diasY);
        
        doc.autoTable({
          head: [['Día', 'Clientes', 'Monto Total (S/)', 'Ganancias (S/)']],
          body: diasData,
          startY: diasY + 5,
          theme: 'grid',
          styles: { 
            fontSize: 9, 
            cellPadding: 2,
            fillColor: [255, 255, 255]
          },
          headStyles: { fillColor: pdfColor, textColor: 255 }
        });
      }
      
      // Productos y Conteo
      const productosY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 140;
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Productos y Conteo', 14, productosY);
      
      const productosData = dashboard?.porProductos?.map(p => [
        p.producto,
        p.total.toString()
      ]) || [];
      
      doc.autoTable({
        head: [['Producto', 'Total']],
        body: productosData,
        startY: productosY + 5,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 2,
          fillColor: [255, 255, 255]
        },
        headStyles: { fillColor: pdfColor, textColor: 255 }
      });
      
      // Pie de página con advertencia de seguridad
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Documento confidencial - Generado por Registro de Clientes', 148, 200, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, 280, 200, { align: 'right' });
      }
      
      // Guardar PDF
      doc.save(`Clientes_${month}_2026.pdf`);
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error al generar PDF:', error);
      console.error('Detalles del error:', error.message, error.stack);
      alert('Error al generar el documento PDF: ' + (error.message || 'Error desconocido'));
    }
  };

  // Calcular resumen por días
  const calcularResumenPorDias = (rows) => {
    const resumenPorDia = {};
    
    rows.forEach(row => {
      const fecha = row[0]; // Columna 0 es la fecha
      if (!fecha) return;
      
      // Extraer solo el día de la fecha (formato: 2026-01-15)
      const dia = fecha.split('-')[2] || fecha;
      
      if (!resumenPorDia[dia]) {
        resumenPorDia[dia] = {
          dia: dia,
          clientes: 0,
          monto: 0,
          ganancias: 0
        };
      }
      
      resumenPorDia[dia].clientes += 1;
      
      // Columna 6 es Monto
      const monto = parseFloat(String(row[6]).replace(/[^0-9.-]/g, '')) || 0;
      resumenPorDia[dia].monto += monto;
      
      // Columna 10 es Ganancias
      const ganancia = parseFloat(String(row[10]).replace(/[^0-9.-]/g, '')) || 0;
      resumenPorDia[dia].ganancias += ganancia;
    });
    
    // Convertir a array y ordenar por día
    return Object.values(resumenPorDia).sort((a, b) => parseInt(a.dia) - parseInt(b.dia));
  };

  // Mostrar vista previa del documento Excel
  const handleShowPreview = () => {
    if (!clientId) return;
    
    try {
      // Guardar datos actuales
      Object.entries(editedData).forEach(([key, value]) => {
        const [rowIndex, colIndex] = key.split('-').map(Number);
        updateCompletedData(clientId, month, rowIndex, colIndex, value);
      });

      // Preparar datos para la vista previa
      const previewRows = data.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const value = editedData[key] !== undefined ? editedData[key] : cell;
          return value !== null && value !== undefined && value !== 'undefined' ? String(value) : '';
        });
      }).filter(row => row.some(cell => cell !== ''));

      // Calcular resumen por días
      const resumenPorDias = calcularResumenPorDias(previewRows);

      setPreviewData({
        headers: headers,
        rows: previewRows,
        dashboard: dashboard,
        resumenPorDias: resumenPorDias
      });
      setShowPreview(true);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error al mostrar vista previa:', error);
      alert('Error al mostrar la vista previa: ' + (error.message || 'Error desconocido'));
    }
  };

  // Cerrar vista previa
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  if (!data) {
    return (
      <div className="editor-empty">
        <h3>No se pudo cargar el documento</h3>
        <p>El documento puede haber sido eliminado o no existe.</p>
      </div>
    );
  }

  const readOnly = isReadOnlyMode(user?.email);
  const trialStatus = getTrialStatus(user?.email);

  return (
    <div className="document-editor-v2">
      {/* Banner de modo solo lectura */}
      {readOnly && (
        <div className="read-only-banner">
          <span className="read-only-icon">🔒</span>
          <div className="read-only-content">
            <strong>Modo Solo Lectura</strong>
            <span>Su período de prueba ha finalizado. Suscríbase para editar.</span>
          </div>
          <button className="read-only-btn" onClick={() => window.location.reload()}>
            Ver Planes
          </button>
        </div>
      )}

      <div className="editor-header-v2">
        <div className="header-content">
          <h2>{month} 2026</h2>
          <p className="client-name">Documento de {user?.name}</p>
        </div>
        
        <div className="header-actions">
          {lastSaved && !readOnly && (
            <span className="save-indicator">
              Guardado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          {!readOnly && (
            <button 
              className={`btn-save-v2 ${saving ? 'saving' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          )}
        </div>
      </div>

      <div className="sheets-container">
        {/* HOJA 1: Clientes */}
        <div className="sheet-section">
          <div className="sheet-header-v2">
            <h3>Hoja 1: Clientes</h3>
            <span className="sheet-badge editable">Editable</span>
          </div>
          
          {/* Leyenda de colores */}
          <div className="color-legend">
            <span className="legend-title">Estados:</span>
            <span className="legend-item yellow">🟡 Cobro</span>
            <span className="legend-item green">🟢 Pendiente/Espera</span>
            <span className="legend-item red">🔴 Cancelado</span>
          </div>
          
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="row-num">#</th>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => {
                  // Calcular color de la fila según observación
                  const currentRow = row.map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    return editedData[key] !== undefined ? editedData[key] : cell;
                  });
                  const rowColor = getRowColor(currentRow);
                  
                  return (
                    <tr key={rowIndex} style={{ backgroundColor: rowColor }}>
                      <td className="row-num">{rowIndex + 1}</td>
                      {row.map((cell, colIndex) => {
                        const key = `${rowIndex}-${colIndex}`;
                        const value = editedData[key] !== undefined ? editedData[key] : cell;
                        
                        // Selector para Producto (columna 5)
                        if (colIndex === 5) {
                          const safeValue = value !== null && value !== undefined && value !== 'undefined' ? value : '';
                          return (
                            <td key={colIndex}>
                              <select
                                value={safeValue}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="data-input"
                                disabled={readOnly}
                              >
                                <option value="">Seleccione...</option>
                                {productosList.map(prod => (
                                  <option key={prod} value={prod}>{prod}</option>
                                ))}
                              </select>
                            </td>
                          );
                        }
                        
                        // Campo de día para Fecha (columna 0) - Solo días según el mes seleccionado
                        if (colIndex === 0) {
                          const diasOptions = getOpcionesDias();
                          const mesNumero = (mesesList.indexOf(month.toLowerCase() + ' 2026') + 1).toString().padStart(2, '0');
                          return (
                            <td key={colIndex}>
                              <select
                                value={value && value !== 'undefined' ? value : ''}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="data-input"
                                disabled={readOnly}
                              >
                                <option value="">Día</option>
                                {diasOptions.map(dia => (
                                  <option key={dia} value={`2026-${mesNumero}-${dia}`}>
                                    {dia}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        }
                        
                        // Campo automático para Mes (columna 1) - Se asigna automáticamente según el mes seleccionado
                        if (colIndex === 1) {
                          const mesAutomatico = month.toLowerCase() + ' 2026';
                          return (
                            <td key={colIndex}>
                              <input
                                type="text"
                                value={mesAutomatico}
                                readOnly
                                className="data-input readonly"
                                title="Mes asignado automáticamente"
                              />
                            </td>
                          );
                        }
                        
                        // Campo de Monto (columna 6) con prefijo S/
                        if (colIndex === 6) {
                          const safeValue = value !== null && value !== undefined && value !== 'undefined' ? value : '';
                          return (
                            <td key={colIndex}>
                              <div className="input-with-prefix">
                                <span className="input-prefix">S/</span>
                                <input
                                  type="text"
                                  value={safeValue}
                                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                  className="data-input prefixed"
                                  placeholder="0.00"
                                  disabled={readOnly}
                                />
                              </div>
                            </td>
                          );
                        }
                        
                        // Campo de Ganancias (columna 10) con prefijo S/
                        if (colIndex === 10) {
                          const safeValue = value !== null && value !== undefined && value !== 'undefined' ? value : '';
                          return (
                            <td key={colIndex}>
                              <div className="input-with-prefix">
                                <span className="input-prefix">S/</span>
                                <input
                                  type="text"
                                  value={safeValue}
                                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                  className="data-input prefixed"
                                  placeholder="0.00"
                                  disabled={readOnly}
                                />
                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={colIndex}>
                            <input
                              type="text"
                              value={value !== null && value !== undefined && value !== 'undefined' ? value : ''}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              className="data-input"
                              placeholder=""
                              disabled={readOnly}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="editor-footer-v2">
        <div className="footer-info">
          <span>Total de filas: {data.length}</span>
          <span>Clientes registrados: {dashboard.totalClientes}</span>
        </div>
        
        {/* Selector de Color para PDF */}
        <div className="color-selector">
          <span className="color-label">Color del PDF:</span>
          <div className="color-options">
            {Object.entries(predefinedColors).map(([name, color]) => (
              <button
                key={name}
                className={`color-btn ${JSON.stringify(pdfColor) === JSON.stringify(color) ? 'active' : ''}`}
                style={{ backgroundColor: `rgb(${color.join(',')})` }}
                onClick={() => handleColorChange(name, color)}
                title={name}
              />
            ))}
          </div>
        </div>
        
        <div className="download-buttons">
          <button className="btn-download-v2 btn-excel" onClick={handleShowPreview}>
            👁️ Vista Previa Documento
          </button>
          <button className="btn-download-v2" onClick={handleDownload}>
            📄 Descargar PDF
          </button>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && previewData && (
        <div className="preview-modal-overlay" onClick={handleClosePreview}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Vista Previa del Documento - {month} 2026</h3>
              <button className="preview-close-btn" onClick={handleClosePreview}>✕</button>
            </div>
            <div className="preview-content">
              <div className="preview-section">
                <h4 className="preview-section-title">📋 Datos de Clientes</h4>
                <div className="preview-excel-table">
                  <table>
                    <thead>
                      <tr>
                        {previewData.headers.map((header, idx) => (
                          <th key={idx}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.length > 0 ? (
                        previewData.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx}>{cell}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={previewData.headers.length} className="no-data">
                            No hay datos registrados aún
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {previewData.dashboard && (
                <div className="preview-section">
                  <h4 className="preview-section-title">📊 DASHBOARD DE ANÁLISIS - AÑO 2026</h4>
                  
                  {/* Instrucciones */}
                  <div className="preview-instrucciones">
                    <p><strong>INSTRUCCIONES:</strong></p>
                    <ol>
                      <li>Ve a la hoja 'Clientes'</li>
                      <li>Escribe fechas del año 2026</li>
                      <li>La columna 'Mes' se actualiza automáticamente</li>
                      <li>En Observaciones usa: <span className="color-cobro">Cobro</span>, <span className="color-pendiente">Pendiente</span> o <span className="color-cancelado">Cancelado</span></li>
                      <li>Los colores se aplican automáticamente:</li>
                    </ol>
                    <div className="preview-leyenda-colores">
                      <span className="leyenda-item yellow">🟡 Amarillo: Cobro</span>
                      <span className="leyenda-item green">🟢 Verde: Pendiente / En espera</span>
                      <span className="leyenda-item red">🔴 Rojo: Cancelado</span>
                    </div>
                  </div>

                  <div className="preview-dashboard">
                    {/* Resumen General */}
                    <div className="preview-resumen-general">
                      <h5>RESUMEN GENERAL - AÑO 2026</h5>
                      <div className="preview-stats-grid">
                        <div className="preview-stat-item">
                          <span className="preview-stat-label">Total de Clientes</span>
                          <span className="preview-stat-value">{previewData.dashboard.totalClientes || 0}</span>
                        </div>
                        <div className="preview-stat-item">
                          <span className="preview-stat-label">Monto Total (S/)</span>
                          <span className="preview-stat-value">{previewData.dashboard.montoTotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="preview-stat-item">
                          <span className="preview-stat-label">Promedio Ponderado (%)</span>
                          <span className="preview-stat-value">{previewData.dashboard.promedioTasa ? previewData.dashboard.promedioTasa.toFixed(2) + '%' : '#¡DIV/0!'}</span>
                        </div>
                        <div className="preview-stat-item">
                          <span className="preview-stat-label">Total Ganancias (S/)</span>
                          <span className="preview-stat-value">{previewData.dashboard.totalGanancias?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumen por Días */}
                    <div className="preview-resumen-dias">
                      <h5>RESUMEN POR DÍAS - {month.toUpperCase()} 2026</h5>
                      <div className="preview-dias-table-container">
                        <table className="preview-dias-table">
                          <thead>
                            <tr>
                              <th className="col-dia-header">Día</th>
                              <th className="col-cliente-header">Clientes</th>
                              <th className="col-numero-header">Monto Total</th>
                              <th className="col-numero-header">Ganancia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.resumenPorDias && previewData.resumenPorDias.length > 0 ? (
                              previewData.resumenPorDias.map((dia, idx) => (
                                <tr key={idx}>
                                  <td className="col-dia">{dia.dia}</td>
                                  <td className="col-cliente">{dia.clientes}</td>
                                  <td className="col-numero">S/ {dia.monto.toFixed(2)}</td>
                                  <td className="col-numero">S/ {dia.ganancias.toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="no-data">No hay datos por día</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Productos y Conteo */}
                    <div className="preview-resumen-productos">
                      <h5>PRODUCTOS Y CONTEO</h5>
                      <div className="preview-productos-table-container">
                        <table className="preview-productos-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.dashboard.porProductos && previewData.dashboard.porProductos.map((prod, idx) => (
                              <tr key={idx}>
                                <td>{prod.producto}</td>
                                <td>{prod.total || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="preview-footer">
              <span>Total de registros: {previewData.rows.length}</span>
              <button className="btn-close-preview" onClick={handleClosePreview}>
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

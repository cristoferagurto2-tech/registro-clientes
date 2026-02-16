import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import * as XLSX from 'xlsx';
import './DocumentEditor.css';

export default function DocumentEditor({ month }) {
  const { user } = useAuth();
  const { getMergedData, updateCompletedData, downloadOriginalFile } = useDocuments();
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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
      tableData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          let value = cell;
          // Convertir números de fecha serial de Excel a texto legible para la columna Mes (columna 1)
          if (colIndex === 1 && typeof value === 'number' && value > 40000) {
            // Es una fecha serial de Excel, convertir a texto del mes
            const fecha = XLSX.SSF.parse_date_code(value);
            if (fecha) {
              const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
              value = meses[fecha.m - 1] + ' 2026';
            }
          }
          // Asegurar que el valor sea un string
          initialEdits[`${rowIndex}-${colIndex}`] = value !== null && value !== undefined ? String(value) : '';
        });
      });
      setEditedData(initialEdits);
    }
  }, [month, clientId, getMergedData]);

  const handleCellChange = (rowIndex, colIndex, value) => {
    const key = `${rowIndex}-${colIndex}`;
    setEditedData(prev => ({
      ...prev,
      [key]: value
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

  // Calcular análisis tipo Dashboard
  const dashboard = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Obtener datos actuales con ediciones
    const currentData = data.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        return editedData[key] !== undefined ? editedData[key] : cell;
      });
    }).filter(row => row[2] && row[2] !== ''); // Filtrar filas con DNI (columna 2)

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
    
    const tasas = currentData.map(row => parseFloat(String(row[7]).replace(/[^0-9.-]/g, '')) || 0)
                             .filter(t => t > 0);
    const promedioTasa = tasas.length > 0 ? tasas.reduce((a, b) => a + b, 0) / tasas.length : 0;
    
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

  // Descargar archivo original modificado
  const handleDownload = () => {
    if (!clientId) return;
    
    try {
      // Primero guardar los datos actuales
      Object.entries(editedData).forEach(([key, value]) => {
        const [rowIndex, colIndex] = key.split('-').map(Number);
        updateCompletedData(clientId, month, rowIndex, colIndex, value);
      });

      // Descargar archivo original modificado
      const blob = downloadOriginalFile(clientId, month);
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Clientes_${month}_2026.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setLastSaved(new Date());
      } else {
        alert('Error al generar el archivo. Por favor intente nuevamente.');
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el documento.');
    }
  };

  if (!data) {
    return (
      <div className="editor-empty">
        <h3>No se pudo cargar el documento</h3>
        <p>El documento puede haber sido eliminado o no existe.</p>
      </div>
    );
  }

  return (
    <div className="document-editor-v2">
      <div className="editor-header-v2">
        <div className="header-content">
          <h2>{month} 2026</h2>
          <p className="client-name">Documento de {user?.name}</p>
        </div>
        
        <div className="header-actions">
          {lastSaved && (
            <span className="save-indicator">
              Guardado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <button 
            className={`btn-save-v2 ${saving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
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
                              >
                                <option value="">Seleccione...</option>
                                {productosList.map(prod => (
                                  <option key={prod} value={prod}>{prod}</option>
                                ))}
                              </select>
                            </td>
                          );
                        }
                        
                        // Campo de fecha para Fecha (columna 0)
                        if (colIndex === 0) {
                          return (
                            <td key={colIndex}>
                              <input
                                type="date"
                                value={value && value !== 'undefined' ? value : ''}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="data-input"
                                placeholder="DD/MM/AAAA"
                              />
                            </td>
                          );
                        }
                        
                        // Campo de selección para Mes (columna 1)
                        if (colIndex === 1) {
                          const safeValue = value !== null && value !== undefined && value !== 'undefined' ? value : '';
                          return (
                            <td key={colIndex}>
                              <select
                                value={safeValue}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="data-input"
                              >
                                <option value="">Seleccione...</option>
                                {mesesList.map(mes => (
                                  <option key={mes} value={mes}>
                                    {mes.charAt(0).toUpperCase() + mes.slice(1)}
                                  </option>
                                ))}
                              </select>
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

        {/* HOJA 2: Dashboard */}
        <div className="sheet-section dashboard">
          <div className="sheet-header-v2">
            <h3>Hoja 2: Dashboard</h3>
            <span className="sheet-badge readonly">Automático</span>
          </div>
          
          <div className="dashboard-content">
            {/* Resumen General */}
            <div className="dashboard-section">
              <h4>📋 Resumen General</h4>
              <div className="summary-grid">
                <div className="summary-card">
                  <span className="summary-label">Total de Clientes</span>
                  <span className="summary-value">{dashboard.totalClientes}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Monto Total (S/)</span>
                  <span className="summary-value">{dashboard.montoTotal.toFixed(2)}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Promedio Tasa (%)</span>
                  <span className="summary-value">{dashboard.promedioTasa.toFixed(2)}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Ganancias (S/)</span>
                  <span className="summary-value">{dashboard.totalGanancias.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Resumen por Meses */}
            <div className="dashboard-section">
              <h4>📅 Resumen por Meses</h4>
              <div className="meses-table-wrapper">
                <table className="meses-table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Clientes</th>
                      <th>Monto Total (S/)</th>
                      <th>Ganancias (S/)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.porMeses.map((mes, index) => (
                      <tr key={index}>
                        <td>{mes.mes}</td>
                        <td className="numero">{mes.clientes}</td>
                        <td className="numero">{mes.monto.toFixed(2)}</td>
                        <td className="numero">{mes.ganancias.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Productos y Conteo */}
            <div className="dashboard-section">
              <h4>📊 Productos y Conteo</h4>
              <div className="productos-grid">
                {dashboard.porProductos.map((prod, index) => (
                  <div key={index} className="producto-card">
                    <span className="producto-nombre">{prod.producto}</span>
                    <span className="producto-total">{prod.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="editor-footer-v2">
        <div className="footer-info">
          <span>Total de filas: {data.length}</span>
          <span>Clientes registrados: {dashboard.totalClientes}</span>
        </div>
        <button className="btn-download-v2" onClick={handleDownload}>
          Descargar Documento Excel Original
        </button>
      </div>
    </div>
  );
}

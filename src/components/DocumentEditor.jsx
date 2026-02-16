import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import * as XLSX from 'xlsx';
import './DocumentEditor.css';

export default function DocumentEditor({ month }) {
  const { user } = useAuth();
  const { getMergedData, updateCompletedData } = useDocuments();
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const clientId = user?.id;

  useEffect(() => {
    if (!clientId) return;
    
    const merged = getMergedData(clientId, month);
    if (merged) {
      setHeaders(merged.headers);
      setData(merged.data);
      
      const initialEdits = {};
      merged.data.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          initialEdits[`${rowIndex}-${colIndex}`] = cell;
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
  };

  const handleSave = async () => {
    if (!clientId) return;
    
    setSaving(true);
    
    Object.entries(editedData).forEach(([key, value]) => {
      const [rowIndex, colIndex] = key.split('-').map(Number);
      updateCompletedData(clientId, month, rowIndex, colIndex, value);
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSaving(false);
    setLastSaved(new Date());
  };

  // Calcular análisis basado en los datos
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const numericData = data.slice(1).map(row => {
      return row.map(cell => {
        const num = parseFloat(cell);
        return isNaN(num) ? 0 : num;
      });
    });

    // Calcular totales por columna (asumiendo que las columnas numéricas están desde la columna 4)
    const totals = {};
    const columnCount = headers.length;
    
    for (let col = 0; col < columnCount; col++) {
      const sum = numericData.reduce((acc, row) => acc + (row[col] || 0), 0);
      if (sum !== 0) {
        totals[col] = {
          header: headers[col] || `Columna ${col + 1}`,
          total: sum,
          count: numericData.filter(row => (row[col] || 0) !== 0).length,
          average: numericData.length > 0 ? sum / numericData.length : 0
        };
      }
    }

    return {
      totalRows: data.length - 1,
      totals: totals,
      hasData: Object.keys(totals).length > 0
    };
  }, [data, headers, editedData]);

  // Preparar datos para la tabla de análisis
  const analysisData = useMemo(() => {
    if (!analysis || !analysis.hasData) return [];
    
    return Object.entries(analysis.totals).map(([col, data]) => ({
      concepto: data.header,
      total: data.total.toFixed(2),
      cantidad: data.count,
      promedio: data.average.toFixed(2)
    }));
  }, [analysis]);

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
          <h2>{month} 2025</h2>
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
        {/* HOJA 1: Registro de Clientes */}
        <div className="sheet-section">
          <div className="sheet-header-v2">
            <h3>Hoja 1: Registro de Clientes</h3>
            <span className="sheet-badge editable">Editable</span>
          </div>
          
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const value = editedData[key] !== undefined ? editedData[key] : cell;
                      
                      return (
                        <td key={colIndex}>
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="data-input"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HOJA 2: Análisis */}
        <div className="sheet-section analysis">
          <div className="sheet-header-v2">
            <h3>Hoja 2: Análisis de Datos</h3>
            <span className="sheet-badge readonly">Automático</span>
          </div>
          
          {analysis && analysis.hasData ? (
            <div className="analysis-content">
              <div className="analysis-summary">
                <div className="summary-card">
                  <span className="summary-label">Total de Registros</span>
                  <span className="summary-value">{analysis.totalRows}</span>
                </div>
              </div>
              
              <div className="analysis-table-wrapper">
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Total</th>
                      <th>Cantidad</th>
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.map((row, index) => (
                      <tr key={index}>
                        <td className="concepto">{row.concepto}</td>
                        <td className="numero">{row.total}</td>
                        <td className="numero">{row.cantidad}</td>
                        <td className="numero">{row.promedio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="analysis-note">
                <strong>Nota:</strong> Este análisis se actualiza automáticamente con los datos de la Hoja 1.
              </div>
            </div>
          ) : (
            <div className="no-analysis">
              <p>Ingrese datos numéricos en la Hoja 1 para ver el análisis automático.</p>
            </div>
          )}
        </div>
      </div>

      <div className="editor-footer-v2">
        <div className="footer-info">
          <span>Total de filas: {data.length}</span>
          <span>Columnas: {headers.length}</span>
        </div>
        <button className="btn-download-v2" onClick={handleSave}>
          Descargar Documento Completo
        </button>
      </div>
    </div>
  );
}

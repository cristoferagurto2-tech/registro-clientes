import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import * as XLSX from 'xlsx';
import './DocumentEditor.css';

export default function DocumentEditor({ month }) {
  const { user, isAdmin } = useAuth();
  const { getMergedData, updateCompletedData } = useDocuments();
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Determinar qué cliente estamos viendo
  // Si es admin, necesitamos saber qué cliente está seleccionado
  // Si es cliente, usamos su propio ID
  const clientId = user?.id;

  useEffect(() => {
    if (!clientId) return;
    
    const merged = getMergedData(clientId, month);
    if (merged) {
      setHeaders(merged.headers);
      setData(merged.data);
      
      // Cargar datos editados previos
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
    
    // Guardar cada celda editada
    Object.entries(editedData).forEach(([key, value]) => {
      const [rowIndex, colIndex] = key.split('-').map(Number);
      updateCompletedData(clientId, month, rowIndex, colIndex, value);
    });

    // Simular delay para mostrar feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSaving(false);
    setLastSaved(new Date());
  };

  const handleDownload = () => {
    if (!data) return;
    
    // Crear workbook con los datos actuales
    const wsData = [headers];
    data.forEach((row, rowIndex) => {
      const newRow = row.map((cell, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        return editedData[key] !== undefined ? editedData[key] : cell;
      });
      wsData.push(newRow);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, month);
    
    // Descargar archivo
    const clientName = user?.name || 'Cliente';
    XLSX.writeFile(wb, `${month}_2025_${clientName.replace(/\s+/g, '_')}.xlsx`);
  };

  if (!data) {
    return (
      <div className="editor-empty">
        <span className="empty-icon">📄</span>
        <h3>No se pudo cargar el documento</h3>
        <p>El documento puede haber sido eliminado o no existe.</p>
      </div>
    );
  }

  return (
    <div className="document-editor">
      <div className="editor-header">
        <div className="editor-title">
          <h2>📝 {month} 2025</h2>
          <p>Completa los datos en las celdas. Los cambios se guardan cuando presionas "Guardar".</p>
        </div>
        
        <div className="editor-actions">
          {lastSaved && (
            <span className="last-saved">
              💾 Guardado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <button 
            className={`btn-save ${saving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
          </button>
          
          <button className="btn-download" onClick={handleDownload}>
            📥 Descargar Excel
          </button>
        </div>
      </div>

      <div className="editor-table-container">
        <table className="editor-table">
          <thead>
            <tr>
              <th className="row-header">#</th>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="row-number">{rowIndex + 1}</td>
                {row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  const value = editedData[key] !== undefined ? editedData[key] : cell;
                  
                  return (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="cell-input"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="editor-footer">
        <div className="editor-info">
          <span>📊 {data.length} filas</span>
          <span>📋 {headers.length} columnas</span>
        </div>
        
        <div className="client-notice">
          <span>💡</span>
          <p>Este es tu documento personal. Solo tú puedes ver y editar estos datos.</p>
        </div>
      </div>
    </div>
  );
}

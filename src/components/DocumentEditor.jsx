import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import * as XLSX from 'xlsx';
import './DocumentEditor.css';

export default function DocumentEditor({ month }) {
  const { user } = useAuth();
  const { getMergedData, updateCompletedData, downloadOriginalFile } = useDocuments();
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [sheetNames, setSheetNames] = useState([]);
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
      setSheetNames(merged.sheetNames || []);
      
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

  const handleDownloadOriginal = () => {
    if (!clientId) return;
    const success = downloadOriginalFile(clientId, month);
    if (success) {
      setLastSaved(new Date());
    }
  };

  const handleDownloadEdited = () => {
    if (!data) return;
    
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
    
    const clientName = user?.name || 'Cliente';
    const fileName = `${month}_2025_${clientName.replace(/\s+/g, '_')}_editado.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  };

  if (!data) {
    return (
      <div className="editor-empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#217346" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h3>No se pudo cargar el documento</h3>
        <p>El documento puede haber sido eliminado o no existe.</p>
      </div>
    );
  }

  return (
    <div className="document-editor">
      <div className="editor-header">
        <div className="editor-title">
          <div className="excel-icon">Excel</div>
          <div>
            <h2>{month} 2025</h2>
            <p>Documento de {user?.name}</p>
          </div>
        </div>
        
        <div className="editor-actions">
          {lastSaved && (
            <span className="last-saved">
              Actualizado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <button 
            className={`btn-save ${saving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="editor-toolbar">
        <div className="sheet-info">
          <div className="info-badge">
            <span className="badge-label">Hojas:</span>
            <span className="badge-value">{sheetNames.length}</span>
          </div>
          {sheetNames.length > 0 && (
            <div className="sheet-list">
              {sheetNames.map((name, idx) => (
                <span key={name} className={`sheet-tag ${idx === 0 ? 'active' : ''}`}>
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="download-options">
          <button className="btn-download-original" onClick={handleDownloadOriginal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar Original
          </button>
          
          <button className="btn-download-edited" onClick={handleDownloadEdited}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar Editado
          </button>
        </div>
      </div>

      <div className="editor-notice">
        <div className="notice-content">
          <strong>Nota importante:</strong> Este documento tiene {sheetNames.length} hoja{sheetNames.length !== 1 ? 's' : ''}. 
          La edición en línea solo modifica la primera hoja "{sheetNames[0] || 'Hoja1'}". 
          Para ver todas las hojas con fórmulas y formato original, use "Descargar Original".
        </div>
      </div>

      <div className="editor-table-container">
        <div className="sheet-header">
          <span className="sheet-name">{sheetNames[0] || 'Hoja1'}</span>
          <span className="sheet-stats">{data.length} filas × {headers.length} columnas</span>
        </div>
        
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
    </div>
  );
}

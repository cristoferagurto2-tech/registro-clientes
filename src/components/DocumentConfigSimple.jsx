import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './DocumentConfigSimple.css';

export default function DocumentConfigSimple() {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar configuración actual
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDocumentConfig();
      if (response.success) {
        setHeaders(response.config.headers);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setMessage('Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, `Columna ${headers.length + 1}`]);
  };

  const handleRemoveHeader = (index) => {
    if (headers.length <= 1) {
      setMessage('Debe haber al menos un header');
      return;
    }
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Filtrar headers vacíos
      const validHeaders = headers.filter(h => h.trim() !== '');
      
      if (validHeaders.length === 0) {
        setMessage('Error: Debe haber al menos un header válido');
        return;
      }
      
      const response = await adminAPI.updateDocumentConfig(validHeaders);
      
      if (response.success) {
        setMessage('✅ Configuración guardada correctamente');
      }
    } catch (error) {
      console.error('Error guardando:', error);
      setMessage('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToAll = async () => {
    if (!window.confirm('¿Aplicar esta configuración a TODOS los clientes?\n\nEsto reemplazará los documentos actuales de todos los clientes.')) {
      return;
    }

    try {
      setApplying(true);
      setMessage('Aplicando configuración...');
      
      const response = await adminAPI.applyDocumentConfig();
      
      if (response.success) {
        setMessage(`✅ Configuración aplicada a ${response.clientsUpdated} clientes (${response.documentsCreated} documentos)`);
      }
    } catch (error) {
      console.error('Error aplicando:', error);
      setMessage(error.error || 'Error aplicando configuración');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="document-config-simple">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="document-config-simple">
      <div className="config-header">
        <h3>Documento Oficial</h3>
        <p>Configure las columnas que aparecerán en los documentos de todos los clientes.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="headers-section">
        <h4>Columnas (Headers)</h4>
        <div className="headers-list">
          {headers.map((header, index) => (
            <div key={index} className="header-item">
              <span className="header-number">{index + 1}</span>
              <input
                type="text"
                value={header}
                onChange={(e) => handleHeaderChange(index, e.target.value)}
                className="header-input"
                placeholder={`Columna ${index + 1}`}
              />
              <button 
                className="btn-remove"
                onClick={() => handleRemoveHeader(index)}
                title="Eliminar columna"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
        
        <button className="btn-add" onClick={handleAddHeader}>
          + Agregar Columna
        </button>
      </div>

      <div className="actions-section">
        <button 
          className="btn-apply"
          onClick={handleApplyToAll}
          disabled={applying}
        >
          {applying ? 'Aplicando...' : 'Aplicar a Todos los Clientes'}
        </button>
        <p style={{marginTop: '12px', fontSize: '13px', color: '#6b7280'}}>
          Esta acción creará o reemplazará los documentos de todos los clientes con esta configuración.
        </p>
      </div>
    </div>
  );
}

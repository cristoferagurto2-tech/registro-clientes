import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { adminAPI } from '../services/api';
import './DocumentConfigSimple.css';

export default function DocumentConfigSimple() {
  const [headers, setHeaders] = useState([]);
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar configuración actual
  useEffect(() => {
    loadConfig();
  }, []);

  // Detectar cambios
  useEffect(() => {
    const changed = JSON.stringify(headers) !== JSON.stringify(originalHeaders);
    setHasChanges(changed);
  }, [headers, originalHeaders]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDocumentConfig();
      if (response.success) {
        setHeaders(response.config.headers);
        setOriginalHeaders(response.config.headers);
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

  const handleAddHeader = (index = null) => {
    const newHeader = `Columna ${headers.length + 1}`;
    let newHeaders;
    
    if (index !== null) {
      // Insertar en posición específica
      newHeaders = [
        ...headers.slice(0, index),
        newHeader,
        ...headers.slice(index)
      ];
    } else {
      // Agregar al final
      newHeaders = [...headers, newHeader];
    }
    
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index) => {
    if (headers.length <= 1) {
      setMessage('Debe haber al menos una columna');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(headers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setHeaders(items);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Filtrar headers vacíos
      const validHeaders = headers.filter(h => h.trim() !== '');
      
      if (validHeaders.length === 0) {
        setMessage('Error: Debe haber al menos una columna válida');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const response = await adminAPI.updateDocumentConfig(validHeaders);
      
      if (response.success) {
        setOriginalHeaders(validHeaders);
        setHeaders(validHeaders);
        setMessage('✅ Configuración guardada correctamente');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      setMessage('Error guardando configuración');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToAll = async () => {
    // Si hay cambios sin guardar, advertir
    if (hasChanges) {
      const confirm = window.confirm('Tienes cambios sin guardar. ¿Deseas guardarlos antes de aplicar a todos los clientes?\n\n• Presiona "Aceptar" para guardar y aplicar\n• Presiona "Cancelar" para aplicar sin guardar (los cambios actuales no se guardarán)');
      
      if (confirm) {
        await handleSave();
      }
    }

    if (!window.confirm('¿Aplicar esta configuración a TODOS los clientes?\n\nEsto reemplazará los documentos actuales de todos los clientes con estas columnas.')) {
      return;
    }

    try {
      setApplying(true);
      setMessage('Aplicando configuración...');
      
      const response = await adminAPI.applyDocumentConfig();
      
      if (response.success) {
        setMessage(`✅ Configuración aplicada a ${response.clientsUpdated} clientes (${response.documentsCreated} documentos creados)`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error aplicando:', error);
      setMessage(error.error || 'Error aplicando configuración');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    if (hasChanges && !window.confirm('¿Descartar cambios no guardados?')) {
      return;
    }
    setHeaders([...originalHeaders]);
    setMessage('');
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
        {hasChanges && (
          <div className="unsaved-indicator">
            ⚠️ Tienes cambios sin guardar
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="headers-section">
        <h4>Columnas (Headers)</h4>
        <p className="section-hint">
          Arrastra las columnas para reordenarlas. Usa los botones [+] para insertar nuevas columnas.
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="headers-list">
            {(provided) => (
              <div 
                className="headers-list" 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {/* Botón insertar al inicio */}
                <button 
                  className="btn-insert" 
                  onClick={() => handleAddHeader(0)}
                  title="Insertar columna al inicio"
                >
                  + Insertar columna aquí
                </button>

                {headers.map((header, index) => (
                  <Draggable key={`header-${index}`} draggableId={`header-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`header-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        {/* Handle para arrastrar */}
                        <div 
                          className="drag-handle"
                          {...provided.dragHandleProps}
                          title="Arrastrar para reordenar"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="4" cy="4" r="1.5"/>
                            <circle cx="8" cy="4" r="1.5"/>
                            <circle cx="12" cy="4" r="1.5"/>
                            <circle cx="4" cy="8" r="1.5"/>
                            <circle cx="8" cy="8" r="1.5"/>
                            <circle cx="12" cy="8" r="1.5"/>
                            <circle cx="4" cy="12" r="1.5"/>
                            <circle cx="8" cy="12" r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                          </svg>
                        </div>
                        
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
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Botón agregar al final */}
                <button className="btn-add-end" onClick={() => handleAddHeader()}>
                  + Agregar columna al final
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="actions-section">
        <div className="actions-row">
          <button 
            className="btn-save"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
          </button>
          
          {hasChanges && (
            <button 
              className="btn-reset"
              onClick={handleReset}
              disabled={saving}
            >
              ↺ Descartar cambios
            </button>
          )}
        </div>

        <div className="divider"></div>

        <button 
          className="btn-apply"
          onClick={handleApplyToAll}
          disabled={applying}
        >
          {applying ? 'Aplicando...' : 'Aplicar a Todos los Clientes'}
        </button>
        <p className="apply-hint">
          Esta acción creará o reemplazará los documentos de todos los clientes con esta configuración.
          {hasChanges && ' Se aplicarán los cambios guardados.'}
        </p>
      </div>
    </div>
  );
}

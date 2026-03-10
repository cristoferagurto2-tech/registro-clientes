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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(headers) !== JSON.stringify(originalHeaders);
    setHasChanges(changed);
  }, [headers, originalHeaders]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await adminAPI.getDocumentConfig();
      
      if (response.success && response.config && Array.isArray(response.config.headers)) {
        setHeaders(response.config.headers);
        setOriginalHeaders(response.config.headers);
      } else {
        // Usar valores por defecto si no hay configuración
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
        setHeaders(defaultHeaders);
        setOriginalHeaders(defaultHeaders);
        setMessage('Usando configuración por defecto');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      // Usar valores por defecto en caso de error
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
      setHeaders(defaultHeaders);
      setOriginalHeaders(defaultHeaders);
      setMessage('Error al cargar. Usando configuración por defecto.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditValue(headers[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newHeaders = [...headers];
      newHeaders[editingIndex] = editValue.trim() || `Columna ${editingIndex + 1}`;
      setHeaders(newHeaders);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAddHeader = (index = null) => {
    const newHeader = `Columna ${headers.length + 1}`;
    let newHeaders;
    
    if (index !== null) {
      newHeaders = [
        ...headers.slice(0, index),
        newHeader,
        ...headers.slice(index)
      ];
    } else {
      newHeaders = [...headers, newHeader];
    }
    
    setHeaders(newHeaders);
    setTimeout(() => {
      const newIndex = index !== null ? index : newHeaders.length - 1;
      handleStartEdit(newIndex);
    }, 100);
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
      
      // Verificar que headers sea un array
      if (!Array.isArray(headers)) {
        setMessage('Error: No hay columnas para guardar');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const validHeaders = headers.filter(h => h && typeof h === 'string' && h.trim() !== '');
      
      if (validHeaders.length === 0) {
        setMessage('Error: Debe haber al menos una columna válida');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const response = await adminAPI.updateDocumentConfig(validHeaders);
      
      if (response.success) {
        setOriginalHeaders(validHeaders);
        setHeaders(validHeaders);
        setMessage('Configuración guardada correctamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error: ' + (response.error || 'No se pudo guardar'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      setMessage('Error guardando configuración: ' + (error.message || 'Error de conexión'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToAll = async () => {
    if (hasChanges) {
      const confirm = window.confirm('Tienes cambios sin guardar. ¿Deseas guardarlos antes de aplicar?\n\n• Aceptar: Guardar y aplicar\n• Cancelar: Aplicar sin guardar');
      if (confirm) {
        await handleSave();
      }
    }

    if (!window.confirm('¿Aplicar esta configuración a TODOS los clientes?\n\nEsto reemplazará los documentos actuales.')) {
      return;
    }

    try {
      setApplying(true);
      setMessage('Aplicando configuración...');
      
      const response = await adminAPI.applyDocumentConfig();
      
      if (response.success) {
        setMessage(`Configuración aplicada a ${response.clientsUpdated} clientes`);
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
    setEditingIndex(null);
    setMessage('');
  };

  if (loading) {
    return (
      <div className="document-config-simple">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-config-simple">
      <div className="config-header">
        <div className="header-title-row">
          <h3>Documento Oficial</h3>
          {hasChanges && (
            <span className="unsaved-badge">Cambios sin guardar</span>
          )}
        </div>
        <p className="header-description">
          Configura las columnas de los documentos. Doble-click para editar, arrastra para mover.
        </p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="table-preview-container">
        <div className="table-header">
          <span>Vista previa de columnas</span>
          <span className="column-count">{headers.length} columnas</span>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="headers-table" direction="horizontal">
            {(provided) => (
              <div 
                className="headers-table-wrapper"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className="headers-table">
                  {headers.length === 0 ? (
                    <div className="no-columns-message">
                      <p>No hay columnas configuradas</p>
                      <button 
                        className="btn-add-first"
                        onClick={() => handleAddHeader()}
                      >
                        + Agregar primera columna
                      </button>
                    </div>
                  ) : (
                    headers.map((header, index) => (
                    <Draggable 
                      key={`header-${index}`} 
                      draggableId={`header-${index}`} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`table-cell ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <button 
                            className="insert-btn before"
                            onClick={() => handleAddHeader(index)}
                            title="Insertar columna aquí"
                          >
                            +
                          </button>

                          <div 
                            className="cell-drag-handle"
                            {...provided.dragHandleProps}
                            title="Arrastrar para mover"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <circle cx="2" cy="2" r="1.5"/>
                              <circle cx="6" cy="2" r="1.5"/>
                              <circle cx="10" cy="2" r="1.5"/>
                              <circle cx="2" cy="6" r="1.5"/>
                              <circle cx="6" cy="6" r="1.5"/>
                              <circle cx="10" cy="6" r="1.5"/>
                              <circle cx="2" cy="10" r="1.5"/>
                              <circle cx="6" cy="10" r="1.5"/>
                              <circle cx="10" cy="10" r="1.5"/>
                            </svg>
                          </div>

                          <div className="cell-content">
                            {editingIndex === index ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="inline-edit-input"
                              />
                            ) : (
                              <span 
                                className="header-text"
                                onDoubleClick={() => handleStartEdit(index)}
                                title="Doble-click para editar"
                              >
                                {header}
                              </span>
                            )}
                          </div>

                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveHeader(index)}
                            title="Eliminar columna"
                          >
                            ×
                          </button>

                          <span className="column-number">{index + 1}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  <button 
                    className="add-column-btn"
                    onClick={() => handleAddHeader()}
                    title="Agregar columna al final"
                  >
                    <span className="plus-icon">+</span>
                    <span className="btn-text">Agregar</span>
                  </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="table-hint">
          Doble-click para editar • Arrastra para reordenar
        </div>
      </div>

      <div className="actions-section">
        <div className="actions-row">
          <button 
            className="btn-save"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          
          {hasChanges && (
            <button 
              className="btn-reset"
              onClick={handleReset}
              disabled={saving}
            >
              Descartar
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
          Esta acción creará documentos con {headers.length} columnas para todos los clientes.
        </p>
      </div>
    </div>
  );
}

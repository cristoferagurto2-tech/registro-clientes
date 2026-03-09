import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './OfficialTemplateManager.css';

export default function OfficialTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [officialTemplate, setOfficialTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    headers: [],
    data: []
  });
  // Estados para subir archivo Excel
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTemplateName, setUploadTemplateName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Cargar plantillas al iniciar
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [templatesRes, officialRes] = await Promise.all([
        adminAPI.getTemplates(),
        adminAPI.getOfficialTemplate().catch(() => null)
      ]);
      
      if (templatesRes.success) {
        setTemplates(templatesRes.templates);
      }
      
      if (officialRes?.success) {
        setOfficialTemplate(officialRes.template);
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      setMessage('Error cargando plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    if (!newTemplate.name) {
      setMessage('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      // Headers por defecto del sistema
      const defaultHeaders = [
        'Fecha', 'Mes', 'DNI', 'Nombre y Apellidos', 'Celular',
        'Producto', 'Monto', 'Tasa', 'Lugar', 'Observación', 'Ganancias'
      ];
      
      // Crear estructura de datos vacía (50 filas)
      const emptyData = Array(50).fill(null).map(() => Array(11).fill(''));
      
      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        headers: defaultHeaders,
        data: emptyData,
        completedData: [],
        isOfficial: false
      };
      
      const response = await adminAPI.createTemplate(templateData);
      
      if (response.success) {
        setMessage('Plantilla creada correctamente');
        setShowCreateModal(false);
        setNewTemplate({ name: '', description: '', headers: [], data: [] });
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error creando plantilla:', error);
      setMessage(error.error || 'Error creando plantilla');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAsOfficial = async (templateId) => {
    if (!window.confirm('¿Establecer esta plantilla como OFICIAL?\n\nLos nuevos clientes recibirán automáticamente esta plantilla al registrarse.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.setTemplateAsOfficial(templateId);
      
      if (response.success) {
        setMessage('Plantilla oficial establecida correctamente');
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error estableciendo plantilla oficial:', error);
      setMessage(error.error || 'Error estableciendo plantilla oficial');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('¿Eliminar esta plantilla?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.deleteTemplate(templateId);
      
      if (response.success) {
        setMessage('Plantilla eliminada correctamente');
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error eliminando plantilla:', error);
      setMessage(error.error || 'Error eliminando plantilla');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToAll = async () => {
    if (!window.confirm('¿Aplicar la plantilla oficial a TODOS los clientes existentes?\n\nEsto reemplazará los documentos actuales de todos los clientes para el año 2026.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.applyTemplateToAllClients(2026);
      
      if (response.success) {
        setMessage(`Plantilla aplicada a ${response.clientsUpdated} clientes (${response.documentsCreated} documentos creados)`);
        setShowApplyModal(false);
      }
    } catch (error) {
      console.error('Error aplicando plantilla:', error);
      setMessage(error.error || 'Error aplicando plantilla a los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de archivo Excel
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar extensión
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileExtension.endsWith(ext));
      
      if (!isValid) {
        setMessage('Error: Solo se permiten archivos Excel (.xlsx, .xls)');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      // Sugerir nombre basado en el archivo
      if (!uploadTemplateName) {
        const suggestedName = file.name.replace(/\.[^/.]+$/, '');
        setUploadTemplateName(suggestedName);
      }
      setMessage('');
    }
  };

  // Subir archivo Excel como plantilla oficial
  const handleUploadExcel = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Por favor selecciona un archivo Excel');
      return;
    }

    try {
      setIsUploading(true);
      setMessage('Subiendo archivo Excel...');
      
      const response = await adminAPI.uploadTemplateFile(
        selectedFile, 
        uploadTemplateName || selectedFile.name.replace(/\.[^/.]+$/, ''),
        'Plantilla subida desde archivo Excel'
      );
      
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        setSelectedFile(null);
        setUploadTemplateName('');
        // Resetear input file
        const fileInput = document.getElementById('excel-file-input');
        if (fileInput) fileInput.value = '';
        // Recargar plantillas
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error subiendo Excel:', error);
      setMessage(error.error || 'Error subiendo el archivo Excel');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="official-template-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando plantillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="official-template-manager">
      <div className="template-header">
        <h3>Gestión de Documento Oficial</h3>
        <p>Configure la plantilla que se asignará automáticamente a los nuevos clientes</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Plantilla Oficial Actual */}
      <div className="official-template-section">
        <h4>Plantilla Oficial Actual</h4>
        {officialTemplate ? (
          <div className="official-card">
            <div className="official-badge">OFICIAL</div>
            <div className="template-info">
              <h5>{officialTemplate.name}</h5>
              <p>{officialTemplate.description || 'Sin descripción'}</p>
              <div className="template-meta">
                <span>Creada: {new Date(officialTemplate.createdAt).toLocaleDateString()}</span>
                <span>Headers: {officialTemplate.headers?.length || 0} columnas</span>
                <span>Filas: {officialTemplate.data?.length || 0}</span>
              </div>
            </div>
            <div className="template-actions">
              <button 
                className="btn-apply"
                onClick={() => setShowApplyModal(true)}
              >
                Aplicar a Todos los Clientes
              </button>
            </div>
          </div>
        ) : (
          <div className="no-official">
            <p>No hay plantilla oficial configurada</p>
            <p className="hint">Suba un archivo Excel o cree una plantilla para que los nuevos clientes la reciban automáticamente.</p>
          </div>
        )}
      </div>

      {/* Subir Archivo Excel */}
      <div className="upload-excel-section">
        <h4>📁 Subir Documento Oficial desde Excel</h4>
        <p className="upload-description">
          Sube tu archivo Excel y se convertirá automáticamente en la plantilla oficial. 
          Se usará la primera hoja del archivo.
        </p>
        
        <form onSubmit={handleUploadExcel} className="upload-form">
          <div className="upload-input-group">
            <div className="file-input-wrapper">
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="file-input"
              />
              <label htmlFor="excel-file-input" className="file-label">
                {selectedFile ? '📄 ' + selectedFile.name : 'Haz clic para seleccionar archivo Excel'}
              </label>
            </div>
            
            {selectedFile && (
              <div className="file-info">
                <span className="file-size">
                  Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          <div className="upload-input-group">
            <label>Nombre de la Plantilla (opcional)</label>
            <input
              type="text"
              value={uploadTemplateName}
              onChange={(e) => setUploadTemplateName(e.target.value)}
              placeholder="Ej: Documento Oficial 2026"
              disabled={isUploading}
              className="template-name-input"
            />
          </div>

          <div className="upload-actions">
            <button 
              type="submit" 
              className="btn-upload-excel"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spinner-small"></span>
                  Subiendo...
                </>
              ) : (
                'Subir como Plantilla Oficial'
              )}
            </button>
          </div>

          <div className="upload-info">
            <p>✓ Se extraerán los headers de la primera fila</p>
            <p>✓ Se creará una estructura vacía para nuevos clientes</p>
            <p>✓ Se establecerá automáticamente como oficial</p>
          </div>
        </form>
      </div>

      {/* Lista de Plantillas */}
      <div className="templates-list-section">
        <div className="section-header">
          <h4>Todas las Plantillas ({templates.length})</h4>
          <button 
            className="btn-create"
            onClick={() => setShowCreateModal(true)}
          >
            + Crear Nueva Plantilla
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="empty-templates">
            <p>No hay plantillas creadas</p>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map(template => (
              <div 
                key={template.id} 
                className={`template-card ${template.isOfficial ? 'is-official' : ''}`}
              >
                {template.isOfficial && <div className="official-tag">OFICIAL</div>}
                <div className="template-card-info">
                  <h5>{template.name}</h5>
                  <p>{template.description || 'Sin descripción'}</p>
                  <span className="template-date">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="template-card-actions">
                  {!template.isOfficial && (
                    <button 
                      className="btn-make-official"
                      onClick={() => handleSetAsOfficial(template.id)}
                      title="Establecer como oficial"
                    >
                      Hacer Oficial
                    </button>
                  )}
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Eliminar plantilla"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Plantilla */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Crear Nueva Plantilla</h4>
              <button 
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Nombre de la Plantilla *</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Ej: Documento Oficial 2026"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Descripción opcional..."
                  rows="3"
                />
              </div>
              <div className="form-info">
                <p>La plantilla se creará con:</p>
                <ul>
                  <li>Headers predeterminados del sistema</li>
                  <li>50 filas vacías para datos</li>
                  <li>Estructura compatible con el sistema actual</li>
                </ul>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aplicar a Todos */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal warning-modal">
            <div className="modal-header">
              <h4>⚠️ Aplicar Plantilla a Todos los Clientes</h4>
              <button 
                className="btn-close"
                onClick={() => setShowApplyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="warning-box">
                <p><strong>¡Atención!</strong></p>
                <p>Esta acción reemplazará los documentos de <strong>todos los clientes existentes</strong> para el año 2026.</p>
                <ul>
                  <li>Los datos actuales de los clientes serán reemplazados</li>
                  <li>Se crearán 12 documentos mensuales por cliente</li>
                  <li>Esta acción no se puede deshacer</li>
                </ul>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-confirm-warning"
                  onClick={handleApplyToAll}
                  disabled={loading}
                >
                  {loading ? 'Aplicando...' : 'Sí, Aplicar a Todos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

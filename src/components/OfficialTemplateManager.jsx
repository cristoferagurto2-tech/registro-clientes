import { useState } from 'react';
import { adminAPI } from '../services/api';
import './OfficialTemplateManager.css';

export default function OfficialTemplateManager() {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTemplateName, setUploadTemplateName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      }
    } catch (error) {
      console.error('Error subiendo Excel:', error);
      setMessage(error.error || 'Error subiendo el archivo Excel');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="official-template-manager">
      <div className="template-header">
        <h3>Documento Oficial</h3>
        <p>Sube tu archivo Excel para establecerlo como el documento oficial. Este será asignado automáticamente a todos los clientes nuevos.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Subir Archivo Excel */}
      <div className="upload-excel-section simplified">
        <h4>📁 Subir Archivo Excel</h4>
        <p className="upload-description">
          Selecciona tu archivo Excel (.xlsx o .xls). Se usará la primera hoja y se extraerán los headers automáticamente.
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
            <label>Nombre del Documento (opcional)</label>
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
                'Subir como Documento Oficial'
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
    </div>
  );
}

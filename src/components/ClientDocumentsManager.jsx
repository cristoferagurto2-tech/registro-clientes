import { useState } from 'react';
import { useDocuments } from '../context/DocumentsContext';
import './ClientDocumentsManager.css';

export default function ClientDocumentsManager({ client, onBack }) {
  const { 
    MESES, 
    uploadDocument, 
    deleteDocument, 
    hasDocument, 
    getClientDocuments 
  } = useDocuments();
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);

  const clientDocs = getClientDocuments(client.id);

  const handleFileUpload = async (month, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage('Error: Por favor suba un archivo Excel (.xlsx o .xls)');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await uploadDocument(client.id, month, file);
      setMessage(`Documento de ${month} subido correctamente`);
    } catch (error) {
      setMessage(`Error al subir: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = (month) => {
    if (window.confirm(`¿Eliminar el documento de ${month} para ${client.name}?`)) {
      deleteDocument(client.id, month);
      setMessage(`Documento de ${month} eliminado`);
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage('Error: Por favor suba un archivo Excel (.xlsx o .xls)');
      event.target.value = '';
      return;
    }

    if (!window.confirm(`¿Está seguro de asignar el archivo "${file.name}" a TODOS los meses para ${client.name}?\n\nEsto reemplazará cualquier documento existente.`)) {
      event.target.value = '';
      return;
    }

    setBulkUploading(true);
    setMessage('Asignando documento a todos los meses...');

    try {
      // Crear una copia del archivo para cada mes (evita problemas de lectura concurrente)
      const fileBuffer = await file.arrayBuffer();
      
      // Subir el archivo a todos los meses uno por uno
      for (let i = 0; i < MESES.length; i++) {
        const month = MESES[i];
        // Crear un nuevo File objeto para cada mes desde el buffer
        const monthFile = new File([fileBuffer], file.name, { type: file.type });
        await uploadDocument(client.id, month, monthFile);
        
        // Actualizar mensaje de progreso
        setMessage(`Asignando documento... (${i + 1}/${MESES.length} meses)`);
      }
      
      setMessage(`¡Éxito! Documento "${file.name}" asignado a todos los meses`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error en subida masiva:', error);
      setMessage(`Error al asignar: ${error.message || 'Error desconocido'}`);
    } finally {
      setBulkUploading(false);
      event.target.value = '';
    }
  };

  const documentCount = Object.keys(clientDocs).length;

  return (
    <div className="client-documents-manager">
      <div className="manager-header">
        <button className="btn-back" onClick={onBack}>
          Volver a Clientes
        </button>
        <div className="client-header-info">
          <div className="client-avatar">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{client.name}</h2>
            <p>{client.email}</p>
            <span className="doc-count">
              {documentCount} documento{documentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Subida masiva a todos los meses */}
      <div className="bulk-upload-section">
        <h3>📁 Asignar Documento a Todos los Meses</h3>
        <p className="section-description">
          Suba un archivo Excel para asignarlo automáticamente a todos los meses de {client.name}.
          Esto es útil cuando el cliente usa el mismo formato para todo el año.
        </p>
        <div className="bulk-upload-box">
          <label className={`btn-bulk-upload ${bulkUploading ? 'disabled' : ''}`}>
            {bulkUploading ? '⏳ Asignando a todos los meses...' : '📤 Subir archivo para todos los meses'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              style={{ display: 'none' }}
              disabled={bulkUploading}
            />
          </label>
          <p className="bulk-hint">
            El mismo archivo se copiará a todos los meses (Enero a Diciembre)
          </p>
        </div>
      </div>

      <div className="documents-section">
        <h3>Documentos por Mes</h3>
        <p className="section-description">
          Suba archivos Excel para cada mes. Estos documentos seran exclusivos de {client.name}.
        </p>

        <div className="months-grid">
          {MESES.map((month) => {
            const hasDoc = hasDocument(client.id, month);
            const doc = clientDocs[month];

            return (
              <div key={month} className={`month-card ${hasDoc ? 'has-document' : 'empty'}`}>
                <h4 className="month-name">{month}</h4>
                
                {hasDoc ? (
                  <div className="document-info">
                    <span className="doc-name">{doc?.name}</span>
                    <span className="doc-date">
                      Subido: {new Date(doc?.uploadedAt).toLocaleDateString()}
                    </span>
                    <div className="document-actions">
                      <label className="btn-reupload">
                        Reemplazar
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleFileUpload(month, e)}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                      </label>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(month)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-section">
                    <p className="no-doc">Sin documento</p>
                    <label className="btn-upload">
                      Subir Excel
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileUpload(month, e)}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="instructions-box">
        <h4>Instrucciones:</h4>
        <ul>
          <li>Cada cliente tiene sus documentos completamente separados de los demas</li>
          <li>Puede subir diferentes archivos para cada cliente y mes</li>
          <li>Los clientes solo veran los documentos que usted les asigne</li>
          <li>Cuando el cliente complete sus datos, solo el los vera</li>
        </ul>
      </div>
    </div>
  );
}

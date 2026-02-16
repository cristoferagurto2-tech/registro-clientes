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

  const clientDocs = getClientDocuments(client.id);

  const handleFileUpload = async (month, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage('❌ Por favor sube un archivo Excel (.xlsx o .xls)');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await uploadDocument(client.id, month, file);
      setMessage(`✅ Documento de ${month} subido para ${client.name}`);
    } catch (error) {
      setMessage(`❌ Error al subir: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = (month) => {
    if (window.confirm(`¿Eliminar el documento de ${month} para ${client.name}?`)) {
      deleteDocument(client.id, month);
      setMessage(`🗑️ Documento de ${month} eliminado`);
    }
  };

  const getMonthIcon = (month) => {
    const icons = {
      'Enero': '❄️', 'Febrero': '💝', 'Marzo': '🌸', 'Abril': '🌧️',
      'Mayo': '🌺', 'Junio': '☀️', 'Julio': '🏖️', 'Agosto': '🌴',
      'Septiembre': '🍂', 'Octubre': '🎃', 'Noviembre': '🦃', 'Diciembre': '🎄'
    };
    return icons[month] || '📅';
  };

  const documentCount = Object.keys(clientDocs).length;

  return (
    <div className="client-documents-manager">
      <div className="manager-header">
        <button className="btn-back" onClick={onBack}>
          ← Volver a Clientes
        </button>
        <div className="client-header-info">
          <div className="client-avatar-large">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{client.name}</h2>
            <p>{client.email}</p>
            <span className="doc-count">
              {documentCount} documento{documentCount !== 1 ? 's' : ''} asignado{documentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="documents-section">
        <h3>📅 Documentos por Mes</h3>
        <p className="section-description">
          Sube archivos Excel para cada mes. Estos documentos serán exclusivos de {client.name}.
        </p>

        <div className="months-grid">
          {MESES.map((month) => {
            const hasDoc = hasDocument(client.id, month);
            const doc = clientDocs[month];

            return (
              <div key={month} className={`month-card ${hasDoc ? 'has-document' : 'empty'}`}>
                <div className="month-icon">{getMonthIcon(month)}</div>
                <h4 className="month-name">{month}</h4>
                
                {hasDoc ? (
                  <div className="document-info">
                    <span className="doc-name">📄 {doc?.name}</span>
                    <span className="doc-date">
                      Subido: {new Date(doc?.uploadedAt).toLocaleDateString()}
                    </span>
                    <div className="document-actions">
                      <label className="btn-reupload">
                        🔄 Reemplazar
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
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-section">
                    <p className="no-doc">Sin documento</p>
                    <label className="btn-upload">
                      📤 Subir Excel
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
        <h4>💡 Instrucciones:</h4>
        <ul>
          <li>Cada cliente tiene sus documentos <strong>completamente separados</strong> de los demás</li>
          <li>Puedes subir diferentes archivos para cada cliente y mes</li>
          <li>Los clientes solo verán los documentos que tú les asignes</li>
          <li>Cuando el cliente complete sus datos, solo él los verá</li>
        </ul>
      </div>
    </div>
  );
}

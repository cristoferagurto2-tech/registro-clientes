import { useState } from 'react';
import { useDocuments } from '../context/DocumentsContext';
import './AdminPanel.css';

export default function AdminPanel() {
  const { MESES, documents, uploadDocument, deleteDocument, hasDocument } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (month, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage('❌ Por favor sube un archivo Excel (.xlsx o .xls)');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await uploadDocument(month, file);
      setMessage(`✅ Documento para ${month} subido correctamente`);
    } catch (error) {
      setMessage(`❌ Error al subir: ${error.message}`);
    } finally {
      setUploading(false);
      // Limpiar input
      event.target.value = '';
    }
  };

  const handleDelete = (month) => {
    if (window.confirm(`¿Estás seguro de eliminar el documento de ${month}?`)) {
      deleteDocument(month);
      setMessage(`🗑️ Documento de ${month} eliminado`);
    }
  };

  // Obtener icono según el mes
  const getMonthIcon = (month) => {
    const icons = {
      'Enero': '❄️', 'Febrero': '💝', 'Marzo': '🌸', 'Abril': '🌧️',
      'Mayo': '🌺', 'Junio': '☀️', 'Julio': '🏖️', 'Agosto': '🌴',
      'Septiembre': '🍂', 'Octubre': '🎃', 'Noviembre': '🦃', 'Diciembre': '🎄'
    };
    return icons[month] || '📅';
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>📂 Panel de Administración</h2>
        <p>Sube los documentos Excel para cada mes. Los clientes podrán completarlos.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="months-grid">
        {MESES.map((month) => {
          const hasDoc = hasDocument(month);
          const doc = documents[month];

          return (
            <div key={month} className={`month-card ${hasDoc ? 'has-document' : 'empty'}`}>
              <div className="month-icon">{getMonthIcon(month)}</div>
              <h3 className="month-name">{month}</h3>
              
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
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-section">
                  <p className="no-doc">No hay documento</p>
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

      <div className="admin-instructions">
        <h3>📋 Instrucciones:</h3>
        <ol>
          <li>Crea tus documentos Excel con las columnas que necesites (Nombre, DNI, Monto, etc.)</li>
          <li>Sube un archivo Excel para cada mes</li>
          <li>Los clientes podrán abrir y completar los datos directamente en el navegador</li>
          <li>Los datos se guardan automáticamente</li>
        </ol>
      </div>
    </div>
  );
}

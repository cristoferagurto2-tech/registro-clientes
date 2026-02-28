import { useState, useEffect } from 'react';
import './PDFViewerModal.css';

export default function PDFViewerModal({ isOpen, onClose, backup }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && backup) {
      setIsLoading(true);
      // Simular carga breve para mejor UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, backup]);

  if (!isOpen || !backup) return null;

  const { metadata, pdfData } = backup;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = `ClientCode_${metadata.month}_${metadata.year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pdf-viewer-modal-overlay" onClick={onClose}>
      <div className="pdf-viewer-modal" onClick={e => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <span className="pdf-viewer-icon">📄</span>
            <h3>
              {metadata.month} {metadata.year}
            </h3>
          </div>
          
          <button className="pdf-viewer-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pdf-viewer-content">
          {isLoading ? (
            <div className="pdf-viewer-loading">
              <div className="pdf-viewer-spinner"></div>
              <p>Cargando documento...</p>
            </div>
          ) : (
            <iframe
              src={pdfData}
              className="pdf-viewer-frame"
              title={`Documento ${metadata.month} ${metadata.year}`}
            />
          )}
        </div>

        <div className="pdf-viewer-footer">
          <div className="pdf-viewer-info">
            Guardado: {formatDate(metadata.savedAt)}
            {metadata.summary && (
              <>
                {' • '}
                {metadata.summary.totalClientes || 0} clientes
                {' • '}
                S/ {(metadata.summary.montoTotal || 0).toLocaleString()}
              </>
            )}
          </div>
          
          <div className="pdf-viewer-actions">
            <button 
              className="pdf-viewer-btn pdf-viewer-btn-secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
            
            <button 
              className="pdf-viewer-btn pdf-viewer-btn-primary"
              onClick={handleDownload}
            >
              ⬇️ Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

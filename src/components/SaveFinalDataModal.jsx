import { useState } from 'react';
import './SaveFinalDataModal.css';

export default function SaveFinalDataModal({ isOpen, onClose, onConfirm, month, year }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="save-final-modal-overlay" onClick={!isLoading ? onClose : undefined}>
      <div className="save-final-modal" onClick={e => e.stopPropagation()}>
        <div className="save-final-modal-header">
          <h3>
            <span className="save-final-modal-icon">💾</span>
            ¿Guardar datos finales?
          </h3>
          <p className="save-final-modal-subtitle">
            {month} {year}
          </p>
        </div>

        <div className="save-final-modal-content">
          <div className="save-final-modal-message">
            <p>
              ¿Estás seguro de que has terminado de completar todos los datos de este mes?
            </p>
          </div>

          <div className="save-final-modal-warning">
            <span className="save-final-modal-warning-icon">⚠️</span>
            <p>
              Una vez guardados, estos datos se almacenarán como respaldo. Podrás verlos en el historial más tarde.
            </p>
          </div>
        </div>

        <div className="save-final-modal-actions">
          <button
            className="save-final-modal-btn save-final-modal-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            ↩️ Seguir Editando
          </button>
          
          <button
            className="save-final-modal-btn save-final-modal-btn-primary"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="save-final-modal-loading">
                <span className="save-final-modal-spinner"></span>
                Guardando...
              </span>
            ) : (
              <>
                ✅ Guardar Datos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

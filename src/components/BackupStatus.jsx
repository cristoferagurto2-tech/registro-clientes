import { useState } from 'react';
import { useBackup } from '../context/BackupContext';
import './BackupStatus.css';

export default function BackupStatus() {
  const {
    lastBackup,
    nextBackup,
    isBackupEnabled,
    isBackingUp,
    backupHistory,
    timeUntilNextBackup,
    triggerManualBackup,
    toggleBackupSchedule,
    restoreFromBackup
  } = useBackup();

  const [showHistory, setShowHistory] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState('');

  const handleManualBackup = async () => {
    const result = await triggerManualBackup();
    if (result.success) {
      alert(`✅ Backup completado: ${result.filename}`);
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!restoreFile) return;

    const result = await restoreFromBackup(restoreFile);
    if (result.success) {
      setRestoreMessage(`✅ ${result.message}`);
    } else {
      setRestoreMessage(`❌ Error: ${result.error}`);
    }
    setRestoreFile(null);
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="backup-status-container">
      <div className="backup-header">
        <h3>💾 Copia de Seguridad</h3>
        <div className="backup-badge">
          {isBackupEnabled ? (
            <span className="badge-active">✓ Automático</span>
          ) : (
            <span className="badge-inactive">✗ Desactivado</span>
          )}
        </div>
      </div>

      <div className="backup-info">
        <div className="info-row">
          <span className="info-label">Último backup:</span>
          <span className="info-value">{formatDate(lastBackup)}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Próximo backup:</span>
          <span className="info-value">
            {isBackupEnabled 
              ? (timeUntilNextBackup || 'Calculando...')
              : 'Desactivado'
            }
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Frecuencia:</span>
          <span className="info-value">Cada 24 horas</span>
        </div>
      </div>

      <div className="backup-actions">
        <button
          className={`btn-backup ${isBackingUp ? 'loading' : ''}`}
          onClick={handleManualBackup}
          disabled={isBackingUp}
        >
          {isBackingUp ? '⏳ Creando backup...' : '📥 Backup Manual'}
        </button>

        <button
          className="btn-toggle"
          onClick={toggleBackupSchedule}
        >
          {isBackupEnabled ? '⏸️ Pausar Automático' : '▶️ Activar Automático'}
        </button>

        <button
          className="btn-history"
          onClick={() => setShowHistory(!showHistory)}
        >
          📋 {showHistory ? 'Ocultar' : 'Ver'} Historial
        </button>
      </div>

      {/* Historial de backups */}
      {showHistory && (
        <div className="backup-history">
          <h4>📜 Historial de Backups</h4>
          {backupHistory.length === 0 ? (
            <p className="no-history">No hay backups registrados aún</p>
          ) : (
            <ul className="history-list">
              {backupHistory.slice(0, 10).map((entry) => (
                <li key={entry.id} className="history-item">
                  <span className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                  <span className={`history-type ${entry.type}`}>
                    {entry.type === 'automático' ? '🤖 Auto' : '👤 Manual'}
                  </span>
                  <span className="history-filename" title={entry.filename}>
                    {entry.filename}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sección de restauración */}
      <div className="backup-restore">
        <h4>🔄 Restaurar desde Backup</h4>
        <form onSubmit={handleRestore} className="restore-form">
          <input
            type="file"
            accept=".xlsx,.json"
            onChange={(e) => setRestoreFile(e.target.files[0])}
            className="restore-input"
          />
          <button
            type="submit"
            className="btn-restore"
            disabled={!restoreFile}
          >
            🔄 Restaurar
          </button>
        </form>
        {restoreMessage && (
          <p className={`restore-message ${restoreMessage.includes('✅') ? 'success' : 'error'}`}>
            {restoreMessage}
          </p>
        )}
        <p className="restore-warning">
          ⚠️ La restauración reemplazará todos los datos actuales
        </p>
      </div>

      <div className="backup-info-box">
        <h4>ℹ️ Información</h4>
        <ul>
          <li>✅ Los backups se descargan automáticamente cada 24 horas</li>
          <li>📁 El archivo incluye todos los clientes y documentos</li>
          <li>💾 Se guarda en formato Excel (.xlsx)</li>
          <li>🔒 Mantén tus backups en un lugar seguro</li>
        </ul>
      </div>
    </div>
  );
}

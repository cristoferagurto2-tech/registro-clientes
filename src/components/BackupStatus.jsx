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

  const formatTimeRemaining = () => {
    if (!isBackupEnabled) return 'Desactivado';
    if (!timeUntilNextBackup) return 'Calculando...';
    return timeUntilNextBackup;
  };

  return (
    <div className="backup-status-container">
      {/* Header Principal */}
      <div className="backup-header">
        <h3>Copia de Seguridad</h3>
        <div className="backup-badge">
          {isBackupEnabled ? (
            <span className="badge-active">Automático</span>
          ) : (
            <span className="badge-inactive">Desactivado</span>
          )}
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="backup-stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-label">Último Backup</div>
          <div className="stat-value">{formatDate(lastBackup)}</div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">⏰</span>
          <div className="stat-label">Próximo Backup</div>
          <div className="stat-value time">{formatTimeRemaining()}</div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🔄</span>
          <div className="stat-label">Frecuencia</div>
          <div className="stat-value">Cada 24 horas</div>
        </div>
      </div>

      {/* Panel de Acciones */}
      <div className="backup-actions-panel">
        <div className="actions-title">⚡ Acciones Rápidas</div>
        <div className="backup-actions">
          <button
            className={`btn-backup ${isBackingUp ? 'loading' : ''}`}
            onClick={handleManualBackup}
            disabled={isBackingUp}
          >
            {isBackingUp ? '⏳ Creando...' : '💾 Backup Manual'}
          </button>

          <button
            className="btn-toggle"
            onClick={toggleBackupSchedule}
          >
            {isBackupEnabled ? '⏸️ Pausar' : '▶️ Activar'}
          </button>

          <button
            className="btn-history"
            onClick={() => setShowHistory(!showHistory)}
          >
            📋 Historial
          </button>
        </div>
      </div>

      {/* Historial de Backups */}
      <div className="backup-history-section">
        <button 
          className={`history-toggle-btn ${showHistory ? 'active' : ''}`}
          onClick={() => setShowHistory(!showHistory)}
        >
          <span>📜 Ver Historial de Backups</span>
          <span className="toggle-icon">▼</span>
        </button>
        
        {showHistory && (
          <div className="backup-history">
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
      </div>

      {/* Panel de Restauración */}
      <div className="backup-restore">
        <div className="restore-header">
          <h4>🔄 Restaurar desde Backup</h4>
        </div>
        <p className="restore-description">
          Sube un archivo de backup anterior para restaurar todos los datos
        </p>
        <form onSubmit={handleRestore} className="restore-form">
          <div className="restore-input-wrapper">
            <input
              type="file"
              accept=".xlsx,.json"
              onChange={(e) => setRestoreFile(e.target.files[0])}
              className="restore-input"
            />
          </div>
          <button
            type="submit"
            className="btn-restore"
            disabled={!restoreFile}
          >
            🔄 Restaurar Datos
          </button>
        </form>
        {restoreMessage && (
          <p className={`restore-message ${restoreMessage.includes('✅') ? 'success' : 'error'}`}>
            {restoreMessage}
          </p>
        )}
        <p className="restore-warning">
          <strong>⚠️ Importante:</strong> La restauración reemplazará todos los datos actuales. Asegúrate de tener un backup reciente antes de continuar.
        </p>
      </div>

      {/* Info Box */}
      <div className="backup-info-box">
        <h4>ℹ️ Información sobre Backups</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-item-icon">✅</span>
            <span className="info-item-text">Los backups se descargan automáticamente cada 24 horas</span>
          </div>
          <div className="info-item">
            <span className="info-item-icon">📁</span>
            <span className="info-item-text">El archivo incluye todos los clientes y documentos</span>
          </div>
          <div className="info-item">
            <span className="info-item-icon">💾</span>
            <span className="info-item-text">Se guarda en formato Excel (.xlsx) compatible</span>
          </div>
          <div className="info-item">
            <span className="info-item-icon">🔒</span>
            <span className="info-item-text">Mantén tus backups en un lugar seguro y protegido</span>
          </div>
        </div>
      </div>
    </div>
  );
}

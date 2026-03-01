import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPDFBackups, getBackupStorageInfo } from '../services/pdfBackupService';
import PDFViewerModal from './PDFViewerModal';
import './Historial.css';

export default function Historial() {
  const { user } = useAuth();
  const [backups, setBackups] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ count: 0, totalSizeKB: 0 });
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadBackups();
    }
  }, [user]);

  const loadBackups = () => {
    const userBackups = getAllPDFBackups(user.id);
    setBackups(userBackups);
    
    const info = getBackupStorageInfo(user.id);
    setStorageInfo(info);
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

  const handleViewPDF = (backup) => {
    setSelectedBackup(backup);
    setShowPDFViewer(true);
  };

  const handleDownloadPDF = (backup) => {
    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = backup.pdfData;
    link.download = `ClientCode_${backup.metadata.month}_${backup.metadata.year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value) => {
    return `S/ ${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2>📋 Historial de Documentos</h2>
        <p>Documentos guardados finalizados por mes</p>
        
        {storageInfo.count > 0 && (
          <div className="historial-stats">
            <div className="historial-stat-item">
              <span className="historial-stat-label">Total Documentos</span>
              <span className="historial-stat-value">{storageInfo.count}</span>
            </div>
            <div className="historial-stat-item">
              <span className="historial-stat-label">Espacio Usado</span>
              <span className="historial-stat-value">{storageInfo.totalSizeKB} KB</span>
            </div>
          </div>
        )}
      </div>

      <div className="historial-list">
        {backups.length === 0 ? (
          <div className="historial-empty">
            <div className="historial-empty-icon">📄</div>
            <h3>No hay documentos guardados</h3>
            <p>
              Cuando termines de completar un mes, presiona <strong>"Guardar Datos Finales"</strong> 
              en el editor para guardarlo aquí.
            </p>
          </div>
        ) : (
          backups.map((backup) => (
            <div key={backup.key} className="historial-item">
              <div className="historial-item-icon">📄</div>
              
              <div className="historial-item-content">
                <h3 className="historial-item-title">
                  {backup.metadata.month} {backup.metadata.year}
                </h3>
                <p className="historial-item-date">
                  Guardado: {formatDate(backup.metadata.savedAt)}
                </p>
                
                {backup.metadata.summary && (
                  <>
                    <div className="historial-item-stats">
                      <span className="historial-item-stat">
                        {backup.metadata.summary.totalClientes || 0} clientes
                      </span>
                      <span className="historial-item-stat">
                        {formatCurrency(backup.metadata.summary.montoTotal || 0)}
                      </span>
                      <span className="historial-item-stat">
                        {formatCurrency(backup.metadata.summary.ganancias || 0)} ganancias
                      </span>
                    </div>
                    
                    {/* TABLA DE PRODUCTOS */}
                    {backup.metadata.summary.productos && backup.metadata.summary.productos.length > 0 && (
                      <div className="historial-item-productos">
                        <h4 className="productos-title">Productos y Conteo</h4>
                        <table className="productos-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {backup.metadata.summary.productos.map((prod, idx) => (
                              <tr key={idx}>
                                <td>{prod.producto}</td>
                                <td>{prod.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* TABLA DE OBSERVACIONES CON COLORES */}
                    {backup.metadata.summary.tableData && backup.metadata.summary.tableData.length > 0 && (
                      <div className="historial-item-observaciones">
                        <h4 className="observaciones-title">Resumen de Observaciones</h4>
                        <table className="observaciones-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Cliente</th>
                              <th>Observación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {backup.metadata.summary.tableData.slice(0, 10).map((row, idx) => {
                              const observacion = String(row[9] || '').toLowerCase().trim();
                              let observacionClass = '';
                              
                              if (observacion.includes('cobro')) {
                                observacionClass = 'obs-cobro';
                              } else if (observacion.includes('pendiente') || observacion.includes('espera')) {
                                observacionClass = 'obs-pendiente';
                              } else if (observacion.includes('cancelado')) {
                                observacionClass = 'obs-cancelado';
                              }
                              
                              return (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{row[3] || 'Sin nombre'}</td>
                                  <td className={observacionClass}>
                                    {row[9] || '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {backup.metadata.summary.tableData.length > 10 && (
                          <p className="observaciones-more">
                            ... y {backup.metadata.summary.tableData.length - 10} registros más
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="historial-item-actions">
                <button
                  className="historial-item-btn historial-item-btn-view"
                  onClick={() => handleViewPDF(backup)}
                >
                  👁️ Ver
                </button>
                
                <button
                  className="historial-item-btn historial-item-btn-download"
                  onClick={() => handleDownloadPDF(backup)}
                >
                  ⬇️ Descargar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para ver el PDF */}
      <PDFViewerModal
        isOpen={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        backup={selectedBackup}
      />
    </div>
  );
}

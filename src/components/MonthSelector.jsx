import { useDocuments } from '../context/DocumentsContext';
import './MonthSelector.css';

export default function MonthSelector() {
  const { MESES, hasDocument, setCurrentMonth, getAvailableMonths } = useDocuments();

  const availableMonths = getAvailableMonths();

  // Obtener icono según el mes
  const getMonthIcon = (month) => {
    const icons = {
      'Enero': '❄️', 'Febrero': '💝', 'Marzo': '🌸', 'Abril': '🌧️',
      'Mayo': '🌺', 'Junio': '☀️', 'Julio': '🏖️', 'Agosto': '🌴',
      'Septiembre': '🍂', 'Octubre': '🎃', 'Noviembre': '🦃', 'Diciembre': '🎄'
    };
    return icons[month] || '📅';
  };

  if (availableMonths.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No hay documentos disponibles</h3>
        <p>El administrador aún no ha subido documentos.</p>
        <p className="empty-hint">Por favor, vuelve más tarde.</p>
      </div>
    );
  }

  return (
    <div className="month-selector">
      <div className="selector-header">
        <h2>📅 Selecciona un Mes</h2>
        <p>Elige el documento que deseas completar:</p>
      </div>

      <div className="months-grid-client">
        {MESES.map((month) => {
          const hasDoc = hasDocument(month);

          return (
            <div 
              key={month} 
              className={`month-card-client ${hasDoc ? 'available' : 'disabled'}`}
              onClick={() => hasDoc && setCurrentMonth(month)}
            >
              <div className="month-icon-client">{getMonthIcon(month)}</div>
              <h3 className="month-name-client">{month}</h3>
              
              {hasDoc ? (
                <div className="month-status available">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Disponible</span>
                  <button className="btn-open">Abrir Documento →</button>
                </div>
              ) : (
                <div className="month-status disabled">
                  <span className="status-icon">🔒</span>
                  <span className="status-text">No disponible</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="client-info">
        <h4>💡 ¿Cómo funciona?</h4>
        <ol>
          <li>Selecciona el mes que corresponde a tu registro</li>
          <li>Completa los datos solicitados en el documento</li>
          <li>Los datos se guardan automáticamente</li>
          <li>Puedes volver a editar cuando lo necesites</li>
        </ol>
      </div>
    </div>
  );
}

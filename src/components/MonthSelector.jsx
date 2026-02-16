import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import './MonthSelector.css';

export default function MonthSelector() {
  const { user } = useAuth();
  const { MESES, hasDocument, setCurrentMonth, getAvailableMonths } = useDocuments();

  // Obtener solo los meses disponibles para este cliente específico
  const availableMonths = getAvailableMonths(user?.id);

  // Obtener icono según el mes
  const getMonthIcon = (month) => {
    const icons = {
      'Enero': '❄️', 'Febrero': '💝', 'Marzo': '🌸', 'Abril': '🌧️',
      'Mayo': '🌹', 'Junio': '☀️', 'Julio': '🏖️', 'Agosto': '🌴',
      'Septiembre': '🍂', 'Octubre': '🎃', 'Noviembre': '🦃', 'Diciembre': '🎄'
    };
    return icons[month] || '📅';
  };

  if (availableMonths.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No tienes documentos asignados</h3>
        <p>El administrador aún no te ha asignado documentos.</p>
        <p className="empty-hint">Contacta al administrador para que te asigne tus documentos.</p>
      </div>
    );
  }

  return (
    <div className="month-selector">
      <div className="selector-header">
        <h2>📅 Mis Documentos</h2>
        <p>Hola {user?.name || 'Cliente'}, estos son tus documentos asignados:</p>
      </div>

      <div className="months-grid-client">
        {MESES.map((month) => {
          const hasDoc = hasDocument(user?.id, month);

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
                  <span className="status-text">No asignado</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="client-info">
        <h4>💡 ¿Cómo funciona?</h4>
        <ol>
          <li>Estos son <strong>tus documentos personales</strong>, solo tú puedes verlos</li>
          <li>Selecciona el mes que deseas completar</li>
          <li>Completa los datos en el documento</li>
          <li>Guarda tus cambios con el botón "Guardar"</li>
          <li>Puedes volver a editar cuando lo necesites</li>
        </ol>
      </div>
    </div>
  );
}

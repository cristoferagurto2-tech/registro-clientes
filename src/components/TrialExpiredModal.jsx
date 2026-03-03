import './TrialExpiredModal.css';

export default function TrialExpiredModal({ isOpen, onClose, daysRemaining, onSubscribe }) {
  if (!isOpen) return null;
  
  const isExpired = daysRemaining <= 0;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={`modal-icon ${isExpired ? 'expired' : 'warning'}`}>
            {isExpired ? '🔒' : '⏰'}
          </div>
          <h2>{isExpired ? 'Período de Prueba Finalizado' : 'Período de Prueba Por Vencer'}</h2>
        </div>
        
        <div className="modal-body">
          {isExpired ? (
            <>
              <p className="modal-description">
                Su período de prueba de 7 días ha finalizado. Para continuar utilizando 
                todas las funcionalidades del sistema, debe suscribirse a uno de nuestros planes.
              </p>
              
              <div className="trial-info-box">
                <h3>📊 Datos seguros</h3>
                <p>Su información no se ha eliminado. Puede acceder a sus datos en modo solo lectura, 
                pero no podrá crear nuevos registros hasta que se suscriba.</p>
              </div>
              
              <div className="plans-section">
                <h3>📋 Planes Disponibles</h3>
                
                <div className="plan-card">
                  <div className="plan-header">
                    <span className="plan-name">Plan Básico</span>
                    <span className="plan-price">S/ 30</span>
                  </div>
                  <div className="plan-period">/mes</div>
                  <ul className="plan-features">
                    <li>✓ Hasta 30 créditos activos</li>
                    <li>✓ 1 usuario por cuenta</li>
                    <li>✓ Dashboard estándar</li>
                    <li>✓ Soporte por email</li>
                  </ul>
                  <button 
                    className="plan-button basic"
                    onClick={() => onSubscribe && onSubscribe('basic')}
                  >
                    Suscribirse al Básico
                  </button>
                </div>
                
                <div className="plan-card recommended">
                  <div className="recommended-badge">Recomendado</div>
                  <div className="plan-header">
                    <span className="plan-name">Plan Profesional</span>
                    <span className="plan-price">S/ 60</span>
                  </div>
                  <div className="plan-period">/mes</div>
                  <ul className="plan-features">
                    <li>✓ Créditos ilimitados</li>
                    <li>✓ Hasta 3 usuarios por cuenta</li>
                    <li>✓ Dashboard avanzado</li>
                    <li>✓ Descarga de PDF</li>
                    <li>✓ Soporte prioritario</li>
                  </ul>
                  <button 
                    className="plan-button professional"
                    onClick={() => onSubscribe && onSubscribe('professional')}
                  >
                    Suscribirse al Profesional
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="modal-description">
                Su período de prueba finaliza en <strong>{daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</strong>. 
                Suscríbase ahora para evitar interrupciones en el servicio.
              </p>
              
              <div className="countdown-box">
                <span className="countdown-number">{daysRemaining}</span>
                <span className="countdown-label">{daysRemaining === 1 ? 'día' : 'días'} restantes</span>
              </div>
              
              <div className="plans-section compact">
                <div className="plan-card">
                  <div className="plan-header">
                    <span className="plan-name">Plan Básico</span>
                    <span className="plan-price">S/ 30/mes</span>
                  </div>
                  <button 
                    className="plan-button basic"
                    onClick={() => onSubscribe && onSubscribe('basic')}
                  >
                    Suscribirse
                  </button>
                </div>
                
                <div className="plan-card recommended">
                  <div className="plan-header">
                    <span className="plan-name">Plan Profesional</span>
                    <span className="plan-price">S/ 60/mes</span>
                  </div>
                  <button 
                    className="plan-button professional"
                    onClick={() => onSubscribe && onSubscribe('professional')}
                  >
                    Suscribirse
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=cristoferagurto2@gmail.com&su=Soporte%20Técnico%20-%20ClientCode&body=Hola,%20necesito%20ayuda%20con:%0A%0A[Describe%20tu%20consulta%20aquí]%0A%0ASaludos,"
            target="_blank"
            rel="noopener noreferrer"
            className="support-link"
          >
            💬 Contactar Soporte Técnico
          </a>
          <button className="btn-secondary" onClick={onClose}>
            {isExpired ? 'Continuar en Modo Lectura' : 'Continuar con Prueba'}
          </button>
        </div>
      </div>
    </div>
  );
}

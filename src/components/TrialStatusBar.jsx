import { useAuth } from '../context/AuthContext';
import './TrialStatusBar.css';

export default function TrialStatusBar() {
  const { user, getTrialStatus, isReadOnlyMode } = useAuth();
  
  if (!user) return null;
  
  const trialStatus = getTrialStatus(user.email);
  
  if (!trialStatus || trialStatus.isAdmin) return null;
  
  const { isTrialActive, isSubscribed, daysRemaining, trialEndDate } = trialStatus;
  
  // Si está suscrito, mostrar badge de suscrito
  if (isSubscribed) {
    return (
      <div className="trial-status-bar subscribed">
        <div className="trial-content">
          <span className="trial-icon">✓</span>
          <span className="trial-text">Cuenta activa - Acceso completo</span>
      </div>
    </div>
  );
  }
  
  // Si el período de prueba está activo
  if (isTrialActive) {
    const endDate = new Date(trialEndDate);
    const formattedDate = endDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return (
      <div className={`trial-status-bar ${daysRemaining <= 2 ? 'warning' : 'active'}`}>
        <div className="trial-content">
          <span className="trial-icon">🎁</span>
          <div className="trial-info">
            <span className="trial-text">
              <strong>Período de prueba:</strong> {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
            </span>
            <span className="trial-date">Vence el {formattedDate}</span>
          </div>
        </div>
        <button className="trial-subscribe-btn">
          Suscribirse Ahora
        </button>
      </div>
    );
  }
  
  // Si el período de prueba terminó
  return (
    <div className="trial-status-bar expired">
      <div className="trial-content">
        <span className="trial-icon">⚠️</span>
        <div className="trial-info">
          <span className="trial-text">
            <strong>Período de prueba finalizado</strong>
          </span>
          <span className="trial-date">Modo solo lectura - Suscríbase para reactivar</span>
        </div>
      </div>
      <button className="trial-subscribe-btn urgent">
        Suscribirse Ahora
      </button>
    </div>
  );
}

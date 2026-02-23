import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './TrialStatusBar.css';

export default function TrialStatusBar({ onSubscribe }) {
  const { user, getTrialStatus, isReadOnlyMode } = useAuth();
  const [showPlans, setShowPlans] = useState(false);
  
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
        <div className="subscribe-options">
          {!showPlans ? (
            <button 
              className="trial-subscribe-btn"
              onClick={() => setShowPlans(true)}
            >
              Suscribirse Ahora
            </button>
          ) : (
            <div className="plan-buttons">
              <button 
                className="plan-btn-basic"
                onClick={() => {
                  onSubscribe && onSubscribe('basic');
                  setShowPlans(false);
                }}
              >
                Básico S/30
              </button>
              <button 
                className="plan-btn-pro"
                onClick={() => {
                  onSubscribe && onSubscribe('professional');
                  setShowPlans(false);
                }}
              >
                Pro S/60
              </button>
            </div>
          )}
        </div>
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
      <div className="subscribe-options">
        {!showPlans ? (
          <button 
            className="trial-subscribe-btn urgent"
            onClick={() => setShowPlans(true)}
          >
            Suscribirse Ahora
          </button>
        ) : (
          <div className="plan-buttons">
            <button 
              className="plan-btn-basic"
              onClick={() => {
                onSubscribe && onSubscribe('basic');
                setShowPlans(false);
              }}
            >
              Básico S/30
            </button>
            <button 
              className="plan-btn-pro"
              onClick={() => {
                onSubscribe && onSubscribe('professional');
                setShowPlans(false);
              }}
            >
              Pro S/60
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import MonthSelector from './MonthSelector';
import DocumentEditor from './DocumentEditor';
import AdminPanel from './AdminPanel';
import TrialStatusBar from './TrialStatusBar';
import TrialExpiredModal from './TrialExpiredModal';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAdmin, logout, getTrialStatus, isReadOnlyMode, subscribeClient } = useAuth();
  const { currentMonth, setCurrentMonth } = useDocuments();
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Manejar suscripción
  const handleSubscribe = (plan) => {
    // Aquí puedes redirigir a una pasarela de pagos real
    // Por ahora mostramos un mensaje con las instrucciones
    const planName = plan === 'basic' ? 'Plan Básico (S/ 30/mes)' : 'Plan Profesional (S/ 60/mes)';
    const message = `Has seleccionado: ${planName}\n\nPara completar tu suscripción, contacta al administrador:\n\n📧 cristoferagurto2@gmail.com\n\nO realiza el pago y envía el comprobante.`;
    
    alert(message);
    
    // Opcional: Abrir WhatsApp
    // window.open('https://wa.me/TUNUMERO?text=Hola, quiero suscribirme al ' + planName, '_blank');
  };

  // Verificar estado del período de prueba al cargar
  useEffect(() => {
    if (user && !isAdmin) {
      const trialStatus = getTrialStatus(user.email);
      if (trialStatus && (trialStatus.daysRemaining <= 2 || !trialStatus.isTrialActive)) {
        // Mostrar modal si quedan 2 días o menos, o si ya expiró
        setShowTrialModal(true);
      }
    }
  }, [user, isAdmin, getTrialStatus]);

  const projectName = "Registro de Clientes";

  // Si hay un mes seleccionado, mostrar el editor
  if (currentMonth) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-brand">
              <div className="logo-box">
                <span>RC</span>
              </div>
              <div className="header-title">
                <h1>{projectName}</h1>
                <span className="header-subtitle">{currentMonth} 2026</span>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => setCurrentMonth(null)} 
                className="btn-secondary"
              >
                Volver a Meses
              </button>
              <div className="header-user">
                <span className="user-role-badge">
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </span>
                <button onClick={logout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <DocumentEditor month={currentMonth} />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="logo-box">
              <span>RC</span>
            </div>
            <div className="header-title">
              <h1>{projectName}</h1>
              <span className="header-subtitle">Sistema de Gestión Financiera</span>
            </div>
          </div>
          
          <div className="header-user">
            <div className="user-info">
              <span className="user-role-badge">
                {isAdmin ? 'Administrador' : 'Cliente'}
              </span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button onClick={logout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <section className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-greeting">
              {isAdmin ? 'Panel de Administración' : 'Bienvenido'}
            </h2>
            <h1 className="welcome-title">
              {projectName}
            </h1>
            <p className="welcome-subtitle">
              {isAdmin 
                ? 'Gestione sus clientes y sus documentos de manera eficiente'
                : 'Acceda a sus documentos personales de forma segura'}
            </p>
          </div>
        </div>
      </section>

      {/* Barra de estado del período de prueba */}
      {!isAdmin && <TrialStatusBar />}

      <main className="dashboard-main">
        {isAdmin ? <AdminPanel /> : <MonthSelector />}
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 {projectName} - Todos los derechos reservados</p>
      </footer>

      {/* Modal de período de prueba */}
      <TrialExpiredModal 
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        daysRemaining={user ? getTrialStatus(user.email)?.daysRemaining : 0}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}

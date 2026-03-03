import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import Logo from './Logo';
import MonthSelector from './MonthSelector';
import DocumentEditor from './DocumentEditor';
import AdminPanel from './AdminPanel';
import TrialStatusBar from './TrialStatusBar';
import TrialExpiredModal from './TrialExpiredModal';
import PaymentModal from './PaymentModal';
import SupportButton from './SupportButton';
import { exportAllData, importAllData } from '../services/dataTransferService';
import './Dashboard.css';

// Lista de correos VIP (debe coincidir con AuthContext)
const VIP_EMAILS = ['cristovalleagur@gmail.com', 'yudyagurto1983@gmail.com'];

export default function Dashboard() {
  const { user, isAdmin, logout, getTrialStatus, isReadOnlyMode, subscribeClient } = useAuth();
  const { currentMonth, setCurrentMonth } = useDocuments();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef(null);

  // Manejar suscripción
  const handleSubscribe = (plan) => {
    console.log('Botón de suscripción presionado:', plan);
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Función para exportar datos
  const handleExportData = () => {
    const result = exportAllData();
    if (result.success) {
      alert('✅ Datos exportados correctamente. Descarga el archivo y guárdalo en un lugar seguro.');
    } else {
      alert('❌ Error al exportar: ' + result.error);
    }
  };

  // Función para importar datos
  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await importAllData(file);
      if (result.success) {
        setImportMessage(`✅ ${result.message}`);
        alert('✅ Datos importados correctamente. La página se recargará.');
        window.location.reload();
      } else if (!result.cancelled) {
        alert('❌ Error al importar');
      }
    } catch (error) {
      alert('❌ Error al importar: ' + error.message);
    }
    
    // Limpiar el input
    event.target.value = '';
  };

  // Función para verificar si un email es VIP
  const isVipEmail = (email) => {
    return VIP_EMAILS.includes(email?.toLowerCase()?.trim());
  };

  // Verificar estado del período de prueba al cargar
  useEffect(() => {
    if (user && !isAdmin) {
      // Primero verificar si es VIP directamente
      if (isVipEmail(user.email)) {
        console.log('Usuario VIP detectado, no se muestra modal de trial');
        return; // No mostrar nada para VIPs
      }
      
      const trialStatus = getTrialStatus(user.email);
      // No mostrar modal si es VIP (acceso gratuito permanente)
      if (trialStatus && !trialStatus.isVIP && (trialStatus.daysRemaining <= 2 || !trialStatus.isTrialActive)) {
        // Mostrar modal si quedan 2 días o menos, o si ya expiró
        setShowTrialModal(true);
      }
    }
  }, [user, isAdmin, getTrialStatus]);

  const projectName = "ClientCode";

  // Si hay un mes seleccionado, mostrar el editor
  if (currentMonth) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-brand">
              <Logo size="medium" />
              <span className="header-subtitle">{currentMonth} 2026</span>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => setCurrentMonth(null)} 
                className="btn-secondary"
              >
                Volver a Meses
              </button>
              <div className="header-user">
                <SupportButton />
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
            <Logo size="medium" />
            <span className="header-subtitle">Sistema de Gestión Financiera</span>
          </div>
          
          <div className="header-user">
            <SupportButton />
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

      {/* NUEVO: Botones para exportar/importar datos */}
      <section className="data-transfer-section">
        <div className="data-transfer-card">
          <h4>📱 Sincronizar entre dispositivos</h4>
          <p>Exporta tus datos de este dispositivo e impórtalos en otro para ver los mismos documentos.</p>
          <div className="data-transfer-buttons">
            <button 
              className="btn-export" 
              onClick={handleExportData}
              title="Descargar todos tus datos como archivo JSON"
            >
              📥 Exportar Datos
            </button>
            <button 
              className="btn-import" 
              onClick={() => fileInputRef.current?.click()}
              title="Importar datos desde un archivo JSON"
            >
              📤 Importar Datos
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
          {importMessage && (
            <div className="import-message">{importMessage}</div>
          )}
        </div>
      </section>

      {/* Barra de estado del período de prueba */}
      {!isAdmin && <TrialStatusBar onSubscribe={handleSubscribe} />}

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

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}

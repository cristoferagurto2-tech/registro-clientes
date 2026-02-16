import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import MonthSelector from './MonthSelector';
import DocumentEditor from './DocumentEditor';
import AdminPanel from './AdminPanel';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { currentMonth, setCurrentMonth } = useDocuments();

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

      <main className="dashboard-main">
        {isAdmin ? <AdminPanel /> : <MonthSelector />}
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 {projectName} - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

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
  
  const frasesEmotivas = [
    "Donde cada cliente es una historia de éxito",
    "Tu confianza, nuestro mayor compromiso",
    "Juntos construyendo un futuro próspero",
    "Tu éxito financiero es nuestra misión"
  ];

  const fraseAleatoria = frasesEmotivas[Math.floor(Math.random() * frasesEmotivas.length)];

  const hora = new Date().getHours();
  let saludo = 'Buenos días';
  if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
  else if (hora >= 18) saludo = 'Buenas noches';

  // Si hay un mes seleccionado, mostrar el editor
  if (currentMonth) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-brand">
              <span className="header-icon">🏦</span>
              <div className="header-title">
                <h1>{projectName}</h1>
                <span className="header-subtitle">{currentMonth} 2025</span>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => setCurrentMonth(null)} 
                className="btn-secondary"
              >
                ← Volver a Meses
              </button>
              <div className="header-user">
                <span className="user-role-badge">
                  {isAdmin ? '👑 Admin' : '👤 Cliente'}
                </span>
                <button onClick={logout} className="logout-button">
                  🚪 Salir
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
            <span className="header-icon">🏦</span>
            <div className="header-title">
              <h1>{projectName}</h1>
              <span className="header-subtitle">Sistema de Gestión Financiera</span>
            </div>
          </div>
          
          <div className="header-user">
            <div className="user-info">
              <span className="user-role-badge">
                {isAdmin ? '👑 Administrador' : '👤 Cliente'}
              </span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button onClick={logout} className="logout-button">
              <span>🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <section className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-content">
            <div className="welcome-greeting">
              <span className="greeting-icon">
                {isAdmin ? '👑' : '👋'}
              </span>
              <h2>{saludo}, {isAdmin ? 'Administrador' : 'Cliente'}</h2>
            </div>
            <h1 className="welcome-title">
              ¡Bienvenido a {projectName}!
            </h1>
            <p className="welcome-quote">
              "{fraseAleatoria}"
            </p>
          </div>
          <div className="welcome-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
          </div>
        </div>
      </section>

      <main className="dashboard-main">
        {isAdmin ? <AdminPanel /> : <MonthSelector />}
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 {projectName} - Todos los derechos reservados</p>
        <p className="footer-love">Hecho con ❤️ para nuestros clientes</p>
      </footer>
    </div>
  );
}

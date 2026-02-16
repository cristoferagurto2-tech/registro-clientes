import { useAuth } from '../context/AuthContext';
import ClientesData from './ClientesData';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();

  // Obtener nombre del proyecto
  const projectName = "Registro de Clientes";
  
  // Frases emotivas de bienvenida
  const frasesEmotivas = [
    "Donde cada cliente es una historia de éxito",
    "Tu confianza, nuestro mayor compromiso",
    "Juntos construyendo un futuro próspero",
    "Tu éxito financiero es nuestra misión"
  ];

  // Seleccionar una frase aleatoria
  const fraseAleatoria = frasesEmotivas[Math.floor(Math.random() * frasesEmotivas.length)];

  // Obtener hora del día para saludo personalizado
  const hora = new Date().getHours();
  let saludo = 'Buenos días';
  if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
  else if (hora >= 18) saludo = 'Buenas noches';

  return (
    <div className="dashboard-container">
      {/* Header */}
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

      {/* Welcome Section */}
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
            <div className="welcome-stats">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <span className="stat-label">{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏰</span>
                <span className="stat-label">{new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          </div>
          <div className="welcome-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-main">
        <ClientesData isAdmin={isAdmin} />
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2025 {projectName} - Todos los derechos reservados</p>
        <p className="footer-love">Hecho con ❤️ para nuestros clientes</p>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo válido');
      setLoading(false);
      return;
    }

    const result = login(email);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🏦</span>
            </div>
          </div>
          <h1 className="login-title">Bienvenido a Registro de Clientes</h1>
          <p className="login-subtitle">
            "Construyendo juntos un futuro financiero más brillante"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-container">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                <span className="button-icon">🔐</span>
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="security-badge">
            <span className="badge-icon">🔒</span>
            <span>Sistema seguro y privado</span>
          </div>
          <p className="contact-info">
            ¿Necesitas acceso? Contacta al administrador
          </p>
        </div>
      </div>

      <div className="login-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
}

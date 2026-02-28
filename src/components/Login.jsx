import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import TerminosCondiciones from './TerminosCondiciones';
import './Login.css';

export default function Login({ onSwitchToRegister, onSwitchToForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.email.includes('@')) {
      setError('Por favor ingrese un correo válido');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Por favor ingrese su contraseña');
      setLoading(false);
      return;
    }

    const result = login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Logo size="large" />
          <p className="login-subtitle">
            Sistema de Gestión Financiera
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingrese su contraseña"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>

          <div className="forgot-password-link">
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToForgotPassword}
            >
              ¿Olvidó su contraseña?
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p className="register-link">
            ¿No tiene cuenta?{' '}
            <button className="link-button" onClick={onSwitchToRegister}>
              Regístrese aquí
            </button>
          </p>
          
          <p className="terms-link">
            <button 
              className="link-button" 
              onClick={() => setShowTerms(true)}
              type="button"
            >
              Ver Términos y Condiciones
            </button>
          </p>
          
          <div className="admin-info">
            <p>Administrador: cristoferagurto2@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      <TerminosCondiciones
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => setShowTerms(false)}
      />
    </div>
  );
}

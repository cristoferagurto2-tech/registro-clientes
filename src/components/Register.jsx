import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import TerminosCondiciones from './TerminosCondiciones';
import './Register.css';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { registerClient } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Primero registrar la cuenta
    const result = registerClient(
      formData.email,
      formData.password,
      formData.name
    );

    if (result.success) {
      // Guardar el email registrado para mostrarlo en los términos
      setRegisteredEmail(formData.email);
      // Mostrar términos y condiciones DESPUÉS de registrar
      setShowTerms(true);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    
    // Limpiar el formulario
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    // Mostrar mensaje de éxito y redirigir al login
    alert('¡Cuenta creada exitosamente! Ahora puede iniciar sesión.');
    onSwitchToLogin();
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <Logo size="large" />
          <p className="register-subtitle">
            Complete el formulario para registrarse
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nombre Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese su nombre completo"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
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
            <label htmlFor="password">Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <span className="field-hint">Mínimo 6 caracteres</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita su contraseña"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="register-footer">
          <p className="login-link">
            ¿Ya tiene cuenta?{' '}
            <button className="link-button" onClick={onSwitchToLogin}>
              Inicie sesión aquí
            </button>
          </p>
        </div>
      </div>

      {/* Modal de Términos y Condiciones - Obligatorio */}
      <TerminosCondiciones
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}

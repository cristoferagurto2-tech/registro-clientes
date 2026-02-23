import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ForgotPassword.css';

export default function ForgotPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'code', 'reset'
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !email.includes('@')) {
      setError('Por favor ingrese un correo válido');
      setLoading(false);
      return;
    }

    const result = requestPasswordReset(email);
    
    if (result.success) {
      setGeneratedCode(result.code);
      setStep('code');
      setSuccess(`Se ha enviado un código de recuperación a ${email}`);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!resetCode || resetCode.length !== 6) {
      setError('Por favor ingrese el código de 6 dígitos');
      setLoading(false);
      return;
    }

    const result = verifyResetCode(email, resetCode);
    
    if (result.success) {
      setStep('reset');
      setSuccess('Código verificado. Ingrese su nueva contraseña.');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const result = resetPassword(email, newPassword);
    
    if (result.success) {
      setSuccess('Contraseña actualizada correctamente. Redirigiendo...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="logo-box">
            <span>RC</span>
          </div>
          <h1 className="forgot-password-title">
            {step === 'email' && 'Recuperar Contraseña'}
            {step === 'code' && 'Verificar Código'}
            {step === 'reset' && 'Nueva Contraseña'}
          </h1>
          <p className="forgot-password-subtitle">
            {step === 'email' && 'Ingrese su correo para recibir un código de recuperación'}
            {step === 'code' && 'Ingrese el código de 6 dígitos enviado a su correo'}
            {step === 'reset' && 'Cree una nueva contraseña segura'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                required
              />
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
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="resetCode">Código de Recuperación</label>
              <input
                type="text"
                id="resetCode"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={loading}
                required
                className="code-input"
              />
              <span className="field-hint">Ingrese los 6 dígitos enviados a su correo</span>
              
              {/* Para desarrollo/demo: mostrar el código generado */}
              <div className="dev-notice">
                <strong>Código (solo para demo):</strong> {generatedCode}
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

            <div className="button-group">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setStep('email')}
                disabled={loading}
              >
                Volver
              </button>
              <button 
                type="submit" 
                className="forgot-password-button"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                  disabled={loading}
                  required
                />
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
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <p className="login-link">
            ¿Recordó su contraseña?{' '}
            <button className="link-button" onClick={onSwitchToLogin}>
              Inicie sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

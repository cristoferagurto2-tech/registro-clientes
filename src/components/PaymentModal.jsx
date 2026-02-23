import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendPaymentNotification } from '../services/emailService';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, onClose, selectedPlan }) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  if (!isOpen) return null;

  const planDetails = {
    basic: { name: 'Plan Básico', price: 30 },
    professional: { name: 'Plan Profesional', price: 60 }
  };

  const plan = planDetails[selectedPlan] || planDetails.basic;
  const yapeNumber = '913664993';
  const adminEmail = 'cristoferagurto2@gmail.com';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert('Por favor suba el comprobante de pago');
      return;
    }

    setSending(true);
    setEmailStatus('Enviando comprobante...');

    try {
      // Enviar notificación por email
      const result = await sendPaymentNotification(
        plan.name,
        plan.price,
        user?.email || 'cliente@email.com',
        uploadedFile
      );

      if (result.success) {
        setEmailStatus('✓ Comprobante enviado a tu correo');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      } else {
        setEmailStatus('⚠ Error al enviar. Intente nuevamente.');
        alert('Hubo un error al enviar el comprobante. Por favor intente nuevamente.');
      }
    } catch (error) {
      setEmailStatus('⚠ Error al enviar');
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  const copyYapeNumber = () => {
    navigator.clipboard.writeText(yapeNumber);
    alert('Número de Yape copiado: ' + yapeNumber);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 Realizar Pago</h2>
          <p>{plan.name} - S/ {plan.price}.00 / mes</p>
        </div>

        {showSuccess ? (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h3>¡Comprobante enviado!</h3>
            <p>Estamos verificando su pago. En breve activaremos su suscripción.</p>
          </div>
        ) : (
          <>
            <div className="payment-body">
              {/* Métodos de pago */}
              <div className="payment-methods">
                <h3>Seleccione método de pago:</h3>
                <div className="method-buttons">
                  <button 
                    className={`method-btn ${paymentMethod === 'yape' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('yape')}
                  >
                    <span className="method-icon">📱</span>
                    Yape
                  </button>
                </div>
              </div>

              {/* Información de pago Yape */}
              {paymentMethod === 'yape' && (
                <div className="yape-section">
                  <div className="qr-container">
                    <h4>Escanea el QR con tu Yape:</h4>
                    <div className="qr-placeholder">
                      {/* QR REAL DE YAPE - YA ACTIVADO */}
                      <img src="/yape-qr.png" alt="QR Yape" className="qr-image" />
                    </div>
                    <p className="qr-hint">Escanea este código con tu aplicación Yape</p>
                  </div>

                  <div className="number-section">
                    <h4>O transfiera al número:</h4>
                    <div className="number-display">
                      <span className="phone-number">{yapeNumber}</span>
                      <button className="copy-btn" onClick={copyYapeNumber}>
                        📋 Copiar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subir comprobante */}
              <div className="upload-section">
                <h4>O suba el comprobante aquí:</h4>
                <div className="upload-area">
                  <input
                    type="file"
                    id="comprobante"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="comprobante" className="upload-label">
                    {uploadedFile ? (
                      <span className="file-selected">📎 {uploadedFile.name}</span>
                    ) : (
                      <>
                        <span className="upload-icon">📤</span>
                        <span>Click para subir comprobante</span>
                        <small>JPG, PNG o PDF (máx. 5MB)</small>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="contact-info-payment">
                <p><strong>📧 Email:</strong> {adminEmail}</p>
              </div>
            </div>

            {emailStatus && (
              <div className={`email-status ${emailStatus.includes('✓') ? 'success' : 'loading'}`}>
                {emailStatus}
              </div>
            )}

            <div className="modal-footer-payment">
              <button className="btn-secondary" onClick={onClose} disabled={sending}>
                Cancelar
              </button>
              <button 
                className={`btn-primary ${!uploadedFile || sending ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!uploadedFile || sending}
              >
                {sending ? 'Enviando...' : uploadedFile ? 'Enviar Comprobante' : 'Suba el comprobante primero'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

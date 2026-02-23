import { useState } from 'react';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, onClose, selectedPlan }) {
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const planDetails = {
    basic: { name: 'Plan Básico', price: 30 },
    professional: { name: 'Plan Profesional', price: 60 }
  };

  const plan = planDetails[selectedPlan] || planDetails.basic;
  const whatsappNumber = '51913664993';
  const yapeNumber = '913664993';
  const adminEmail = 'cristoferagurto2@gmail.com';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert('Por favor suba el comprobante de pago');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  const openWhatsApp = () => {
    const message = `Hola, acabo de realizar el pago del ${plan.name} (S/ ${plan.price}.00). Adjunto el comprobante.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
                      <div className="qr-code">
                        <div className="qr-pattern">
                          <span className="qr-label">QR YAPE</span>
                          <span className="qr-number">{yapeNumber}</span>
                        </div>
                      </div>
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

              {/* Botón WhatsApp */}
              <div className="whatsapp-section">
                <h4>¿Ya realizaste el pago?</h4>
                <button className="whatsapp-btn" onClick={openWhatsApp}>
                  <span className="whatsapp-icon">💬</span>
                  Enviar comprobante por WhatsApp
                </button>
              </div>

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
                <p><strong>📱 WhatsApp:</strong> {whatsappNumber}</p>
              </div>
            </div>

            <div className="modal-footer-payment">
              <button className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className={`btn-primary ${!uploadedFile ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!uploadedFile}
              >
                {uploadedFile ? 'Enviar Comprobante' : 'Suba el comprobante primero'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

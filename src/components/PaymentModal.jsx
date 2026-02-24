import { useState } from 'react';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, onClose, selectedPlan }) {
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const planDetails = {
    basic: { name: 'Plan Básico', price: 30 },
    professional: { name: 'Plan Profesional', price: 60 }
  };

  const plan = planDetails[selectedPlan] || planDetails.basic;
  const yapeNumber = '913664993';
  const adminEmail = 'cristoferagurto2@gmail.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    alert('📧 Email copiado: ' + adminEmail);
  };

  const copyYapeNumber = () => {
    navigator.clipboard.writeText(yapeNumber);
    alert('📱 Número de Yape copiado: ' + yapeNumber);
  };

  const openGmail = () => {
    const subject = encodeURIComponent(`Comprobante de Pago - ${plan.name}`);
    const body = encodeURIComponent(
      `Hola,\n\n` +
      `He realizado el pago del ${plan.name}.\n\n` +
      `💰 Monto: S/ ${plan.price}.00\n` +
      `📅 Fecha: ${new Date().toLocaleDateString()}\n\n` +
      `Adjunto el comprobante de pago.\n\n` +
      `Gracias.`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${adminEmail}&su=${subject}&body=${body}`, '_blank');
  };

  const openOutlook = () => {
    const subject = encodeURIComponent(`Comprobante de Pago - ${plan.name}`);
    const body = encodeURIComponent(
      `Hola,\n\n` +
      `He realizado el pago del ${plan.name}.\n\n` +
      `💰 Monto: S/ ${plan.price}.00\n` +
      `📅 Fecha: ${new Date().toLocaleDateString()}\n\n` +
      `Adjunto el comprobante de pago.\n\n` +
      `Gracias.`
    );
    window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${adminEmail}&subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 Realizar Pago</h2>
          <p>{plan.name} - S/ {plan.price}.00 / mes</p>
        </div>

        <div className="payment-body">
          {/* Sección Yape */}
          <div className="yape-section">
            <h3>📱 Paga con Yape</h3>
            
            <div className="qr-container">
              <h4>Escanea el QR:</h4>
              <div className="qr-placeholder">
                <img src="/yape-qr.png" alt="QR Yape" className="qr-image" />
              </div>
              <p className="qr-hint">Abre Yape y escanea este código</p>
            </div>

            <div className="number-section">
              <h4>O al número:</h4>
              <div className="number-display">
                <span className="phone-number">{yapeNumber}</span>
                <button className="copy-btn" onClick={copyYapeNumber}>
                  📋 Copiar
                </button>
              </div>
            </div>
          </div>

          {/* Sección Email */}
          <div className="email-section">
            <h3>📧 Envía el Comprobante</h3>
            <p className="email-instruction">
              Después de pagar, envía el comprobante a:
            </p>
            
            <div className="email-display">
              <span className="email-address">{adminEmail}</span>
              <button className="copy-btn" onClick={copyEmail}>
                📋 Copiar
              </button>
            </div>

            <div className="email-buttons">
              <button className="email-btn gmail" onClick={openGmail}>
                📧 Abrir Gmail
              </button>
              <button className="email-btn outlook" onClick={openOutlook}>
                📧 Abrir Outlook
              </button>
            </div>

            <div className="email-instructions-box">
              <h4>✅ Pasos a seguir:</h4>
              <ol>
                <li>Paga con Yape al número o QR de arriba</li>
                <li>Toma una captura del comprobante</li>
                <li>Haz clic en "Abrir Gmail" o "Abrir Outlook"</li>
                <li>Adjunta la imagen del comprobante</li>
                <li>Envía el email</li>
              </ol>
              <p className="email-note">
                <strong>💡 Tip:</strong> También puedes enviar el comprobante desde tu celular escribiendo directamente al email.
              </p>
            </div>
          </div>

          {/* Información */}
          <div className="payment-info">
            <p>⏳ <strong>Después de enviar el comprobante:</strong></p>
            <p>Te activaremos la suscripción en menos de 24 horas.</p>
            <p>Recibirás un email de confirmación.</p>
          </div>
        </div>

        <div className="modal-footer-payment">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button 
            className="btn-primary" 
            onClick={() => { 
              setShowInstructions(true); 
              alert('📧 Recuerda enviar el comprobante a: ' + adminEmail);
            }}
          >
            ✓ Ya pagué
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import './TerminosCondiciones.css';

export default function TerminosCondiciones({ onAccept, isOpen }) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content terms-modal">
        <div className="modal-header">
          <h2>Términos y Condiciones de Uso</h2>
          <p>ClientCore - Sistema de Gestión de Datos</p>
        </div>

        <div className="modal-body">
          <div className="terms-content">
            <p className="terms-date">
              <strong>Fecha de última actualización:</strong> 23 de febrero de 2026
            </p>

            <section className="terms-section">
              <h3>1. Definiciones</h3>
              <ul>
                <li><strong>"ClientCore"</strong> se refiere al sistema de software ofrecido como servicio (SaaS).</li>
                <li><strong>"Usuario"</strong> o <strong>"Cliente"</strong> se refiere a la persona que utiliza el servicio.</li>
                <li><strong>"Datos"</strong> se refiere a la información que el usuario almacena en el sistema.</li>
                <li><strong>"Suscripción"</strong> se refiere al acceso de pago al servicio después del período de prueba.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>2. Descripción del Servicio</h3>
              <p>ClientCore es un sistema de gestión y almacenamiento de datos diseñado para personas que otorgan préstamos y necesitan organizar la información de sus clientes de manera eficiente.</p>
              <p><strong>IMPORTANTE:</strong> ClientCore NO otorga préstamos ni servicios financieros directos. Solo proporciona una herramienta de software para el registro y organización de datos.</p>
            </section>

            <section className="terms-section">
              <h3>3. Período de Prueba Gratuita</h3>
              <ul>
                <li>Todo nuevo usuario recibe automáticamente <strong>7 días de prueba gratuita</strong> con acceso completo al sistema.</li>
                <li>Durante el período de prueba, el usuario puede utilizar todas las funcionalidades sin restricciones.</li>
                <li>Al finalizar los 7 días, el acceso se limita a <strong>modo solo lectura</strong> (visualización de datos existentes, sin poder crear nuevos registros).</li>
                <li>Para reactivar el acceso completo, el usuario debe suscribirse a uno de los planes de pago disponibles.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>4. Planes y Precios</h3>
              <div className="pricing-table">
                <div className="plan-item">
                  <h4>Plan Básico</h4>
                  <p className="price">S/ 30.00 / mes</p>
                  <ul>
                    <li>Hasta 100 créditos activos</li>
                    <li>1 usuario por cuenta</li>
                    <li>Dashboard estándar</li>
                    <li>Soporte por correo electrónico</li>
                  </ul>
                </div>
                <div className="plan-item">
                  <h4>Plan Profesional</h4>
                  <p className="price">S/ 60.00 / mes</p>
                  <ul>
                    <li>Créditos ilimitados</li>
                    <li>Hasta 3 usuarios por cuenta</li>
                    <li>Dashboard avanzado</li>
                    <li>Descarga de PDF</li>
                    <li>Soporte prioritario</li>
                  </ul>
                </div>
              </div>
              <p className="note"><strong>Nota:</strong> Los precios están sujetos a cambios. Los usuarios suscritos serán notificados con anticipación de cualquier modificación en las tarifas.</p>
            </section>

            <section className="terms-section">
              <h3>5. Pagos</h3>
              <ul>
                <li>Los pagos se realizan mediante <strong>Yape</strong> al número de contacto proporcionado.</li>
                <li>La suscripción se activa manualmente por el administrador una vez confirmado el pago.</li>
                <li>El período de suscripción comienza desde el momento de la activación.</li>
                <li><strong>No se realizan devoluciones</strong> de pagos una vez activada la suscripción.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>6. Garantía de Servicio Técnico</h3>
              <ul>
                <li>ClientCore se compromete a mantener el sistema funcionando correctamente.</li>
                <li>En caso de errores graves que impidan el uso normal del sistema:</li>
                <li style={{ marginLeft: '20px' }}>Si el problema no se corrige dentro de los <strong>2-3 días hábiles</strong>, el usuario afectado recibirá <strong>1 semana adicional gratis</strong> como compensación.</li>
                <li>Esta garantía aplica únicamente a errores técnicos atribuibles al sistema, no a problemas de conectividad del usuario o dispositivos.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>7. Protección y Uso de Datos</h3>
              <ul>
                <li>ClientCore almacena los datos proporcionados por el usuario de manera segura.</li>
                <li>La información NO se comparte con terceros ni se utiliza para fines distintos a la prestación del servicio.</li>
                <li>Los datos se conservan durante <strong>3 meses</strong> después de la cancelación de la suscripción, pasado este tiempo pueden ser eliminados.</li>
                <li>El usuario es responsable de la veracidad y legalidad de los datos que ingresa al sistema.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>8. Prohibiciones</h3>
              <p>Queda estrictamente prohibido el uso de ClientCore para:</p>
              <ul>
                <li>Actividades ilegales o fraudulentas de cualquier tipo.</li>
                <li>Usura, extorsión o cualquier práctica financiera no autorizada por la ley.</li>
                <li>Almacenar datos de personas sin su consentimiento.</li>
                <li>Intentar acceder a cuentas de otros usuarios.</li>
                <li>Distribuir malware o realizar ataques cibernéticos.</li>
                <li>Revender o sublicenciar el acceso al sistema.</li>
              </ul>
              <p>El incumplimiento de estas prohibiciones resultará en la cancelación inmediata de la cuenta sin derecho a reembolso.</p>
            </section>

            <section className="terms-section">
              <h3>9. Cancelación del Servicio</h3>
              <ul>
                <li>El usuario puede cancelar su suscripción en cualquier momento.</li>
                <li>Al cancelar, el usuario mantiene acceso en modo solo lectura durante 3 meses.</li>
                <li>Pasados los 3 meses, los datos pueden ser eliminados permanentemente.</li>
                <li>Para recuperar acceso completo, el usuario debe reactivar su suscripción.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>10. Limitación de Responsabilidad</h3>
              <ul>
                <li>ClientCore es una herramienta de software y no asume responsabilidad por las decisiones financieras que tomen los usuarios.</li>
                <li>No garantizamos que el sistema esté libre de errores, aunque nos comprometemos a corregirlos lo antes posible.</li>
                <li>El usuario es responsable de mantener segura su contraseña y credenciales de acceso.</li>
                <li>No nos hacemos responsables por pérdida de datos debido a negligencia del usuario (olvidar contraseña, eliminar datos accidentalmente, etc.).</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>11. Modificaciones de los Términos</h3>
              <ul>
                <li>Nos reservamos el derecho de modificar estos términos en cualquier momento.</li>
                <li>Los cambios significativos serán notificados a los usuarios por correo electrónico.</li>
                <li>El uso continuado del servicio después de la notificación implica la aceptación de los nuevos términos.</li>
              </ul>
            </section>

            <section className="terms-section">
              <h3>12. Contacto</h3>
              <p>Para cualquier consulta, soporte o reclamo, puede contactarnos mediante:</p>
              <div className="contact-info">
                <p><strong>Correo electrónico:</strong> cristoferagurto2@gmail.com</p>
                <p><strong>WhatsApp:</strong> 913 664 993</p>
              </div>
              <p style={{ marginTop: '15px' }}><strong>Horario de atención:</strong> Lunes a Viernes de 9:00 a.m. a 6:00 p.m. (hora de Perú)</p>
            </section>

            <section className="terms-section">
              <h3>13. Aceptación</h3>
              <p>Al registrarse y utilizar ClientCore, usted declara que ha leído, comprendido y acepta todos los términos y condiciones descritos en este documento. Si no está de acuerdo con alguno de estos términos, por favor no utilice el servicio.</p>
            </section>
          </div>
        </div>

        <div className="modal-footer">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">
              He leído y acepto los Términos y Condiciones de uso
            </span>
          </label>

          <div className="buttons-container">
            <button 
              className={`btn-primary ${!accepted ? 'disabled' : ''}`}
              onClick={handleAccept}
              disabled={!accepted}
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

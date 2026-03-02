import './SupportButton.css';

export default function SupportButton() {
  const handleSupportClick = () => {
    const subject = encodeURIComponent('Soporte Técnico - ClientCode');
    const body = encodeURIComponent('Hola, necesito ayuda con:\n\n[Describe tu consulta aquí]\n\nSaludos,');
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=cristoferagurto2@gmail.com&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <button 
      className="support-button"
      onClick={handleSupportClick}
      title="Contactar Soporte Técnico"
    >
      <span className="support-icon">💬</span>
      <span className="support-text">Soporte</span>
    </button>
  );
}

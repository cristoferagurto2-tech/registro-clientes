import { useState, useEffect } from 'react';
import './WhitelistManager.css';

// Correos VIP que no se pueden eliminar (acceso gratuito permanente)
const VIP_EMAILS = ['cristovalleagur@gmail.com', 'yudyagurto1983@gmail.com'];

export default function WhitelistManager() {
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para asegurar que los VIPs estén siempre en la lista
  const ensureVipsInList = (emails) => {
    const normalizedVips = VIP_EMAILS.map(email => email.toLowerCase().trim());
    const normalizedEmails = emails.map(email => email.toLowerCase().trim());
    
    // Agregar VIPs que falten
    normalizedVips.forEach(vip => {
      if (!normalizedEmails.includes(vip)) {
        normalizedEmails.push(vip);
      }
    });
    
    return normalizedEmails;
  };

  // Cargar emails al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('allowedEmails');
    if (saved) {
      const parsedEmails = JSON.parse(saved);
      // Asegurar que los VIPs estén en la lista
      const emailsWithVips = ensureVipsInList(parsedEmails);
      setAllowedEmails(emailsWithVips);
      // Guardar la lista actualizada con VIPs
      localStorage.setItem('allowedEmails', JSON.stringify(emailsWithVips));
    } else {
      // Lista por defecto si no hay nada guardado (incluye VIPs)
      const defaultEmails = [
        'cliente1@email.com',
        'cliente2@email.com',
        'prueba@clientcore.com',
        'cristovalleagur@gmail.com',
        'yudyagurto1983@gmail.com'
      ];
      setAllowedEmails(defaultEmails);
      localStorage.setItem('allowedEmails', JSON.stringify(defaultEmails));
    }
  }, []);

  // Guardar cuando cambie
  useEffect(() => {
    localStorage.setItem('allowedEmails', JSON.stringify(allowedEmails));
  }, [allowedEmails]);

  const handleAddEmail = (e) => {
    e.preventDefault();
    
    const email = newEmail.toLowerCase().trim();
    
    if (!email || !email.includes('@')) {
      setMessage('Error: Ingrese un correo válido');
      return;
    }

    if (allowedEmails.includes(email)) {
      setMessage('Error: Este correo ya está en la lista');
      return;
    }

    setAllowedEmails([...allowedEmails, email]);
    setNewEmail('');
    setMessage(`Correo agregado: ${email}`);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const isVipEmail = (email) => {
    return VIP_EMAILS.includes(email.toLowerCase().trim());
  };

  const handleRemoveEmail = (emailToRemove) => {
    // No permitir eliminar correos VIP
    if (isVipEmail(emailToRemove)) {
      setMessage('Error: Este correo es VIP y no puede ser eliminado');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (window.confirm(`¿Eliminar ${emailToRemove} de la lista blanca?\n\nLos usuarios con este correo no podrán registrarse.`)) {
      setAllowedEmails(allowedEmails.filter(email => email !== emailToRemove));
      setMessage(`Correo eliminado: ${emailToRemove}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Eliminar TODOS los correos de la lista blanca?\n\nLos correos VIP no serán eliminados.\n\nEsta acción no se puede deshacer.')) {
      // Mantener solo los correos VIP
      const vipsOnly = allowedEmails.filter(email => isVipEmail(email));
      setAllowedEmails(vipsOnly);
      setMessage(`Lista limpiada. ${vipsOnly.length} correo(s) VIP protegido(s).`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Separar por líneas, comas o punto y coma
        const emails = text.split(/[\n,;]/)
          .map(e => e.trim().toLowerCase())
          .filter(e => e.includes('@'));
        
        // Eliminar duplicados
        const uniqueEmails = [...new Set([...allowedEmails, ...emails])];
        setAllowedEmails(uniqueEmails);
        setMessage(`Importados ${emails.length} correos`);
        setTimeout(() => setMessage(''), 3000);
      } catch (_error) {
        setMessage('Error al importar archivo');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const text = allowedEmails.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista-blanca-emails.txt';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Lista exportada');
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredEmails = allowedEmails.filter(email => 
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="whitelist-manager">
      <div className="whitelist-header">
        <h2>Lista Blanca de Correos</h2>
        <p>Gestione los correos electrónicos autorizados para registrarse en el sistema</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="whitelist-stats">
        <div className="stat-box">
          <span className="stat-number">{allowedEmails.length}</span>
          <span className="stat-label">Correos autorizados</span>
        </div>
      </div>

      <div className="whitelist-actions">
        <form onSubmit={handleAddEmail} className="add-email-form">
          <div className="form-group">
            <label>Agregar nuevo correo:</label>
            <div className="input-group">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
              <button type="submit" className="btn-add">
                Agregar
              </button>
            </div>
          </div>
        </form>

        <div className="bulk-actions">
          <label className="btn-import">
            Importar lista
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleExport} className="btn-export">
            Exportar lista
          </button>
        </div>
      </div>

      <div className="email-list-section">
        <div className="list-header">
          <h3>Correos autorizados ({filteredEmails.length})</h3>
          <div className="list-actions">
            <input
              type="text"
              placeholder="Buscar correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {allowedEmails.length > 0 && (
              <button onClick={handleClearAll} className="btn-clear">
                Vaciar todo
              </button>
            )}
          </div>
        </div>

        {filteredEmails.length === 0 ? (
          <div className="empty-list">
            {searchTerm ? (
              <p>No se encontraron correos con "{searchTerm}"</p>
            ) : (
              <>
                <p>No hay correos en la lista blanca</p>
                <span className="empty-hint">Agregue correos usando el formulario de arriba</span>
              </>
            )}
          </div>
        ) : (
          <div className="email-list">
            {filteredEmails.map((email, index) => (
              <div key={email} className={`email-item ${isVipEmail(email) ? 'vip' : ''}`}>
                <span className="email-number">{index + 1}</span>
                <span className="email-address">{email}</span>
                {isVipEmail(email) && (
                  <span className="vip-badge" title="VIP - Acceso gratuito permanente">VIP</span>
                )}
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="btn-remove"
                  title={isVipEmail(email) ? "VIP - No puede ser eliminado" : "Eliminar correo"}
                  disabled={isVipEmail(email)}
                >
                  {isVipEmail(email) ? 'Protegido' : 'Eliminar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="whitelist-info">
        <h4>Información importante:</h4>
        <ul>
          <li>Solo los correos en esta lista podrán registrarse en el sistema</li>
          <li>Los usuarios con correos no autorizados verán un mensaje de error al intentar registrarse</li>
          <li>Puede importar múltiples correos desde un archivo .txt o .csv</li>
          <li>Los cambios se guardan automáticamente</li>
          <li>Para registrar un nuevo cliente, primero debe agregar su correo a esta lista</li>
          <li><strong>Correos VIP (marcados en amarillo):</strong> Tienen acceso gratuito permanente y no pueden ser eliminados</li>
        </ul>
        
        <div className="browser-note">
          <strong>⚠️ Nota sobre modo incógnito:</strong>
          <p>Si usas modo incógnito o privado del navegador, los datos no se comparten con ventanas normales. Se recomienda usar el navegador normal o exportar/importar la lista cuando cambies de dispositivo/navegador.</p>
        </div>
      </div>
    </div>
  );
}

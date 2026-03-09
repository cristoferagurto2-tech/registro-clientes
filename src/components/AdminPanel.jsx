import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WhitelistManager from './WhitelistManager';

import './AdminPanel.css';

export default function AdminPanel() {
  const { clients, removeClient, updateClientPassword, subscribeClient, getTrialStatus } = useAuth();
  const [showPasswords, setShowPasswords] = useState({});
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' o 'whitelist'

  const togglePasswordVisibility = (clientId) => {
    setShowPasswords(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleRemoveClient = (clientId, clientEmail) => {
    if (window.confirm(`¿Eliminar al cliente ${clientEmail}?\n\nEsta acción también eliminará todos sus documentos.`)) {
      removeClient(clientId);
      setMessage('Cliente eliminado');
    }
  };

  const handleResetPassword = (client) => {
    const newPassword = prompt(`Restablecer contraseña para ${client.name}\n\nIngrese la nueva contraseña (mínimo 6 caracteres):`);

    if (newPassword) {
      if (newPassword.length < 6) {
        setMessage('Error: La contraseña debe tener al menos 6 caracteres');
        return;
      }

      updateClientPassword(client.id, newPassword);
      setMessage(`Contraseña actualizada para ${client.name}`);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <p>Gestione clientes, documentos y acceso al sistema</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          Clientes
        </button>
        <button 
          className={`tab-button ${activeTab === 'whitelist' ? 'active' : ''}`}
          onClick={() => setActiveTab('whitelist')}
        >
          Lista Blanca
        </button>
      </div>

      {/* Contenido según tab seleccionado */}
      {activeTab === 'whitelist' ? (
        <WhitelistManager />
      ) : (
        <>
          {/* Lista de Clientes */}
          <div className="clients-section">
            <div className="section-header">
              <h3>Clientes Registrados ({clients.length})</h3>
            </div>

            {clients.length === 0 ? (
              <div className="empty-clients">
                <p>No hay clientes registrados</p>
                <p className="empty-hint">Los clientes deben registrarse por sí mismos. Agregue sus emails a la Lista Blanca primero.</p>
              </div>
            ) : (
              <div className="clients-table-container">
                <table className="clients-table">
                   <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th>Contraseña</th>
                      <th>Suscripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => {
                      const showPass = showPasswords[client.id];
                      const trialStatus = getTrialStatus(client.email);
                      const isSubscribed = trialStatus?.isSubscribed;
                      const isTrialActive = trialStatus?.isTrialActive;
                      const daysRemaining = trialStatus?.daysRemaining;

                      return (
                        <tr key={client.id}>
                          <td>
                            <div className="client-cell">
                              <div className="client-avatar">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="client-name">{client.name}</span>
                            </div>
                          </td>
                          <td className="email-cell">{client.email}</td>
                          <td className="password-cell">
                            <div className="password-display">
                              <code className="password-code">
                                {showPass ? client.password : '••••••••'}
                              </code>
                              <button 
                                className="btn-show-password"
                                onClick={() => togglePasswordVisibility(client.id)}
                                title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                              >
                                {showPass ? 'Ocultar' : 'Ver'}
                              </button>
                            </div>
                          </td>
                          <td className="subscription-cell">
                            {isSubscribed ? (
                              <span className="badge-subscription active">Activa</span>
                            ) : isTrialActive ? (
                              <span className="badge-subscription trial">Trial: {daysRemaining} días</span>
                            ) : (
                              <span className="badge-subscription expired">Expirada</span>
                            )}
                          </td>
                          <td className="actions-cell">
                            <button 
                              className="btn-action password"
                              onClick={() => handleResetPassword(client)}
                              title="Cambiar contraseña"
                            >
                              Contraseña
                            </button>
                            {!isSubscribed && (
                              <button 
                                className="btn-action subscribe"
                                onClick={() => {
                                  if (window.confirm(`¿Activar suscripción para ${client.name}?\n\nEl cliente podrá usar el sistema sin límites.`)) {
                                    subscribeClient(client.email);
                                    setMessage(`Suscripción activada para ${client.name}`);
                                  }
                                }}
                                title="Activar suscripción"
                              >
                                Suscribir
                              </button>
                            )}
                            <button 
                              className="btn-action delete"
                              onClick={() => handleRemoveClient(client.id, client.email)}
                              title="Eliminar cliente"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-instructions">
            <h3>Información del Administrador</h3>
            <div className="admin-credentials">
              <p><strong>Email:</strong> cristoferagurto2@gmail.com</p>
              <p><strong>Contraseña:</strong> admin123</p>
            </div>
            <div className="workflow-info" style={{marginTop: '20px', padding: '16px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #dbeafe'}}>
              <h4 style={{fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.025em'}}>Flujo de trabajo:</h4>
              <ol style={{margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#374151', lineHeight: '1.8'}}>
                <li><strong>Paso 1:</strong> Agregue el email del nuevo cliente a la <strong>Lista Blanca</strong></li>
                <li><strong>Paso 2:</strong> El cliente se registra y recibe automáticamente los documentos listos para usar</li>
                <li><strong>Paso 3:</strong> El cliente puede comenzar a ingresar sus datos inmediatamente</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import ClientDocumentsManager from './ClientDocumentsManager';
import WhitelistManager from './WhitelistManager';
import './AdminPanel.css';

export default function AdminPanel() {
  const { clients, removeClient, updateClientPassword } = useAuth();
  const { clientHasAnyDocument } = useDocuments();
  const [selectedClient, setSelectedClient] = useState(null);
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
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
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

  // Si hay un cliente seleccionado, mostrar su gestor de documentos
  if (selectedClient) {
    return (
      <ClientDocumentsManager 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)}
      />
    );
  }

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
                      <th>Documentos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => {
                      const hasDocs = clientHasAnyDocument(client.id);
                      const showPass = showPasswords[client.id];

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
                          <td className="docs-cell">
                            {hasDocs ? (
                              <span className="badge-docs yes">Si</span>
                            ) : (
                              <span className="badge-docs no">No</span>
                            )}
                          </td>
                          <td className="actions-cell">
                            <button 
                              className="btn-action manage"
                              onClick={() => setSelectedClient(client)}
                              title="Gestionar documentos"
                            >
                              Documentos
                            </button>
                            <button 
                              className="btn-action password"
                              onClick={() => handleResetPassword(client)}
                              title="Cambiar contraseña"
                            >
                              Contraseña
                            </button>
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
                <li><strong>Paso 2:</strong> El cliente se registra por sí mismo eligiendo su propia contraseña</li>
                <li><strong>Paso 3:</strong> Usted puede ver la contraseña que el cliente eligió en esta tabla</li>
                <li><strong>Paso 4:</strong> Asigne documentos al cliente según sea necesario</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

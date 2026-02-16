import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import ClientDocumentsManager from './ClientDocumentsManager';
import './AdminPanel.css';

export default function AdminPanel() {
  const { clients, addClient, removeClient, updateClientPassword } = useAuth();
  const { getClientsWithDocuments, clientHasAnyDocument } = useDocuments();
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [newClient, setNewClient] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const togglePasswordVisibility = (clientId) => {
    setShowPasswords(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.email || !newClient.email.includes('@')) {
      setMessage('❌ Por favor ingresa un correo válido');
      return;
    }

    if (!newClient.password || newClient.password.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const existingClient = clients.find(c => c.email.toLowerCase() === newClient.email.toLowerCase());
    if (existingClient) {
      setMessage('❌ Este cliente ya existe');
      return;
    }

    const client = addClient(
      newClient.email, 
      newClient.name || `Cliente ${clients.length + 1}`,
      newClient.password
    );
    
    setMessage(`✅ Cliente agregado: ${newClient.email}\n📧 Email: ${newClient.email}\n🔑 Contraseña: ${newClient.password}`);
    setNewClient({ email: '', name: '', password: '' });
    setShowAddClient(false);
  };

  const handleRemoveClient = (clientId, clientEmail) => {
    if (window.confirm(`¿Eliminar al cliente ${clientEmail}?\n\n⚠️ Esto también eliminará todos sus documentos.`)) {
      removeClient(clientId);
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      setMessage('🗑️ Cliente eliminado');
    }
  };

  const handleResetPassword = (client) => {
    const newPassword = prompt(`Restablecer contraseña para ${client.name}\n\nIngresa la nueva contraseña (mínimo 6 caracteres):`);
    
    if (newPassword) {
      if (newPassword.length < 6) {
        setMessage('❌ La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      updateClientPassword(client.id, newPassword);
      setMessage(`✅ Contraseña actualizada para ${client.name}\n🔑 Nueva contraseña: ${newPassword}`);
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
        <h2>👥 Gestión de Clientes</h2>
        <p>Administra tus clientes, sus contraseñas y documentos.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="clients-section">
        <div className="section-header">
          <h3>📋 Clientes Registrados ({clients.length})</h3>
          <button 
            className="btn-add-client"
            onClick={() => setShowAddClient(true)}
          >
            ➕ Agregar Cliente
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="empty-clients">
            <span className="empty-icon">👤</span>
            <p>No hay clientes registrados</p>
            <button 
              className="btn-add-client"
              onClick={() => setShowAddClient(true)}
            >
              Agregar primer cliente
            </button>
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
                          <div className="client-avatar-small">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="client-name-cell">{client.name}</span>
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
                            {showPass ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </td>
                      <td className="docs-cell">
                        {hasDocs ? (
                          <span className="badge-docs yes">✅ Sí</span>
                        ) : (
                          <span className="badge-docs no">⚪ No</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-action manage"
                          onClick={() => setSelectedClient(client)}
                          title="Gestionar documentos"
                        >
                          📂
                        </button>
                        <button 
                          className="btn-action password"
                          onClick={() => handleResetPassword(client)}
                          title="Cambiar contraseña"
                        >
                          🔑
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => handleRemoveClient(client.id, client.email)}
                          title="Eliminar cliente"
                        >
                          🗑️
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

      {/* Modal para agregar cliente */}
      {showAddClient && (
        <div className="modal-overlay" onClick={() => setShowAddClient(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Agregar Nuevo Cliente</h3>
            <form onSubmit={handleAddClient}>
              <div className="form-row">
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="cliente@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Contraseña * (mínimo 6 caracteres)</label>
                <input
                  type="text"
                  value={newClient.password}
                  onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                  placeholder="Ingresa una contraseña segura"
                  required
                  minLength={6}
                />
                <span className="field-hint">El cliente usará esta contraseña para iniciar sesión</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddClient(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Agregar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-instructions">
        <h3>📋 Información del Admin:</h3>
        <div className="admin-credentials">
          <p><strong>📧 Email:</strong> cristoferagurto2@gmail.com</p>
          <p><strong>🔑 Contraseña:</strong> admin123</p>
        </div>
        <h4 style={{marginTop: '20px'}}>📋 Cómo funciona:</h4>
        <ol>
          <li><strong>Agrega clientes:</strong> Crea una cuenta con email, nombre y contraseña</li>
          <li><strong>Ver contraseñas:</strong> Haz clic en el ojo 👁️ para ver la contraseña de cada cliente</li>
          <li><strong>Cambiar contraseña:</strong> Usa el botón 🔑 para restablecer la contraseña</li>
          <li><strong>Asigna documentos:</strong> Haz clic en 📂 para subir archivos Excel por mes</li>
          <li><strong>Privacidad:</strong> Cada cliente solo ve sus propios documentos</li>
        </ol>
      </div>
    </div>
  );
}

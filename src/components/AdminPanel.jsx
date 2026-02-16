import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import ClientDocumentsManager from './ClientDocumentsManager';
import './AdminPanel.css';

export default function AdminPanel() {
  const { clients, addClient, removeClient } = useAuth();
  const { getClientsWithDocuments, clientHasAnyDocument } = useDocuments();
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [message, setMessage] = useState('');

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClientEmail || !newClientEmail.includes('@')) {
      setMessage('❌ Por favor ingresa un correo válido');
      return;
    }

    const existingClient = clients.find(c => c.email.toLowerCase() === newClientEmail.toLowerCase());
    if (existingClient) {
      setMessage('❌ Este cliente ya existe');
      return;
    }

    addClient(newClientEmail, newClientName || `Cliente ${clients.length + 1}`);
    setMessage(`✅ Cliente agregado: ${newClientEmail}`);
    setNewClientEmail('');
    setNewClientName('');
    setShowAddClient(false);
  };

  const handleRemoveClient = (clientId, clientEmail) => {
    if (window.confirm(`¿Eliminar al cliente ${clientEmail}?`)) {
      removeClient(clientId);
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      setMessage('🗑️ Cliente eliminado');
    }
  };

  const clientsWithDocs = getClientsWithDocuments();

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
        <p>Selecciona un cliente para asignarle documentos o gestionar sus archivos.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
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
          <div className="clients-grid">
            {clients.map((client) => {
              const hasDocs = clientHasAnyDocument(client.id);
              const docCount = hasDocs ? Object.keys(getClientsWithDocuments().find(id => id === client.id) || {}).length : 0;

              return (
                <div 
                  key={client.id} 
                  className={`client-card ${hasDocs ? 'has-documents' : ''}`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="client-avatar">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="client-info">
                    <h4 className="client-name">{client.name}</h4>
                    <p className="client-email">{client.email}</p>
                    <span className="client-status">
                      {hasDocs ? (
                        <span className="status-badge active">
                          ✅ Con documentos
                        </span>
                      ) : (
                        <span className="status-badge inactive">
                          ⚪ Sin documentos
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="client-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn-manage"
                      onClick={() => setSelectedClient(client)}
                    >
                      📂 Gestionar
                    </button>
                    <button 
                      className="btn-delete-client"
                      onClick={() => handleRemoveClient(client.id, client.email)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para agregar cliente */}
      {showAddClient && (
        <div className="modal-overlay" onClick={() => setShowAddClient(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Agregar Nuevo Cliente</h3>
            <form onSubmit={handleAddClient}>
              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre (opcional)</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
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
        <h3>📋 Cómo funciona:</h3>
        <ol>
          <li><strong>Agrega clientes:</strong> Crea una cuenta para cada cliente con su correo</li>
          <li><strong>Asigna documentos:</strong> Selecciona un cliente y sube archivos Excel para cada mes</li>
          <li><strong>Personalización:</strong> Cada cliente tendrá sus propios documentos individuales</li>
          <li><strong>Acceso:</strong> Los clientes solo verán y podrán editar sus propios documentos</li>
        </ol>
      </div>
    </div>
  );
}

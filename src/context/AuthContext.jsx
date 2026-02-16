import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Correo del admin autorizado
const ADMIN_EMAIL = 'cristoferagurto2@gmail.com';

// Lista inicial de clientes autorizados con sus IDs
const INITIAL_CLIENTS = [
  { id: 'cliente-001', email: 'cliente1@email.com', name: 'Cliente 1' },
  { id: 'cliente-002', email: 'cliente2@email.com', name: 'Cliente 2' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    const savedClients = localStorage.getItem('clients');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.email === ADMIN_EMAIL);
    }
    
    // Cargar clientes o usar los iniciales
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('clients', JSON.stringify(INITIAL_CLIENTS));
    }
  }, []);

  // Guardar clientes cuando cambien
  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem('clients', JSON.stringify(clients));
    }
  }, [clients]);

  const login = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const admin = normalizedEmail === ADMIN_EMAIL.toLowerCase();
    
    // Verificar si es cliente autorizado
    const client = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    const isAuthorized = admin || client;
    
    if (!isAuthorized) {
      return { success: false, error: 'Correo no autorizado. Contacta al administrador.' };
    }

    const userData = {
      id: admin ? 'admin' : client.id,
      email: normalizedEmail,
      role: admin ? 'admin' : 'cliente',
      name: admin ? 'Administrador' : client.name,
      loginTime: new Date().toISOString()
    };

    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(admin);
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
  };

  // Funciones para gestionar clientes (solo admin)
  const addClient = (email, name) => {
    const newClient = {
      id: `cliente-${Date.now()}`,
      email: email.toLowerCase().trim(),
      name: name || `Cliente ${clients.length + 1}`
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const removeClient = (clientId) => {
    setClients(clients.filter(c => c.id !== clientId));
  };

  const getClientByEmail = (email) => {
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  };

  const getClientById = (clientId) => {
    return clients.find(c => c.id === clientId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin, 
      clients,
      login, 
      logout,
      addClient,
      removeClient,
      getClientByEmail,
      getClientById
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

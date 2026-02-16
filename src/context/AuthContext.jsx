import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Correo del admin autorizado
const ADMIN_EMAIL = 'cristoferagurto2@gmail.com';
const ADMIN_PASSWORD = 'admin123'; // Contraseña fija para admin

// Lista inicial de clientes autorizados con sus IDs
const INITIAL_CLIENTS = [
  { 
    id: 'cliente-001', 
    email: 'cliente1@email.com', 
    name: 'Cliente 1',
    password: 'cliente123',
    isRegistered: true 
  },
  { 
    id: 'cliente-002', 
    email: 'cliente2@email.com', 
    name: 'Cliente 2',
    password: 'cliente123',
    isRegistered: true 
  },
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

  // Login con email y contraseña
  const login = (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar si es admin
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password !== ADMIN_PASSWORD) {
        return { success: false, error: 'Contraseña de administrador incorrecta' };
      }
      
      const userData = {
        id: 'admin',
        email: normalizedEmail,
        role: 'admin',
        name: 'Administrador',
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    }
    
    // Buscar cliente
    const client = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    
    if (!client) {
      return { success: false, error: 'Correo no registrado. Contacta al administrador.' };
    }

    // Verificar si ya completó el registro
    if (!client.isRegistered) {
      return { success: false, error: 'Primero debes completar tu registro. Ve a "Registrarme".' };
    }

    // Verificar contraseña
    if (client.password !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    const userData = {
      id: client.id,
      email: normalizedEmail,
      role: 'cliente',
      name: client.name,
      loginTime: new Date().toISOString()
    };

    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(false);
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true };
  };

  // Registro de nuevo cliente (primera vez)
  const registerClient = (email, password, confirmPassword, name) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validaciones
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Por favor ingresa un correo válido' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (password !== confirmPassword) {
      return { success: false, error: 'Las contraseñas no coinciden' };
    }
    
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Por favor ingresa tu nombre' };
    }

    // Verificar si el email ya existe
    const existingClient = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    if (existingClient) {
      return { success: false, error: 'Este correo ya está registrado. Usa "Iniciar Sesión".' };
    }

    // Crear nuevo cliente
    const newClient = {
      id: `cliente-${Date.now()}`,
      email: normalizedEmail,
      name: name.trim(),
      password: password,
      isRegistered: true,
      registeredAt: new Date().toISOString()
    };

    setClients([...clients, newClient]);
    
    return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
  };

  // Funciones para gestionar clientes (solo admin)
  const addClient = (email, name, password = 'temporal123') => {
    const newClient = {
      id: `cliente-${Date.now()}`,
      email: email.toLowerCase().trim(),
      name: name || `Cliente ${clients.length + 1}`,
      password: password,
      isRegistered: true,
      createdByAdmin: true
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const removeClient = (clientId) => {
    setClients(clients.filter(c => c.id !== clientId));
  };

  const updateClientPassword = (clientId, newPassword) => {
    setClients(clients.map(c => 
      c.id === clientId ? { ...c, password: newPassword } : c
    ));
  };

  const getClientByEmail = (email) => {
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  };

  const getClientById = (clientId) => {
    return clients.find(c => c.id === clientId);
  };

  // Verificar si un email está autorizado para registrarse
  const canRegister = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const client = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    return !client; // Puede registrarse si no existe
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin, 
      clients,
      login, 
      logout,
      registerClient,
      addClient,
      removeClient,
      updateClientPassword,
      getClientByEmail,
      getClientById,
      canRegister
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

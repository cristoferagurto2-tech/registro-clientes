import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Correo del admin autorizado
const ADMIN_EMAIL = 'cristoferagurto2@gmail.com';
const ADMIN_PASSWORD = 'admin123'; // Contraseña fija para admin

// Correo VIP (acceso gratuito permanente para familiar)
const VIP_EMAIL = 'cristovalleagur@gmail.com'; // Acceso gratuito permanente

// Periodo de prueba: 7 días en milisegundos
const TRIAL_PERIOD_DAYS = 7;
const TRIAL_PERIOD_MS = TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

// Función para obtener la lista blanca desde localStorage
const getAllowedEmails = () => {
  const saved = localStorage.getItem('allowedEmails');
  if (saved) {
    return JSON.parse(saved);
  }
  // Lista por defecto si no existe
  const defaultList = ['cliente1@email.com', 'cliente2@email.com', 'cristovalleagur@gmail.com'];
  localStorage.setItem('allowedEmails', JSON.stringify(defaultList));
  return defaultList;
};

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
  { 
    id: 'cliente-003', 
    email: 'cristovalleagur@gmail.com', 
    name: 'Cristo Agurto',
    password: '123456',
    isRegistered: true 
  },
  { 
    id: 'cliente-prueba', 
    email: 'prueba@clientcore.com', 
    name: 'Usuario de Prueba',
    password: '654321',
    isRegistered: true,
    registeredAt: new Date().toISOString()
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState([]);
  const [resetCodes, setResetCodes] = useState({});

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

  // Guardar códigos de recuperación cuando cambien
  useEffect(() => {
    localStorage.setItem('resetCodes', JSON.stringify(resetCodes));
  }, [resetCodes]);

  // Solicitar código de recuperación
  const requestPasswordReset = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar si el email existe (admin o cliente)
    const isAdminEmail = normalizedEmail === ADMIN_EMAIL.toLowerCase();
    const client = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    
    if (!isAdminEmail && !client) {
      return { success: false, error: 'No existe una cuenta con este correo electrónico' };
    }
    
    // Generar código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar código con expiración (30 minutos)
    setResetCodes(prev => ({
      ...prev,
      [normalizedEmail]: {
        code: code,
        expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutos
        attempts: 0
      }
    }));
    
    return { 
      success: true, 
      code: code,
      message: 'Código de recuperación generado' 
    };
  };

  // Verificar código de recuperación
  const verifyResetCode = (email, code) => {
    const normalizedEmail = email.toLowerCase().trim();
    const resetData = resetCodes[normalizedEmail];
    
    if (!resetData) {
      return { success: false, error: 'Código no válido o expirado' };
    }
    
    // Verificar expiración
    if (Date.now() > resetData.expiresAt) {
      // Eliminar código expirado
      setResetCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[normalizedEmail];
        return newCodes;
      });
      return { success: false, error: 'El código ha expirado. Solicite uno nuevo.' };
    }
    
    // Verificar intentos (máximo 3)
    if (resetData.attempts >= 3) {
      setResetCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[normalizedEmail];
        return newCodes;
      });
      return { success: false, error: 'Demasiados intentos fallidos. Solicite un nuevo código.' };
    }
    
    // Verificar código
    if (resetData.code !== code) {
      setResetCodes(prev => ({
        ...prev,
        [normalizedEmail]: {
          ...prev[normalizedEmail],
          attempts: prev[normalizedEmail].attempts + 1
        }
      }));
      return { success: false, error: `Código incorrecto. Intentos restantes: ${3 - (resetData.attempts + 1)}` };
    }
    
    // Marcar como verificado
    setResetCodes(prev => ({
      ...prev,
      [normalizedEmail]: {
        ...prev[normalizedEmail],
        verified: true
      }
    }));
    
    return { success: true, message: 'Código verificado correctamente' };
  };

  // Restablecer contraseña
  const resetPassword = (email, newPassword) => {
    const normalizedEmail = email.toLowerCase().trim();
    const resetData = resetCodes[normalizedEmail];
    
    if (!resetData || !resetData.verified) {
      return { success: false, error: 'Debe verificar el código primero' };
    }
    
    // Verificar expiración
    if (Date.now() > resetData.expiresAt) {
      setResetCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[normalizedEmail];
        return newCodes;
      });
      return { success: false, error: 'El código ha expirado. Solicite uno nuevo.' };
    }
    
    // Actualizar contraseña según el tipo de usuario
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      // Para el admin, no podemos cambiar la contraseña fácilmente
      // ya que está hardcodeada. En producción esto iría a la base de datos
      return { 
        success: false, 
        error: 'No se puede restablecer la contraseña del administrador desde aquí. Contacte soporte.' 
      };
    } else {
      // Actualizar contraseña del cliente
      setClients(prev => prev.map(c => 
        c.email.toLowerCase() === normalizedEmail 
          ? { ...c, password: newPassword }
          : c
      ));
    }
    
    // Eliminar código usado
    setResetCodes(prev => {
      const newCodes = { ...prev };
      delete newCodes[normalizedEmail];
      return newCodes;
    });
    
    return { success: true, message: 'Contraseña actualizada correctamente' };
  };

  // Funciones para el período de prueba de 7 días
  const getTrialStatus = (clientEmail) => {
    const normalizedEmail = clientEmail.toLowerCase().trim();
    const client = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    
    if (!client) return null;
    
    // El admin y el VIP tienen acceso permanente gratuito
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() || 
        normalizedEmail === VIP_EMAIL.toLowerCase()) {
      return {
        isAdmin: normalizedEmail === ADMIN_EMAIL.toLowerCase(),
        isVIP: normalizedEmail === VIP_EMAIL.toLowerCase(),
        isTrialActive: true,
        isSubscribed: true,
        daysRemaining: null,
        trialEndDate: null,
        registeredAt: null
      };
    }
    
    const registeredAt = client.registeredAt ? new Date(client.registeredAt) : null;
    
    if (!registeredAt) {
      // Si no tiene fecha de registro, asumimos que es un cliente antiguo y le damos acceso completo
      return {
        isAdmin: false,
        isTrialActive: true,
        isSubscribed: true,
        daysRemaining: null,
        trialEndDate: null,
        registeredAt: null
      };
    }
    
    const now = new Date();
    const trialEndDate = new Date(registeredAt.getTime() + TRIAL_PERIOD_MS);
    const timeRemaining = trialEndDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const isTrialActive = timeRemaining > 0;
    
    return {
      isAdmin: false,
      isTrialActive,
      isSubscribed: client.isSubscribed || false,
      daysRemaining: isTrialActive ? daysRemaining : 0,
      trialEndDate: trialEndDate.toISOString(),
      registeredAt: client.registeredAt
    };
  };

  const canCreateCredits = (clientEmail) => {
    const status = getTrialStatus(clientEmail);
    if (!status) return false;
    
    // Admin siempre puede crear
    if (status.isAdmin) return true;
    
    // Si está suscrito, puede crear
    if (status.isSubscribed) return true;
    
    // Si el período de prueba está activo, puede crear
    return status.isTrialActive;
  };

  const isReadOnlyMode = (clientEmail) => {
    const status = getTrialStatus(clientEmail);
    if (!status) return true;
    
    // Admin nunca está en modo solo lectura
    if (status.isAdmin) return false;
    
    // Si está suscrito, no está en modo solo lectura
    if (status.isSubscribed) return false;
    
    // Si el período de prueba terminó, está en modo solo lectura
    return !status.isTrialActive;
  };

  const subscribeClient = (clientEmail) => {
    const normalizedEmail = clientEmail.toLowerCase().trim();
    
    setClients(prev => prev.map(c => 
      c.email.toLowerCase() === normalizedEmail 
        ? { ...c, isSubscribed: true, subscribedAt: new Date().toISOString() }
        : c
    ));
    
    return { success: true, message: 'Suscripción activada correctamente' };
  };

  // Login de usuario
  const login = (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar si es admin
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser = {
        email: ADMIN_EMAIL,
        name: 'Administrador',
        role: 'admin'
      };
      setUser(adminUser);
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }
    
    // Verificar si es cliente registrado
    const client = clients.find(c => 
      c.email.toLowerCase() === normalizedEmail && c.password === password
    );
    
    if (client) {
      const clientUser = {
        email: client.email,
        name: client.name,
        role: 'client',
        id: client.id
      };
      setUser(clientUser);
      setIsAuthenticated(true);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(clientUser));
      return { success: true, user: clientUser };
    }
    
    return { success: false, error: 'Correo o contraseña incorrectos' };
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
  };

  // Verificar si un correo puede registrarse (está en la lista blanca)
  const canRegister = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const allowedEmails = getAllowedEmails();
    return allowedEmails.includes(normalizedEmail);
  };

  // Registrar nuevo cliente
  const registerClient = (email, password, name) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar si está en lista blanca
    if (!canRegister(normalizedEmail)) {
      return { success: false, error: 'Este correo no está autorizado para registrarse. Contacte al administrador.' };
    }
    
    // Verificar si ya existe
    if (clients.some(c => c.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Ya existe una cuenta con este correo' };
    }
    
    // Crear nuevo cliente con fecha de inicio del trial
    const newClient = {
      id: `cliente-${Date.now()}`,
      email: normalizedEmail,
      name: name,
      password: password,
      isRegistered: true,
      registeredAt: new Date().toISOString(), // Aquí inicia el trial de 7 días
      isSubscribed: false
    };
    
    setClients(prev => [...prev, newClient]);
    return { success: true, message: 'Registro exitoso' };
  };

  // Obtener cliente por email
  const getClientByEmail = (email) => {
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase().trim());
  };

  // Obtener cliente por ID
  const getClientById = (id) => {
    return clients.find(c => c.id === id);
  };

  // Agregar cliente (para admin)
  const addClient = (clientData) => {
    const newClient = {
      ...clientData,
      id: `cliente-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      isSubscribed: false
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  // Eliminar cliente
  const removeClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Actualizar contraseña de cliente
  const updateClientPassword = (email, newPassword) => {
    const normalizedEmail = email.toLowerCase().trim();
    setClients(prev => prev.map(c => 
      c.email.toLowerCase() === normalizedEmail 
        ? { ...c, password: newPassword }
        : c
    ));
  };

  return (
    <AuthContext.Provider value={{
      user, 
      isAuthenticated, 
      isAdmin, 
      clients,
      allowedEmails: getAllowedEmails(),
      login, 
      logout,
      registerClient,
      addClient,
      removeClient,
      updateClientPassword,
      getClientByEmail,
      getClientById,
      canRegister,
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
      getTrialStatus,
      canCreateCredits,
      isReadOnlyMode,
      subscribeClient,
      TRIAL_PERIOD_DAYS
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

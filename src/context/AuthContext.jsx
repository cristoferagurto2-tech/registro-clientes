import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, syncService } from '../services/api';

const AuthContext = createContext();

// Correo del admin autorizado
const ADMIN_EMAIL = 'cristoferagurto2@gmail.com';
const ADMIN_PASSWORD = 'admin123'; // Contraseña fija para admin

// Correos VIP (acceso gratuito permanente para familiares)
const VIP_EMAILS = ['cristovalleagur@gmail.com', 'yudyagurto1983@gmail.com']; // Acceso gratuito permanente

// Periodo de prueba: 7 días en milisegundos
const TRIAL_PERIOD_DAYS = 7;
const TRIAL_PERIOD_MS = TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

// Función para obtener la lista blanca desde localStorage
const getAllowedEmails = () => {
  const saved = localStorage.getItem('allowedEmails');
  if (saved) {
    return JSON.parse(saved);
  }
    // Lista por defecto - SOLO VIPs inicialmente
  const defaultList = ['cristovalleagur@gmail.com', 'yudyagurto1983@gmail.com'];
  localStorage.setItem('allowedEmails', JSON.stringify(defaultList));
  return defaultList;
};

// Lista inicial de clientes - SOLO VIPs (tú y tu familiar)
// Para agregar nuevos clientes, usa el panel de administrador
const INITIAL_CLIENTS = [
  { 
    id: 'cliente-001', 
    email: 'cristovalleagur@gmail.com', 
    name: 'Cristo Agurto',
    password: '123456',
    isRegistered: true 
  },
  { 
    id: 'cliente-002', 
    email: 'yudyagurto1983@gmail.com', 
    name: 'Yudy Agurto',
    password: 'Melissa1983',
    isRegistered: true,
    backendId: '69ab44840529792adcf6a723'
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState([]);
  const [resetCodes, setResetCodes] = useState({});
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para eliminar clientes duplicados por email (mantener el que tenga backendId)
  const removeDuplicateClients = (clients) => {
    const uniqueClients = [];
    const emailMap = new Map();
    
    // Primero, agrupar por email
    clients.forEach(client => {
      const normalizedEmail = client.email.toLowerCase().trim();
      if (!emailMap.has(normalizedEmail)) {
        emailMap.set(normalizedEmail, []);
      }
      emailMap.get(normalizedEmail).push(client);
    });
    
    // Para cada email, mantener solo el que tenga backendId, o el primero si ninguno lo tiene
    emailMap.forEach((clientsWithSameEmail, email) => {
      if (clientsWithSameEmail.length === 1) {
        uniqueClients.push(clientsWithSameEmail[0]);
      } else {
        // Hay duplicados, buscar el que tenga backendId
        const withBackendId = clientsWithSameEmail.find(c => c.backendId);
        if (withBackendId) {
          uniqueClients.push(withBackendId);
        } else {
          // Si ninguno tiene backendId, mantener el primero
          uniqueClients.push(clientsWithSameEmail[0]);
        }
      }
    });
    
    return uniqueClients;
  };

  // Función para sincronizar VIPs en la lista de clientes
  const syncVipsInClients = (existingClients) => {
    const updatedClients = [...existingClients];
    
    VIP_EMAILS.forEach(vipEmail => {
      const normalizedVip = vipEmail.toLowerCase().trim();
      const exists = updatedClients.some(c => 
        c.email.toLowerCase().trim() === normalizedVip
      );
      
      if (!exists) {
        // Buscar en INITIAL_CLIENTS
        const vipClient = INITIAL_CLIENTS.find(c => 
          c.email.toLowerCase().trim() === normalizedVip
        );
        if (vipClient) {
          updatedClients.push(vipClient);
        }
      }
    });
    
    // Eliminar duplicados antes de retornar
    return removeDuplicateClients(updatedClients);
  };

  // Función para sincronizar un cliente con el backend y obtener su backendId
  const syncClientBackendId = async (client) => {
    if (!backendAvailable) return client;
    
    try {
      // Intentar login con las credenciales del cliente para obtener su backend ID
      const response = await authAPI.login(client.email, client.password);
      if (response.success && response.user) {
        // Guardar el backendId (MongoDB ObjectId) en el cliente
        const updatedClient = {
          ...client,
          backendId: response.user.id || response.user._id
        };
        
        // Actualizar en la lista de clientes
        setClients(prev => prev.map(c => 
          c.id === client.id ? updatedClient : c
        ));
        
        console.log(`Cliente ${client.email} sincronizado con backend ID:`, updatedClient.backendId);
        return updatedClient;
      }
    } catch (error) {
      console.warn(`No se pudo sincronizar cliente ${client.email} con backend:`, error.message);
    }
    
    return client;
  };

  // Función para obtener el backendId de un cliente por su ID
  const getClientBackendId = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.backendId || clientId;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Verificar disponibilidad del backend
      const isAvailable = await syncService.isBackendAvailable();
      setBackendAvailable(isAvailable);
      
      // Intentar cargar sesión del backend primero
      const token = localStorage.getItem('token');
      if (isAvailable && token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            const userData = response.user;
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 'admin' || userData.email === ADMIN_EMAIL);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.log('Error cargando perfil del backend:', error);
          // Si falla, usar localStorage como respaldo
          loadFromLocalStorage();
        }
      } else {
        // Usar localStorage
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);
  
  const loadFromLocalStorage = () => {
    // Verificar si hay sesión guardada en localStorage
    const savedUser = localStorage.getItem('user');
    const savedClients = localStorage.getItem('clients');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.email === ADMIN_EMAIL || userData.role === 'admin');
    }
    
    // Cargar clientes o usar los iniciales
    if (savedClients) {
      const parsedClients = JSON.parse(savedClients);
      // Sincronizar VIPs que puedan faltar
      const clientsWithVips = syncVipsInClients(parsedClients);
      setClients(clientsWithVips);
      // Guardar la lista actualizada
      localStorage.setItem('clients', JSON.stringify(clientsWithVips));
    } else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('clients', JSON.stringify(INITIAL_CLIENTS));
    }
  };

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
    if (!clientEmail) return null;
    
    const normalizedEmail = clientEmail.toLowerCase().trim();
    
    // PRIORIDAD 1: Verificar si es Admin o VIP directamente por email
    // Esto funciona incluso si no está en el array clients
    const isAdmin = normalizedEmail === ADMIN_EMAIL.toLowerCase();
    const isVIP = VIP_EMAILS.includes(normalizedEmail);
    
    if (isAdmin || isVIP) {
      return {
        isAdmin: isAdmin,
        isVIP: isVIP,
        isTrialActive: true,
        isSubscribed: true,
        daysRemaining: null,
        trialEndDate: null,
        registeredAt: null
      };
    }
    
    // Buscar cliente en el estado actual
    const client = clients.find(c => c.email.toLowerCase() === normalizedEmail);
    
    // Si no está en clients, verificar si el usuario actual tiene la info
    if (!client && user && user.email.toLowerCase() === normalizedEmail) {
      // Usar info del usuario logueado
      const isUserSubscribed = user.isSubscribed || false;
      
      return {
        isAdmin: false,
        isVIP: false,
        isTrialActive: isUserSubscribed, // Si está suscrito, trial está "activo"
        isSubscribed: isUserSubscribed,
        daysRemaining: isUserSubscribed ? null : 0,
        trialEndDate: null,
        registeredAt: user.registeredAt || null
      };
    }
    
    if (!client) return null;
    
    const registeredAt = client.registeredAt ? new Date(client.registeredAt) : null;
    
    if (!registeredAt) {
      // Si no tiene fecha de registro, asumimos que es un cliente antiguo y le damos acceso completo
      return {
        isAdmin: false,
        isVIP: false,
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
      isVIP: false,
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
    
    // Admin y VIP siempre pueden crear
    if (status.isAdmin) return true;
    if (status.isVIP) return true;
    
    // Si está suscrito, puede crear
    if (status.isSubscribed) return true;
    
    // Si el período de prueba está activo, puede crear
    return status.isTrialActive;
  };

  const isReadOnlyMode = (clientEmail) => {
    const status = getTrialStatus(clientEmail);
    if (!status) return true;
    
    // Admin y VIP nunca están en modo solo lectura
    if (status.isAdmin) return false;
    if (status.isVIP) return false;
    
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

  // Login de usuario con soporte híbrido (backend + localStorage)
  const login = async (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Intentar login en el backend primero si está disponible
    if (backendAvailable) {
      try {
        const response = await authAPI.login(email, password);
        if (response.success) {
          const userData = response.user;
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.role === 'admin' || userData.email === ADMIN_EMAIL);
          return { success: true, user: userData, backend: true };
        }
      } catch (error) {
        console.log('Login en backend falló, intentando localStorage:', error);
        // Si falla el backend, continuamos con localStorage
      }
    }
    
    // Fallback a localStorage (tu código original)
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
      return { success: true, user: adminUser, backend: false };
    }
    
    // Verificar si es cliente registrado
    let client = clients.find(c => 
      c.email.toLowerCase() === normalizedEmail && c.password === password
    );
    
    // Fallback: Si no se encuentra pero es un VIP, buscar en INITIAL_CLIENTS y agregar automáticamente
    if (!client) {
      const vipClient = INITIAL_CLIENTS.find(c => 
        c.email.toLowerCase() === normalizedEmail && c.password === password
      );
      
      if (vipClient) {
        console.log('VIP encontrado en INITIAL_CLIENTS, agregando a clients:', vipClient.email);
        // Agregar el VIP a la lista de clients
        const updatedClients = [...clients, vipClient];
        setClients(updatedClients);
        localStorage.setItem('clients', JSON.stringify(updatedClients));
        client = vipClient;
      }
    }
    
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
      return { success: true, user: clientUser, backend: false };
    }
    
    return { success: false, error: 'Correo o contraseña incorrectos' };
  };

  // Logout - limpia tanto backend como localStorage
  const logout = () => {
    authAPI.logout();
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

  // Registrar nuevo cliente con soporte híbrido (backend + localStorage)
  const registerClient = async (email, password, name) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar si está en lista blanca
    if (!canRegister(normalizedEmail)) {
      return { success: false, error: 'Este correo no está autorizado para registrarse. Contacte al administrador.' };
    }
    
    // Intentar registro en backend primero si está disponible
    if (backendAvailable) {
      try {
        const response = await authAPI.register(name, email, password);
        if (response.success) {
          // También guardar en localStorage para compatibilidad
          const newClient = {
            id: response.user.id || `cliente-${Date.now()}`,
            email: normalizedEmail,
            name: name,
            password: password,
            isRegistered: true,
            registeredAt: new Date().toISOString(),
            isSubscribed: false,
            backendId: response.user.id
          };
          
          const updatedClients = [...clients, newClient];
          setClients(updatedClients);
          localStorage.setItem('clients', JSON.stringify(updatedClients));
          
          return { success: true, message: 'Registro exitoso', backend: true };
        }
      } catch (error) {
        console.log('Registro en backend falló:', error);
        
        // Si el backend dice que ya existe pero no tenemos backendId,
        // intentar hacer login para obtener el backendId
        if (error.error?.includes('existe') || error.error?.includes('Ya existe')) {
          const existingClient = clients.find(c => c.email.toLowerCase() === normalizedEmail);
          
          if (existingClient && !existingClient.backendId) {
            console.log('Cliente existe en localStorage pero sin backendId, intentando login...');
            try {
              const loginResponse = await authAPI.login(email, password);
              if (loginResponse.success) {
                // Actualizar el cliente existente con el backendId
                const updatedClient = {
                  ...existingClient,
                  backendId: loginResponse.user.id,
                  name: loginResponse.user.name || existingClient.name
                };
                
                setClients(prev => prev.map(c => 
                  c.id === existingClient.id ? updatedClient : c
                ));
                
                console.log('Cliente sincronizado con backend ID:', updatedClient.backendId);
                return { 
                  success: true, 
                  message: 'Cuenta sincronizada con el servidor', 
                  backend: true,
                  user: loginResponse.user 
                };
              }
            } catch (loginError) {
              console.log('Login también falló:', loginError);
              // Si el login falla, significa que realmente no existe en el backend
              // Continuar con el flujo normal de registro
            }
          }
          
          return { success: false, error: error.error };
        }
        // Si falla por otro motivo, continuamos con localStorage
      }
    }
    
    // Fallback a localStorage (tu código original)
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
    
    // Actualizar estado y guardar inmediatamente en localStorage
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    
    return { success: true, message: 'Registro exitoso', backend: false };
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

  // Sincronizar usuario con backend (útil para migrar usuarios existentes)
  const syncUserWithBackend = async (email, password, name) => {
    if (!backendAvailable) {
      return { success: false, error: 'Backend no disponible' };
    }
    
    try {
      // Intentar registrar primero
      try {
        const response = await authAPI.register(name, email, password);
        if (response.success) {
          return { success: true, message: 'Usuario sincronizado con backend' };
        }
      } catch (regError) {
        // Si ya existe, intentar login
        if (regError.error?.includes('existe')) {
          const loginResponse = await authAPI.login(email, password);
          if (loginResponse.success) {
            return { success: true, message: 'Usuario ya existía en backend' };
          }
        }
        throw regError;
      }
    } catch (error) {
      return { success: false, error: error.error || error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      isAuthenticated, 
      isAdmin, 
      clients,
      backendAvailable,
      isLoading,
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
      syncUserWithBackend,
      syncClientBackendId,
      getClientBackendId,
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

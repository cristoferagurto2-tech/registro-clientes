import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Correo del admin autorizado
const ADMIN_EMAIL = 'cristoferagurto2@gmail.com';

// Lista de correos de clientes autorizados (puedes agregar más)
const CLIENT_EMAILS = [
  'cliente1@email.com',
  'cliente2@email.com',
  // Agrega más correos de clientes aquí
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.email === ADMIN_EMAIL);
    }
  }, []);

  const login = (email) => {
    // Verificar si es admin
    const admin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
    
    // Verificar si es cliente autorizado (o admin)
    const isAuthorized = admin || CLIENT_EMAILS.includes(email.toLowerCase().trim());
    
    if (!isAuthorized && !admin) {
      return { success: false, error: 'Correo no autorizado. Contacta al administrador.' };
    }

    const userData = {
      email: email.toLowerCase().trim(),
      role: admin ? 'admin' : 'cliente',
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin, 
      login, 
      logout 
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

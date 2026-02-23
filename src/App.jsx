import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentsProvider } from './context/DocumentsContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgotPassword'

  return (
    <div className="app">
      {isAuthenticated ? (
        <DocumentsProvider>
          <Dashboard />
        </DocumentsProvider>
      ) : currentView === 'register' ? (
        <Register onSwitchToLogin={() => setCurrentView('login')} />
      ) : currentView === 'forgotPassword' ? (
        <ForgotPassword onSwitchToLogin={() => setCurrentView('login')} />
      ) : (
        <Login 
          onSwitchToRegister={() => setCurrentView('register')} 
          onSwitchToForgotPassword={() => setCurrentView('forgotPassword')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App

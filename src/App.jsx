import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentsProvider } from './context/DocumentsContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="app">
      {isAuthenticated ? (
        <DocumentsProvider>
          <Dashboard />
        </DocumentsProvider>
      ) : showRegister ? (
        <Register onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onSwitchToRegister={() => setShowRegister(true)} />
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

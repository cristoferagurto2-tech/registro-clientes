import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentsProvider } from './context/DocumentsContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated ? (
        <DocumentsProvider>
          <Dashboard />
        </DocumentsProvider>
      ) : (
        <Login />
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

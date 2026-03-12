import './App.css';
import React, { useState } from 'react';
import { AuthProvider } from './auth/AuthContext';
import AuthUI from './auth/AuthUI';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const handleAuthSuccess = (authenticatedUser) => {
    console.log('User authenticated:', authenticatedUser);
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setShowLanding(true);
    console.log('User logged out');
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  return (
    <AuthProvider>
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : showLanding ? (
        <Landing onGetStarted={handleGetStarted} />
      ) : (
        <AuthUI onSuccess={handleAuthSuccess} />
      )}
    </AuthProvider>
  );
}

export default App;
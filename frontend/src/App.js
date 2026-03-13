import './App.css';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthUI from './auth/AuthUI';
import FeedbackDashboard from './pages/FeedbackDashboard';
import Landing from './pages/Landing';

function AppContent() {
  const { user, isAuthenticated, loading, signout } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-ai-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ai-primary"></div>
      </div>
    );
  }

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogout = () => {
    signout();
    setShowLanding(true);
  };

  // If already authenticated, show dashboard
  if (isAuthenticated) {
    return <FeedbackDashboard user={user} onLogout={handleLogout} />;
  }

  // If not authenticated, handle landing vs auth UI
  if (showLanding) {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  // In AppContent, we don't need handleAuthSuccess anymore because AuthUI/AuthContext handles it
  return <AuthUI />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
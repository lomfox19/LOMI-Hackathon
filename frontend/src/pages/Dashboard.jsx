import React, { useState } from 'react';
import {
  Shield,
  LogOut,
  User,
  MessageCircle,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Profile from '../components/Profile';
import Chatbot from '../components/Chatbot';
import MedicalForm from '../components/MedicalForm';
import About from '../components/About';

const navItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'chatbot', label: 'AI Chatbot', icon: MessageCircle },
  { id: 'medical', label: 'Medical Form', icon: Stethoscope },
  { id: 'about', label: 'About', icon: Info },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const { signout } = useAuth();

  const handleNavClick = (id) => {
    if (id === 'logout') {
      signout();
      if (onLogout) {
        onLogout();
      }
      return;
    }
    setActiveSection(id);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <Profile user={user} />;
      case 'chatbot':
        return <Chatbot />;
      case 'medical':
        return <MedicalForm />;
      case 'about':
        return <About />;
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-ai-bg p-4 font-body text-ai-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-10 w-72 h-72 bg-gradient-to-br from-ai-secondary/15 via-ai-secondary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-72 h-72 bg-gradient-to-tr from-ai-primary/15 via-ai-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 backdrop-blur-xl bg-white/80 rounded-xl-card shadow-ai-card border border-ai-primary/10 p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-ai-primary rounded-xl shadow-md text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-semibold text-ai-primary">Medical AI Assistant</h1>
              <p className="text-xs text-ai-primary/65">Secured by SVH Authentication</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  id === activeSection
                    ? 'bg-ai-primary text-white shadow-md'
                    : 'text-ai-primary/75 hover:bg-ai-primary/5 hover:text-ai-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {user && (
            <div className="mt-4 p-3 rounded-xl bg-ai-primary/4 border border-ai-primary/10 text-xs text-ai-primary/80">
              <p className="font-semibold text-ai-primary flex items-center gap-1">
                <User className="w-3 h-3" />
                {user.username || user.email}
              </p>
              {user.email && <p className="truncate">{user.email}</p>}
            </div>
          )}
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 backdrop-blur-xl bg-white/85 rounded-xl-card shadow-ai-card border border-ai-primary/10 p-4 lg:p-6 min-h-[60vh]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

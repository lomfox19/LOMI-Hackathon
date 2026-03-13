import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import {
  BarChart3,
  MessageSquareText,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  Smile,
  Frown,
  AlertCircle,
  Menu,
  X as CloseIcon,
  ShieldAlert,
  ShieldBan,
  Terminal,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import UploadFeedback from '../components/UploadFeedback';
import SentimentChart from '../components/SentimentChart';
import TopicInsights from '../components/TopicInsights';
import AIInsightPanel from '../components/AIInsightPanel';
import FraudDetection from './FraudDetection';
import SpamDetection from './SpamDetection';
import ApiAccess from './ApiAccess';
import Feedback from './Feedback';
import Analytics from './Analytics';
import AIInsights from './AIInsights';
import { useAuth } from '../auth/AuthContext';
/* ────────────────────────────────────────────
   Sidebar navigation items
   ──────────────────────────────────────────── */
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'feedback',  label: 'Feedback',  icon: MessageSquareText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'insights',  label: 'AI Insights', icon: BrainCircuit },
  { id: 'fraud',     label: 'Fraud Detection', icon: ShieldAlert },
  { id: 'spam',      label: 'Spam Detection',  icon: ShieldBan },
  { id: 'api',       label: 'API Access',      icon: Terminal },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];
/* ────────────────────────────────────────────
   Animated neural-dot background (AI visual cue)
   ──────────────────────────────────────────── */
const NeuralBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Large gradient blobs */}
    <motion.div
      className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full"
      style={{
        background:
          'radial-gradient(circle, rgba(46,125,91,0.12) 0%, rgba(46,125,91,0.03) 60%, transparent 80%)',
      }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-32 -left-16 w-[380px] h-[380px] rounded-full"
      style={{
        background:
          'radial-gradient(circle, rgba(15,61,46,0.10) 0%, rgba(15,61,46,0.02) 60%, transparent 80%)',
      }}
      animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Floating AI pulse dots */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-ai-secondary/20"
        style={{
          top: `${15 + i * 14}%`,
          left: `${10 + ((i * 17) % 80)}%`,
        }}
        animate={{
          y: [0, -12, 0],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 3 + i * 0.6,
          repeat: Infinity,
          delay: i * 0.4,
          ease: 'easeInOut',
        }}
      />
    ))}
    {/* Subtle circuit lines */}
    <svg
      className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M0 60h40M60 0v40M80 60h40M60 80v40" stroke="#0F3D2E" strokeWidth="1" fill="none" />
        <circle cx="60" cy="60" r="3" fill="#0F3D2E" />
        <circle cx="40" cy="60" r="2" fill="#2E7D5B" />
        <circle cx="80" cy="60" r="2" fill="#2E7D5B" />
        <circle cx="60" cy="40" r="2" fill="#2E7D5B" />
        <circle cx="60" cy="80" r="2" fill="#2E7D5B" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  </div>
);
/* ────────────────────────────────────────────
   Main Feedback Dashboard Component
   ──────────────────────────────────────────── */
const FeedbackDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { signout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/feedback/analytics');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeSection]);

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };

  const handleLogout = () => {
    signout();
    if (onLogout) onLogout();
  };
  return (
    <div className="min-h-screen bg-ai-bg font-body text-ai-primary relative overflow-hidden">
      <NeuralBackground />
      <div className="relative flex min-h-screen">
        {/* ── Sidebar Backdrop (Mobile Only) ── */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-ai-primary/20 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <motion.aside
          initial={false}
          animate={{ 
            x: mobileSidebarOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0),
            width: sidebarCollapsed ? 72 : 260 
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col
                     backdrop-blur-2xl bg-white/75 border-r border-ai-primary/8
                     shadow-[4px_0_24px_rgba(15,61,46,0.06)] 
                     ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Brand header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-ai-primary/8">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
                           bg-gradient-to-br from-ai-primary to-ai-secondary shadow-lg text-white"
              >
                <BrainCircuit className="w-5 h-5" />
              </motion.div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-0"
                  >
                    <h1 className="text-sm font-heading font-bold text-ai-primary leading-tight truncate">
                      LOMI
                      <span className="block text-[8px] uppercase tracking-wider text-ai-secondary font-body">
                        Intelligence Hub
                      </span>
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile Close Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg bg-ai-primary/5 text-ai-primary/50"
            >
              <CloseIcon className="w-4 h-4" />
            </motion.button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-colors duration-200 group
                    ${
                      isActive
                        ? 'bg-ai-primary text-white shadow-md shadow-ai-primary/25'
                        : 'text-ai-primary/60 hover:bg-ai-primary/5 hover:text-ai-primary'
                    }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Active glow indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-xl bg-ai-primary/10"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
          {/* User info + Logout */}
          <div className="px-3 pb-4 space-y-2 border-t border-ai-primary/8 pt-3">
            {user && !sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 py-2.5 rounded-xl bg-ai-primary/[0.03] border border-ai-primary/8"
              >
                <p className="text-xs font-semibold text-ai-primary flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  {user.username || user.email}
                </p>
                {user.email && (
                  <p className="text-[10px] text-ai-primary/50 truncate mt-0.5 pl-5">
                    {user.email}
                  </p>
                )}
              </motion.div>
            )}
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                       bg-white border border-ai-primary/10 shadow-sm flex items-center justify-center
                       text-ai-primary/50 hover:text-ai-primary hover:shadow-md
                       transition-all duration-200 z-40"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </motion.aside>
        {/* ── Main Content Area ── */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="sticky top-0 z-20 backdrop-blur-xl bg-white/60 border-b border-ai-primary/6 w-full"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 lg:hidden rounded-xl bg-ai-primary/5 border border-ai-primary/10 text-ai-primary"
                >
                  <Menu className="w-5 h-5" />
                </motion.button>
                <div>
                  <h2 className="text-lg lg:text-2xl font-heading font-bold text-ai-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-ai-secondary hidden sm:inline-block" />
                    Customer Feedback Intelligence Dashboard
                  </h2>
                  <p className="text-[10px] sm:text-xs text-ai-primary/50 mt-0.5 font-medium">
                    AI-powered insights at a glance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Notification bell with pulse */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-xl bg-white/80 border border-ai-primary/8
                             hover:shadow-md transition-shadow duration-200"
                >
                  <Bell className="w-4.5 h-4.5 text-ai-primary/60" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ai-secondary animate-pulse" />
                </motion.button>
                {/* User avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-ai-primary to-ai-secondary
                             flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </motion.div>
              </div>
            </div>
          </motion.header>
          {/* Dashboard content */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-full space-y-8 min-h-[600px]"
              > 
                {activeSection === 'dashboard' ? (
                  <>
                    {/* Top Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard
                        index={0}
                        title="Total Feedback"
                        value={stats?.totalFeedback?.toLocaleString() || '0'}
                        icon={MessageSquareText}
                        trend="up"
                        trendValue="Live"
                      />
                      <MetricCard
                        index={1}
                        title="Positive Sentiment"
                        value={stats?.totalFeedback > 0 ? `${Math.round((stats.sentimentCounts.positive / stats.totalFeedback) * 100)}%` : '0%'}
                        icon={Smile}
                        trend="up"
                        trendValue="AI Verified"
                      />
                      <MetricCard
                        index={2}
                        title="Negative Sentiment"
                        value={stats?.totalFeedback > 0 ? `${Math.round((stats.sentimentCounts.negative / stats.totalFeedback) * 100)}%` : '0%'}
                        icon={Frown}
                        trend="down"
                        trendValue="AI Tracked"
                      />
                      <MetricCard
                        index={3}
                        title="Top Customer Issue"
                        value={stats?.topTopics?.[0]?.name || 'Analyzing...'}
                        icon={AlertCircle}
                        trend="neutral"
                        trendValue="Stable"
                      />
                    </div>

                    {/* Dashboard Intelligence Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 items-start">
                      {/* Left Column: Upload & Live Feed */}
                      <div className="lg:col-span-8 space-y-8">
                        <UploadFeedback onUploadSuccess={fetchDashboardStats} />
                        
                        {/* Feed Intelligence Data Stream */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className="bg-white/40 backdrop-blur-md rounded-xl-card border border-ai-primary/6 p-8 min-h-[400px] flex flex-col items-center justify-center text-center shadow-ai-card overflow-hidden"
                        >
                          {stats?.recentActivity?.length > 0 ? (
                            <div className="w-full h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-6 px-2">
                                <div className="p-2 rounded-lg bg-ai-primary/5 text-ai-primary">
                                  <MessageSquareText className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-heading font-bold text-ai-primary">Live Analysis Feed</h4>
                              </div>
                              <div className="space-y-3 overflow-y-auto max-h-[500px] px-2 custom-scrollbar">
                                {stats.recentActivity.map((item, i) => (
                                  <motion.div
                                    key={item.id || i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 rounded-xl bg-white/60 border border-ai-primary/5 flex items-start gap-4 text-left group hover:border-ai-secondary/20 transition-colors"
                                  >
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                      item.sentiment === 'positive' ? 'bg-ai-secondary shadow-[0_0_8px_rgba(46,125,91,0.5)]' :
                                      item.sentiment === 'negative' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                      'bg-ai-primary/30'
                                    }`} />
                                    <div className="min-w-0">
                                      <p className="text-sm text-ai-primary/80 line-clamp-2 leading-relaxed">{item.text}</p>
                                      <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-widest">{item.sentiment}</span>
                                        {item.topics?.slice(0, 2).map(t => (
                                          <span key={t} className="text-[9px] font-bold text-ai-secondary bg-ai-secondary/5 px-1.5 py-0.5 rounded-full border border-ai-secondary/10 uppercase">{t}</span>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-2xl bg-ai-primary/5 flex items-center justify-center mb-4">
                                <MessageSquareText className="w-8 h-8 text-ai-primary/20" />
                              </div>
                              <h4 className="text-lg font-heading font-bold text-ai-primary/40">Feed Intelligence Data Stream</h4>
                              <p className="text-sm text-ai-primary/25 mt-1 max-w-xs">Detailed analysis records will populate here once datasets are processed.</p>
                            </>
                          )}
                        </motion.div>
                      </div>

                      {/* Right Column: AI Insights & Charts */}
                      <div className="lg:col-span-4 space-y-8">
                        <SentimentChart stats={stats} />
                        <TopicInsights topics={stats?.topTopics} />
                        <AIInsightPanel key={stats?.totalFeedback} />
                      </div>
                    </div>
                  </>
                ) : activeSection === 'feedback' ? (
                  <Feedback />
                ) : activeSection === 'analytics' ? (
                  <Analytics />
                ) : activeSection === 'insights' ? (
                  <AIInsights />
                ) : activeSection === 'fraud' ? (
                  <FraudDetection />
                ) : activeSection === 'spam' ? (
                  <SpamDetection />
                ) : activeSection === 'api' ? (
                  <ApiAccess />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-ai-primary/30 p-20 border-2 border-dashed border-ai-primary/5 rounded-3xl">
                    <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-heading font-bold uppercase tracking-widest">{activeSection} Module</h3>
                    <p className="text-sm mt-2">Intelligence integration for this module is currently in progress.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
export default FeedbackDashboard;

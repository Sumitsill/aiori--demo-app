import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PillNavbar } from './components/PillNavbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ConsentCenterPage } from './pages/ConsentCenterPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminConsolePage } from './pages/AdminConsolePage';

const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetReceiptId, setTargetReceiptId] = useState<string | null>(null);
  const [aioriConnected, setAioriConnected] = useState<boolean>(true);

  // Automatically route role when switching accounts
  useEffect(() => {
    if (currentUser?.role === 'ADMIN' && activeTab === 'dashboard') {
      setActiveTab('admin');
    } else if (currentUser?.role !== 'ADMIN' && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role, activeTab]);

  // Monitor AIORI-3 connection
  useEffect(() => {
    async function checkAioriHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setAioriConnected(data.aiori_integration?.connected ?? false);
        } else {
          setAioriConnected(false);
        }
      } catch {
        setAioriConnected(false);
      }
    }
    checkAioriHealth();
    const interval = setInterval(checkAioriHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center text-slate-400 text-xs font-mono relative overflow-hidden">
        <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-2.5 shadow-[0_0_12px_#10b981]" />
        <span className="text-white font-semibold tracking-wide">Initializing FitPulse environment...</span>
      </div>
    );
  }

  if (!currentUser) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  const navigateToReceipts = (receiptId?: string) => {
    if (receiptId) setTargetReceiptId(receiptId);
    setActiveTab('receipts');
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {/* Ambient Neon Mesh Glows in Pure Pitch Black */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[350px] h-[350px] bg-purple-500/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Floating Glassmorphic Pill Navbar */}
      <PillNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aioriConnected={aioriConnected}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        <ErrorBoundary>
          {activeTab === 'admin' && <AdminConsolePage />}
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'workouts' && <WorkoutsPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'goals' && <GoalsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'consent' && <ConsentCenterPage onNavigateToReceipts={navigateToReceipts} />}
          {activeTab === 'receipts' && <ReceiptsPage initialReceiptId={targetReceiptId} />}
          {activeTab === 'settings' && <SettingsPage />}
        </ErrorBoundary>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;


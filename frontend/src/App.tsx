import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
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
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400 text-xs font-mono">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-2.5" />
        Initializing FitPulse environment...
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
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aioriConnected={aioriConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0d14] overflow-x-hidden">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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


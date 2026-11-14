import React from 'react';
import { ChevronRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TAB_TITLES: Record<string, string> = {
  admin: 'Platform Administration & AIORI-3 Bridge Oversight',
  dashboard: 'Fitness Telemetry & Daily Dashboard',
  workouts: 'Workout Tracking & Caloric Burn',
  analytics: 'Performance Trends & Consumer Sharing',
  goals: 'Fitness Targets & Milestone Tracking',
  profile: 'Biometric Profile & Account Settings',
  consent: 'Authoritative Privacy Notice & Consent Registry',
  receipts: 'Kantara 7807 Consent Receipts & Verification',
  settings: 'Network Diagnostics & AIORI-3 Linkage',
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, login } = useAuth();

  const handleDemoSwitch = async (role: 'USER' | 'ADMIN') => {
    if (role === 'USER') {
      await login('user_001', 'password123');
      setActiveTab('dashboard');
    } else {
      await login('admin_fitpulse', 'adminpassword123');
      setActiveTab('admin');
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#03060c]/95 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.9)] relative">
      {/* Top Ambient Glow Hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="hidden sm:inline">Platform</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
        <span className="text-slate-300 font-semibold">FitPulse</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-emerald-400 font-bold truncate drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
          {TAB_TITLES[activeTab] || 'Overview'}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Governance Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-mono text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          <span>AIORI-3 Governed (DPDP Act 2023 §6)</span>
        </div>

        {/* Quick Demo Switcher */}
        <div className="flex items-center bg-[#070b14] border border-white/[0.08] rounded-2xl p-1 text-xs shadow-inner">
          <button
            onClick={() => handleDemoSwitch('USER')}
            className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 ${
              currentUser?.role === 'USER'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Demo User (Alex Morgan)"
          >
            <UserCheck className="w-3 h-3" />
            <span>User</span>
          </button>
          <button
            onClick={() => handleDemoSwitch('ADMIN')}
            className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 ${
              currentUser?.role === 'ADMIN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Demo Admin (Platform Oversight)"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};


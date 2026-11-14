import React from 'react';
import {
  Activity,
  Dumbbell,
  BarChart3,
  Target,
  UserCircle,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Settings,
  LogOut,
  Zap,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aioriConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, aioriConnected }) => {
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems = [
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Oversight', icon: ShieldAlert, highlight: true }] : []),
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'workouts', label: 'My Workouts', icon: Dumbbell },
    { id: 'analytics', label: 'Fitness Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Fitness Goals', icon: Target },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'consent', label: 'Privacy & Consent Center', icon: ShieldCheck, highlight: !isAdmin },
    { id: 'receipts', label: 'Consent Receipts', icon: FileCheck },
    { id: 'settings', label: 'Settings & Network', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-72 bg-[#0e121d] border-b lg:border-b-0 lg:border-r border-white/[0.06] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 lg:p-6 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0e121d] rounded-2xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">FitPulse</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Connected Fitness SaaS</p>
          </div>
        </div>
      </div>

      {/* AIORI-3 Cross-App Link Banner */}
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#090c14]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            AIORI-3 Authority
          </span>
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              aioriConnected
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${aioriConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {aioriConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                isActive
                  ? item.highlight
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? item.highlight
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DPDP §6
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer & Session Info */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0a0d15] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/[0.1] flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 font-mono">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || ''}</p>
            </div>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
            {currentUser?.role || 'USER'}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.03] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};


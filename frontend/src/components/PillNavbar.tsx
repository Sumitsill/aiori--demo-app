import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

export interface PillNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aioriConnected: boolean;
}

export const PillNavbar: React.FC<PillNavbarProps> = ({
  activeTab,
  setActiveTab,
  aioriConnected,
}) => {
  const { currentUser, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems = [
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Oversight', icon: ShieldAlert, highlight: true }] : []),
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'consent', label: 'Privacy & Consent', icon: ShieldCheck, highlight: !isAdmin },
    { id: 'receipts', label: 'Receipts', icon: FileCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

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
    <header className="sticky top-2 sm:top-3 z-50 w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-auto">
      {/* Floating Glassmorphic Pill Outer Shell */}
      <div className="relative rounded-2xl lg:rounded-full bg-[#040711]/85 backdrop-blur-2xl border border-white/[0.09] shadow-[0_12px_45px_rgba(0,0,0,0.85)] px-3 sm:px-4 py-2 transition-all duration-300">
        {/* Subtle Ambient Neon Accent Hairline */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* ── LEFT: FitPulse Brand Logo & AIORI-3 Status ── */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
              title="FitPulse Pro - Connected Fitness Platform"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/30 via-teal-500/25 to-cyan-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-sm sm:text-base font-black shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 group-hover:border-emerald-400 transition-all duration-200">
                <Zap className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight group-hover:text-emerald-200 transition">
                  FitPulse
                </span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  PRO
                </span>
              </div>
            </button>

            {/* AIORI-3 Status Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono">
              <Globe2 className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">AIORI-3:</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  aioriConnected
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                    : 'bg-rose-400'
                }`}
              />
              <span className={aioriConnected ? 'text-emerald-300 font-semibold' : 'text-rose-400'}>
                {aioriConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* ── CENTER: Desktop Floating Pill Navigation ── */}
          <nav className="hidden lg:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-full p-1 shadow-inner max-w-2xl overflow-x-auto no-scrollbar">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? tab.highlight
                        ? 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-600/25 text-amber-300 border border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                        : 'bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-600/25 text-emerald-300 border border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? tab.highlight
                          ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                          : 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        tab.highlight ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_4px_#10b981]'
                      } -ml-0.5`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── RIGHT: Role Switcher & User Profile Controls ── */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Demo Role Switcher */}
            <div className="flex items-center bg-[#070b14] border border-white/[0.08] rounded-full p-0.5 text-xs shadow-inner">
              <button
                onClick={() => handleDemoSwitch('USER')}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                  currentUser?.role === 'USER'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Demo User (Alex Morgan)"
              >
                <UserCheck className="w-3 h-3" />
                <span className="hidden xs:inline">User</span>
              </button>
              <button
                onClick={() => handleDemoSwitch('ADMIN')}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Demo Admin (Platform Oversight)"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden xs:inline">Admin</span>
              </button>
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 transition cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                <span className="font-semibold text-xs truncate max-w-[80px] sm:max-w-[110px] hidden sm:inline">
                  {currentUser?.name || 'User'}
                </span>
                <UserCircle className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0a0e1c] border border-white/[0.12] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ROLE: {currentUser?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleTabClick('profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-2 cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-emerald-400" />
                    <span>My Biometric Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle (< 1024px) */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setUserDropdownOpen(false);
              }}
              className="lg:hidden p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE ACCORDION / DRAWER (< 1024px) ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/[0.07] space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-2 pb-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center justify-between">
              <span>FitPulse Navigation</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AIORI-3 {aioriConnected ? 'Linked' : 'Offline'}
              </span>
            </div>

            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? tab.highlight
                        ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent text-amber-300 border border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent text-emerald-300 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? tab.highlight
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        tab.highlight ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default PillNavbar;

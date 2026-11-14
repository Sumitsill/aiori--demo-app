import React, { useState } from 'react';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('user_001');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Neon Mesh Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-500/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            <div className="w-full h-full bg-[#03060c] rounded-3xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">FitPulse Platform</h1>
          <p className="text-xs text-slate-400">
            Connected Fitness SaaS with External AIORI-3 Consent Authority
          </p>
        </div>

        {/* Demo Quick Logins */}
        <div className="neon-card p-4 rounded-3xl space-y-2.5 text-xs">
          <p className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            Quick Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('user_001', 'password123')}
              className="p-2.5 rounded-2xl bg-[#03060c] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] text-left transition cursor-pointer"
            >
              <div className="font-semibold text-white">Alex Morgan</div>
              <div className="text-[10px] text-emerald-400/80 font-mono font-semibold">user_001 (User)</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin_fitpulse', 'adminpassword123')}
              className="p-2.5 rounded-2xl bg-[#03060c] hover:bg-amber-500/10 border border-white/[0.06] hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] text-left transition cursor-pointer"
            >
              <div className="font-semibold text-white">FitPulse Admin</div>
              <div className="text-[10px] text-amber-400/80 font-mono font-semibold">admin_fitpulse</div>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="neon-card-emerald p-7 rounded-3xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address or User ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="e.g. user_001 or alex.morgan@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#03060c] border border-white/[0.08] focus:border-emerald-500/60 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#03060c] border border-white/[0.08] focus:border-emerald-500/60 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-btn-emerald w-full py-3 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to FitPulse'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/[0.06] text-center">
            <button
              onClick={onSwitchToRegister}
              className="text-xs text-slate-400 hover:text-emerald-400 transition cursor-pointer"
            >
              Don't have an account? <strong className="text-white hover:text-emerald-300">Register here</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


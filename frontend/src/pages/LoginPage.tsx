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
    <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0e121d] rounded-3xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FitPulse Platform</h1>
          <p className="text-xs text-slate-400">
            Connected Fitness SaaS with External AIORI-3 Consent Authority
          </p>
        </div>

        {/* Demo Quick Logins */}
        <div className="bg-[#121724] border border-white/[0.08] p-3.5 rounded-2xl space-y-2 text-xs">
          <p className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('user_001', 'password123')}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 text-left transition"
            >
              <div className="font-semibold text-white">Alex Morgan</div>
              <div className="text-[10px] text-slate-400 font-mono">user_001 (User)</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin_fitpulse', 'adminpassword123')}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/[0.06] hover:border-amber-500/30 text-left transition"
            >
              <div className="font-semibold text-white">FitPulse Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">admin_fitpulse</div>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#121724] border border-white/[0.08] p-7 rounded-3xl shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e121d] border border-white/[0.08] focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e121d] border border-white/[0.08] focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to FitPulse'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/[0.06] text-center">
            <button
              onClick={onSwitchToRegister}
              className="text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              Don't have an account? <strong className="text-white">Register here</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


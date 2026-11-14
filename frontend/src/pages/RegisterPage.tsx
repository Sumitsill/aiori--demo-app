import React, { useState } from 'react';
import { Zap, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Create FitPulse Account</h1>
          <p className="text-xs text-slate-400">
            Registration provisions your privacy identity with AIORI-3
          </p>
        </div>

        {/* Notice Info Card */}
        <div className="neon-card p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Basic account creation is independent of secondary consent. You will be able to review, grant, or decline analytics and marketing sharing explicitly inside the Privacy & Consent Center.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="neon-card-emerald p-7 rounded-3xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e121d] border border-white/[0.08] focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. jordan@example.com"
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
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e121d] border border-white/[0.08] focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e121d] border border-white/[0.08] focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-btn-emerald w-full py-3 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Creating Account & Provisioning...' : 'Register FitPulse Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/[0.06] text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-xs text-slate-400 hover:text-emerald-400 transition cursor-pointer"
            >
              Already have an account? <strong className="text-white">Sign In</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


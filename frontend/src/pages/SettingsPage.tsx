import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe2,
  Database,
  RotateCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Laptop,
  Server,
  Layers,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [adminStats, setAdminStats] = useState<any>(null);
  const [retryingOutbox, setRetryingOutbox] = useState(false);
  const [outboxResult, setOutboxResult] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      api.getAdminStats().then(setAdminStats).catch(console.error);
    }
  }, [isAdmin]);

  const handleRetryOutbox = async () => {
    setRetryingOutbox(true);
    setOutboxResult(null);
    try {
      const res = await fetch('/api/consent/retry-outbox', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('fitpulse_jwt_token')}`,
        },
      });
      const data = await res.json();
      setOutboxResult(data.message || 'Outbox sync triggered.');
    } catch (e: any) {
      setOutboxResult(`Outbox sync failed: ${e.message}`);
    } finally {
      setRetryingOutbox(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
            TOPOLOGY & ENVIRONMENT
          </span>
          <span className="text-xs text-slate-400 font-mono">• Section 9 Specification</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          Settings, Network & Two-Device Demonstration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Architectural overview of FitPulse running alongside the AIORI-3 consent governance platform.
        </p>
      </div>

      {/* Two-Device Demonstration Architecture Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
          <Laptop className="w-4 h-4 text-emerald-400" />
          <span>Two-Device Physical Demonstration Topology</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Device 1 */}
          <div className="p-4 rounded-2xl bg-[#0e121d] border border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Laptop className="w-4 h-4" />
                DEVICE 1: FitPulse App
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">
                Active Platform
              </span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• React 18 + Vite (Port 5174)</li>
              <li>• FastAPI Backend (Port 8001)</li>
              <li>• PostgreSQL Database (psycopg)</li>
              <li>• AIORI-3 Resilient Integration Service</li>
            </ul>
            <div className="p-2.5 bg-black/40 rounded-xl text-[10px] text-slate-400 break-all">
              Launch: <code className="text-emerald-300">cd Fitpulse/backend && uvicorn app.main:app --host 0.0.0.0 --port 8001</code>
            </div>
          </div>

          {/* Device 2 */}
          <div className="p-4 rounded-2xl bg-[#0e121d] border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                DEVICE 2: AIORI-3 Platform
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px]">
                Consent Authority
              </span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• React 18 + Vite (Port 5173)</li>
              <li>• FastAPI Backend (Port 8000)</li>
              <li>• SQLite Tamper-Evident Ledger</li>
              <li>• Ed25519 Checkpoint Signatures</li>
            </ul>
            <div className="p-2.5 bg-black/40 rounded-xl text-[10px] text-slate-400 break-all">
              Launch: <code className="text-amber-300">cd A3-PS002-TC320-main/src/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000</code>
            </div>
          </div>
        </div>

        {/* Configuration Variables */}
        <div className="p-4 rounded-2xl bg-[#090b10] border border-white/[0.05] space-y-2 text-xs font-mono">
          <p className="text-slate-400 font-bold">Configurable Environment Variables (.env):</p>
          <div className="space-y-1 text-slate-300 text-[11px]">
            <p><code className="text-cyan-300">AIORI_BASE_URL</code>: Set to <code className="text-white">http://&lt;DEVICE_2_LAN_IP&gt;:8000</code> for remote link</p>
            <p><code className="text-cyan-300">AIORI_CONSUMER_API_KEY</code>: <code className="text-white">fitpulse_api_key_live_2026</code> (pre-registered in AIORI-3)</p>
            <p><code className="text-cyan-300">DATABASE_URL</code>: <code className="text-white">postgresql://postgres:postgres@localhost:5432/fitpulse</code> (auto-fallback to SQLite enabled)</p>
          </div>
        </div>
      </div>

      {/* Outbox Synchronization & Resilience Bench */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Fail-Closed Consent Outbox & Resilient Sync
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              If AIORI-3 connectivity drops during a consent withdrawal, FitPulse immediately blocks local data sharing and queues the withdrawal in an idempotent retry outbox.
            </p>
          </div>

          <button
            onClick={handleRetryOutbox}
            disabled={retryingOutbox}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retryingOutbox ? 'animate-spin' : ''}`} />
            <span>{retryingOutbox ? 'Retrying...' : 'Trigger Outbox Sync'}</span>
          </button>
        </div>

        {outboxResult && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-emerald-300">
            {outboxResult}
          </div>
        )}
      </div>

      {/* Administrator Stats (If Logged in as Admin) */}
      {isAdmin && adminStats && (
        <div className="bg-[#121724] border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-white/[0.06] pb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Platform Telemetry & Diagnostics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#0e121d] border border-white/[0.05]">
              <span className="text-slate-400 text-[10px]">Total Users</span>
              <p className="text-lg font-bold text-white mt-1">{adminStats.platform.total_users}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e121d] border border-white/[0.05]">
              <span className="text-slate-400 text-[10px]">Workouts Logged</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">{adminStats.platform.total_workouts}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e121d] border border-white/[0.05]">
              <span className="text-slate-400 text-[10px]">Metrics Recorded</span>
              <p className="text-lg font-bold text-cyan-400 mt-1">{adminStats.platform.total_metrics_logged}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e121d] border border-white/[0.05]">
              <span className="text-slate-400 text-[10px]">Pending Outbox</span>
              <p className="text-lg font-bold text-amber-400 mt-1">{adminStats.platform.pending_sync_outbox}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


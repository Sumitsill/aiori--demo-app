import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Send,
  Lock,
  Layers,
  Terminal,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardTelemetry, ConsumerAccessResponse } from '../types';
import { StepCountChart, CalorieTrendChart, CategoryBreakdown } from '../components/InteractiveCharts';

export const AnalyticsPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<DashboardTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  // Consumer simulation test bench state
  const [testPurpose, setTestPurpose] = useState('fitness_analytics');
  const [overrideKey, setOverrideKey] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ConsumerAccessResponse | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await api.getDashboard();
        setTelemetry(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleSimulateConsumer = async () => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await api.simulateConsumerAccess(
        testPurpose,
        overrideKey.trim() || undefined
      );
      setSimulationResult(res);
    } catch (e: any) {
      alert(`Simulation error: ${e.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const setTestScenario = (purpose: string, key: string) => {
    setTestPurpose(purpose);
    setOverrideKey(key);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono text-slate-400">
        Loading fitness analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="neon-card-cyan p-6 sm:p-7 rounded-3xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-mono shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            LONGITUDINAL TELEMETRY & ENFORCEMENT
          </span>
          <span className="text-xs text-slate-400 font-mono">• AIORI-3 Runtime Pipeline</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <BarChart3 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          Fitness Analytics & Downstream Access Bench
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Visual activity trends across daily steps and caloric expenditure. Test how downstream enterprise partners access this data under AIORI-3's purpose-based consent runtime.
        </p>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neon-card-cyan p-6 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold text-white mb-2">Step Count Volatility</h3>
          <StepCountChart data={telemetry?.weekly_steps || []} />
        </div>

        <div className="neon-card-amber p-6 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold text-white mb-2">Caloric Consumption Profile</h3>
          <CalorieTrendChart data={telemetry?.weekly_calories || []} />
        </div>
      </div>

      {/* Downstream Consumer Integration Test Bench (Core Hackathon Requirement) */}
      <div className="neon-card p-6 sm:p-7 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold font-mono border border-amber-500/30">
                SECTION 5 INTEGRATION BENCH
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              Downstream Consumer Access Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate an external health consumer requesting your fitness telemetry under various consent conditions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Authenticated Key:</span>
            <code className="px-2 py-1 bg-white/[0.04] rounded-lg border border-white/[0.06] text-amber-300 text-[11px]">
              fitpulse_api_key_live_2026
            </code>
          </div>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-300">Quick Test Scenarios:</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setTestScenario('fitness_analytics', '')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 text-slate-300 transition"
            >
              1. Authorized Access (<code className="text-emerald-400">fitness_analytics</code>)
            </button>
            <button
              onClick={() => setTestScenario('marketing', '')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 text-slate-300 transition"
            >
              2. Scope Violation (<code className="text-rose-400">marketing</code>)
            </button>
            <button
              onClick={() => setTestScenario('fitness_analytics', 'invalid_unregistered_key_999')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 text-slate-300 transition"
            >
              3. Invalid Consumer Key (<code className="text-rose-400">HTTP 401</code>)
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Declared Processing Purpose</label>
            <select
              value={testPurpose}
              onChange={(e) => setTestPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
            >
              <option value="fitness_analytics">fitness_analytics (FitPulse Allowed Scope)</option>
              <option value="personalized_recommendations">personalized_recommendations (Allowed Scope)</option>
              <option value="marketing">marketing (Commercial - Scope Violation for FitPulse)</option>
              <option value="research_sharing">research_sharing (Research - Scope Violation for FitPulse)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Consumer API Key (Optional Override)</label>
            <input
              type="text"
              value={overrideKey}
              onChange={(e) => setOverrideKey(e.target.value)}
              placeholder="Leave blank for valid FitPulse key: fitpulse_api_key_live_2026"
              className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <button
            onClick={handleSimulateConsumer}
            disabled={simulating}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{simulating ? 'Evaluating across 10 security checks...' : 'Execute Downstream Access Request'}</span>
          </button>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div
            className={`p-5 rounded-2xl border space-y-4 animate-in fade-in ${
              simulationResult.allowed
                ? 'bg-[#0f1d19] border-emerald-500/30'
                : 'bg-[#1e1116] border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {simulationResult.allowed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {simulationResult.allowed
                      ? 'HTTP 200 OK — Telemetry Access Authorized'
                      : `HTTP ${simulationResult.status_code} — Access Denied`}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Reason Code: <span className={simulationResult.allowed ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>{simulationResult.reason_code}</span>
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                  simulationResult.allowed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {simulationResult.status}
              </span>
            </div>

            {/* Response Payload */}
            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px] font-semibold">
                {simulationResult.allowed ? 'Released Telemetry Data:' : 'RFC 9457 Problem Details (Zero Biometrics Emitted):'}
              </span>
              <pre className="p-3.5 rounded-xl bg-[#0a0d14] text-slate-300 text-[11px] overflow-auto max-h-56 border border-white/[0.06]">
                {JSON.stringify(simulationResult.allowed ? simulationResult.data : simulationResult.problem_details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


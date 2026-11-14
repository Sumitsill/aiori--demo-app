import React, { useEffect, useState } from 'react';
import {
  Footprints,
  Flame,
  Heart,
  Timer,
  TrendingUp,
  Dumbbell,
  Target,
  ShieldCheck,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardTelemetry, Workout, FitnessGoal } from '../types';
import { StepCountChart, CalorieTrendChart, CategoryBreakdown } from '../components/InteractiveCharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [telemetry, setTelemetry] = useState<DashboardTelemetry | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dash, wList, gList] = await Promise.all([
          api.getDashboard(),
          api.getWorkouts(),
          api.getGoals(),
        ]);
        setTelemetry(dash);
        setRecentWorkouts(wList.slice(0, 4));
        setGoals(gList.slice(0, 3));
      } catch (e) {
        console.error('Failed to load dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
        Loading real-time fitness metrics...
      </div>
    );
  }

  const today = telemetry?.today;
  const stepGoal = telemetry?.goals.step_goal || 10000;
  const stepProgress = telemetry?.goals.step_progress_pct || 0;
  const calGoal = telemetry?.goals.calorie_goal || 500;
  const calProgress = telemetry?.goals.calorie_progress_pct || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              DAILY PERFORMANCE BENCHMARK
            </span>
            <span className="text-xs text-slate-400 font-mono">• Synthetic Biometrics Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Today's Fitness Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time biometric estimation calibrated for cardiovascular conditioning and metabolic tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('workouts')}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>
          <button
            onClick={() => onNavigate('consent')}
            className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-bold transition flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Consent Center</span>
          </button>
        </div>
      </div>

      {/* Sensor Notice Badge */}
      <div className="bg-[#0e121d] border border-white/[0.06] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-slate-200">Device Telemetry Notice:</strong> Heart rate and oxygen saturation readings are simulated sensor measurements for this demonstration.
        </span>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Steps Card */}
        <div className="bg-[#121724] border border-white/[0.08] p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Daily Steps</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {today?.steps.toLocaleString() || '0'}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>Goal: {stepGoal.toLocaleString()}</span>
              <span className="text-emerald-400 font-semibold">{stepProgress}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, stepProgress)}%` }}
            />
          </div>
        </div>

        {/* Calories Burned Card */}
        <div className="bg-[#121724] border border-white/[0.08] p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Burn</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {Math.round(today?.calories_burned || 0)} <span className="text-xs font-normal text-slate-400 font-mono">kcal</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>Goal: {calGoal} kcal</span>
              <span className="text-amber-400 font-semibold">{calProgress}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, calProgress)}%` }}
            />
          </div>
        </div>

        {/* Heart Rate Card */}
        <div className="bg-[#121724] border border-white/[0.08] p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Heart Rate (Simulated)</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
              <span>{today?.heart_rate_avg || 72}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">BPM (Avg)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Resting: <strong className="text-slate-300">{today?.resting_heart_rate || 58} BPM</strong> • Zone 1
            </p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Calibrated Sensor Model #HR-SIM-2026
          </div>
        </div>

        {/* Active Duration Card */}
        <div className="bg-[#121724] border border-white/[0.08] p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden group hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Minutes</span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {today?.active_minutes || 0} <span className="text-xs font-normal text-slate-400 font-mono">min</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Sleep Score: <strong className="text-cyan-300">{today?.sleep_score || 85}/100</strong> ({today?.sleep_hours || 7.8}h)
            </p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Estimated VO2 Max: {today?.vo2_max || 51.4} mL/kg/min
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Steps Bar Chart */}
        <div className="bg-[#121724] border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Footprints className="w-4 h-4 text-emerald-400" />
              Weekly Step Trajectory
            </h3>
            <span className="text-[11px] font-mono text-slate-400">7-Day Rolling Trend</span>
          </div>
          <StepCountChart data={telemetry?.weekly_steps || []} target={stepGoal} />
        </div>

        {/* Weekly Calorie Burn Chart */}
        <div className="bg-[#121724] border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Active Caloric Expenditure
            </h3>
            <span className="text-[11px] font-mono text-slate-400">MET-Derived Output</span>
          </div>
          <CalorieTrendChart data={telemetry?.weekly_calories || []} />
        </div>
      </div>

      {/* Bottom Grid: Recent Workouts & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workouts (2 cols) */}
        <div className="lg:col-span-2 bg-[#121724] border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Workout History</h3>
            </div>
            <button
              onClick={() => onNavigate('workouts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentWorkouts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No workouts recorded yet.</p>
            ) : (
              recentWorkouts.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 rounded-2xl bg-[#0e121d] border border-white/[0.05] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center font-bold text-emerald-400 shrink-0 font-mono text-xs">
                      {w.category.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{w.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {w.category} • {w.duration_minutes} min {w.distance_km > 0 ? `• ${w.distance_km} km` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-300 font-mono">{Math.round(w.calories_burned)} kcal</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(w.performed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals & Category Breakdown (1 col) */}
        <div className="bg-[#121724] border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Active Goals</h3>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
              return (
                <div key={g.id} className="p-3 rounded-2xl bg-[#0e121d] border border-white/[0.04] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">{g.title}</span>
                    <span className="text-[11px] font-mono text-cyan-400">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{g.current_value.toLocaleString()} {g.unit}</span>
                    <span>Target: {g.target_value.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <h4 className="text-xs font-bold text-slate-300 mb-3 font-mono">Workout Categories</h4>
            <CategoryBreakdown data={telemetry?.workout_distribution || []} />
          </div>
        </div>
      </div>
    </div>
  );
};


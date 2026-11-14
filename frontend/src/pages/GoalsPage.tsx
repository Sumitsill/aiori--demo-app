import React, { useEffect, useState } from 'react';
import { Target, Plus, Check, Trash2, Calendar, Award, Activity, X } from 'lucide-react';
import { api } from '../services/api';
import { FitnessGoal, ActivityHistoryItem } from '../types';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [activity, setActivity] = useState<ActivityHistoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('STEPS');
  const [targetValue, setTargetValue] = useState(10000);
  const [unit, setUnit] = useState('steps');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [gList, aList] = await Promise.all([
        api.getGoals(),
        api.getActivityHistory(),
      ]);
      setGoals(gList);
      setActivity(aList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createGoal({
        title,
        goal_type: goalType as any,
        target_value: targetValue,
        unit,
      });
      setIsModalOpen(false);
      setTitle('');
      await loadData();
    } catch (err: any) {
      alert(`Error creating goal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await api.deleteGoal(id);
      await loadData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              TARGETS & MILESTONES
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Fitness Goals & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Set ambitious targets across daily steps, caloric expenditure, distance, and weekly workouts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
          return (
            <div
              key={g.id}
              className={`p-6 rounded-3xl border shadow-lg space-y-4 transition ${
                g.is_completed
                  ? 'bg-[#101c18] border-emerald-500/30'
                  : 'bg-[#121724] border-white/[0.08] hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.06]">
                    {g.goal_type}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{g.title}</h3>
                </div>

                <button
                  onClick={() => handleDelete(g.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                  title="Delete goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Progress</span>
                  <span className={g.is_completed ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      g.is_completed
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{g.current_value.toLocaleString()} {g.unit}</span>
                  <span>Target: {g.target_value.toLocaleString()}</span>
                </div>
              </div>

              {g.is_completed && (
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Milestone Achieved!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Activity Event Stream */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Recent Activity History</h3>
        </div>

        <div className="space-y-2.5">
          {activity.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent activity events.</p>
          ) : (
            activity.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-2xl bg-[#0e121d] border border-white/[0.05] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{a.summary}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Category: {a.activity_type} {a.metric_value ? `• ${a.metric_value}` : ''}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121724] border border-white/[0.1] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Set New Fitness Goal
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10,000 Steps Daily"
                  className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Goal Metric</label>
                  <select
                    value={goalType}
                    onChange={(e) => {
                      setGoalType(e.target.value);
                      if (e.target.value === 'STEPS') setUnit('steps');
                      if (e.target.value === 'CALORIES') setUnit('kcal');
                      if (e.target.value === 'DISTANCE') setUnit('km');
                      if (e.target.value === 'WORKOUTS_WEEKLY') setUnit('workouts');
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  >
                    <option value="STEPS">Daily Steps</option>
                    <option value="CALORIES">Active Calories</option>
                    <option value="DISTANCE">Running/Cycling Distance</option>
                    <option value="WORKOUTS_WEEKLY">Weekly Workout Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.04] text-slate-300 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{loading ? 'Creating...' : 'Create Goal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


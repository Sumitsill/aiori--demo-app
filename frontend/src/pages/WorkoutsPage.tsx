import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Search,
  Timer,
  Flame,
  Route,
  Info,
  X,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Workout, WorkoutSummary } from '../types';

export const WorkoutsPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<string>('0');
  const [heartRateAvg, setHeartRateAvg] = useState<string>('135');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Running', 'Cycling', 'Strength', 'HIIT', 'Swimming', 'Yoga', 'Walking'];

  const loadWorkouts = async () => {
    try {
      const [list, sum] = await Promise.all([
        api.getWorkouts(selectedCategory || undefined),
        api.getWorkoutSummary(),
      ]);
      setWorkouts(list);
      setSummary(sum);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [selectedCategory]);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Running');
    setDurationMinutes(30);
    setCaloriesBurned('');
    setDistanceKm('0');
    setHeartRateAvg('135');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (w: Workout) => {
    setEditingId(w.id);
    setTitle(w.title);
    setCategory(w.category);
    setDurationMinutes(w.duration_minutes);
    setCaloriesBurned(w.calories_burned.toString());
    setDistanceKm(w.distance_km.toString());
    setHeartRateAvg(w.heart_rate_avg?.toString() || '');
    setNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Partial<Workout> = {
        title,
        category,
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned ? parseFloat(caloriesBurned) : undefined,
        distance_km: parseFloat(distanceKm) || 0,
        heart_rate_avg: heartRateAvg ? parseFloat(heartRateAvg) : undefined,
        notes,
      };

      if (editingId) {
        await api.updateWorkout(editingId, payload);
      } else {
        await api.createWorkout(payload);
      }
      setIsModalOpen(false);
      await loadWorkouts();
    } catch (err: any) {
      alert(`Error saving workout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await api.deleteWorkout(id);
      await loadWorkouts();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              WORKOUT LEDGER & METRICS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            My Workouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Log exercises with MET-calibrated caloric estimation and simulated heart rate tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workout</span>
        </button>
      </div>

      {/* MET Methodology Info Box */}
      <div className="bg-[#0e121d] border border-white/[0.06] p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Metabolic Equivalent of Task (MET) Estimation</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            When calories burned are left blank, FitPulse computes expenditure using standard physiological MET multipliers:
            Running (9.8 MET), Cycling (7.5 MET), Swimming (8.0 MET), Strength (5.0 MET), HIIT (8.5 MET), Yoga (3.0 MET).
            Formula: <code className="text-amber-300 font-mono">Calories = MET × weight (kg) × (minutes / 60)</code>.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.06] space-y-1">
          <span className="text-slate-400 text-[11px]">Total Workouts</span>
          <p className="text-xl font-bold text-white">{summary?.total_workouts || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.06] space-y-1">
          <span className="text-slate-400 text-[11px]">Active Duration</span>
          <p className="text-xl font-bold text-cyan-400">{summary?.total_duration_minutes || 0} min</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.06] space-y-1">
          <span className="text-slate-400 text-[11px]">Energy Expended</span>
          <p className="text-xl font-bold text-amber-400">{Math.round(summary?.total_calories_burned || 0)} kcal</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.06] space-y-1">
          <span className="text-slate-400 text-[11px]">Distance Covered</span>
          <p className="text-xl font-bold text-emerald-400">{summary?.total_distance_km || 0} km</p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            selectedCategory === ''
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
              : 'bg-[#121724] text-slate-400 hover:text-white border border-white/[0.06]'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedCategory === c
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'bg-[#121724] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Workouts Table */}
      <div className="bg-[#121724] rounded-3xl border border-white/[0.08] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/[0.04] text-left text-xs">
            <thead className="bg-[#0e121d] text-slate-400 uppercase font-semibold text-[11px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-5">Workout</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Duration</th>
                <th className="py-3.5 px-5">Caloric Burn</th>
                <th className="py-3.5 px-5">Distance</th>
                <th className="py-3.5 px-5">Heart Rate (Sim)</th>
                <th className="py-3.5 px-5">Date / Time</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {workouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No workouts logged under this category.
                  </td>
                </tr>
              ) : (
                workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-[#161c2c] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">
                      {w.title}
                      {w.notes && <p className="text-[10px] text-slate-500 truncate max-w-xs">{w.notes}</p>}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#171d2e] text-slate-300 border border-white/[0.06] font-mono">
                        {w.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-cyan-300">
                      {w.duration_minutes} min
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-amber-300">
                      {Math.round(w.calories_burned)} kcal
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-300">
                      {w.distance_km > 0 ? `${w.distance_km} km` : '—'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-300 text-[11px]">
                      {w.heart_rate_avg ? `${w.heart_rate_avg} BPM` : '—'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(w.performed_at).toLocaleDateString()} {new Date(w.performed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(w)}
                        className="p-1.5 hover:text-white text-slate-400 transition rounded-lg hover:bg-white/[0.05]"
                        title="Edit Workout"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-1.5 hover:text-rose-400 text-slate-500 transition rounded-lg hover:bg-rose-500/10"
                        title="Delete Workout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Workout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121724] border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                {editingId ? 'Edit Workout' : 'Log New Workout'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Workout Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5K Sunrise Tempo Run"
                  className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#0e121d]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Calories (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Auto (MET)"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    placeholder="135"
                    value={heartRateAvg}
                    onChange={(e) => setHeartRateAvg(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Workout Notes & Reflections</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terrain, fatigue level, cadence..."
                  className="w-full px-3.5 py-2 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none resize-none"
                />
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
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : editingId ? 'Update Workout' : 'Save Workout'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


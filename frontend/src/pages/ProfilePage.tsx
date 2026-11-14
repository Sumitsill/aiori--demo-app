import React, { useEffect, useState } from 'react';
import { UserCircle, Save, Check, ShieldCheck, Dumbbell, Ruler, Scale } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [age, setAge] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [gender, setGender] = useState<string>('Not Specified');
  const [fitnessLevel, setFitnessLevel] = useState<string>('Intermediate');
  const [preferredActivity, setPreferredActivity] = useState<string>('Running');
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [calorieGoal, setCalorieGoal] = useState<number>(500);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await api.getProfile();
        setProfile(p);
        setAge(p.age?.toString() || '');
        setHeightCm(p.height_cm?.toString() || '');
        setWeightKg(p.weight_kg?.toString() || '');
        setGender(p.gender || 'Not Specified');
        setFitnessLevel(p.fitness_level || 'Intermediate');
        setPreferredActivity(p.preferred_activity || 'Running');
        setStepGoal(p.daily_step_goal || 10000);
        setCalorieGoal(p.daily_calorie_goal || 500);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const updated = await api.updateProfile({
        age: age ? parseInt(age) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        gender,
        fitness_level: fitnessLevel,
        preferred_activity: preferredActivity,
        daily_step_goal: stepGoal,
        daily_calorie_goal: calorieGoal,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
            PERSONAL BIOMETRICS
          </span>
          <span className="text-xs text-slate-400 font-mono">• Caloric Multipliers</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-emerald-400" />
          Fitness Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Maintain your physical parameters to ensure accurate Metabolic Equivalent (MET) calorie estimation.
        </p>
      </div>

      {/* Account Info Pill */}
      <div className="bg-[#0e121d] border border-white/[0.06] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm font-mono">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{currentUser?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">User ID:</span>
          <code className="text-emerald-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
            {currentUser?.id}
          </code>
          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.06]">
            {currentUser?.role}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 68.5"
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                Height (cm)
              </label>
              <input
                type="number"
                step="1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 29"
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Gender (Optional)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              >
                <option value="Not Specified">Not Specified</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Fitness Experience Level</label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Elite">Elite / Competitor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Preferred Primary Activity</label>
              <select
                value={preferredActivity}
                onChange={(e) => setPreferredActivity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              >
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Strength">Strength & Conditioning</option>
                <option value="HIIT">HIIT & Cross-training</option>
                <option value="Swimming">Swimming</option>
                <option value="Yoga">Yoga & Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Daily Step Target</label>
              <input
                type="number"
                value={stepGoal}
                onChange={(e) => setStepGoal(parseInt(e.target.value) || 10000)}
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Daily Caloric Burn Target (kcal)</label>
              <input
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 500)}
                className="w-full px-3.5 py-2.5 bg-[#0e121d] border border-white/[0.08] rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            {saved ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Profile updated successfully.
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


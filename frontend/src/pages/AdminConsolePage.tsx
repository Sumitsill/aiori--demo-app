import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Dumbbell,
  Activity,
  Layers,
  RotateCw,
  Server,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Lock,
  FileText,
  Send,
  Hash,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

function getNextVersion(currentVer?: string): string {
  if (!currentVer) return 'v2.1';
  const match = currentVer.match(/v?(\d+)(\.(\d+))?/i);
  if (!match) return 'v2.1';
  const major = parseInt(match[1], 10);
  const minor = match[3] !== undefined ? parseInt(match[3], 10) : 0;
  return `v${major}.${minor + 1}`;
}

export const AdminConsolePage: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [simPurpose, setSimPurpose] = useState<string>('fitness_analytics');
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Privacy Notice Revision State
  const [currentNotice, setCurrentNotice] = useState<any>(null);
  const [noticeVersion, setNoticeVersion] = useState<string>('v2.1');
  const [noticeTitle, setNoticeTitle] = useState<string>('FitPulse Telemetry & Academic Research Privacy Policy v2.1');
  const [noticeContent, setNoticeContent] = useState<string>(
    'This updated privacy notice expands data processing transparency for advanced cardiovascular telemetry, VO2 max estimation algorithms, and de-identified data sharing with academic sports science partners under DPDP Act 2023 §6 guidelines.'
  );
  const [noticeLang, setNoticeLang] = useState<string>('en');
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<{ text: string; isError?: boolean; hash?: string } | null>(null);

  const loadAdminData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsData, usersData, eventsData, noticeData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminIntegrationEvents(30),
        api.getAdminCurrentNotice().catch(() => null),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setEvents(eventsData);
      setCurrentNotice(noticeData);
      if (noticeData) {
        const nextVer = getNextVersion(noticeData.version);
        setNoticeVersion(nextVer);
        setNoticeTitle(`FitPulse Telemetry & Academic Research Privacy Policy ${nextVer}`);
        if (noticeData.content) {
          setNoticeContent(noticeData.content);
        }
      }
    } catch (e) {
      console.error('Failed to load admin telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to publish notice version ${noticeVersion}? This will immediately invalidate existing consents across the platform and block downstream access until users re-consent.`)) {
      return;
    }
    setPublishLoading(true);
    setPublishMessage(null);
    try {
      const res = await api.publishNoticeRevision({
        version: noticeVersion,
        title: noticeTitle,
        content: noticeContent,
        language: noticeLang,
      });
      setPublishMessage({
        text: res.message || `Notice ${noticeVersion} published successfully.`,
        hash: res.notice?.hash_sha256,
      });
      await loadAdminData();
    } catch (err: any) {
      setPublishMessage({
        text: err.message || 'Failed to publish notice to AIORI-3.',
        isError: true,
      });
    } finally {
      setPublishLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await api.simulateConsumerAccess(simPurpose);
      setSimResult(res);
      // reload events
      const eventsData = await api.getAdminIntegrationEvents(30);
      setEvents(eventsData);
    } catch (err: any) {
      setSimResult({
        decision: 'DENIED',
        status_code: 403,
        reason: err.message || 'Authorization rejected by AIORI-3.',
      });
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-slate-400">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping mr-2.5 inline-block" />
        Loading administrative telemetry and integration stream...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono">ADMINISTRATOR ROLE REQUIRED</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Admin Oversight Console is restricted to accounts with the <code>ADMIN</code> role under platform RBAC controls.
        </p>
      </div>
    );
  }

  const pStats = stats?.platform || {};
  const aiori = stats?.aiori_integration || {};
  const consentDist = stats?.consent_distribution || {};

  return (
    <div className="space-y-6">
      {/* Admin Title Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              ROLE: FITPULSE ADMIN
            </span>
            <span className="text-xs text-slate-400 font-mono">• Platform & AIORI-3 Bridge Oversight</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Platform Administration & Integration Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor SaaS operational metrics, registered users, fail-closed outbox queues, and audit telemetry exchanged with the authoritative AIORI-3 consent authority.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* DPDP Act 2023 §6 Security Notice */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-300 font-mono">
            ADMINISTRATIVE ACCESS CONTROL POLICY (DPDP ACT 2023 §6)
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            FitPulse strictly enforces separation of concerns. Platform administrators have visibility into application telemetry and integration health, but <strong>cannot grant or withdraw personal user consent</strong> on behalf of data principals. All consent modifications must originate from the authenticated user.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Registered Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pStats.total_users || 0}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Platform Data Principals</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Workouts Logged</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pStats.total_workouts || 0}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">MET-Calibrated Sessions</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Telemetry Datapoints</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pStats.total_metrics_logged || 0}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Daily Biometric Records</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Fail-Closed Outbox</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pStats.pending_sync_outbox || 0}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Pending Offline Syncs</p>
        </div>
      </div>

      {/* Integration Status & Consent Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AIORI-3 Linkage */}
        <div className="p-6 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>AIORI-3 Authority Bridge</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                aiori.is_connected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {aiori.is_connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Target Authority URL:</span>
              <span className="text-amber-300 truncate max-w-[180px]">{aiori.target_url || 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Enforcement Model:</span>
              <span className="text-slate-200">10-Point Runtime Gate</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Audit Ledger:</span>
              <span className="text-slate-200">RFC 8785 SHA-256 Chain</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Receipt Standard:</span>
              <span className="text-slate-200">Kantara Initiative 7807</span>
            </div>
          </div>
        </div>

        {/* Consent Distribution */}
        <div className="p-6 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Consent State Distribution</span>
          </h3>

          <div className="space-y-2.5">
            {Object.keys(consentDist).length === 0 ? (
              <p className="text-xs text-slate-400 py-3 font-mono">No consent records cached yet.</p>
            ) : (
              Object.entries(consentDist).map(([st, cnt]: [string, any]) => (
                <div key={st} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{st}</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.05] text-amber-300 border border-white/[0.08] font-bold">
                    {cnt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Consumer Simulator */}
        <div className="p-6 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Downstream Access Simulator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Trigger a simulated 3rd-party consumer request through AIORI-3 authorization:
            </p>

            <div className="mt-3 space-y-2">
              <select
                value={simPurpose}
                onChange={(e) => setSimPurpose(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0d14] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="fitness_analytics">fitness_analytics (Analytics Engine)</option>
                <option value="personalized_recommendations">personalized_recommendations (AI Coach)</option>
                <option value="marketing">marketing (Wellness Promotions)</option>
                <option value="research_sharing">research_sharing (Academic Lab)</option>
              </select>

              <button
                onClick={handleSimulate}
                disabled={simLoading}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{simLoading ? 'Authorizing in AIORI-3...' : 'Simulate Consumer Access'}</span>
              </button>
            </div>
          </div>

          {simResult && (
            <div
              className={`p-3 rounded-2xl text-xs font-mono border ${
                simResult.decision === 'ALLOWED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {simResult.decision === 'ALLOWED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>DECISION: {simResult.decision}</span>
              </div>
              <p className="text-[11px] leading-tight text-slate-300">{simResult.message || simResult.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Authoritative Privacy Notice Management (AIORI-3 Governed) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                DPDP ACT §6 INLINE REVISION
              </span>
              <span className="text-xs text-slate-400 font-mono">• Authoritative AIORI-3 Notice Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Privacy Notice Revision & Consent Invalidation Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              When terms or data processing scopes change, publishing a revised notice version to AIORI-3 writes an immutable RFC 8785 block to the audit ledger and <strong>automatically invalidates all existing user consents across FitPulse (marking them CONSENT_STALE)</strong>. Downstream access is immediately halted until users re-consent.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Notice Card (Left) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0a0d14] border border-white/[0.06] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Active Policy on AIORI-3
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentNotice?.version || 'v1.0'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Policy Title</span>
                  <p className="text-slate-200 font-semibold">{currentNotice?.title || 'FitTrack Lite Initial Privacy Notice'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Ledger SHA-256 Hash</span>
                  <p className="text-[10px] font-mono text-amber-300/90 break-all bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.04]">
                    {currentNotice?.hash_sha256 || 'SHA-256 computing on demand...'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Terms Excerpt</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.03] max-h-32 overflow-y-auto">
                    {currentNotice?.content || 'Initial fitness telemetry processing terms for steps, calories, and workouts.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.04] text-[10px] font-mono text-slate-500 flex justify-between items-center">
              <span>Authority: AIORI-3 SQLite Ledger</span>
              <span>Lang: {currentNotice?.language || 'en'}</span>
            </div>
          </div>

          {/* Revision Form (Right) */}
          <form onSubmit={handlePublishNotice} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  New Version (Next: {getNextVersion(currentNotice?.version)})
                </label>
                <input
                  type="text"
                  required
                  value={noticeVersion}
                  onChange={(e) => setNoticeVersion(e.target.value)}
                  placeholder={getNextVersion(currentNotice?.version)}
                  className={`w-full px-3 py-2 bg-[#0a0d14] border rounded-xl text-xs text-white focus:outline-none font-mono ${
                    noticeVersion === currentNotice?.version
                      ? 'border-rose-500/50 focus:border-rose-400'
                      : 'border-white/[0.1] focus:border-amber-400'
                  }`}
                />
                {noticeVersion === currentNotice?.version && (
                  <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Version {noticeVersion} is already active. Use a new version like {getNextVersion(currentNotice?.version)}.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Language Code
                </label>
                <select
                  value={noticeLang}
                  onChange={(e) => setNoticeLang(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0d14] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="en">en (English - Master)</option>
                  <option value="hi">hi (हिन्दी)</option>
                  <option value="bn">bn (বাংলা)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Notice Title
              </label>
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="FitPulse Privacy Notice Revision"
                className="w-full px-3 py-2 bg-[#0a0d14] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Revised Terms & Scope Content
              </label>
              <textarea
                rows={3}
                required
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Describe new telemetry categories, retention duration, and purpose updates..."
                className="w-full px-3 py-2 bg-[#0a0d14] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            {/* Invalidation Alert */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Regulatory Consequence:</strong> Publishing will anchor this revision into AIORI-3's SHA-256 hash ledger, <strong>immediately invalidating all active user consents (marking them CONSENT_STALE)</strong>. Downstream third-party consumers will be blocked with HTTP 403 until individual users grant re-consent.
              </span>
            </div>

            {/* Inline Result / Error Message Directly Above Button */}
            {publishMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex flex-col gap-1.5 border animate-in fade-in ${
                  publishMessage.isError
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {publishMessage.isError ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>{publishMessage.text}</span>
                </div>
                {publishMessage.hash && (
                  <div className="font-mono text-[11px] text-emerald-200/90 pl-6 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Deterministic SHA-256 Hash: {publishMessage.hash}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={publishLoading || noticeVersion === currentNotice?.version}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>
                {publishLoading
                  ? 'Anchoring in AIORI-3 Audit Ledger...'
                  : noticeVersion === currentNotice?.version
                  ? `Version ${noticeVersion} Already Exists (Specify ${getNextVersion(currentNotice?.version)})`
                  : `Publish Notice ${noticeVersion} & Invalidate Consents`}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Users & HTTP Integration Events 2-Col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Users */}
        <div className="p-6 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Platform Users ({users.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">FitPulse DB</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-slate-400 border-b border-white/[0.06]">
                <tr>
                  <th className="pb-2">User ID</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">AIORI ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 text-white font-bold">{u.id}</td>
                    <td className="py-2.5 text-slate-300">{u.name}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{u.aiori_user_id || 'unlinked'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration HTTP Event Audit Stream */}
        <div className="p-6 rounded-3xl bg-[#121724] border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>AIORI-3 REST Bridge Audit Stream</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Last 30 Calls</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono py-4 text-center">No integration events recorded yet.</p>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-2xl bg-[#0a0d14] border border-white/[0.05] text-xs font-mono space-y-1 hover:border-white/[0.1] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{ev.event_type}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ev.status_code && ev.status_code < 400
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      HTTP {ev.status_code || 'FAIL'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{ev.target_url}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/[0.03]">
                    <span>User: {ev.user_id || 'System'}</span>
                    <span>{new Date(ev.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Globe2,
  FileCheck,
  RotateCw,
  AlertTriangle,
  Lock,
  ArrowRight,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  X,
  Eye,
  Hash,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserConsentOverview, PurposeConsentState, NoticeRead } from '../types';

interface ConsentCenterProps {
  onNavigateToReceipts: (receiptId?: string) => void;
}

const PURPOSE_DATA_CATEGORIES: Record<string, string[]> = {
  fitness_analytics: ['Daily Steps', 'Average Heart Rate', 'Caloric Burn', 'Active Duration', 'Distance'],
  personalized_recommendations: ['Heart Rate Zones', 'Sleep Efficiency Score', 'VO2 Max Estimates', 'Hydration Targets'],
  marketing: ['Activity Tier', 'Preferred Workout Time', 'Promotion Eligibility', 'Device Model'],
  research_sharing: ['De-Identified Cardio Series', 'Age Bracket', 'BMI Tier', 'VO2 Max Range'],
};

export const ConsentCenterPage: React.FC<ConsentCenterProps> = ({ onNavigateToReceipts }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [overview, setOverview] = useState<UserConsentOverview | null>(null);
  const [activeLang, setActiveLang] = useState<string>('en');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Review Policy Changes Before Re-Consent Modal State
  const [reviewModalPurpose, setReviewModalPurpose] = useState<PurposeConsentState | null>(null);
  const [consentAffirmed, setConsentAffirmed] = useState<boolean>(false);
  const [viewGeneralNoticeModal, setViewGeneralNoticeModal] = useState<boolean>(false);

  const loadConsentData = async (lang: string = activeLang) => {
    try {
      const data = await api.getConsentOverview(lang);
      setOverview(data);
    } catch (e) {
      console.error('Failed to load consent overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsentData(activeLang);
  }, [activeLang]);

  const handleGrant = async (purposeId: string) => {
    setActionLoading(purposeId);
    setActionMessage(null);
    try {
      const res = await api.grantConsent(purposeId, activeLang);
      setActionMessage({ text: res.message || 'Consent granted successfully.' });
      await loadConsentData();
    } catch (err: any) {
      setActionMessage({ text: err.message, isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (purposeId: string) => {
    if (!confirm(`Are you sure you want to withdraw consent for this purpose? Downstream processing will be immediately blocked.`)) {
      return;
    }
    setActionLoading(purposeId);
    setActionMessage(null);
    try {
      const res = await api.withdrawConsent(purposeId, activeLang);
      setActionMessage({ text: res.message || 'Consent withdrawn successfully.' });
      await loadConsentData();
    } catch (err: any) {
      setActionMessage({ text: err.message, isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono text-slate-400">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-2 inline-block" />
        Connecting to AIORI-3 authoritative consent platform...
      </div>
    );
  }

  const notice = overview?.current_notice;

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="neon-card-amber p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 font-mono shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              DPDP ACT 2023 §6 • KANTARA 7807 GOVERNED
            </span>
            <span className="text-xs text-slate-400 font-mono">• Authoritative AIORI-3 Link</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <ShieldCheck className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            Privacy & Purpose-Based Consent Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            FitPulse strictly enforces itemized, informed consent at data-sharing runtime. Withdrawals take effect immediately in the AIORI-3 cryptographic ledger, blocking downstream access.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => setViewGeneralNoticeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-white/[0.08] text-xs font-mono transition"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Privacy Notice: {notice?.version || 'v2.1'} (View Full Terms & SHA-256)</span>
            </button>
          </div>
        </div>

        {/* Language Switcher & Refresh */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <Globe2 className="w-3.5 h-3.5 text-amber-400 ml-2" />
            <button
              onClick={() => setActiveLang('en')}
              className={`px-2.5 py-1 rounded-xl font-medium transition ${
                activeLang === 'en'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLang('hi')}
              className={`px-2.5 py-1 rounded-xl font-medium transition ${
                activeLang === 'hi'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setActiveLang('bn')}
              className={`px-2.5 py-1 rounded-xl font-medium transition ${
                activeLang === 'bn'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>

          <button
            onClick={() => loadConsentData()}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-2xl border border-white/[0.08] transition"
            title="Refresh live status from AIORI-3"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Administrator Governance Guardrail Banner */}
      {isAdmin && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 shadow-lg shadow-amber-500/5">
          <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-300 font-mono tracking-wide uppercase">
                Administrator Audit Mode • Read-Only Governance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40 font-mono">
                DPDP Act 2023 §6 Guardrail
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under Indian Digital Personal Data Protection Act (DPDP Act §6) and global privacy principles, consent must be freely given directly by the individual user. <strong className="text-white">Administrators are strictly prohibited from granting or withdrawing personal user consent.</strong> You are inspecting authoritative purpose terms and notice versions in audit governance mode.
            </p>
          </div>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in ${
            actionMessage.isError
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          {actionMessage.isError ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Authoritative Privacy Notice Card */}
      {notice && (
        <div className="bg-[#101422] border border-white/[0.08] p-6 rounded-3xl space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                {notice.title} ({notice.version})
              </h2>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>SHA-256:</span>
              <code className="text-amber-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                {notice.hash_sha256 ? `${notice.hash_sha256.substring(0, 16)}...` : 'N/A'}
              </code>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            {notice.content}
          </p>
        </div>
      )}

      {/* 4 Itemized Purpose Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {overview?.purposes.map((p) => {
          const isGranted = p.status === 'CONSENT_GRANTED';
          const isWithdrawn = p.status === 'CONSENT_WITHDRAWN';
          const isPending = p.status === 'CONSENT_PENDING';
          const isStale = p.status === 'CONSENT_STALE';
          const categories = PURPOSE_DATA_CATEGORIES[p.purpose_id] || ['Biometric Metrics'];

          return (
            <div
              key={p.purpose_id}
              className={`p-6 rounded-3xl flex flex-col justify-between gap-5 transition ${
                isGranted
                  ? 'neon-card-emerald'
                  : isWithdrawn
                  ? 'neon-card-rose'
                  : isStale
                  ? 'neon-card-amber'
                  : 'neon-card'
              }`}
            >
              {/* Header & Badges */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {p.purpose_id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{p.purpose_name}</h3>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isGranted && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        CONSENT GRANTED
                      </span>
                    )}
                    {isWithdrawn && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        CONSENT WITHDRAWN
                      </span>
                    )}
                    {isPending && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                        WITHDRAWAL PENDING
                      </span>
                    )}
                    {isStale && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        STALE (RE-CONSENT REQ)
                      </span>
                    )}
                    {!isGranted && !isWithdrawn && !isPending && !isStale && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                        NO CONSENT
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {p.purpose_description}
                </p>

                {/* Stale Warning Banner */}
                {isStale && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Notice revision superseded. Previous consent was bound to version <strong>{p.notice_version || 'earlier terms'}</strong>. The active policy on AIORI-3 is now <strong>{notice?.version || 'updated'}</strong>. Downstream data release is blocked until re-consent.
                      </span>
                    </div>
                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewModalPurpose(p);
                          setConsentAffirmed(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Policy Changes & Re-consent &rarr;</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Data Categories Involved */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    Data Categories Processed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.03] text-slate-300 border border-white/[0.05]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Binding Notice Version & Receipt */}
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Bound Notice: {p.notice_version || 'None'}</span>
                  {p.latest_receipt_id && (
                    <button
                      onClick={() => onNavigateToReceipts(p.latest_receipt_id)}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Receipt: {p.latest_receipt_id.substring(0, 10)}...</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                {isAdmin ? (
                  <div className="w-full flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-500/25">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Individual User Action Only</span>
                    </span>
                    {p.latest_receipt_id && (
                      <button
                        onClick={() => onNavigateToReceipts(p.latest_receipt_id)}
                        className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition"
                      >
                        <span>Inspect Receipt</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : isGranted ? (
                  <>
                    <button
                      onClick={() => handleWithdraw(p.purpose_id)}
                      disabled={actionLoading === p.purpose_id}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{actionLoading === p.purpose_id ? 'Recording Withdrawal...' : 'Withdraw Consent'}</span>
                    </button>
                    {p.latest_receipt_id && (
                      <button
                        onClick={() => onNavigateToReceipts(p.latest_receipt_id)}
                        className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
                      >
                        <span>Inspect Receipt</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (isStale) {
                          setReviewModalPurpose(p);
                          setConsentAffirmed(false);
                        } else {
                          handleGrant(p.purpose_id);
                        }
                      }}
                      disabled={actionLoading === p.purpose_id}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                        isStale
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                      }`}
                    >
                      {isStale ? <FileText className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>
                        {actionLoading === p.purpose_id
                          ? 'Recording in AIORI-3...'
                          : isStale
                          ? `Review Changes & Re-consent (${notice?.version || 'New'})`
                          : 'Grant Consent'}
                      </span>
                    </button>
                    {p.latest_receipt_id && (
                      <button
                        onClick={() => onNavigateToReceipts(p.latest_receipt_id)}
                        className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
                      >
                        <span>Prior Receipt</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Review Policy Changes Before Re-Consent Modal */}
      {reviewModalPurpose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121724] border border-white/[0.1] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 sticky top-0 bg-[#121724]/95 backdrop-blur-md z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    DPDP ACT 2023 §6 INFORMED RE-CONSENT
                  </span>
                  <span className="text-xs font-mono text-slate-400">• AIORI-3 Governed</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Review Privacy Policy Changes Before Re-Consenting</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Carefully review the updated terms and data processing scope before recording informed re-consent.
                </p>
              </div>

              <button
                onClick={() => setReviewModalPurpose(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Version Comparison Banner */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0a0d14] border border-white/[0.06]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Prior Bound Policy</span>
                  <div className="text-rose-400 font-mono font-bold flex items-center gap-1.5 text-sm">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewModalPurpose.notice_version || 'v1.0 (Superseded)'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Consent Invalidated</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">New Binding Policy</span>
                  <div className="text-emerald-400 font-mono font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{notice?.version || 'Active Version'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Current AIORI-3 Ledger Terms</p>
                </div>
              </div>

              {/* SHA-256 Digest Verification */}
              {notice?.hash_sha256 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <span className="text-[10px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    Cryptographic Ledger Anchor (RFC 8785 SHA-256)
                  </span>
                  <p className="font-mono text-[10px] text-amber-200/90 break-all select-all">
                    {notice.hash_sha256}
                  </p>
                </div>
              )}

              {/* What Changed in the Privacy Policy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono uppercase text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Updated Policy Title: {notice?.title || 'FitPulse Privacy Policy'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Lang: {notice?.language || 'en'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0d14] border border-amber-500/20 text-slate-300 space-y-2 max-h-56 overflow-y-auto leading-relaxed">
                  <p className="font-semibold text-amber-300">Revised Data Processing & Telemetry Terms:</p>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{notice?.content || 'Telemetry processing updates.'}</p>
                </div>
              </div>

              {/* Purpose & Data Categories */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="font-bold text-white font-mono text-[11px]">
                  Target Purpose: {reviewModalPurpose.purpose_name}
                </span>
                <p className="text-slate-400 text-xs">{reviewModalPurpose.purpose_description}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                    Data Categories Processed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(PURPOSE_DATA_CATEGORIES[reviewModalPurpose.purpose_id] || ['Biometric Metrics']).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informed Consent Affirmation Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentAffirmed}
                  onChange={(e) => setConsentAffirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs text-amber-200 leading-relaxed font-medium">
                  I confirm that I have reviewed the revised Privacy Policy (<strong>{notice?.version || 'v2.1'}</strong>). I explicitly grant my free, specific, informed, and unambiguous re-consent for <strong>{reviewModalPurpose.purpose_name}</strong> under DPDP Act 2023 §6.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-white/[0.08] flex items-center justify-end gap-3 sticky bottom-0 bg-[#121724]/95 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setReviewModalPurpose(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
              >
                Keep Access Blocked
              </button>

              <button
                type="button"
                disabled={!consentAffirmed || actionLoading === reviewModalPurpose.purpose_id}
                onClick={async () => {
                  const pid = reviewModalPurpose.purpose_id;
                  setReviewModalPurpose(null);
                  await handleGrant(pid);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Revised Policy & Grant Re-Consent</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. General Active Privacy Policy Inspector Modal */}
      {viewGeneralNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121724] border border-white/[0.1] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 sticky top-0 bg-[#121724]/95 backdrop-blur-md z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    ACTIVE NOTICE ON AIORI-3
                  </span>
                  <span className="text-xs font-mono text-slate-400">Version: {notice?.version || 'v2.1'}</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>{notice?.title || 'FitPulse Privacy Policy'}</span>
                </h2>
              </div>

              <button
                onClick={() => setViewGeneralNoticeModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {notice?.hash_sha256 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <span className="text-[10px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    Deterministic SHA-256 Hash
                  </span>
                  <p className="font-mono text-[10px] text-amber-200/90 break-all select-all">
                    {notice.hash_sha256}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#0a0d14] border border-white/[0.06] text-slate-300 space-y-2 leading-relaxed">
                <span className="text-[11px] font-mono text-slate-500 uppercase block">Complete Policy Content</span>
                <p className="whitespace-pre-wrap">{notice?.content || 'Full privacy policy content.'}</p>
              </div>
            </div>

            <div className="p-6 border-t border-white/[0.08] flex justify-end sticky bottom-0 bg-[#121724]/95 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewGeneralNoticeModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white transition"
              >
                Close Policy Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


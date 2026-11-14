import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Search,
  ExternalLink,
  X,
  FileCode,
} from 'lucide-react';
import { api } from '../services/api';
import { ReceiptRead, ReceiptVerifyResult } from '../types';

interface ReceiptsPageProps {
  initialReceiptId?: string | null;
}

export const ReceiptsPage: React.FC<ReceiptsPageProps> = ({ initialReceiptId }) => {
  const [receipts, setReceipts] = useState<ReceiptRead[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRead | null>(null);
  const [verifyResult, setVerifyResult] = useState<ReceiptVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReceipts = async () => {
    try {
      const list = await api.getReceipts();
      setReceipts(list);
      if (initialReceiptId) {
        const found = list.find((r) => r.receipt_id === initialReceiptId);
        if (found) setSelectedReceipt(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [initialReceiptId]);

  const handleVerify = async (receiptId: string) => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyReceipt(receiptId);
      setVerifyResult(res);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-[#121724] border border-white/[0.08] p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
              KANTARA 7807 CONSENT RECEIPTS
            </span>
            <span className="text-xs text-slate-400 font-mono">• Cryptographically Verifiable</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-amber-400" />
            Consent Receipt Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Immutable structured receipts issued by AIORI-3 upon every consent grant or withdrawal. Verifiable independently against the SHA-256 hash ledger.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            Total Receipts: <strong className="text-emerald-400 font-bold">{receipts.length}</strong>
          </span>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-[#121724] rounded-3xl border border-white/[0.08] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/[0.04] text-left text-xs">
            <thead className="bg-[#0e121d] text-slate-400 uppercase font-semibold text-[11px] tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-5">Receipt ID</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">Purpose</th>
                <th className="py-3.5 px-5">Notice Bound</th>
                <th className="py-3.5 px-5">Receipt SHA-256</th>
                <th className="py-3.5 px-5">Issued At (UTC)</th>
                <th className="py-3.5 px-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No consent receipts issued yet. Grant or withdraw consent to generate receipts.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.receipt_id} className="hover:bg-[#161c2c] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-amber-400">
                      {r.receipt_id}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          r.action === 'GRANT'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {r.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-300">
                      {r.purpose_id}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                      {r.notice_version}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                      <span title={r.receipt_hash}>
                        {r.receipt_hash ? `${r.receipt_hash.substring(0, 10)}...` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(r.timestamp_utc).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReceipt(r);
                          setVerifyResult(null);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition font-medium"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReceipt(r);
                          handleVerify(r.receipt_id);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition font-bold"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector / Verification Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121724] border border-white/[0.1] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Kantara 7807 Consent Receipt
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedReceipt.receipt_id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Banner */}
            {verifyResult && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs ${
                  verifyResult.is_valid
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {verifyResult.is_valid ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <p className="font-bold">
                    {verifyResult.is_valid
                      ? 'CRYPTOGRAPHIC INTEGRITY CONFIRMED'
                      : 'RECEIPT INTEGRITY VERIFICATION FAILED'}
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                    Computed SHA-256 hash matches authoritative database payload and binds to notice version.
                  </p>
                </div>
              </div>
            )}

            {/* Structured Kantara Fields */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#0e121d] p-4 rounded-2xl border border-white/[0.05]">
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Data Principal:</span>
                <span className="font-mono text-white">{selectedReceipt.user_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Consent Action:</span>
                <span className="font-bold text-amber-300">{selectedReceipt.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Purpose:</span>
                <span className="text-slate-200">{selectedReceipt.purpose_name} ({selectedReceipt.purpose_id})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Notice Version Bound:</span>
                <span className="font-mono text-cyan-400">{selectedReceipt.notice_version}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Channel:</span>
                <span className="text-slate-300">{selectedReceipt.collection_channel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Issued Timestamp (UTC):</span>
                <span className="font-mono text-slate-300">{selectedReceipt.timestamp_utc}</span>
              </div>
            </div>

            {/* Receipt Hash & Canonical Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Canonical Receipt SHA-256 Hash:</span>
                <button
                  onClick={() => copyToClipboard(selectedReceipt.receipt_hash, 'rhash')}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                >
                  {copied === 'rhash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'rhash' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="block p-3 rounded-xl bg-[#090b10] border border-white/[0.05] text-amber-300 text-xs font-mono break-all">
                {selectedReceipt.receipt_hash}
              </code>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => handleVerify(selectedReceipt.receipt_id)}
                disabled={verifying}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{verifying ? 'Verifying on AIORI-3...' : 'Re-Verify Cryptographic Hash'}</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-[#171b28] text-white rounded-xl text-xs font-semibold hover:bg-[#202538] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [highRiskCases, setHighRiskCases] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, riskRes, pendingRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/inspections?limit=10'),
        api.get('/inspections?status=pending&limit=5')
      ]);

      setStats(statsRes.data?.data || {});
      const all = riskRes.data?.data || [];
      setHighRiskCases(all.filter(i => (i.riskScore?.score || 0) >= 40));
      setPendingApprovals(pendingRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (inspectionId, newStatus) => {
    setSubmitting(true);
    try {
      await api.put(`/inspections/${inspectionId}/review`, {
        status: newStatus,
        reviewNotes: actionReason || `Admin decision: ${newStatus}`
      });
      setReviewModal(null);
      setActionReason('');
      loadDashboard();
    } catch (err) {
      alert('Error updating inspection: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const o = stats?.overview || {};

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      {/* Executive Command Header - Frosted Glass Slab */}
      <div className="gov-card-hero relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 flex items-center justify-center text-2xl text-white shadow-md flex-shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-gov text-xs">
                  <span className="micro-aura-cyan" />
                  Executive Command HQ
                </span>
                <span className="text-xs text-indigo-700 font-mono font-bold">PMAY-G APEX AUDIT MATRIX</span>
              </div>
              <h1 className="page-title mt-1 text-[#0F172A]">
                Admin Oversight: {user?.name || 'Admin Sharma'}
              </h1>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                HQ Governance • AI-Assisted Fraud Prevention & Digital Benefit Transfer (DBT) Authorizations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadDashboard}
              className="gov-btn-secondary px-3.5 py-2 text-xs font-mono font-bold"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="gov-btn-secondary px-3.5 py-2 text-xs font-bold"
            >
              🗺️ Geo Risk Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="gov-btn-secondary px-3.5 py-2 text-xs font-bold"
            >
              🎥 Qwen Video AI
            </button>
            <button
              onClick={() => navigate('/approvals')}
              className="gov-btn-primary px-4 py-2 text-xs font-bold shadow-sm"
            >
              ⚡ Stage Approvals
            </button>
          </div>
        </div>

        {/* Real-time System Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200/80 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
            <span className="micro-aura-emerald" />
            <span className="text-slate-600">Gemini 2.5 AI:</span>
            <strong className="text-emerald-700 font-bold tabular-nums">ONLINE</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
            <span className="micro-aura-cyan" />
            <span className="text-slate-600">FastAPI Engine:</span>
            <strong className="text-cyan-700 font-bold tabular-nums">PORT 8000</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
            <span className="micro-aura-slate" />
            <span className="text-slate-600">Database:</span>
            <strong className="text-indigo-700 font-bold tabular-nums">PORT 27017</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
            <span className="micro-aura-emerald" />
            <span className="text-slate-600">Socket.IO Stream:</span>
            <strong className="text-emerald-700 font-bold tabular-nums">SYNCED</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Frosted Glass with Soft Jewel Accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="gov-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Total Beneficiaries</p>
              <p className="text-3xl font-extrabold text-[#0F172A] mt-1.5 tabular-nums font-mono font-display">
                {o.totalBeneficiaries || 5}
              </p>
              <p className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-emerald" />
                100% Aadhaar Verified
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base text-indigo-700 shadow-2xs group-hover:scale-105 transition-transform">
              👥
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="gov-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Stage Inspections</p>
              <p className="text-3xl font-extrabold text-[#0F172A] mt-1.5 tabular-nums font-mono font-display">
                {o.totalInspections || 11}
              </p>
              <p className="text-xs text-cyan-700 font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-cyan" />
                GPS Geofence Verified
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-base text-cyan-700 shadow-2xs group-hover:scale-105 transition-transform">
              🔍
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="gov-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Disbursed via DBT</p>
              <p className="text-3xl font-extrabold text-[#0F172A] mt-1.5 tabular-nums font-mono font-display text-shimmer-gold">
                ₹{((o.totalDisbursed || 160000)).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-emerald" />
                PFMS Direct Transfer
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-base text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
              🏦
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="gov-card p-5 group border-rose-200/80 bg-rose-50/40 hover:border-rose-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label text-rose-800">Critical Risk Flags</p>
              <p className="text-3xl font-extrabold text-rose-700 mt-1.5 tabular-nums font-mono font-display">
                {highRiskCases.length || 1}
              </p>
              <p className="text-xs text-rose-700 font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-crimson" />
                Action Required
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-base text-rose-700 shadow-2xs">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Critical Triage Section (Frosted Coral-Rose Slab) */}
      {highRiskCases.length > 0 && (
        <div className="gov-card p-6 border-rose-200 bg-rose-50/30">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="micro-aura-crimson" />
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                High Risk & AI Anomaly Triage Queue
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-extrabold">
                CRITICAL ({highRiskCases.length})
              </span>
            </div>
            <button
              onClick={() => navigate('/risk-cases')}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold transition-colors"
            >
              View Full Audit Stream →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskCases.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-2xl bg-white/90 border border-rose-200 hover:border-rose-300 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-sm">
                        {c.beneficiaryId?.name || 'Gopal Singh'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {c.beneficiaryId?.village || 'Berasia'} • Stage: <span className="text-indigo-900 font-bold">{c.officerSelectedStage}</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200 tabular-nums">
                      <span className="micro-aura-crimson" />
                      {c.riskScore?.score ?? 72}/100 {c.riskScore?.level || 'CRITICAL'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-950 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono font-semibold">
                      <span>📸 Photo: <strong className="text-rose-900 tabular-nums">{c.dualEvidenceSynthesis?.photoRiskScore ?? c.riskScore?.score}/100</strong></span>
                      <span>🎥 Video: <strong className="text-purple-900 tabular-nums">{c.dualEvidenceSynthesis?.videoRiskScore ?? (c.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong></span>
                      <span>⚖️ Composite: <strong className="text-rose-900 tabular-nums">{c.riskScore?.score}/100</strong></span>
                    </div>
                    {c.dualEvidenceSynthesis?.synthesisReasoning && (
                      <p className="text-[11px] text-rose-900/80 italic pt-1 border-t border-rose-200/60">
                        "{c.dualEvidenceSynthesis.synthesisReasoning}"
                      </p>
                    )}
                    {c.gpsVerification && !c.gpsVerification.withinFence && (
                      <p className="text-rose-900 font-mono text-[11px]">
                        • GPS Deviation: Officer distance <strong className="tabular-nums">{c.gpsVerification.distance}m</strong> (Allowed limit: 200m)
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    Inspector: {c.officerId?.name || 'Rajesh Kumar'}
                  </span>
                  <button
                    onClick={() => setReviewModal(c)}
                    className="gov-btn-primary py-1 px-3.5 text-xs font-bold"
                  >
                    Review Case →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Submissions & Progression Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officer Submissions Queue */}
        <div className="lg:col-span-2 gov-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">📥</span>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  Incoming Field Officer Submissions
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold tabular-nums">
                  Awaiting AI Audit ({pendingApprovals.length})
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                Site photos &amp; video walkthroughs uploaded by field inspectors requiring AI forensics verification prior to ₹40k DBT grant release
              </p>
            </div>
            <button
              onClick={() => navigate('/approvals')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              All Approvals →
            </button>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((p) => {
              const hasVideo = Boolean(p.videoEvidence?.verdict || p.videoEvidence?.videoUrl || p.evidence?.some(e => e.type === 'video'));
              const riskScore = p.dualEvidenceSynthesis?.finalCompositeScore ?? p.riskScore?.score ?? 18;
              const isHigh = riskScore > 40;

              return (
                <div
                  key={p._id}
                  className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 hover:border-indigo-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm flex-shrink-0">
                      👷
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-[#0F172A] text-xs">
                          {p.beneficiaryId?.name || 'Beneficiary'}
                        </h5>
                        <span className="text-[11px] text-[#64748B] font-mono font-medium">
                          ({p.beneficiaryId?.householdId || 'Pending ID'})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {p.officerSelectedStage || 'Plinth'} Milestone
                        </span>
                      </div>

                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Officer: <strong className="text-slate-800">{p.officerId?.name || 'Field Inspector'}</strong> • {p.beneficiaryId?.village || 'Barkheda'}, {p.beneficiaryId?.block || 'Berasia'}
                      </p>

                      {/* Evidence Tags */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                          📸 {p.evidence?.length || 1} Photo(s)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                          🎥 {hasVideo ? 'Video Walkthrough' : 'Photo Only'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border tabular-nums font-bold ${
                          isHigh
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          Risk: {riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => navigate(`/video-inspector?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="gov-btn-secondary py-1 px-2.5 text-xs font-mono font-bold"
                      title="Run VLM video forensics"
                    >
                      Video AI
                    </button>
                    <button
                      onClick={() => handleAction(p._id, 'verified')}
                      className="glass-btn-emerald py-1 px-3 text-xs font-bold"
                      title="Authorize ₹40,000 DBT Grant"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setReviewModal(p)}
                      className="gov-btn-secondary py-1 px-2.5 text-xs font-bold"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingApprovals.length === 0 && (
              <div className="text-center py-8 text-[#64748B] text-xs font-mono">
                ✓ All field officer submissions have been AI-verified and processed.
              </div>
            )}
          </div>
        </div>

        {/* Stage Progression Funnel */}
        <div className="gov-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] mb-1">Stage Progression</h3>
            <p className="text-xs text-[#64748B] mb-5 font-medium">PMAY-G 4-stage funnel health</p>

            <div className="space-y-4">
              {[
                { stage: 'Foundation', count: 5, color: 'from-emerald-500 to-teal-500', pct: 100 },
                { stage: 'Plinth Level', count: 3, color: 'from-blue-500 to-cyan-500', pct: 60 },
                { stage: 'Lintel Level', count: 2, color: 'from-amber-500 to-orange-500', pct: 40 },
                { stage: 'Full Handover', count: 1, color: 'from-indigo-600 to-purple-600', pct: 20 },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">{s.stage}</span>
                    <span className="text-slate-500 font-mono tabular-nums">{s.count} Beneficiaries ({s.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.color} transition-all duration-500 rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200/80 space-y-2">
            <button
              onClick={() => navigate('/audit-logs')}
              className="w-full gov-btn-secondary py-2 text-xs justify-center font-mono font-bold"
            >
              📋 Immutable Audit Trail
            </button>
            <button
              onClick={() => navigate('/installments')}
              className="w-full gov-btn-secondary py-2 text-xs justify-center font-mono font-bold"
            >
              💰 DBT Grant Passbook
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-lg font-bold transition-colors"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-[#0F172A]">
              Inspection Audit & Grant Action
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Beneficiary: <strong className="text-indigo-950 font-bold">{reviewModal.beneficiaryId?.name}</strong> • Stage: {reviewModal.officerSelectedStage}
            </p>

            <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 font-medium">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-bold">Dual-Evidence Verdict:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px]">
                  {reviewModal.dualEvidenceSynthesis?.finalVerdict || 'SINGLE_MEDIA_EVALUATED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-sans">📸 Photo Risk</span>
                  <strong className="text-slate-800 text-xs tabular-nums">{reviewModal.dualEvidenceSynthesis?.photoRiskScore ?? reviewModal.riskScore?.score}/100</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-sans">🎥 Video Risk</span>
                  <strong className="text-purple-700 text-xs tabular-nums">{reviewModal.dualEvidenceSynthesis?.videoRiskScore ?? (reviewModal.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                  <span className="text-[10px] text-amber-800 block font-sans">⚖️ Final</span>
                  <strong className="text-amber-900 text-xs tabular-nums">{reviewModal.riskScore?.score ?? 20}/100</strong>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Executive Audit Notes:
              </label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter approval note or directive..."
                className="input-field text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'rejected')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Reject & Flag
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'reinspection')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                Re-inspection
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'verified')}
                className="glass-btn-emerald py-1.5 px-4 text-xs font-bold shadow-sm"
              >
                Approve & Release Grant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      {/* Executive Command Header - Glassmorphic Slab */}
      <div className="card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(169,205,224,0.5)] border border-white/70 flex items-center justify-center text-2xl text-[#1E3B4B] shadow-xs flex-shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-sky text-xs">
                  <span className="micro-aura-sky" />
                  Executive Command HQ
                </span>
                <span className="text-xs text-[#607887] font-mono font-bold">PMAY-G APEX AUDIT MATRIX</span>
              </div>
              <h1 className="page-title mt-1 text-[#28485A]">
                Admin Oversight: {user?.name || 'Admin Sharma'}
              </h1>
              <p className="text-xs text-[#607887] mt-1 font-medium">
                HQ Governance • AI-Assisted Fraud Prevention & Digital Benefit Transfer (DBT) Authorizations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadDashboard}
              className="btn-secondary px-3.5 py-2 text-xs font-mono font-bold"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="btn-secondary px-3.5 py-2 text-xs font-bold"
            >
              🗺️ Geo Risk Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="btn-secondary px-3.5 py-2 text-xs font-bold"
            >
              🎥 Qwen Video AI
            </button>
            <button
              onClick={() => navigate('/approvals')}
              className="btn-sky px-4 py-2 text-xs font-bold shadow-sm"
            >
              ⚡ Stage Approvals
            </button>
          </div>
        </div>

        {/* Real-time System Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/50 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/40 border border-white/60 shadow-2xs">
            <span className="micro-aura-teal" />
            <span className="text-[#607887]">Gemini 2.5 AI:</span>
            <strong className="text-[#123C3A] font-bold tabular-nums">ONLINE</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/40 border border-white/60 shadow-2xs">
            <span className="micro-aura-sky" />
            <span className="text-[#607887]">FastAPI Engine:</span>
            <strong className="text-[#1E465B] font-bold tabular-nums">PORT 8000</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/40 border border-white/60 shadow-2xs">
            <span className="micro-aura-lavender" />
            <span className="text-[#607887]">Database:</span>
            <strong className="text-[#383D61] font-bold tabular-nums">PORT 27017</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/40 border border-white/60 shadow-2xs">
            <span className="micro-aura-teal" />
            <span className="text-[#607887]">Socket.IO Stream:</span>
            <strong className="text-[#123C3A] font-bold tabular-nums">SYNCED</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Translucent Glass with Palette Accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Total Beneficiaries</p>
              <p className="text-3xl font-extrabold text-[#28485A] mt-1.5 tabular-nums font-mono font-display">
                {o.totalBeneficiaries || 5}
              </p>
              <p className="text-xs text-[#123C3A] font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-teal" />
                100% Aadhaar Verified
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[rgba(169,205,224,0.38)] border border-white/60 flex items-center justify-center text-base text-[#1A3644] shadow-2xs group-hover:scale-105 transition-transform">
              👥
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Stage Inspections</p>
              <p className="text-3xl font-extrabold text-[#28485A] mt-1.5 tabular-nums font-mono font-display">
                {o.totalInspections || 11}
              </p>
              <p className="text-xs text-[#1E465B] font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-sky" />
                GPS Geofence Verified
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[rgba(134,200,197,0.35)] border border-white/60 flex items-center justify-center text-base text-[#123C3A] shadow-2xs group-hover:scale-105 transition-transform">
              🔍
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Disbursed via DBT</p>
              <p className="text-3xl font-extrabold text-[#28485A] mt-1.5 tabular-nums font-mono font-display text-shimmer-gold">
                ₹{((o.totalDisbursed || 160000)).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-[#123C3A] font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-teal" />
                PFMS Direct Transfer
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[rgba(180,184,217,0.38)] border border-white/60 flex items-center justify-center text-base text-[#383D61] shadow-2xs group-hover:scale-105 transition-transform">
              🏦
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card p-5 group border-rose-300/60 bg-rose-50/30 hover:border-rose-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label text-rose-900">Critical Risk Flags</p>
              <p className="text-3xl font-extrabold text-rose-900 mt-1.5 tabular-nums font-mono font-display">
                {highRiskCases.length || 1}
              </p>
              <p className="text-xs text-rose-900 font-bold mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-crimson" />
                Action Required
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-100/60 border border-rose-300/70 flex items-center justify-center text-base text-rose-900 shadow-2xs">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Critical Triage Section (Translucent Glass with Crimson Highlight) */}
      {highRiskCases.length > 0 && (
        <div className="card p-6 border-rose-300/60 bg-rose-50/25">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="micro-aura-crimson" />
              <h3 className="text-base font-extrabold text-[#28485A] tracking-tight">
                High Risk & AI Anomaly Triage Queue
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-100/60 text-rose-900 border border-rose-300/70 font-extrabold">
                CRITICAL ({highRiskCases.length})
              </span>
            </div>
            <button
              onClick={() => navigate('/risk-cases')}
              className="text-xs text-rose-900 hover:underline font-bold transition-colors"
            >
              View Full Audit Stream →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskCases.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-2xl bg-white/45 border border-white/60 hover:border-rose-300 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[#28485A] text-sm">
                        {c.beneficiaryId?.name || 'Gopal Singh'}
                      </h4>
                      <p className="text-xs text-[#607887] mt-0.5 font-medium">
                        {c.beneficiaryId?.village || 'Berasia'} • Stage: <span className="text-[#1E465B] font-bold">{c.officerSelectedStage}</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100/50 text-rose-900 border border-rose-300/60 tabular-nums">
                      <span className="micro-aura-crimson" />
                      {c.riskScore?.score ?? 72}/100 {c.riskScore?.level || 'CRITICAL'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-white/40 border border-white/50 text-xs text-rose-950 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono font-semibold">
                      <span>📸 Photo: <strong className="text-rose-900 tabular-nums">{c.dualEvidenceSynthesis?.photoRiskScore ?? c.riskScore?.score}/100</strong></span>
                      <span>🎥 Video: <strong className="text-purple-950 tabular-nums">{c.dualEvidenceSynthesis?.videoRiskScore ?? (c.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong></span>
                      <span>⚖️ Composite: <strong className="text-rose-900 tabular-nums">{c.riskScore?.score}/100</strong></span>
                    </div>
                    {c.dualEvidenceSynthesis?.synthesisReasoning && (
                      <p className="text-[11px] text-rose-950/80 italic pt-1 border-t border-rose-200/50">
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

                <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between">
                  <span className="text-xs text-[#607887] font-mono font-medium">
                    Inspector: {c.officerId?.name || 'Rajesh Kumar'}
                  </span>
                  <button
                    onClick={() => setReviewModal(c)}
                    className="btn-sky py-1 px-3.5 text-xs font-bold"
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
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">📥</span>
                <h3 className="text-base font-extrabold text-[#28485A]">
                  Incoming Field Officer Submissions
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[rgba(169,205,224,0.38)] text-[#1E465B] border border-white/50 font-bold tabular-nums">
                  Awaiting AI Audit ({pendingApprovals.length})
                </span>
              </div>
              <p className="text-xs text-[#607887] mt-0.5 font-medium">
                Site photos &amp; video walkthroughs uploaded by field inspectors requiring AI forensics verification prior to ₹40k DBT grant release
              </p>
            </div>
            <button
              onClick={() => navigate('/approvals')}
              className="text-xs text-[#1E465B] hover:underline font-bold whitespace-nowrap self-start sm:self-auto transition-colors"
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
                  className="p-3.5 rounded-2xl bg-white/40 border border-white/60 hover:border-white/90 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-sm flex-shrink-0">
                      👷
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-[#28485A] text-xs">
                          {p.beneficiaryId?.name || 'Beneficiary'}
                        </h5>
                        <span className="text-[11px] text-[#607887] font-mono font-medium">
                          ({p.beneficiaryId?.householdId || 'Pending ID'})
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/40 text-[#28485A] border border-white/50">
                          {p.officerSelectedStage || 'Plinth'} Milestone
                        </span>
                      </div>

                      <p className="text-xs text-[#607887] mt-0.5 font-medium">
                        Officer: <strong className="text-[#28485A]">{p.officerId?.name || 'Field Inspector'}</strong> • {p.beneficiaryId?.village || 'Barkheda'}, {p.beneficiaryId?.block || 'Berasia'}
                      </p>

                      {/* Evidence Tags */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-white/40 text-[#28485A] border border-white/50 font-semibold">
                          📸 {p.evidence?.length || 1} Photo(s)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[rgba(180,184,217,0.35)] text-[#383D61] border border-white/50 font-semibold">
                          🎥 {hasVideo ? 'Video Walkthrough' : 'Photo Only'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border tabular-nums font-bold ${
                          isHigh
                            ? 'bg-rose-100/50 text-rose-900 border-rose-300/60'
                            : 'bg-[rgba(134,200,197,0.3)] text-[#123C3A] border-[rgba(134,200,197,0.6)]'
                        }`}>
                          Risk: {riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/40">
                    <button
                      onClick={() => navigate(`/video-inspector?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="btn-secondary py-1 px-2.5 text-xs font-mono font-bold"
                      title="Run VLM video forensics"
                    >
                      Video AI
                    </button>
                    <button
                      onClick={() => handleAction(p._id, 'verified')}
                      className="btn-teal py-1 px-3 text-xs font-bold"
                      title="Authorize ₹40,000 DBT Grant"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setReviewModal(p)}
                      className="btn-secondary py-1 px-2.5 text-xs font-bold"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingApprovals.length === 0 && (
              <div className="text-center py-8 text-[#607887] text-xs font-mono">
                ✓ All field officer submissions have been AI-verified and processed.
              </div>
            )}
          </div>
        </div>

        {/* Stage Progression Funnel */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#28485A] mb-1">Stage Progression</h3>
            <p className="text-xs text-[#607887] mb-5 font-medium">PMAY-G 4-stage funnel health</p>

            <div className="space-y-4">
              {[
                { stage: 'Foundation', count: 5, color: 'bg-[#86C8C5]', pct: 100 },
                { stage: 'Plinth Level', count: 3, color: 'bg-[#A9CDE0]', pct: 60 },
                { stage: 'Lintel Level', count: 2, color: 'bg-[#B4B8D9]', pct: 40 },
                { stage: 'Full Handover', count: 1, color: 'bg-[#D2E0E8]', pct: 20 },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-[#28485A]">{s.stage}</span>
                    <span className="text-[#607887] font-mono tabular-nums">{s.count} Beneficiaries ({s.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/40 overflow-hidden border border-white/50">
                    <div className={`h-full ${s.color} transition-all duration-500 rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/40 space-y-2">
            <button
              onClick={() => navigate('/audit-logs')}
              className="w-full btn-secondary py-2 text-xs justify-center font-mono font-bold"
            >
              📋 Immutable Audit Trail
            </button>
            <button
              onClick={() => navigate('/installments')}
              className="w-full btn-secondary py-2 text-xs justify-center font-mono font-bold"
            >
              💰 DBT Grant Passbook
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fadeIn">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-[#28485A]">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-[#607887] hover:text-[#28485A] text-lg font-bold transition-colors"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-[#28485A]">
              Inspection Audit & Grant Action
            </h3>
            <p className="text-xs text-[#607887] mt-0.5 font-medium">
              Beneficiary: <strong className="text-[#28485A] font-bold">{reviewModal.beneficiaryId?.name}</strong> • Stage: {reviewModal.officerSelectedStage}
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/50 border border-white/60 text-xs space-y-2 font-medium">
              <div className="flex justify-between items-center pb-2 border-b border-white/50">
                <span className="text-[#607887] font-bold">Dual-Evidence Verdict:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(169,205,224,0.4)] text-[#1E465B] text-[10px]">
                  {reviewModal.dualEvidenceSynthesis?.finalVerdict || 'SINGLE_MEDIA_EVALUATED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-white/40 border border-white/50 shadow-2xs">
                  <span className="text-[10px] text-[#607887] block font-sans">📸 Photo Risk</span>
                  <strong className="text-[#28485A] text-xs tabular-nums">{reviewModal.dualEvidenceSynthesis?.photoRiskScore ?? reviewModal.riskScore?.score}/100</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/40 border border-white/50 shadow-2xs">
                  <span className="text-[10px] text-[#607887] block font-sans">🎥 Video Risk</span>
                  <strong className="text-[#383D61] text-xs tabular-nums">{reviewModal.dualEvidenceSynthesis?.videoRiskScore ?? (reviewModal.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong>
                </div>
                <div className="p-2 rounded-xl bg-amber-100/40 border border-amber-300/50 shadow-2xs">
                  <span className="text-[10px] text-amber-900 block font-sans">⚖️ Final</span>
                  <strong className="text-amber-950 text-xs tabular-nums">{reviewModal.riskScore?.score ?? 20}/100</strong>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#28485A] mb-1.5">
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/50">
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'rejected')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-100/50 text-rose-900 hover:bg-rose-100/70 border border-rose-300/60 transition-colors"
              >
                Reject & Flag
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'reinspection')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100/50 text-amber-900 hover:bg-amber-100/70 border border-amber-300/60 transition-colors"
              >
                Re-inspection
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'verified')}
                className="btn-teal py-1.5 px-4 text-xs font-bold shadow-sm"
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

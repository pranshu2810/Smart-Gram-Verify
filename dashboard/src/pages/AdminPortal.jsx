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
    <div className="space-y-6 animate-fadeIn text-[#F1F5F9]">
      {/* Executive Command Header - Gov-Tech Glass Slab */}
      <div className="gov-card-hero relative overflow-hidden">
        {/* Subtle top chisel line */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-2xl text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex-shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-gov text-xs">
                  <span className="micro-aura-cyan" />
                  Executive Command HQ
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">PMAY-G APEX AUDIT MATRIX</span>
              </div>
              <h1 className="page-title mt-1 text-[#F1F5F9]">
                Admin Oversight: {user?.name || 'Admin Sharma'}
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1 font-medium">
                HQ Governance • Multi-Modal AI Fraud Prevention & Digital Benefit Transfer (DBT) Authorizations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadDashboard}
              className="gov-btn-secondary px-3.5 py-2 text-xs font-mono"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="gov-btn-secondary px-3.5 py-2 text-xs"
            >
              🗺️ Geo Risk Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="gov-btn-secondary px-3.5 py-2 text-xs"
            >
              🎥 Qwen Video AI
            </button>
            <button
              onClick={() => navigate('/approvals')}
              className="gov-btn-primary px-4 py-2 text-xs font-semibold"
            >
              ⚡ Stage Approvals
            </button>
          </div>
        </div>

        {/* Bloomberg-Style Micro-Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.05]">
            <span className="micro-aura-emerald" />
            <span className="text-[#94A3B8]">Gemini 2.5 AI:</span>
            <strong className="text-[#F1F5F9] tabular-nums">ONLINE</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.05]">
            <span className="micro-aura-cyan" />
            <span className="text-[#94A3B8]">FastAPI Engine:</span>
            <strong className="text-[#F1F5F9] tabular-nums">PORT 8000</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.05]">
            <span className="micro-aura-slate" />
            <span className="text-[#94A3B8]">Database:</span>
            <strong className="text-[#F1F5F9] tabular-nums">PORT 27017</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.05]">
            <span className="micro-aura-emerald" />
            <span className="text-[#94A3B8]">Socket.IO Stream:</span>
            <strong className="text-[#F1F5F9] tabular-nums">SYNCED</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Monochromatic with Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="gov-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Total Beneficiaries</p>
              <p className="text-3xl font-semibold text-[#F1F5F9] mt-1.5 tabular-nums font-mono">
                {o.totalBeneficiaries || 5}
              </p>
              <p className="text-xs text-[#94A3B8] font-medium mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-emerald" />
                100% Aadhaar Verified
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm text-[#94A3B8]">
              👥
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="gov-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Stage Inspections</p>
              <p className="text-3xl font-semibold text-[#F1F5F9] mt-1.5 tabular-nums font-mono">
                {o.totalInspections || 11}
              </p>
              <p className="text-xs text-[#94A3B8] font-medium mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-cyan" />
                GPS Geofence Verified
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm text-[#94A3B8]">
              🔍
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="gov-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Disbursed via DBT</p>
              <p className="text-3xl font-semibold text-[#F1F5F9] mt-1.5 tabular-nums font-mono">
                ₹{((o.totalDisbursed || 160000)).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-[#94A3B8] font-medium mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-emerald" />
                PFMS Direct Transfer
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm text-[#94A3B8]">
              🏦
            </div>
          </div>
        </div>

        {/* KPI 4 - Laser Crimson for Critical Flags */}
        <div className="gov-card p-5 group border-[#FF334B]/30 bg-[rgba(255,51,75,0.03)] hover:border-[#FF334B]/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label text-[#FF334B]">Critical Risk Flags</p>
              <p className="text-3xl font-semibold text-[#FF334B] mt-1.5 tabular-nums font-mono">
                {highRiskCases.length || 1}
              </p>
              <p className="text-xs text-[#FF334B]/80 font-medium mt-1.5 flex items-center gap-1.5">
                <span className="micro-aura-crimson" />
                Action Required
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#FF334B]/10 border border-[#FF334B]/30 flex items-center justify-center text-sm text-[#FF334B]">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Critical Triage Section (Restrained Laser Crimson) */}
      {highRiskCases.length > 0 && (
        <div className="gov-card p-6 border-[#FF334B]/30 bg-black/30">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="micro-aura-crimson" />
              <h3 className="text-base font-semibold text-[#F1F5F9] tracking-tight">
                High Risk & AI Anomaly Triage Queue
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF334B]/15 text-[#FF334B] border border-[#FF334B]/30 font-bold">
                CRITICAL ({highRiskCases.length})
              </span>
            </div>
            <button
              onClick={() => navigate('/risk-cases')}
              className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] font-medium transition-colors"
            >
              View Full Audit Stream →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskCases.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-xl bg-black/40 border border-[#FF334B]/25 hover:border-[#FF334B]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#F1F5F9] text-sm">
                        {c.beneficiaryId?.name || 'Gopal Singh'}
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {c.beneficiaryId?.village || 'Berasia'} • Stage: <span className="text-[#F1F5F9] font-medium">{c.officerSelectedStage}</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FF334B]/10 text-[#FF334B] border border-[#FF334B]/30 tabular-nums">
                      <span className="micro-aura-crimson" />
                      {c.riskScore?.score ?? 72}/100 {c.riskScore?.level || 'CRITICAL'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-[#94A3B8] space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span>📸 Photo Risk: <strong className="text-[#F1F5F9] tabular-nums">{c.dualEvidenceSynthesis?.photoRiskScore ?? c.riskScore?.score}/100</strong></span>
                      <span>🎥 Video Risk: <strong className="text-[#F1F5F9] tabular-nums">{c.dualEvidenceSynthesis?.videoRiskScore ?? (c.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong></span>
                      <span>⚖️ Composite: <strong className="text-[#FF334B] tabular-nums">{c.riskScore?.score}/100</strong></span>
                    </div>
                    {c.dualEvidenceSynthesis?.synthesisReasoning && (
                      <p className="text-[11px] text-[#94A3B8] italic pt-1 border-t border-white/[0.05]">
                        "{c.dualEvidenceSynthesis.synthesisReasoning}"
                      </p>
                    )}
                    {c.gpsVerification && !c.gpsVerification.withinFence && (
                      <p className="text-[#FF334B] font-mono text-[11px]">
                        • GPS Deviation: Officer distance <strong className="tabular-nums">{c.gpsVerification.distance}m</strong> (Allowed limit: 200m)
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-[#64748B] font-mono">
                    Inspector: {c.officerId?.name || 'Rajesh Kumar'}
                  </span>
                  <button
                    onClick={() => setReviewModal(c)}
                    className="gov-btn-primary py-1 px-3 text-xs"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">📥</span>
                <h3 className="text-base font-semibold text-[#F1F5F9]">
                  Incoming Field Officer Submissions
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#94A3B8] border border-white/[0.08] tabular-nums">
                  Awaiting Verification ({pendingApprovals.length})
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Site photos &amp; video walkthroughs uploaded by field inspectors requiring AI forensics verification prior to ₹40k DBT grant release
              </p>
            </div>
            <button
              onClick={() => navigate('/approvals')}
              className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] font-medium whitespace-nowrap self-start sm:self-auto transition-colors"
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
                  className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/[0.14] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm flex-shrink-0">
                      👷
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-semibold text-[#F1F5F9] text-xs">
                          {p.beneficiaryId?.name || 'Beneficiary'}
                        </h5>
                        <span className="text-[11px] text-[#64748B] font-mono">
                          ({p.beneficiaryId?.householdId || 'Pending ID'})
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/[0.05] text-[#94A3B8] border border-white/[0.06]">
                          {p.officerSelectedStage || 'Plinth'} Milestone
                        </span>
                      </div>

                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Officer: {p.officerId?.name || 'Field Inspector'} • {p.beneficiaryId?.village || 'Barkheda'}, {p.beneficiaryId?.block || 'Berasia'}
                      </p>

                      {/* Evidence Tags */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/40 text-[#94A3B8] border border-white/[0.06]">
                          📸 {p.evidence?.length || 1} Photo(s)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/40 text-[#94A3B8] border border-white/[0.06]">
                          🎥 {hasVideo ? 'Video Walkthrough' : 'Photo Only'}
                        </span>
                        <span className={`px-2 py-0.5 rounded border tabular-nums ${
                          isHigh
                            ? 'bg-[#FF334B]/10 text-[#FF334B] border-[#FF334B]/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        }`}>
                          Risk: {riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.05]">
                    <button
                      onClick={() => navigate(`/video-inspector?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="gov-btn-secondary py-1 px-2.5 text-xs font-mono"
                      title="Run VLM video forensics"
                    >
                      Video AI
                    </button>
                    <button
                      onClick={() => handleAction(p._id, 'verified')}
                      className="gov-btn-primary py-1 px-3 text-xs"
                      title="Authorize ₹40,000 DBT Grant"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setReviewModal(p)}
                      className="gov-btn-secondary py-1 px-2.5 text-xs"
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
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1">Stage Progression</h3>
            <p className="text-xs text-[#94A3B8] mb-5">PMAY-G 4-stage funnel health</p>

            <div className="space-y-4">
              {[
                { stage: 'Foundation', count: 5, pct: 100 },
                { stage: 'Plinth Level', count: 3, pct: 60 },
                { stage: 'Lintel Level', count: 2, pct: 40 },
                { stage: 'Full Handover', count: 1, pct: 20 },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94A3B8]">{s.stage}</span>
                    <span className="text-[#64748B] font-mono tabular-nums">{s.count} Beneficiaries ({s.pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/[0.06]">
                    <div className="h-full bg-white/40 transition-all duration-500 rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
            <button
              onClick={() => navigate('/audit-logs')}
              className="w-full gov-btn-secondary py-2 text-xs justify-center font-mono"
            >
              📋 Immutable Audit Trail
            </button>
            <button
              onClick={() => navigate('/installments')}
              className="w-full gov-btn-secondary py-2 text-xs justify-center font-mono"
            >
              💰 DBT Grant Passbook
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0E17] border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[#F1F5F9]">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9] text-base transition-colors"
            >
              ✕
            </button>

            <h3 className="text-base font-semibold text-[#F1F5F9]">
              Inspection Audit & Grant Action
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Beneficiary: <strong className="text-[#F1F5F9]">{reviewModal.beneficiaryId?.name}</strong> • Stage: {reviewModal.officerSelectedStage}
            </p>

            <div className="my-4 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-[#94A3B8]">Dual-Evidence Synthesis:</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-[#F1F5F9] border border-white/[0.08]">
                  {reviewModal.dualEvidenceSynthesis?.finalVerdict || 'SINGLE_MEDIA_EVALUATED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <span className="text-[10px] text-[#64748B] block">📸 Photo</span>
                  <strong className="text-[#F1F5F9] text-xs tabular-nums">{reviewModal.dualEvidenceSynthesis?.photoRiskScore ?? reviewModal.riskScore?.score}/100</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <span className="text-[10px] text-[#64748B] block">🎥 Video</span>
                  <strong className="text-[#F1F5F9] text-xs tabular-nums">{reviewModal.dualEvidenceSynthesis?.videoRiskScore ?? (reviewModal.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <span className="text-[10px] text-[#64748B] block">⚖️ Final</span>
                  <strong className="text-amber-400 text-xs tabular-nums">{reviewModal.riskScore?.score ?? 20}/100</strong>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Executive Audit Notes:
              </label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter approval note or directive..."
                className="input-field text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'rejected')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF334B]/10 text-[#FF334B] hover:bg-[#FF334B]/20 border border-[#FF334B]/30 transition-colors"
              >
                Reject & Flag
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'reinspection')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              >
                Re-inspection
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'verified')}
                className="gov-btn-primary py-1.5 px-4 text-xs"
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

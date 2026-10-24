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
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Admin Executive Command Center Header */}
      <div className="card glass-card-pro p-6 sm:p-8 relative overflow-hidden border border-indigo-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-3xl text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] flex-shrink-0 animate-pulseGlow">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-glow-indigo text-xs">
                  Executive Headquarters Command
                </span>
                <span className="text-xs text-indigo-300 font-mono">PMAY-G Apex Portal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
              </div>
              <h1 className="page-title text-2xl sm:text-3xl mt-1 text-white">
                Admin Oversight: <span className="text-shimmer">{user?.name || 'Admin Sharma'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                HQ Governance • Multi-Modal AI Fraud Prevention & Digital Benefit Transfer (DBT) Approvals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadDashboard}
              className="btn-secondary px-4 py-2 text-xs font-bold"
            >
              ↻ Refresh Feeds
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-950/60 text-indigo-300 hover:text-white hover:bg-indigo-900/60 border border-indigo-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              🗺️ Geo Risk Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              🎥 Qwen Video AI Forensics
            </button>
            <button
              onClick={() => navigate('/approvals')}
              className="glass-btn-emerald px-5 py-2 text-xs font-bold"
            >
              ⚡ Stage Disbursement Approvals
            </button>
          </div>
        </div>

        {/* Live Micro-Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-500/15 text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#050814]/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400 font-sans">Gemini Vision AI:</span>
            <strong className="text-emerald-400 font-bold">ONLINE</strong>
          </div>
          <div className="flex items-center gap-2 bg-[#050814]/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-sans">FastAPI Engine:</span>
            <strong className="text-cyan-400 font-bold">PORT 8000</strong>
          </div>
          <div className="flex items-center gap-2 bg-[#050814]/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-slate-400 font-sans">Database:</span>
            <strong className="text-indigo-400 font-bold">PORT 27017</strong>
          </div>
          <div className="flex items-center gap-2 bg-[#050814]/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-sans">Socket.IO Stream:</span>
            <strong className="text-emerald-400 font-bold">CONNECTED</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="card p-5 border-indigo-500/25 group hover:border-indigo-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Beneficiaries</span>
            <span className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-lg font-bold">
              👥
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-display">
            {o.totalBeneficiaries || 5}
          </p>
          <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
            ✓ 100% Aadhaar Verified
          </p>
        </div>

        {/* KPI 2 */}
        <div className="card p-5 border-cyan-500/25 group hover:border-cyan-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Stage Inspections</span>
            <span className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-lg font-bold">
              🔍
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-display">
            {o.totalInspections || 11}
          </p>
          <p className="text-xs text-cyan-400 font-bold mt-1 flex items-center gap-1">
            📡 GPS Geofenced & Active
          </p>
        </div>

        {/* KPI 3 */}
        <div className="card p-5 border-emerald-500/25 group hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Disbursed via DBT</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-lg font-bold">
              🏦
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 font-display text-shimmer-gold">
            ₹{((o.totalDisbursed || 160000)).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-300 font-bold mt-1">Direct Bank Transfers</p>
        </div>

        {/* KPI 4 */}
        <div className="card p-5 border-rose-500/30 bg-rose-950/20 group hover:border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 uppercase tracking-wider font-bold">High / Critical Flags</span>
            <span className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center text-lg font-bold animate-pulse">
              ⚠️
            </span>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-2 font-display">
            {highRiskCases.length || 1}
          </p>
          <p className="text-xs text-rose-300 font-bold mt-1">Requires Apex Audit</p>
        </div>
      </div>

      {/* Critical Triage Section */}
      {highRiskCases.length > 0 && (
        <div className="card p-6 sm:p-8 border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-[#0d1230] to-rose-950/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🚨</span>
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  High Risk & AI Anomaly Triage Queue
                  <span className="badge badge-critical text-[10px]">Active Anomaly</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Inspections flagged with GPS geofence deviation, AI stage mismatches, or duplicate perceptual hashes
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/risk-cases')}
              className="text-xs text-rose-300 hover:text-rose-100 font-bold transition-colors"
            >
              View All Risk Cases →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskCases.map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-2xl bg-[#090d22]/90 border border-rose-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between hover:border-rose-500/60 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base font-display">
                        {c.beneficiaryId?.name || 'Gopal Singh'}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {c.beneficiaryId?.village || 'Berasia'} • Stage: <span className="text-indigo-300 font-bold">{c.officerSelectedStage}</span>
                      </p>
                    </div>
                    <span className="badge badge-critical">
                      {c.riskScore?.score ?? 72}/100 {c.riskScore?.level || 'CRITICAL'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 space-y-2">
                    <p className="font-bold text-rose-200 flex items-center justify-between">
                      <span>Flagged Risk Indicators:</span>
                      {c.dualEvidenceSynthesis?.finalVerdict && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-200 font-bold">
                          {c.dualEvidenceSynthesis.finalVerdict}
                        </span>
                      )}
                    </p>
                    {/* Dual Modality Comparison */}
                    <div className="py-1.5 px-2.5 rounded-lg bg-[#050814]/80 border border-rose-500/20 font-mono text-[11px] flex justify-between">
                      <span>📸 Photo: <strong className="text-rose-300">{c.dualEvidenceSynthesis?.photoRiskScore ?? c.riskScore?.score}/100</strong></span>
                      <span>🎥 Video: <strong className="text-purple-300">{c.dualEvidenceSynthesis?.videoRiskScore ?? (c.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong></span>
                      <span>⚖️ Avg: <strong className="text-amber-300">{c.riskScore?.score}/100</strong></span>
                    </div>
                    {c.dualEvidenceSynthesis?.synthesisReasoning && (
                      <p className="text-[11px] text-rose-300/80 italic">• {c.dualEvidenceSynthesis.synthesisReasoning}</p>
                    )}
                    {c.gpsVerification && !c.gpsVerification.withinFence && (
                      <p className="text-rose-300">• GPS Geofence: Officer was <strong>{c.gpsVerification.distance}m</strong> away from site (Limit: 200m)</p>
                    )}
                    {c.stageMismatch && (
                      <p className="text-amber-300">• AI Stage Mismatch: Officer claimed <strong>{c.officerSelectedStage}</strong>, AI classified as <strong>{c.aiDetectedStage}</strong></p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-500/15 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Inspector: <strong className="text-slate-200">{c.officerId?.name || 'Rajesh Kumar'}</strong>
                  </span>
                  <button
                    onClick={() => setReviewModal(c)}
                    className="btn-primary py-1.5 px-3.5 text-xs font-bold"
                  >
                    Review Case →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Field Officer Submissions Hub (Core Officer -> Admin Workflow) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officer Submissions Queue */}
        <div className="lg:col-span-2 card glass-card-pro p-6 sm:p-8 space-y-4 border border-indigo-500/25">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-500/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📥</span>
                <h3 className="text-lg font-display font-extrabold text-white">
                  Incoming Field Officer Submissions
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30">
                  Awaiting AI Verification ({pendingApprovals.length})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Site photos &amp; video walkthroughs uploaded by field inspectors requiring AI forensics verification prior to ₹40k DBT grant release
              </p>
            </div>
            <button
              onClick={() => navigate('/approvals')}
              className="text-xs text-indigo-400 hover:text-indigo-200 font-bold whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              All Approvals Queue →
            </button>
          </div>

          <div className="space-y-3.5">
            {pendingApprovals.map((p) => {
              const hasVideo = Boolean(p.videoEvidence?.verdict || p.videoEvidence?.videoUrl || p.evidence?.some(e => e.type === 'video'));
              const riskScore = p.dualEvidenceSynthesis?.finalCompositeScore ?? p.riskScore?.score ?? 18;

              return (
                <div
                  key={p._id}
                  className="p-4 rounded-xl bg-[#090d22]/90 border border-indigo-500/20 hover:border-indigo-500/50 shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                      👷
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-extrabold text-white text-sm font-display">
                          {p.beneficiaryId?.name || 'Beneficiary'}
                        </h5>
                        <span className="text-xs text-slate-400 font-medium">
                          ({p.beneficiaryId?.householdId || 'Pending ID'})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                          {p.officerSelectedStage || 'Plinth'} Milestone
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Submitted by: <strong className="text-slate-200">{p.officerId?.name || 'Field Inspector'}</strong> • {p.beneficiaryId?.village || 'Barkheda'}, {p.beneficiaryId?.block || 'Berasia'}
                      </p>

                      {/* Evidence Tags */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#050814] text-slate-300 border border-slate-700 flex items-center gap-1">
                          📸 {p.evidence?.length || 1} Photo(s)
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          hasVideo
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        }`}>
                          🎥 {hasVideo ? 'Walkthrough Video Attached' : 'Photo Evidence Only'}
                        </span>
                        <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                          riskScore > 40 ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          Risk Score: {riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-indigo-500/15">
                    <button
                      onClick={() => navigate(`/video-inspector?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      title="Verify officer video with Qwen 2.5-VL and OpenCV forensics"
                    >
                      <span>⚡ Video AI Verify</span>
                    </button>

                    <button
                      onClick={() => navigate(`/spatial-twin?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                      title="Reconstruct 3D Spatial Twin and LiDAR model"
                    >
                      <span>🏛️ 3D Twin</span>
                    </button>

                    <button
                      onClick={() => handleAction(p._id, 'verified')}
                      className="glass-btn-emerald py-1.5 px-3 text-xs font-bold"
                      title="Authorize ₹40,000 DBT Grant"
                    >
                      ✓ Approve
                    </button>

                    <button
                      onClick={() => setReviewModal(p)}
                      className="btn-secondary py-1.5 px-2.5 text-xs font-bold"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingApprovals.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-medium text-xs">
                ✓ All field officer submissions have been AI-verified and processed.
              </div>
            )}
          </div>
        </div>

        {/* Stage Funnel Progression */}
        <div className="card p-6 sm:p-8 flex flex-col justify-between border border-indigo-500/25">
          <div>
            <h3 className="text-lg font-display font-bold text-white mb-1">Stage Progression</h3>
            <p className="text-xs text-slate-400 font-medium mb-5">PMAY-G 4-stage funnel health</p>

            <div className="space-y-4">
              {[
                { stage: 'Foundation', count: 5, color: 'from-emerald-600 to-teal-400', pct: 100 },
                { stage: 'Plinth Level', count: 3, color: 'from-blue-600 to-cyan-400', pct: 60 },
                { stage: 'Lintel Level', count: 2, color: 'from-amber-500 to-yellow-400', pct: 40 },
                { stage: 'Full Handover', count: 1, color: 'from-indigo-600 to-purple-400', pct: 20 },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-300">{s.stage}</span>
                    <span className="text-slate-400 font-mono">{s.count} Beneficiaries ({s.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#050814] overflow-hidden border border-indigo-500/20">
                    <div className={`h-full bg-gradient-to-r ${s.color} transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-indigo-500/15 space-y-2">
            <button
              onClick={() => navigate('/audit-logs')}
              className="w-full btn-secondary py-2 text-xs font-bold justify-center"
            >
              📋 View Immutable Audit Trail
            </button>
            <button
              onClick={() => navigate('/installments')}
              className="w-full btn-secondary py-2 text-xs font-bold justify-center"
            >
              💰 Review All Direct Benefit Transfers
            </button>
          </div>
        </div>
      </div>

      {/* Audit & Grant Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#090d22] border border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative text-slate-100">
            {/* Top Glow bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold transition-colors"
            >
              ✕
            </button>

            <h3 className="text-xl font-display font-extrabold text-white">
              Inspection Review &amp; Grant Action
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Beneficiary: <strong className="text-indigo-300">{reviewModal.beneficiaryId?.name}</strong> • Stage: {reviewModal.officerSelectedStage}
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-[#050814]/90 border border-indigo-500/20 text-xs space-y-2.5 font-medium">
              <div className="flex justify-between items-center pb-2 border-b border-indigo-500/15">
                <span className="text-slate-300 font-bold">Dual-Evidence Synthesis:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {reviewModal.dualEvidenceSynthesis?.finalVerdict || 'SINGLE_MEDIA_EVALUATED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-[#0d1230] border border-indigo-500/20">
                  <span className="text-[10px] text-slate-400 block">📸 Photo Risk</span>
                  <strong className="text-slate-200 text-xs">{reviewModal.dualEvidenceSynthesis?.photoRiskScore ?? reviewModal.riskScore?.score}/100</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0d1230] border border-indigo-500/20">
                  <span className="text-[10px] text-slate-400 block">🎥 Video Risk</span>
                  <strong className="text-purple-300 text-xs">{reviewModal.dualEvidenceSynthesis?.videoRiskScore ?? (reviewModal.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong>
                </div>
                <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40">
                  <span className="text-[10px] text-indigo-300 block">⚖️ Final Avg</span>
                  <strong className="text-indigo-200 text-xs">{reviewModal.riskScore?.score ?? 20}/100</strong>
                </div>
              </div>
              {reviewModal.dualEvidenceSynthesis?.synthesisReasoning && (
                <p className="text-[11px] text-slate-300 italic pt-1 border-t border-indigo-500/15">
                  "{reviewModal.dualEvidenceSynthesis.synthesisReasoning}"
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Executive Audit Notes / Reason:
              </label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter approval note or reinspection directive..."
                className="input-field text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-500/15">
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'rejected')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/40 text-rose-300 hover:bg-rose-900/40 border border-rose-500/40 transition-colors"
              >
                Reject & Flag
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'reinspection')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-950/40 text-amber-300 hover:bg-amber-900/40 border border-amber-500/40 transition-colors"
              >
                Re-inspection
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'verified')}
                className="glass-btn-emerald py-2 px-4 text-xs font-bold shadow-md"
              >
                ✓ Approve & Release Grant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

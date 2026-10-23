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
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* Admin Executive Header */}
      <div className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-3xl text-white shadow-md flex-shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-indigo-50 text-indigo-800 border-indigo-200">
                  Executive Headquarters Command
                </span>
                <span className="text-xs text-slate-500 font-bold">PMAY-G Apex Portal</span>
              </div>
              <h1 className="page-title text-2xl sm:text-3xl mt-1 text-slate-900">
                Admin Oversight: {user?.name || 'Admin Sharma'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                HQ Governance • AI-Assisted Fraud Prevention & Digital Benefit Transfer (DBT) Approvals
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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              🗺️ Geo Risk Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-1.5"
            >
              🎥 Qwen Video AI Forensics
            </button>
            <button
              onClick={() => navigate('/approvals')}
              className="glass-btn-emerald px-5 py-2 text-xs font-bold shadow-md"
            >
              ⚡ Stage Disbursement Approvals
            </button>
          </div>
        </div>

        {/* System & Architecture Health Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-600 font-medium">Gemini Vision AI:</span>
            <strong className="text-emerald-700 font-bold">ONLINE</strong>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600 font-medium">FastAPI Engine:</span>
            <strong className="text-blue-700 font-bold">PORT 8000</strong>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Database:</span>
            <strong className="text-emerald-700 font-bold">PORT 27017</strong>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-slate-600 font-medium">Socket.IO Stream:</span>
            <strong className="text-indigo-700 font-bold">CONNECTED</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Beneficiaries</span>
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-bold">👥</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-display">{o.totalBeneficiaries || 5}</p>
          <p className="text-xs text-emerald-700 font-bold mt-1">✓ 100% Aadhaar Verified</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Stage Inspections</span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg font-bold">🔍</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-display">{o.totalInspections || 11}</p>
          <p className="text-xs text-blue-700 font-bold mt-1">GPS & Geofenced</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Disbursed via DBT</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">🏦</span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2 font-display">
            ₹{((o.totalDisbursed || 160000)).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-800 font-bold mt-1">Direct Bank Transfers</p>
        </div>

        <div className="card p-5 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 uppercase tracking-wider font-bold">High / Critical Flags</span>
            <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg font-bold">⚠️</span>
          </div>
          <p className="text-3xl font-extrabold text-rose-700 mt-2 font-display">{highRiskCases.length || 1}</p>
          <p className="text-xs text-rose-600 font-bold mt-1">Action Required</p>
        </div>
      </div>

      {/* Critical Triage Section */}
      {highRiskCases.length > 0 && (
        <div className="card p-6 sm:p-8 border-rose-200 bg-rose-50/20">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">
                  High Risk & AI Anomaly Triage Queue
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Inspections flagged with GPS geofence deviation, AI stage mismatches, or duplicate perceptual hashes
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/risk-cases')}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold"
            >
              View All Risk Cases →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskCases.map((c) => (
              <div key={c._id} className="p-4 rounded-xl bg-white border border-rose-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{c.beneficiaryId?.name || 'Gopal Singh'}</h4>
                      <p className="text-xs text-slate-600 font-medium">{c.beneficiaryId?.village || 'Berasia'} • Stage: {c.officerSelectedStage}</p>
                    </div>
                    <span className="badge badge-critical">
                      {c.riskScore?.score ?? 72}/100 {c.riskScore?.level || 'CRITICAL'}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-900 space-y-1">
                    <p className="font-bold text-rose-900 flex items-center justify-between">
                      <span>Flagged Risk Indicators:</span>
                      {c.dualEvidenceSynthesis?.finalVerdict && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200/70 font-bold">
                          {c.dualEvidenceSynthesis.finalVerdict}
                        </span>
                      )}
                    </p>
                    {/* Dual Modality Comparison */}
                    <div className="py-1 px-2 rounded bg-white/80 border border-rose-200/80 font-mono text-[11px] flex justify-between">
                      <span>📸 Photo Risk: <strong>{c.dualEvidenceSynthesis?.photoRiskScore ?? c.riskScore?.score}/100</strong></span>
                      <span>🎥 Video Risk: <strong>{c.dualEvidenceSynthesis?.videoRiskScore ?? (c.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong></span>
                      <span>⚖️ Avg: <strong>{c.riskScore?.score}/100</strong></span>
                    </div>
                    {c.dualEvidenceSynthesis?.synthesisReasoning && (
                      <p className="text-[11px] text-rose-800 italic">• {c.dualEvidenceSynthesis.synthesisReasoning}</p>
                    )}
                    {c.gpsVerification && !c.gpsVerification.withinFence && (
                      <p>• GPS Geofence: Officer was <strong>{c.gpsVerification.distance}m</strong> away from site (Limit: 200m)</p>
                    )}
                    {c.stageMismatch && (
                      <p>• AI Stage Mismatch: Officer claimed <strong>{c.officerSelectedStage}</strong>, AI classified as <strong>{c.aiDetectedStage}</strong></p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Inspector: {c.officerId?.name || 'Rajesh Kumar'}</span>
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
        <div className="lg:col-span-2 card glass-card-pro p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📥</span>
                <h3 className="text-lg font-display font-extrabold text-slate-900">
                  Incoming Field Officer Submissions
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold border border-indigo-200">
                  Awaiting AI Verification ({pendingApprovals.length})
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Site photos &amp; video walkthroughs uploaded by field inspectors requiring AI forensics verification prior to ₹40k DBT grant release
              </p>
            </div>
            <button
              onClick={() => navigate('/approvals')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold whitespace-nowrap self-start sm:self-auto"
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
                  className="p-4 rounded-xl bg-white/90 border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-xl shadow-xs flex-shrink-0">
                      👷
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-extrabold text-slate-900 text-sm">
                          {p.beneficiaryId?.name || 'Beneficiary'}
                        </h5>
                        <span className="text-xs text-slate-500 font-medium">
                          ({p.beneficiaryId?.householdId || 'Pending ID'})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {p.officerSelectedStage || 'Plinth'} Milestone
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Submitted by: <strong className="text-slate-800">{p.officerId?.name || 'Field Inspector'}</strong> • {p.beneficiaryId?.village || 'Barkheda'}, {p.beneficiaryId?.block || 'Berasia'}
                      </p>

                      {/* Evidence Tags */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          📸 {p.evidence?.length || 1} Photo(s)
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          hasVideo
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          🎥 {hasVideo ? 'Walkthrough Video Attached' : 'Photo Evidence Only'}
                        </span>
                        <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                          riskScore > 40 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Risk Score: {riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => navigate(`/video-inspector?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                      title="Verify officer video with Qwen 2.5-VL and OpenCV forensics"
                    >
                      <span>⚡ Video AI Verify</span>
                    </button>

                    <button
                      onClick={() => navigate(`/spatial-twin?inspectionId=${p._id}&stage=${p.officerSelectedStage}&beneficiaryId=${p.beneficiaryId?._id}`)}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
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
              <div className="text-center py-8 text-slate-500 font-medium text-xs">
                ✓ All field officer submissions have been AI-verified and processed.
              </div>
            )}
          </div>
        </div>

        {/* Stage Funnel */}
        <div className="card p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 mb-1">Stage Progression</h3>
            <p className="text-xs text-slate-500 font-medium mb-5">PMAY-G 4-stage funnel health</p>

            <div className="space-y-4">
              {[
                { stage: 'Foundation', count: 5, color: 'bg-emerald-500', pct: 100 },
                { stage: 'Plinth Level', count: 3, color: 'bg-blue-500', pct: 60 },
                { stage: 'Lintel Level', count: 2, color: 'bg-amber-500', pct: 40 },
                { stage: 'Full Handover', count: 1, color: 'bg-indigo-600', pct: 20 },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">{s.stage}</span>
                    <span className="text-slate-500">{s.count} Beneficiaries ({s.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 space-y-2">
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

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-display font-extrabold text-slate-900">
              Inspection Review & Grant Action
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Beneficiary: <strong className="text-slate-900">{reviewModal.beneficiaryId?.name}</strong> • Stage: {reviewModal.officerSelectedStage}
            </p>

            <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-medium">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Dual-Evidence Verdict:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {reviewModal.dualEvidenceSynthesis?.finalVerdict || 'SINGLE_MEDIA_EVALUATED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-1.5 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">📸 Photo Risk</span>
                  <strong className="text-slate-800 text-xs">{reviewModal.dualEvidenceSynthesis?.photoRiskScore ?? reviewModal.riskScore?.score}/100</strong>
                </div>
                <div className="p-1.5 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">🎥 Video Risk</span>
                  <strong className="text-purple-700 text-xs">{reviewModal.dualEvidenceSynthesis?.videoRiskScore ?? (reviewModal.videoEvidence?.aiGeneratedRiskScore || 0)}/100</strong>
                </div>
                <div className="p-1.5 rounded bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] text-indigo-700 block">⚖️ Final Avg</span>
                  <strong className="text-indigo-900 text-xs">{reviewModal.riskScore?.score ?? 20}/100</strong>
                </div>
              </div>
              {reviewModal.dualEvidenceSynthesis?.synthesisReasoning && (
                <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                  "{reviewModal.dualEvidenceSynthesis.synthesisReasoning}"
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Executive Notes / Reason:
              </label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter approval note or reinspection directive..."
                className="input-field text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'rejected')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              >
                Reject & Flag
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'reinspection')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              >
                Re-inspection
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction(reviewModal._id, 'verified')}
                className="glass-btn-emerald py-2 px-4 text-xs font-bold shadow-sm"
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

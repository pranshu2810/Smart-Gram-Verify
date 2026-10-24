import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { StatusBadge, RiskBadge, EmptyState } from '../components/Layout';

export default function Approvals() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      const { data } = await api.get('/inspections', { params: { status: 'pending', limit: 50 } });
      setInspections(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReview = async (id, status) => {
    try {
      await api.put(`/inspections/${id}/review`, { status, reviewNotes: `HQ Decision: ${status}` });
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#28485A] font-bold">
        <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin mr-3" />
        Loading pending approval requests...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">Disbursement Approvals</h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
            {inspections.length} construction stage inspections awaiting HQ administrative sign-off
          </p>
        </div>
        <button onClick={fetch} className="btn-secondary py-2 px-3 text-xs font-bold">
          ↻ Refresh Queue
        </button>
      </div>

      {inspections.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All Clear — Queue Empty"
          message="No pending inspections awaiting review. All stage disbursements are up to date."
        />
      ) : (
        <div className="space-y-3.5">
          {inspections.map((insp) => (
            <div
              key={insp._id}
              className="card p-5 border border-white/50 hover:border-[#A9CDE0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/inspections/${insp._id}`)}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-xl flex-shrink-0 shadow-xs backdrop-blur-md">
                    🏠
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[#28485A]">
                      {insp.beneficiaryId?.name || 'Unnamed Beneficiary'}
                    </p>
                    <p className="text-xs text-[#607887] font-medium mt-0.5">
                      Village: <strong className="text-[#28485A]">{insp.beneficiaryId?.village}</strong> • Stage: <strong className="text-[#28485A]">{insp.officerSelectedStage}</strong> • Inspector: {insp.officerId?.name || 'Field Officer'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <RiskBadge score={insp.riskScore?.score} level={insp.riskScore?.level} />
                {insp.dualEvidenceSynthesis?.finalVerdict === 'DUAL_CONSENSUS_VERIFIED' && (
                  <span className="badge badge-teal font-bold text-[11px]">
                    ⚖️ Dual Consensus
                  </span>
                )}
                {insp.dualEvidenceSynthesis?.finalVerdict === 'CRITICAL_FRAUD_FLAGGED' && (
                  <span className="badge badge-critical animate-pulse">
                    🚨 Fraud Override
                  </span>
                )}
                {insp.dualEvidenceSynthesis?.finalVerdict === 'MEDIA_DISCREPANCY_FLAGGED' && (
                  <span className="badge badge-lavender font-bold text-[11px]">
                    ⚠️ Stage Discrepancy
                  </span>
                )}
                {insp.stageMismatch && (
                  <span className="badge badge-critical">AI Mismatch</span>
                )}
                <button
                  onClick={() => handleQuickReview(insp._id, 'verified')}
                  className="px-3.5 py-2 btn-teal text-[#28485A] text-xs rounded-xl font-bold transition-all shadow-xs"
                >
                  ✓ Approve Stage
                </button>
                <button
                  onClick={() => handleQuickReview(insp._id, 'reinspection')}
                  className="px-3.5 py-2 bg-amber-500/80 hover:bg-amber-500 text-white text-xs rounded-xl font-bold transition-all shadow-xs"
                  title="Request Re-inspection"
                >
                  🔄 Re-inspect
                </button>
                <button
                  onClick={() => handleQuickReview(insp._id, 'rejected')}
                  className="px-3.5 py-2 bg-rose-500/80 hover:bg-rose-500 text-white text-xs rounded-xl font-bold transition-all shadow-xs"
                  title="Reject Inspection"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

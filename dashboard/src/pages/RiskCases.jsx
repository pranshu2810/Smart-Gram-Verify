import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { RiskBadge, EmptyState } from '../components/Layout';

export default function RiskCases() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      const { data } = await api.get('/inspections', { params: { limit: 100 } });
      const highRisk = (data.data || [])
        .filter((i) => (i.riskScore?.score || 0) >= 25)
        .sort((a, b) => (b.riskScore?.score || 0) - (a.riskScore?.score || 0));
      setInspections(highRisk);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#28485A] font-bold">
        <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin mr-3" />
        Scanning risk cases and AI fraud anomalies...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">⚠️ High Risk & Fraud Triage</h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
            {inspections.length} cases flagged with GPS fence deviation, AI stage mismatches, or forensic anomalies
          </p>
        </div>
        <button onClick={fetch} className="btn-secondary py-2 px-3 text-xs font-bold">
          ↻ Refresh Anomaly Feed
        </button>
      </div>

      {inspections.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="No high-risk cases detected"
          message="All submitted inspections across Gram Panchayats are within acceptable risk thresholds."
        />
      ) : (
        <div className="space-y-3.5">
          {inspections.map((insp) => (
            <div
              key={insp._id}
              onClick={() => navigate(`/inspections/${insp._id}`)}
              className="card p-5 border border-white/50 hover:border-rose-300 shadow-sm cursor-pointer transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-xs border ${
                      (insp.riskScore?.score || 0) > 70
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : (insp.riskScore?.score || 0) > 45
                        ? 'bg-[#B4B8D9]/40 text-[#28485A] border-[#B4B8D9]/60'
                        : 'bg-[#A9CDE0]/40 text-[#28485A] border-white/60'
                    }`}
                  >
                    {insp.riskScore?.score || 0}
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

                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  {insp.stageMismatch && (
                    <span className="badge badge-critical">AI Stage Mismatch</span>
                  )}
                  {insp.gpsVerification && !insp.gpsVerification.withinFence && (
                    <span className="badge badge-critical">
                      GPS Deviation ({insp.gpsVerification.distance}m)
                    </span>
                  )}
                  {insp.timestampVerification && !insp.timestampVerification.valid && (
                    <span className="badge badge-medium">Timestamp Conflict</span>
                  )}
                  <RiskBadge score={insp.riskScore?.score} level={insp.riskScore?.level} />
                </div>
              </div>

              {insp.riskScore?.factors?.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-white/40 flex gap-2 flex-wrap">
                  {insp.riskScore.factors.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/40 text-[#28485A] px-2.5 py-1 rounded-lg font-bold border border-white/50 backdrop-blur-xs"
                    >
                      {f.icon || '⚠️'} {f.factor} (+{Math.round(f.score)})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

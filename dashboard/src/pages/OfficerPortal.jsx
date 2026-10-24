import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function OfficerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [offlineQueue, setOfflineQueue] = useState(2);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [benRes, inspRes] = await Promise.all([
        api.get('/beneficiaries?limit=50'),
        api.get('/inspections?limit=30')
      ]);
      setBeneficiaries(benRes.data?.data || []);
      setInspections(inspRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load officer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const myPanchayat = user?.panchayat || 'Barkheda';
  const myBlock = user?.block || 'Berasia';

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Officer Welcome Header */}
      <div className="card glass-card-pro p-6 sm:p-8 relative overflow-hidden border border-emerald-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Emerald Ambient Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-3xl text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] flex-shrink-0 animate-pulseGlow">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-glow-emerald text-xs">
                  Field Inspector Active
                </span>
                <span className="text-xs text-emerald-300 font-mono">ID: {user?.employeeId || 'OFF-001'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
              </div>
              <h1 className="page-title text-2xl sm:text-3xl mt-1 text-white">
                Field Officer Terminal: <span className="text-shimmer">{user?.name || 'Officer Rajesh Kumar'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Assigned Jurisdiction: <strong className="text-emerald-400">{myPanchayat} Gram Panchayat</strong>, {myBlock} Block, {user?.district || 'Bhopal'} District
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/new-inspection')}
              className="glass-btn-emerald px-5 py-3 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              🚀 Launch New Inspection
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="btn-secondary px-4 py-3 text-sm font-bold flex items-center gap-1.5"
            >
              🗺️ Radius Risk Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="px-4 py-3 text-sm font-bold rounded-xl bg-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-500/40 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              🎥 Video AI Forensics
            </button>
            <button
              onClick={() => navigate('/beneficiaries')}
              className="btn-secondary px-4 py-3 text-sm font-bold"
            >
              👥 Assigned Houses
            </button>
          </div>
        </div>

        {/* Real-time Field Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-500/15">
          <div className="p-4 rounded-2xl bg-[#050814]/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Houses</span>
              <span className="text-xl">🏠</span>
            </div>
            <p className="text-2xl font-extrabold text-white mt-1 font-display">{beneficiaries.length || 5}</p>
            <p className="text-[11px] text-emerald-400 font-bold mt-0.5">In your Gram Panchayat</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050814]/70 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Completed / Verified</span>
              <span className="text-xl">✅</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-display">
              {inspections.filter(i => i.status === 'verified').length}
            </p>
            <p className="text-[11px] text-emerald-300 font-medium mt-0.5">Approved by Admin</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050814]/70 border border-amber-500/25 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Under AI Review</span>
              <span className="text-xl">⏳</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-1 font-display">
              {inspections.filter(i => i.status === 'pending').length}
            </p>
            <p className="text-[11px] text-amber-300 font-medium mt-0.5">Awaiting Admin Sign-off</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050814]/70 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Offline Queue</span>
              <span className="text-xl">📡</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-extrabold text-cyan-400 font-display">{offlineQueue}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold animate-pulse">
                Auto-Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cached in local storage</p>
          </div>
        </div>
      </div>

      {/* Actionable Beneficiaries Assigned to this Officer */}
      <div className="card glass-card-pro p-6 sm:p-8 border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              Beneficiaries Pending Field Inspection
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Select a beneficiary to record geo-tagged stage evidence (Foundation, Plinth, Lintel, Completion)
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'Foundation', 'Plinth', 'Lintel'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === f
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-[#090d22] text-slate-400 hover:text-white border border-indigo-500/20'
                }`}
              >
                {f === 'all' ? 'All Stages' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium">Loading assigned cases...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficiaries
              .filter(b => activeFilter === 'all' || (b.currentStage || 'Foundation') === activeFilter)
              .map((b) => (
                <div
                  key={b._id}
                  className="p-5 rounded-2xl bg-[#090d22]/90 border border-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base font-display group-hover:text-emerald-300 transition-colors">
                          {b.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          ID: <span className="font-mono text-cyan-400 font-bold">{b.householdId}</span> • {b.village}
                        </p>
                      </div>
                      <span className="badge badge-pending">
                        {b.currentStage || 'Foundation'}
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-[#050814]/80 border border-indigo-500/15 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400 font-medium">
                        <span>Aadhaar:</span>
                        <span className="font-mono text-slate-200 font-bold">XXXX-{b.aadhaarLast4}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-medium">
                        <span>BPL Number:</span>
                        <span className="font-mono text-slate-200 font-bold">{b.bplNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-medium">
                        <span>Coordinates:</span>
                        <span className="text-emerald-400 font-mono text-[11px] font-bold">
                          {b.registeredLocation?.latitude || '23.63'}, {b.registeredLocation?.longitude || '77.42'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-indigo-500/15 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold">
                      Grant: <strong className="text-white">₹{(b.estimatedCost || 150000).toLocaleString('en-IN')}</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/new-inspection?beneficiaryId=${b._id}&stage=${b.currentStage || 'Foundation'}`)}
                      className="glass-btn-emerald py-2 px-3.5 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    >
                      📸 Inspect {b.currentStage || 'Stage'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Field Submissions by this Officer */}
      <div className="card glass-card-pro p-6 sm:p-8 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-display font-bold text-white">Your Recent Field Submissions</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Inspections analyzed by multi-modal AI &amp; forwarded to Block Admin</p>
          </div>
          <button
            onClick={() => navigate('/inspections')}
            className="text-xs text-emerald-400 hover:text-emerald-200 font-bold transition-colors"
          >
            Full Archive →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark-table">
            <thead>
              <tr>
                <th>Beneficiary</th>
                <th>Stage</th>
                <th>AI Detection</th>
                <th>Risk Assessment</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {inspections.slice(0, 6).map((insp) => (
                <tr key={insp._id}>
                  <td className="py-3.5">
                    <p className="font-bold text-white">{insp.beneficiaryId?.name || 'Beneficiary'}</p>
                    <p className="text-xs text-slate-400 font-medium">{insp.beneficiaryId?.village || 'Panchayat'}</p>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-200">{insp.officerSelectedStage}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-indigo-300">{insp.aiDetectedStage || insp.officerSelectedStage}</span>
                      {insp.stageMismatch && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          Mismatch
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`badge ${insp.riskScore?.level === 'CRITICAL' ? 'badge-critical' : insp.riskScore?.level === 'HIGH' ? 'badge-high' : insp.riskScore?.level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                      {insp.riskScore?.score ?? 15}/100 ({insp.riskScore?.level || 'LOW'})
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {insp.videoEvidence?.verdict ? '🎥 Video Sent to HQ' : '📸 Photo Only'}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`badge ${
                      insp.status === 'verified'
                        ? 'badge-verified'
                        : insp.status === 'rejected'
                        ? 'badge-rejected'
                        : insp.status === 'reinspection_required'
                        ? 'badge-reinspection'
                        : 'badge-pending'
                    }`}>
                      {insp.status === 'verified' ? '✓ HQ Approved' : insp.status === 'reinspection_required' ? '⚠️ Re-Inspect' : '⏳ Admin Review'}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-slate-400 font-mono">
                    {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/inspections/${insp._id}`)}
                      className="btn-secondary py-1.5 px-3 text-xs font-bold"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* Officer Welcome Header */}
      <div className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-3xl text-white shadow-md flex-shrink-0">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                  Field Inspector Active
                </span>
                <span className="text-xs text-slate-500 font-bold">ID: {user?.employeeId || 'OFF-001'}</span>
              </div>
              <h1 className="page-title text-2xl sm:text-3xl mt-1 text-slate-900">
                Field Officer Workspace: {user?.name || 'Officer Rajesh Kumar'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Assigned Jurisdiction: <strong className="text-slate-900">{myPanchayat} Gram Panchayat</strong>, {myBlock} Block, {user?.district || 'Bhopal'} District
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/new-inspection')}
              className="glass-btn-emerald px-5 py-3 text-sm font-bold shadow-md"
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
              className="px-4 py-3 text-sm font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-1.5"
            >
              🎥 Video AI Forensics
            </button>
            <button
              onClick={() => navigate('/beneficiaries')}
              className="btn-secondary px-4 py-3 text-sm font-bold"
            >
              👥 View Assigned Houses
            </button>
          </div>
        </div>

        {/* Real-time Field Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">Assigned Houses</span>
              <span className="text-xl">🏠</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 font-display">{beneficiaries.length || 5}</p>
            <p className="text-[11px] text-indigo-600 font-bold mt-0.5">In your Gram Panchayat</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-bold">Completed / Verified</span>
              <span className="text-xl">✅</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-display">
              {inspections.filter(i => i.status === 'verified').length}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Approved by Admin</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-800 font-bold">Under AI Review</span>
              <span className="text-xl">⏳</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-700 mt-1 font-display">
              {inspections.filter(i => i.status === 'pending').length}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Awaiting Admin Sign-off</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">Offline Queue</span>
              <span className="text-xl">📡</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-extrabold text-slate-900 font-display">{offlineQueue}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Auto-Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Stored locally on device</p>
          </div>
        </div>
      </div>

      {/* Actionable Beneficiaries Assigned to this Officer */}
      <div className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">
              Beneficiaries Pending Field Inspection
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select a beneficiary to record geo-tagged stage evidence (Foundation, Plinth, Lintel, Completion)
            </p>
          </div>

          <div className="flex gap-2">
            {['all', 'Foundation', 'Plinth', 'Lintel'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === f
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All Stages' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading assigned cases...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficiaries
              .filter(b => activeFilter === 'all' || (b.currentStage || 'Foundation') === activeFilter)
              .map((b) => (
                <div key={b._id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{b.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          ID: <span className="font-mono text-indigo-600 font-bold">{b.householdId}</span> • {b.village}
                        </p>
                      </div>
                      <span className="badge badge-pending">
                        {b.currentStage || 'Foundation'}
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Aadhaar:</span>
                        <span className="font-mono text-slate-800 font-bold">XXXX-{b.aadhaarLast4}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>BPL Number:</span>
                        <span className="font-mono text-slate-800 font-bold">{b.bplNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Coordinates:</span>
                        <span className="text-emerald-700 font-mono text-[11px] font-bold">
                          {b.registeredLocation?.latitude || '23.63'}, {b.registeredLocation?.longitude || '77.42'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-bold">
                      Grant: <strong className="text-slate-900">₹{(b.estimatedCost || 150000).toLocaleString('en-IN')}</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/new-inspection?beneficiaryId=${b._id}&stage=${b.currentStage || 'Foundation'}`)}
                      className="glass-btn-emerald py-2 px-3.5 text-xs font-bold shadow-xs"
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
      <div className="card p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">Your Recent Field Submissions</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Inspections analyzed by multi-modal AI & forwarded to Block Admin</p>
          </div>
          <button
            onClick={() => navigate('/inspections')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Full Archive →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="pb-3">Beneficiary</th>
                <th className="pb-3">Stage</th>
                <th className="pb-3">AI Detection</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.slice(0, 6).map((insp) => (
                <tr key={insp._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <p className="font-bold text-slate-900">{insp.beneficiaryId?.name || 'Beneficiary'}</p>
                    <p className="text-xs text-slate-500 font-medium">{insp.beneficiaryId?.village || 'Panchayat'}</p>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">{insp.officerSelectedStage}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-indigo-700">{insp.aiDetectedStage || insp.officerSelectedStage}</span>
                      {insp.stageMismatch && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                          Mismatch
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`badge ${insp.riskScore?.level === 'CRITICAL' ? 'badge-critical' : insp.riskScore?.level === 'HIGH' ? 'badge-high' : insp.riskScore?.level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                      {insp.riskScore?.score ?? 15}/100 ({insp.riskScore?.level || 'LOW'})
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
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
                  <td className="py-3.5 text-xs text-slate-500 font-medium">
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

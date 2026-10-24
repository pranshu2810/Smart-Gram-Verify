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
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      {/* Officer Welcome Header - Glassmorphic Slab */}
      <div className="card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(134,200,197,0.45)] border border-white/70 flex items-center justify-center text-2xl text-[#123C3A] shadow-xs flex-shrink-0">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-teal text-xs">
                  <span className="micro-aura-teal" />
                  Field Inspector Active
                </span>
                <span className="text-xs text-[#123C3A] font-mono font-bold">ID: {user?.employeeId || 'OFF-001'}</span>
              </div>
              <h1 className="page-title mt-1 text-[#28485A]">
                Field Workspace: {user?.name || 'Officer Rajesh Kumar'}
              </h1>
              <p className="text-xs text-[#607887] mt-1 font-medium">
                Jurisdiction: <span className="text-[#123C3A] font-bold">{myPanchayat} Gram Panchayat</span>, {myBlock} Block, {user?.district || 'Bhopal'} District
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/new-inspection')}
              className="btn-teal px-4 py-2.5 text-xs font-bold shadow-md"
            >
              🚀 Launch New Inspection
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="btn-secondary px-3.5 py-2.5 text-xs font-bold"
            >
              🗺️ Radius Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="btn-secondary px-3.5 py-2.5 text-xs font-bold"
            >
              🎥 Video Forensics
            </button>
            <button
              onClick={() => navigate('/beneficiaries')}
              className="btn-secondary px-3.5 py-2.5 text-xs font-bold"
            >
              👥 Beneficiaries
            </button>
          </div>
        </div>

        {/* Real-time Field Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/50">
          <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="section-label">Assigned Houses</span>
              <span className="text-sm opacity-80">🏠</span>
            </div>
            <p className="text-2xl font-extrabold text-[#28485A] mt-1 tabular-nums font-mono font-display">{beneficiaries.length || 5}</p>
            <p className="text-[11px] text-[#1E465B] font-bold font-mono mt-0.5">In GP Jurisdiction</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/40 border border-[rgba(134,200,197,0.5)] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="section-label text-[#123C3A]">Verified & Approved</span>
              <span className="text-sm opacity-80">✅</span>
            </div>
            <p className="text-2xl font-extrabold text-[#123C3A] mt-1 tabular-nums font-mono font-display">
              {inspections.filter(i => i.status === 'verified').length}
            </p>
            <p className="text-[11px] text-[#123C3A] font-bold font-mono mt-0.5">HQ Cleared</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/40 border border-amber-300/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="section-label text-amber-900">Pending AI Audit</span>
              <span className="text-sm opacity-80">⏳</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-900 mt-1 tabular-nums font-mono font-display">
              {inspections.filter(i => i.status === 'pending').length}
            </p>
            <p className="text-[11px] text-amber-900 font-bold font-mono mt-0.5">In Review Queue</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="section-label">Offline Queue</span>
              <span className="text-sm opacity-80">📡</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-extrabold text-[#28485A] tabular-nums font-mono font-display">{offlineQueue}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[rgba(134,200,197,0.3)] text-[#123C3A] border border-[rgba(134,200,197,0.5)]">
                AUTO-SYNC
              </span>
            </div>
            <p className="text-[11px] text-[#607887] font-bold font-mono mt-0.5">Local Storage Cache</p>
          </div>
        </div>
      </div>

      {/* Actionable Beneficiaries Assigned to this Officer */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-[#28485A]">
              Beneficiaries Pending Field Inspection
            </h3>
            <p className="text-xs text-[#607887] mt-0.5 font-medium">
              Select a beneficiary to record geo-tagged stage evidence (Foundation, Plinth, Lintel, Completion)
            </p>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {['all', 'Foundation', 'Plinth', 'Lintel'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  activeFilter === f
                    ? 'bg-[#86C8C5] text-[#123C3A] border-white/70 shadow-xs'
                    : 'bg-white/40 text-[#607887] hover:text-[#28485A] border-white/50'
                }`}
              >
                {f === 'all' ? 'All Stages' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#607887] text-xs font-mono">Loading assigned cases...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficiaries
              .filter(b => activeFilter === 'all' || (b.currentStage || 'Foundation') === activeFilter)
              .map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-white/40 border border-white/60 hover:border-[#86C8C5] transition-all shadow-2xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-[#28485A] text-sm group-hover:text-[#123C3A] transition-colors">
                          {b.name}
                        </h4>
                        <p className="text-xs text-[#607887] mt-0.5 font-medium">
                          ID: <span className="font-mono text-[#1E465B] font-bold">{b.householdId}</span> • {b.village}
                        </p>
                      </div>
                      <span className="badge badge-medium">
                        {b.currentStage || 'Foundation'}
                      </span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-white/35 border border-white/50 space-y-1 text-xs font-medium">
                      <div className="flex justify-between text-[#607887]">
                        <span>Aadhaar:</span>
                        <span className="font-mono text-[#28485A] font-bold tabular-nums">XXXX-{b.aadhaarLast4}</span>
                      </div>
                      <div className="flex justify-between text-[#607887]">
                        <span>BPL Number:</span>
                        <span className="font-mono text-[#28485A] font-bold tabular-nums">{b.bplNumber}</span>
                      </div>
                      <div className="flex justify-between text-[#607887]">
                        <span>Coordinates:</span>
                        <span className="text-[#123C3A] font-mono text-[11px] font-bold tabular-nums">
                          {b.registeredLocation?.latitude || '23.63'}, {b.registeredLocation?.longitude || '77.42'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between">
                    <span className="text-xs text-[#607887] font-medium font-mono">
                      Grant: <strong className="text-[#28485A] font-bold tabular-nums">₹{(b.estimatedCost || 150000).toLocaleString('en-IN')}</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/new-inspection?beneficiaryId=${b._id}&stage=${b.currentStage || 'Foundation'}`)}
                      className="btn-teal py-1 px-3 text-xs font-bold shadow-2xs"
                    >
                      📸 Inspect {b.currentStage || 'Stage'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Field Submissions - Glass Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#28485A]">Recent Field Submissions</h3>
            <p className="text-xs text-[#607887] mt-0.5 font-medium">Inspections analyzed by multi-modal AI & forwarded to District HQ</p>
          </div>
          <button
            onClick={() => navigate('/inspections')}
            className="text-xs text-[#123C3A] hover:underline font-bold transition-colors"
          >
            Archive Stream →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm glass-table">
            <thead>
              <tr>
                <th>Beneficiary</th>
                <th>Stage</th>
                <th>AI Detection</th>
                <th>Risk Telemetry</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {inspections.slice(0, 6).map((insp) => (
                <tr key={insp._id}>
                  <td className="py-3">
                    <p className="font-bold text-[#28485A] text-xs">{insp.beneficiaryId?.name || 'Beneficiary'}</p>
                    <p className="text-[11px] text-[#607887] font-medium">{insp.beneficiaryId?.village || 'Panchayat'}</p>
                  </td>
                  <td className="py-3 text-xs font-semibold text-[#28485A]">{insp.officerSelectedStage}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1E465B]">{insp.aiDetectedStage || insp.officerSelectedStage}</span>
                      {insp.stageMismatch && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-100/60 text-rose-900 border border-rose-300/70">
                          MISMATCH
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-xs tabular-nums font-bold text-[#28485A]">
                      {insp.riskScore?.score ?? 15}/100 ({insp.riskScore?.level || 'LOW'})
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      {insp.status === 'verified' ? (
                        <>
                          <span className="micro-aura-teal" />
                          <span className="text-[#123C3A] font-bold text-[11px]">HQ Approved</span>
                        </>
                      ) : insp.status === 'reinspection_required' ? (
                        <>
                          <span className="micro-aura-amber" />
                          <span className="text-amber-900 font-bold text-[11px]">Re-Inspection</span>
                        </>
                      ) : (
                        <>
                          <span className="micro-aura-slate" />
                          <span className="text-[#607887] font-semibold text-[11px]">In Review</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[#607887] font-mono tabular-nums font-medium">
                    {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => navigate(`/inspections/${insp._id}`)}
                      className="btn-secondary py-1 px-3 text-xs font-bold"
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

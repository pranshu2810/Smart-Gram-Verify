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
    <div className="space-y-6 animate-fadeIn text-[#F1F5F9]">
      {/* Officer Welcome Header - Gov-Tech Glass Slab */}
      <div className="gov-card-hero relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-2xl text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex-shrink-0">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-gov text-xs">
                  <span className="micro-aura-emerald" />
                  Field Inspector Active
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">ID: {user?.employeeId || 'OFF-001'}</span>
              </div>
              <h1 className="page-title mt-1 text-[#F1F5F9]">
                Field Workspace: {user?.name || 'Officer Rajesh Kumar'}
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1 font-medium">
                Jurisdiction: <span className="text-[#F1F5F9] font-semibold">{myPanchayat} Gram Panchayat</span>, {myBlock} Block, {user?.district || 'Bhopal'} District
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/new-inspection')}
              className="gov-btn-primary px-4 py-2.5 text-xs font-semibold"
            >
              🚀 Launch New Inspection
            </button>
            <button
              onClick={() => navigate('/risk-map')}
              className="gov-btn-secondary px-3.5 py-2.5 text-xs"
            >
              🗺️ Radius Map
            </button>
            <button
              onClick={() => navigate('/video-inspector')}
              className="gov-btn-secondary px-3.5 py-2.5 text-xs"
            >
              🎥 Video Forensics
            </button>
            <button
              onClick={() => navigate('/beneficiaries')}
              className="gov-btn-secondary px-3.5 py-2.5 text-xs"
            >
              👥 Beneficiaries
            </button>
          </div>
        </div>

        {/* Real-time Field Metrics Bar (Monochromatic Tabular) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="section-label">Assigned Houses</span>
              <span className="text-sm opacity-60">🏠</span>
            </div>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1 tabular-nums font-mono">{beneficiaries.length || 5}</p>
            <p className="text-[11px] text-[#64748B] font-mono mt-0.5">In GP Jurisdiction</p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="section-label">Verified & Approved</span>
              <span className="text-sm opacity-60">✅</span>
            </div>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1 tabular-nums font-mono">
              {inspections.filter(i => i.status === 'verified').length}
            </p>
            <p className="text-[11px] text-[#64748B] font-mono mt-0.5">HQ Cleared</p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="section-label">Pending AI Audit</span>
              <span className="text-sm opacity-60">⏳</span>
            </div>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1 tabular-nums font-mono">
              {inspections.filter(i => i.status === 'pending').length}
            </p>
            <p className="text-[11px] text-[#64748B] font-mono mt-0.5">In Review Queue</p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="section-label">Offline Queue</span>
              <span className="text-sm opacity-60">📡</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-semibold text-[#F1F5F9] tabular-nums font-mono">{offlineQueue}</p>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/[0.05] text-[#94A3B8] border border-white/[0.06]">
                AUTO-SYNC
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-mono mt-0.5">Local Storage Cache</p>
          </div>
        </div>
      </div>

      {/* Actionable Beneficiaries Assigned to this Officer */}
      <div className="gov-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9]">
              Beneficiaries Pending Field Inspection
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Select a beneficiary to record geo-tagged stage evidence (Foundation, Plinth, Lintel, Completion)
            </p>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {['all', 'Foundation', 'Plinth', 'Lintel'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-white/[0.04] text-[#94A3B8] hover:text-[#F1F5F9] border border-white/[0.06]'
                }`}
              >
                {f === 'all' ? 'All Stages' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#64748B] text-xs font-mono">Loading assigned cases...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficiaries
              .filter(b => activeFilter === 'all' || (b.currentStage || 'Foundation') === activeFilter)
              .map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/[0.14] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-[#F1F5F9] text-sm group-hover:text-white transition-colors">
                          {b.name}
                        </h4>
                        <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                          ID: <span className="text-[#F1F5F9] font-medium">{b.householdId}</span> • {b.village}
                        </p>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-white/[0.05] text-[#94A3B8] border border-white/[0.06]">
                        {b.currentStage || 'Foundation'}
                      </span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-[#64748B]">
                        <span>Aadhaar:</span>
                        <span className="text-[#94A3B8] tabular-nums">XXXX-{b.aadhaarLast4}</span>
                      </div>
                      <div className="flex justify-between text-[#64748B]">
                        <span>BPL Number:</span>
                        <span className="text-[#94A3B8] tabular-nums">{b.bplNumber}</span>
                      </div>
                      <div className="flex justify-between text-[#64748B]">
                        <span>Coordinates:</span>
                        <span className="text-[#94A3B8] text-[11px] tabular-nums">
                          {b.registeredLocation?.latitude || '23.63'}, {b.registeredLocation?.longitude || '77.42'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-mono">
                      Grant: <strong className="text-[#F1F5F9] tabular-nums">₹{(b.estimatedCost || 150000).toLocaleString('en-IN')}</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/new-inspection?beneficiaryId=${b._id}&stage=${b.currentStage || 'Foundation'}`)}
                      className="gov-btn-primary py-1 px-3 text-xs"
                    >
                      📸 Inspect {b.currentStage || 'Stage'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Field Submissions - Bloomberg Dark Table */}
      <div className="gov-card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9]">Recent Field Submissions</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Inspections analyzed by multi-modal AI & forwarded to District HQ</p>
          </div>
          <button
            onClick={() => navigate('/inspections')}
            className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] font-mono transition-colors"
          >
            Archive Stream →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark-table">
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
                    <p className="font-medium text-[#F1F5F9] text-xs">{insp.beneficiaryId?.name || 'Beneficiary'}</p>
                    <p className="text-[11px] text-[#64748B] font-mono">{insp.beneficiaryId?.village || 'Panchayat'}</p>
                  </td>
                  <td className="py-3 text-xs text-[#94A3B8] font-mono">{insp.officerSelectedStage}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#F1F5F9] font-mono">{insp.aiDetectedStage || insp.officerSelectedStage}</span>
                      {insp.stageMismatch && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-[#FF334B]/15 text-[#FF334B] border border-[#FF334B]/30">
                          MISMATCH
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-xs tabular-nums text-[#94A3B8]">
                      {insp.riskScore?.score ?? 15}/100 ({insp.riskScore?.level || 'LOW'})
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      {insp.status === 'verified' ? (
                        <>
                          <span className="micro-aura-emerald" />
                          <span className="text-emerald-400 font-mono text-[11px]">HQ Approved</span>
                        </>
                      ) : insp.status === 'reinspection_required' ? (
                        <>
                          <span className="micro-aura-amber" />
                          <span className="text-amber-400 font-mono text-[11px]">Re-Inspection</span>
                        </>
                      ) : (
                        <>
                          <span className="micro-aura-slate" />
                          <span className="text-[#94A3B8] font-mono text-[11px]">In Review</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[#64748B] font-mono tabular-nums">
                    {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => navigate(`/inspections/${insp._id}`)}
                      className="gov-btn-secondary py-0.5 px-2.5 text-xs font-mono"
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

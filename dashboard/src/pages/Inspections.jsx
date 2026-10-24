import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { StatusBadge, RiskBadge, EmptyState } from '../components/Layout';

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', stage: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInspections();
  }, [filters, page]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (filters.status) params.status = filters.status;
      if (filters.stage) params.stage = filters.stage;
      const { data } = await api.get('/inspections', { params });
      setInspections(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">Inspection Audit</h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
            Complete registry of field inspection submissions with automated AI verification results
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters((f) => ({ ...f, status: e.target.value }));
            setPage(1);
          }}
          className="input-field w-auto text-xs font-bold"
        >
          <option value="">All Review Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified & Approved</option>
          <option value="rejected">Rejected</option>
          <option value="reinspection">Re-inspection Required</option>
        </select>
        <select
          value={filters.stage}
          onChange={(e) => {
            setFilters((f) => ({ ...f, stage: e.target.value }));
            setPage(1);
          }}
          className="input-field w-auto text-xs font-bold"
        >
          <option value="">All 4 Construction Stages</option>
          <option value="Foundation">Stage 1: Foundation</option>
          <option value="Plinth">Stage 2: Plinth</option>
          <option value="Lintel">Stage 3: Lintel</option>
          <option value="Completion">Stage 4: Completion</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden border border-white/50 shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-[#28485A] font-bold">
            <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin inline-block mr-2" />
            Loading inspection audits...
          </div>
        ) : inspections.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No inspections found"
            message="No records match your selected filters. Adjust criteria or submit a new field inspection."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="glass-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Beneficiary</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Village GP</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Officer Stage</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">AI Detected</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Mismatch Flag</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Geofence</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Risk Assessment</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Review Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Date Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {inspections.map((insp) => (
                  <tr
                    key={insp._id}
                    onClick={() => navigate(`/inspections/${insp._id}`)}
                    className="hover:bg-white/35 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#28485A]">{insp.beneficiaryId?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-[#607887] font-medium">{insp.beneficiaryId?.village || '—'}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#28485A]">{insp.officerSelectedStage}</td>
                    <td className="py-3.5 px-4 text-[#28485A] font-bold">{insp.aiDetectedStage || 'Analyzing...'}</td>
                    <td className="py-3.5 px-4">
                      {insp.stageMismatch ? (
                        <span className="badge badge-critical">AI Mismatch</span>
                      ) : (
                        <span className="badge badge-teal">✓ Consistent</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {insp.gpsVerification?.withinFence ? (
                        <span className="text-[#28485A] text-xs font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#86C8C5]" />
                          Inside Fence
                        </span>
                      ) : (
                        <span className="text-rose-700 text-xs font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Outside ({insp.gpsVerification?.distance || 0}m)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge score={insp.riskScore?.score} level={insp.riskScore?.level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={insp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#607887] text-xs font-medium">
                      {new Date(insp.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary py-1.5 px-3.5 text-xs font-bold disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-xs font-bold text-[#28485A]">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary py-1.5 px-3.5 text-xs font-bold disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

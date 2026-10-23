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
    <div className="space-y-6 animate-fadeIn text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-slate-900">Inspection Audit</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
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
      <div className="card p-0 overflow-hidden bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-slate-700 font-bold">
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mr-2" />
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
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Beneficiary</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Village GP</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Officer Stage</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">AI Detected</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Mismatch Flag</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Geofence</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Risk Assessment</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Review Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Date Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr
                    key={insp._id}
                    onClick={() => navigate(`/inspections/${insp._id}`)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">{insp.beneficiaryId?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{insp.beneficiaryId?.village || '—'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{insp.officerSelectedStage}</td>
                    <td className="py-3.5 px-4 text-indigo-700 font-bold">{insp.aiDetectedStage || 'Analyzing...'}</td>
                    <td className="py-3.5 px-4">
                      {insp.stageMismatch ? (
                        <span className="badge badge-critical">AI Mismatch</span>
                      ) : (
                        <span className="badge badge-verified">✓ Consistent</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {insp.gpsVerification?.withinFence ? (
                        <span className="text-emerald-700 text-xs font-bold">✓ Inside Fence</span>
                      ) : (
                        <span className="text-rose-700 text-xs font-bold">✕ Outside ({insp.gpsVerification?.distance || 0}m)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge score={insp.riskScore?.score} level={insp.riskScore?.level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={insp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
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
          <span className="text-xs font-bold text-slate-700">
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

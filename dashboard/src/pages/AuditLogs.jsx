import { useState, useEffect } from 'react';
import api from '../api/axios';
import { EmptyState } from '../components/Layout';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch();
  }, [page]);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/audit-logs', { params: { page, limit: 30 } });
      setLogs(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    INSPECTION_SUBMITTED: 'bg-blue-50 text-blue-800 border-blue-200',
    INSPECTION_VERIFIED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    INSPECTION_REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
    INSPECTION_REINSPECTION: 'bg-amber-50 text-amber-800 border-amber-200',
    BENEFICIARY_CREATED: 'bg-purple-50 text-purple-800 border-purple-200',
    USER_LOGIN: 'bg-slate-100 text-slate-800 border-slate-200',
    USER_REGISTERED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    INSTALLMENT_APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    DATABASE_SEEDED: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-slate-900">Immutable Audit Trail</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Cryptographically sealed system event log documenting every login, inspection, and stage disbursement
          </p>
        </div>
        <button onClick={fetch} className="btn-secondary py-2 px-3 text-xs font-bold">
          ↻ Refresh Trail
        </button>
      </div>

      <div className="card p-0 overflow-hidden bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-slate-700 font-bold">
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mr-2" />
            Loading cryptographic audit trail...
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No audit entries recorded"
            message="All administrative and field actions will be logged here automatically."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`badge text-[11px] font-bold ${
                        actionColors[log.action] || 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{log.entityType}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Operated by: <strong className="text-slate-900">{log.userName || log.userId?.name || 'System'}</strong> • {new Date(log.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                {log.details && (
                  <div className="text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 max-w-sm truncate hidden md:block">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </div>
                )}
              </div>
            ))}
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

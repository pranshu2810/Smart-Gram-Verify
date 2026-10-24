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
    INSPECTION_SUBMITTED: 'badge-sky',
    INSPECTION_VERIFIED: 'badge-teal',
    INSPECTION_REJECTED: 'badge-critical',
    INSPECTION_REINSPECTION: 'badge-medium',
    BENEFICIARY_CREATED: 'badge-lavender',
    USER_LOGIN: 'badge-sky',
    USER_REGISTERED: 'badge-teal',
    INSTALLMENT_APPROVED: 'badge-teal',
    DATABASE_SEEDED: 'badge-lavender',
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">Immutable Audit Trail</h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
            Cryptographically sealed system event log documenting every login, inspection, and stage disbursement
          </p>
        </div>
        <button onClick={fetch} className="btn-secondary py-2 px-3 text-xs font-bold">
          ↻ Refresh Trail
        </button>
      </div>

      <div className="card p-0 overflow-hidden border border-white/50 shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-[#28485A] font-bold">
            <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin inline-block mr-2" />
            Loading cryptographic audit trail...
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No audit entries recorded"
            message="All administrative and field actions will be logged here automatically."
          />
        ) : (
          <div className="divide-y divide-white/40">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/35 transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#86C8C5] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`badge text-[11px] font-bold ${
                        actionColors[log.action] || 'badge-sky'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-[#28485A]">{log.entityType}</span>
                  </div>
                  <p className="text-xs text-[#607887] font-medium mt-1">
                    Operated by: <strong className="text-[#28485A]">{log.userName || log.userId?.name || 'System'}</strong> • {new Date(log.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                {log.details && (
                  <div className="text-xs text-[#607887] font-mono bg-white/40 px-2.5 py-1 rounded-lg border border-white/50 max-w-sm truncate hidden md:block">
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

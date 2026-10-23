import { useState, useEffect } from 'react';
import api from '../api/axios';
import { StatusBadge, EmptyState } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Installments() {
  const { user } = useAuth();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch();
  }, [filter]);

  const fetch = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const { data } = await api.get('/dashboard/installments', { params });
      setInstallments(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/dashboard/installments/${id}`, { status });
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update installment');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-slate-900">DBT Grant Passbook</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Stage-wise Direct Benefit Transfer (DBT) installment ledger & bank disbursements
          </p>
        </div>
        <button onClick={fetch} className="btn-secondary py-2 px-3 text-xs font-bold">
          ↻ Refresh Passbook
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: '', label: 'All Transfers' },
          { key: 'pending', label: 'Pending Approval' },
          { key: 'approved', label: 'Approved (Ready to Pay)' },
          { key: 'disbursed', label: 'Disbursed (Transferred)' },
          { key: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-slate-700 font-bold">
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mr-2" />
            Loading installment ledger...
          </div>
        ) : installments.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No installments recorded"
            message="Installment milestones are automatically triggered when field inspections are verified by an Admin"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Beneficiary</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Milestone Stage</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Installment #</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Grant Amount</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Risk Level</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Transfer Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Approved By</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">Created Date</th>
                  {user?.role === 'admin' && (
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-slate-800">HQ Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installments.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{inst.beneficiaryId?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{inst.stage}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">Installment #{inst.installmentNumber}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹{(inst.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`badge badge-${(inst.riskLevel || 'low').toLowerCase()}`}>
                        {inst.riskScore || 0}/100 • {inst.riskLevel || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">{inst.approvedBy?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                      {new Date(inst.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-3.5 px-4">
                        {inst.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(inst._id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg font-bold hover:bg-emerald-100"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(inst._id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-lg font-bold hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {inst.status === 'approved' && (
                          <button
                            onClick={() => handleAction(inst._id, 'disbursed')}
                            className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs rounded-lg font-bold hover:bg-indigo-100"
                          >
                            Mark as Disbursed
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

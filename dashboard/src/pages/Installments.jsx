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
    <div className="space-y-6 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">DBT Grant Passbook</h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md ${
              filter === f.key
                ? 'bg-[#A9CDE0] text-[#28485A] shadow-xs border border-white/60'
                : 'bg-white/40 border border-white/50 text-[#607887] hover:text-[#28485A] hover:bg-white/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden border border-white/50 shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-[#28485A] font-bold">
            <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin inline-block mr-2" />
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
            <table className="glass-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Beneficiary</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Milestone Stage</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Installment #</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Grant Amount</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Risk Level</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Transfer Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Approved By</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">Created Date</th>
                  {user?.role === 'admin' && (
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-[#28485A]">HQ Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {installments.map((inst) => (
                  <tr key={inst._id} className="hover:bg-white/35 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#28485A]">{inst.beneficiaryId?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-[#28485A] font-medium">{inst.stage}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#607887]">Installment #{inst.installmentNumber}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#28485A]">₹{(inst.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`badge ${
                        (inst.riskLevel || '').toUpperCase() === 'CRITICAL' ? 'badge-critical' :
                        (inst.riskLevel || '').toUpperCase() === 'HIGH' ? 'badge-critical' :
                        (inst.riskLevel || '').toUpperCase() === 'MEDIUM' ? 'badge-medium' : 'badge-teal'
                      }`}>
                        {inst.riskScore || 0}/100 • {inst.riskLevel || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#607887] text-xs font-medium">{inst.approvedBy?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-[#607887] text-xs font-medium">
                      {new Date(inst.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-3.5 px-4">
                        {inst.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(inst._id, 'approved')}
                              className="px-2.5 py-1 btn-teal text-[#28485A] text-xs rounded-lg font-bold shadow-2xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(inst._id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-500/80 hover:bg-rose-500 text-white text-xs rounded-lg font-bold shadow-2xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {inst.status === 'approved' && (
                          <button
                            onClick={() => handleAction(inst._id, 'disbursed')}
                            className="px-3 py-1 btn-primary text-[#28485A] text-xs rounded-lg font-bold shadow-2xs"
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

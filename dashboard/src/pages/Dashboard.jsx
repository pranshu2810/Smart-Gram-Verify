import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { StatCard, StatusBadge, RiskBadge } from '../components/Layout';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#28485A] font-bold">
        <span className="w-5 h-5 border-2 border-[#A9CDE0] border-t-transparent rounded-full animate-spin mr-3" />
        Loading analytics overview...
      </div>
    );
  }

  const o = stats?.overview || {};

  return (
    <div className="space-y-8 animate-fadeIn text-[#28485A]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">
            Panchayat Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#607887] font-medium mt-1">
            Real-time analytics across all Gram Panchayats, Stages, and AI Inspections
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStats} className="btn-secondary text-xs font-bold py-2 px-3.5">
            ↻ Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Beneficiaries" value={o.totalBeneficiaries || 0} icon="👥" color="primary" />
        <StatCard label="Total Inspections" value={o.totalInspections || 0} icon="🔍" color="blue" />
        <StatCard label="Pending Review" value={o.pendingInspections || 0} icon="⏳" color="amber" />
        <StatCard label="Verified Stages" value={o.verifiedInspections || 0} icon="✅" color="emerald" />
        <StatCard label="Rejected Inspections" value={o.rejectedInspections || 0} icon="❌" color="red" />
        <StatCard label="Reinspections" value={o.reinspections || 0} icon="🔄" color="amber" />
        <StatCard label="Installments Approved" value={o.approvedInstallments || 0} icon="💰" color="emerald" />
        <StatCard label="Total Disbursed" value={`₹${(o.totalDisbursed || 0).toLocaleString('en-IN')}`} icon="🏦" color="violet" />
      </div>

      {/* Risk Distribution & Stage Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6 border border-white/50">
          <h3 className="text-base font-display font-bold text-[#28485A] mb-4 flex items-center justify-between">
            <span>Risk Distribution Breakdown</span>
            <span className="text-xs text-[#607887] font-medium font-sans">Automated AI Risk Scoring</span>
          </h3>
          <div className="space-y-3.5">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(level => {
              const count = stats?.riskDistribution?.[level] || 0;
              const total = o.totalInspections || 1;
              const pct = Math.round((count / total) * 100);
              const barColors = {
                LOW: 'bg-[#86C8C5]',
                MEDIUM: 'bg-[#A9CDE0]',
                HIGH: 'bg-[#B4B8D9]',
                CRITICAL: 'bg-rose-400'
              };
              const textColors = {
                LOW: 'text-[#28485A]',
                MEDIUM: 'text-[#28485A]',
                HIGH: 'text-[#28485A]',
                CRITICAL: 'text-rose-700 font-bold'
              };
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-16 ${textColors[level]}`}>{level}</span>
                  <div className="flex-1 bg-white/40 rounded-full h-3 overflow-hidden border border-white/50 backdrop-blur-xs">
                    <div className={`h-3 rounded-full ${barColors[level]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[#28485A] w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6 border border-white/50">
          <h3 className="text-base font-display font-bold text-[#28485A] mb-4 flex items-center justify-between">
            <span>Verified Construction Stages</span>
            <span className="text-xs text-[#607887] font-medium font-sans">PMAY-G 4-Stage Model</span>
          </h3>
          <div className="grid grid-cols-2 gap-3.5">
            {['Foundation', 'Plinth', 'Lintel', 'Completion'].map((stage, i) => {
              const count = stats?.stageDistribution?.[stage] || 0;
              const icons = ['🏗️', '🧱', '🪟', '🏠'];
              return (
                <div key={stage} className="p-4 bg-white/40 rounded-2xl border border-white/50 text-center hover:border-[#A9CDE0] transition-all backdrop-blur-sm">
                  <div className="text-2xl mb-1.5">{icons[i]}</div>
                  <div className="text-2xl font-bold text-[#28485A] font-display">{count}</div>
                  <div className="text-xs font-bold text-[#607887] uppercase tracking-wider mt-0.5">{stage}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="card p-6 border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-display font-bold text-[#28485A]">Recent Stage Inspections</h3>
            <p className="text-xs text-[#607887] font-medium">Latest submissions processed by the multi-modal verification pipeline</p>
          </div>
          <button onClick={() => navigate('/inspections')} className="btn-secondary text-xs font-bold py-1.5 px-3">
            View All Inspections →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="glass-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-3 px-3.5">Beneficiary</th>
                <th className="text-left py-3 px-3.5">Stage</th>
                <th className="text-left py-3 px-3.5">Status</th>
                <th className="text-left py-3 px-3.5">Risk Assessment</th>
                <th className="text-left py-3 px-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {(stats?.recentInspections || []).map((insp, i) => (
                <tr
                  key={insp._id || i}
                  className="hover:bg-white/35 cursor-pointer transition-colors"
                  onClick={() => navigate(`/inspections/${insp._id}`)}
                >
                  <td className="py-3 px-3.5 font-bold text-[#28485A]">{insp.beneficiaryId?.name || '—'}</td>
                  <td className="py-3 px-3.5 text-[#607887] font-medium">{insp.officerSelectedStage}</td>
                  <td className="py-3 px-3.5"><StatusBadge status={insp.status} /></td>
                  <td className="py-3 px-3.5"><RiskBadge score={insp.riskScore?.score} level={insp.riskScore?.level} /></td>
                  <td className="py-3 px-3.5 text-[#607887] text-xs font-medium">{new Date(insp.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

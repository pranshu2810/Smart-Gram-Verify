import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-light-mesh text-slate-900 flex flex-col">
      <PortalHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ml-[260px] p-6 lg:p-8 min-h-[calc(100vh-65px)] transition-all duration-300 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Reusable luminous status badge
export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    under_review: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
    reinspection: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    disbursed: 'bg-teal-50 text-teal-800 border-teal-200',
    on_hold: 'bg-slate-100 text-slate-700 border-slate-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    suspended: 'bg-rose-50 text-rose-800 border-rose-200',
    flagged: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
  };

  const labels = {
    pending: 'Pending Review',
    under_review: 'Under AI Review',
    verified: 'Verified',
    rejected: 'Rejected',
    reinspection: 'Reinspection Required',
    approved: 'Approved',
    disbursed: 'DBT Disbursed',
    on_hold: 'On Hold',
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    suspended: 'Suspended',
    flagged: 'Critical Flag',
  };

  return (
    <span className={`badge ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {labels[status] || status}
    </span>
  );
}

// Risk score indicator with clear text
export function RiskBadge({ score, level }) {
  const styles = {
    LOW: 'badge-low',
    MEDIUM: 'badge-medium',
    HIGH: 'badge-high',
    CRITICAL: 'badge-critical',
  };

  return (
    <span className={`badge ${styles[level] || 'badge-low'}`}>
      {score !== undefined ? `${score}/100 • ${level}` : level}
    </span>
  );
}

// Stat card for dashboard with high-contrast text and crisp colors
export function StatCard({ label, value, icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'from-indigo-600 to-blue-600 text-white shadow-indigo-200',
    emerald: 'from-emerald-600 to-teal-600 text-white shadow-emerald-200',
    amber: 'from-amber-500 to-orange-500 text-white shadow-amber-200',
    red: 'from-rose-500 to-red-600 text-white shadow-rose-200',
    blue: 'from-sky-500 to-indigo-600 text-white shadow-sky-200',
    violet: 'from-purple-600 to-indigo-600 text-white shadow-purple-200',
  };

  return (
    <div className="card p-5 group animate-fadeIn hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 font-display tracking-tight">{value}</p>
          {trend && <p className="text-xs text-slate-500 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colorMap[color]} shadow-md flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Empty state
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="text-center py-16 animate-fadeIn card p-8">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{message}</p>
    </div>
  );
}

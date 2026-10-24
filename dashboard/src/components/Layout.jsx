import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-mesh text-slate-100 flex flex-col relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Subtle Star Particles */}
      <div className="stars" />
      <PortalHeader />
      <div className="flex flex-1 relative z-10">
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
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    under_review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    verified: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    reinspection: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    disbursed: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    on_hold: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    suspended: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    flagged: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold shadow-[0_0_12px_rgba(244,63,94,0.25)]',
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
    <span className={`badge ${styles[status] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {labels[status] || status}
    </span>
  );
}

// Risk score indicator with clear neon glow
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

// Stat card for dashboard with high-contrast glowing text and cyberpunk gradient cards
export function StatCard({ label, value, icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'from-indigo-600 to-blue-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    emerald: 'from-emerald-600 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    amber: 'from-amber-500 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    red: 'from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    blue: 'from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    violet: 'from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  };

  return (
    <div className="card p-5 group animate-fadeIn hover:border-indigo-500/40 relative overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-white mt-1 font-display tracking-tight group-hover:text-shimmer transition-colors">
            {value}
          </p>
          {trend && <p className="text-xs text-slate-400 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Empty state
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="text-center py-16 animate-fadeIn card p-8 border-dashed border-indigo-500/25">
      <div className="text-5xl mb-3 animate-float">{icon}</div>
      <h3 className="text-lg font-bold text-white font-display">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">{message}</p>
    </div>
  );
}

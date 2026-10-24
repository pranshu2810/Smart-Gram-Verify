import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gov-command text-slate-800 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Precision architectural dot grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-0 opacity-40" />

      {/* Luminous Frosted Acrylic Header */}
      <PortalHeader />

      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 ml-[260px] p-6 lg:p-8 min-h-[calc(100vh-65px)] max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Reusable executive status indicator with subtle glowing micro-auras
export function StatusBadge({ status }) {
  const configs = {
    pending: {
      label: 'Pending Review',
      aura: 'micro-aura-amber',
      text: 'text-amber-800',
      border: 'border-amber-200/80 bg-amber-50/80',
    },
    under_review: {
      label: 'AI Verification',
      aura: 'micro-aura-cyan',
      text: 'text-cyan-800',
      border: 'border-cyan-200/80 bg-cyan-50/80',
    },
    verified: {
      label: 'Verified & Approved',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80 bg-emerald-50/80',
    },
    rejected: {
      label: 'Critical Flag / Rejected',
      aura: 'micro-aura-crimson',
      text: 'text-rose-800',
      border: 'border-rose-200/80 bg-rose-50/80',
    },
    reinspection: {
      label: 'Re-Inspection Required',
      aura: 'micro-aura-amber',
      text: 'text-amber-800',
      border: 'border-amber-200/80 bg-amber-50/80',
    },
    approved: {
      label: 'Approved',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80 bg-emerald-50/80',
    },
    disbursed: {
      label: 'DBT Disbursed',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80 bg-emerald-50/80',
    },
    on_hold: {
      label: 'On Hold',
      aura: 'micro-aura-slate',
      text: 'text-slate-700',
      border: 'border-slate-200/80 bg-slate-100/80',
    },
    draft: {
      label: 'Draft',
      aura: 'micro-aura-slate',
      text: 'text-slate-600',
      border: 'border-slate-200/80 bg-slate-100/80',
    },
    active: {
      label: 'Active Clearance',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80 bg-emerald-50/80',
    },
    completed: {
      label: 'Completed',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80 bg-emerald-50/80',
    },
    flagged: {
      label: 'Flagged Anomaly',
      aura: 'micro-aura-crimson',
      text: 'text-rose-800 font-bold',
      border: 'border-rose-300 bg-rose-50',
    },
  };

  const c = configs[status] || {
    label: status,
    aura: 'micro-aura-slate',
    text: 'text-slate-700',
    border: 'border-slate-200 bg-slate-50',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${c.border} shadow-2xs tracking-tight`}>
      <span className={c.aura} />
      <span className={c.text}>{c.label}</span>
    </span>
  );
}

// Risk score indicator with tabular monospaced numbers & precision crimson
export function RiskBadge({ score, level }) {
  const isCritical = level === 'CRITICAL' || (score !== undefined && score >= 70);
  const isWarning = level === 'HIGH' || level === 'MEDIUM' || (score !== undefined && score >= 35);

  let style = 'border-slate-200 bg-slate-50 text-slate-700';
  let aura = 'micro-aura-slate';

  if (isCritical) {
    style = 'border-rose-300 bg-rose-50 text-rose-800 font-bold shadow-2xs';
    aura = 'micro-aura-crimson';
  } else if (isWarning) {
    style = 'border-amber-300 bg-amber-50 text-amber-800 font-semibold';
    aura = 'micro-aura-amber';
  } else {
    style = 'border-emerald-200 bg-emerald-50 text-emerald-800';
    aura = 'micro-aura-emerald';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs border ${style}`}>
      <span className={aura} />
      <span className="tabular-nums font-mono font-bold">
        {score !== undefined ? `${score}/100` : ''}
      </span>
      <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">
        {level}
      </span>
    </span>
  );
}

// Frosted Glass Stat Card
export function StatCard({ label, value, icon, trend, subtext }) {
  return (
    <div className="gov-card p-5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label">{label}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] mt-1.5 tabular-nums tracking-tight font-display">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-emerald-700 mt-1.5 font-bold flex items-center gap-1">
              {trend}
            </p>
          )}
          {subtext && (
            <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              {subtext}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-sky-50 border border-indigo-100 flex items-center justify-center text-lg text-indigo-700 shadow-2xs group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Clean Frosted Empty State
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="text-center py-14 gov-card p-8 border-dashed border-slate-300">
      <div className="text-3xl mb-3 opacity-80">{icon}</div>
      <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
      <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">{message}</p>
    </div>
  );
}

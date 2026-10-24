import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gov-command text-slate-100 flex flex-col relative selection:bg-slate-700 selection:text-slate-100">
      {/* Ultra-subtle dot-grid texture */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-0 opacity-60" />

      {/* Executive Command Header */}
      <PortalHeader />

      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 ml-[260px] p-6 lg:p-8 min-h-[calc(100vh-61px)] max-w-7xl">
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
      text: 'text-amber-400',
      border: 'border-amber-500/20 bg-amber-500/5',
    },
    under_review: {
      label: 'AI Verification',
      aura: 'micro-aura-cyan',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20 bg-cyan-500/5',
    },
    verified: {
      label: 'Verified & Approved',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20 bg-emerald-500/5',
    },
    rejected: {
      label: 'Critical Flag / Rejected',
      aura: 'micro-aura-crimson',
      text: 'text-[#FF334B]',
      border: 'border-[#FF334B]/25 bg-[#FF334B]/5',
    },
    reinspection: {
      label: 'Re-Inspection Required',
      aura: 'micro-aura-amber',
      text: 'text-amber-400',
      border: 'border-amber-500/20 bg-amber-500/5',
    },
    approved: {
      label: 'Approved',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20 bg-emerald-500/5',
    },
    disbursed: {
      label: 'DBT Disbursed',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20 bg-emerald-500/5',
    },
    on_hold: {
      label: 'On Hold',
      aura: 'micro-aura-slate',
      text: 'text-slate-400',
      border: 'border-slate-500/20 bg-slate-500/5',
    },
    draft: {
      label: 'Draft',
      aura: 'micro-aura-slate',
      text: 'text-slate-400',
      border: 'border-slate-500/20 bg-slate-500/5',
    },
    active: {
      label: 'Active Clearance',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20 bg-emerald-500/5',
    },
    completed: {
      label: 'Completed',
      aura: 'micro-aura-emerald',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20 bg-emerald-500/5',
    },
    flagged: {
      label: 'Flagged Anomaly',
      aura: 'micro-aura-crimson',
      text: 'text-[#FF334B]',
      border: 'border-[#FF334B]/30 bg-[#FF334B]/10',
    },
  };

  const c = configs[status] || {
    label: status,
    aura: 'micro-aura-slate',
    text: 'text-slate-400',
    border: 'border-slate-500/20 bg-slate-500/5',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-medium border ${c.border} tracking-wide`}>
      <span className={c.aura} />
      <span className={c.text}>{c.label}</span>
    </span>
  );
}

// Risk score indicator with tabular monospaced numbers & precision crimson
export function RiskBadge({ score, level }) {
  const isCritical = level === 'CRITICAL' || (score !== undefined && score >= 70);
  const isWarning = level === 'HIGH' || level === 'MEDIUM' || (score !== undefined && score >= 35);

  let style = 'border-slate-500/20 bg-slate-500/5 text-slate-300';
  let aura = 'micro-aura-slate';

  if (isCritical) {
    style = 'border-[#FF334B]/35 bg-[#FF334B]/10 text-[#FF334B] font-bold shadow-[0_0_12px_rgba(255,51,75,0.2)]';
    aura = 'micro-aura-crimson';
  } else if (isWarning) {
    style = 'border-amber-500/25 bg-amber-500/5 text-amber-400 font-semibold';
    aura = 'micro-aura-amber';
  } else {
    style = 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
    aura = 'micro-aura-emerald';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs border ${style}`}>
      <span className={aura} />
      <span className="tabular-nums font-mono">
        {score !== undefined ? `${score}/100` : ''}
      </span>
      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
        {level}
      </span>
    </span>
  );
}

// Executive Gov-Tech Glass Stat Card with tabular alignment
export function StatCard({ label, value, icon, trend, subtext }) {
  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label">{label}</p>
          <p className="text-2xl lg:text-3xl font-semibold text-[#F1F5F9] mt-1.5 tabular-nums tracking-tight font-display">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-[#94A3B8] mt-1.5 font-medium flex items-center gap-1">
              {trend}
            </p>
          )}
          {subtext && (
            <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">
              {subtext}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-lg text-slate-300 group-hover:border-white/[0.18] transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Minimalist Empty State
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="text-center py-14 card p-8 border-dashed border-white/[0.08]">
      <div className="text-3xl mb-3 opacity-60">{icon}</div>
      <h3 className="text-base font-semibold text-[#F1F5F9]">{title}</h3>
      <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">{message}</p>
    </div>
  );
}

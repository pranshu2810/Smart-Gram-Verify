import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-glass-canvas text-[#28485A] flex flex-col relative selection:bg-[#A9CDE0]/50 selection:text-[#28485A]">
      {/* Soft Blurred Background Color Shapes for Depth */}
      <div className="fixed top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(169, 205, 224, 0.45) 0%, transparent 70%)' }} />
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(134, 200, 197, 0.40) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-45 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(180, 184, 217, 0.35) 0%, transparent 70%)' }} />

      {/* Translucent Glass Header */}
      <PortalHeader />

      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 ml-[260px] p-6 lg:p-8 min-h-[calc(100vh-65px)] max-w-7xl transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Reusable translucent glass status badge
export function StatusBadge({ status }) {
  const configs = {
    pending: {
      label: 'Pending Review',
      aura: 'micro-aura-amber',
      text: 'text-amber-900',
      border: 'border-amber-300/60 bg-amber-100/40',
    },
    under_review: {
      label: 'AI Verification',
      aura: 'micro-aura-sky',
      text: 'text-[#1E465B]',
      border: 'border-[#A9CDE0]/70 bg-[#A9CDE0]/30',
    },
    verified: {
      label: 'Verified & Approved',
      aura: 'micro-aura-teal',
      text: 'text-[#123C3A]',
      border: 'border-[#86C8C5]/70 bg-[#86C8C5]/25',
    },
    rejected: {
      label: 'Rejected',
      aura: 'micro-aura-crimson',
      text: 'text-rose-900 font-bold',
      border: 'border-rose-300/60 bg-rose-100/40',
    },
    reinspection: {
      label: 'Re-Inspection Required',
      aura: 'micro-aura-amber',
      text: 'text-amber-900',
      border: 'border-amber-300/60 bg-amber-100/40',
    },
    approved: {
      label: 'Approved',
      aura: 'micro-aura-teal',
      text: 'text-[#123C3A]',
      border: 'border-[#86C8C5]/70 bg-[#86C8C5]/25',
    },
    disbursed: {
      label: 'DBT Disbursed',
      aura: 'micro-aura-teal',
      text: 'text-[#123C3A]',
      border: 'border-[#86C8C5]/70 bg-[#86C8C5]/25',
    },
    on_hold: {
      label: 'On Hold',
      aura: 'micro-aura-slate',
      text: 'text-[#607887]',
      border: 'border-white/50 bg-white/30',
    },
    draft: {
      label: 'Draft',
      aura: 'micro-aura-slate',
      text: 'text-[#607887]',
      border: 'border-white/50 bg-white/30',
    },
    active: {
      label: 'Active Clearance',
      aura: 'micro-aura-teal',
      text: 'text-[#123C3A]',
      border: 'border-[#86C8C5]/70 bg-[#86C8C5]/25',
    },
    completed: {
      label: 'Completed',
      aura: 'micro-aura-teal',
      text: 'text-[#123C3A]',
      border: 'border-[#86C8C5]/70 bg-[#86C8C5]/25',
    },
    flagged: {
      label: 'Flagged Anomaly',
      aura: 'micro-aura-crimson',
      text: 'text-rose-900 font-bold',
      border: 'border-rose-400/70 bg-rose-100/50',
    },
  };

  const c = configs[status] || {
    label: status,
    aura: 'micro-aura-slate',
    text: 'text-[#607887]',
    border: 'border-white/50 bg-white/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.border} backdrop-blur-md shadow-2xs tracking-tight`}>
      <span className={c.aura} />
      <span className={c.text}>{c.label}</span>
    </span>
  );
}

// Risk score indicator with tabular numbers
export function RiskBadge({ score, level }) {
  const isCritical = level === 'CRITICAL' || (score !== undefined && score >= 70);
  const isWarning = level === 'HIGH' || level === 'MEDIUM' || (score !== undefined && score >= 35);

  let style = 'border-white/60 bg-white/35 text-[#607887]';
  let aura = 'micro-aura-slate';

  if (isCritical) {
    style = 'border-rose-400/70 bg-rose-100/50 text-rose-900 font-bold';
    aura = 'micro-aura-crimson';
  } else if (isWarning) {
    style = 'border-amber-300/70 bg-amber-100/50 text-amber-900 font-bold';
    aura = 'micro-aura-amber';
  } else {
    style = 'border-[#86C8C5]/70 bg-[#86C8C5]/25 text-[#123C3A] font-bold';
    aura = 'micro-aura-teal';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${style} backdrop-blur-md`}>
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

// Medium-Tone Glass Stat Card (38% Opacity + 16px Blur + 18px Radius)
export function StatCard({ label, value, icon, trend, color = 'sky', subtext }) {
  const iconSurfaces = {
    sky: 'bg-[rgba(169,205,224,0.38)] border-[rgba(255,255,255,0.6)] text-[#1A3644]',
    teal: 'bg-[rgba(134,200,197,0.35)] border-[rgba(255,255,255,0.6)] text-[#123C3A]',
    lavender: 'bg-[rgba(180,184,217,0.38)] border-[rgba(255,255,255,0.6)] text-[#383D61]',
    ice: 'bg-[rgba(210,224,232,0.45)] border-[rgba(255,255,255,0.6)] text-[#28485A]',
    primary: 'bg-[rgba(169,205,224,0.38)] border-[rgba(255,255,255,0.6)] text-[#1A3644]',
    blue: 'bg-[rgba(169,205,224,0.38)] border-[rgba(255,255,255,0.6)] text-[#1A3644]',
    emerald: 'bg-[rgba(134,200,197,0.35)] border-[rgba(255,255,255,0.6)] text-[#123C3A]',
    amber: 'bg-[rgba(245,158,11,0.18)] border-[rgba(245,158,11,0.35)] text-amber-900',
    red: 'bg-[rgba(225,29,72,0.15)] border-[rgba(225,29,72,0.35)] text-rose-900',
    violet: 'bg-[rgba(180,184,217,0.38)] border-[rgba(255,255,255,0.6)] text-[#383D61]',
  };

  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label">{label}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[#28485A] mt-1.5 tabular-nums tracking-tight font-display">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-[#607887] mt-1.5 font-bold flex items-center gap-1">
              {trend}
            </p>
          )}
          {subtext && (
            <p className="text-[11px] text-[#8299A6] mt-0.5 font-mono">
              {subtext}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform ${iconSurfaces[color] || iconSurfaces.sky}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Translucent Glass Empty State
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="text-center py-14 card p-8 border-dashed border-white/60">
      <div className="text-4xl mb-3 opacity-80">{icon}</div>
      <h3 className="text-base font-bold text-[#28485A]">{title}</h3>
      <p className="text-xs text-[#607887] mt-1 max-w-sm mx-auto font-medium">{message}</p>
    </div>
  );
}

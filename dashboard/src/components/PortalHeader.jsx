import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-[14px] flex items-center justify-center text-lg shadow-inner">
              🏛️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-[#0F172A] text-base tracking-tight">
                Smart-Gram <span className="text-shimmer">Verify</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                PMAY-G
              </span>
              <span className="text-[10px] font-mono text-[#64748B] font-semibold">v2.4</span>
            </div>
            <p className="text-[10px] text-[#64748B] font-medium tracking-wide">
              Rural Housing Inspection & Digital Benefit Transfer (DBT) System
            </p>
          </div>
        </div>

        {/* Clearance Role Banner */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 shadow-2xs">
              <span className="micro-aura-cyan" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                    Executive Command HQ
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-200/80 text-indigo-900 font-bold font-mono">
                    Apex Clearance
                  </span>
                </div>
                <p className="text-[10px] text-indigo-800 font-medium leading-tight">
                  State Oversight • DBT Grant Disbursements
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs">
              <span className="micro-aura-emerald" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Field Officer Workspace
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-200/80 text-emerald-900 font-bold font-mono">
                    Field Clearance
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 font-medium leading-tight">
                  Jurisdiction: <span className="font-bold text-emerald-950">{user?.panchayat || 'Barkheda'} GP</span>, {user?.block || 'Berasia'} Block
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
            <span className="micro-aura-emerald" />
            <span className="text-[11px] font-bold text-emerald-800 font-mono">Vision AI Engine Active</span>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xs font-extrabold text-white shadow-2xs">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-[#0F172A] truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-indigo-700 font-bold capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign out of workspace"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors text-xs font-bold border border-slate-200 hover:border-rose-200 shadow-2xs"
              >
                Sign Out 🚪
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

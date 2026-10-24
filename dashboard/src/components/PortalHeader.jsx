import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050814]/85 backdrop-blur-xl border-b border-indigo-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)] px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full bg-[#090d1f] rounded-[14px] flex items-center justify-center text-lg">
              🏛️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-white text-base tracking-tight">
                Smart-Gram <span className="text-shimmer">Verify</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 font-extrabold border border-indigo-500/30">
                PMAY-G
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              AI-Powered Rural Housing & DBT Audit Matrix
            </p>
          </div>
        </div>

        {/* Clearance Role Banner */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <span className="text-base animate-pulse">🛡️</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider">
                    Executive Command HQ
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-extrabold border border-indigo-500/40">
                    Apex Clearance
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                  State Oversight • DBT Autonomous Approvals
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="text-base animate-pulse">👷</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                    Field Officer Terminal
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 font-extrabold border border-emerald-500/40">
                    Field Clearance
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                  Jurisdiction: <strong className="text-emerald-400">{user?.panchayat || 'Barkheda'} GP</strong>, {user?.block || 'Berasia'} Block
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-300">AI Sentinel Active</span>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                <div className="w-full h-full bg-[#0d1230] rounded-full flex items-center justify-center text-xs font-extrabold text-indigo-300">
                  {user.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-extrabold text-white truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-indigo-400 font-semibold capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign Out to switch account or portal"
                className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-100 transition-all text-xs font-bold border border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
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

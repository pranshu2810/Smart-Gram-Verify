import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090E]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)] px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[#F1F5F9] text-sm tracking-tight">
                Smart-Gram <span className="text-[#94A3B8] font-normal">Verify</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-white/[0.05] text-[#94A3B8] border border-white/[0.08]">
                PMAY-G
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">v2.4-HQ</span>
            </div>
            <p className="text-[10px] text-[#64748B] font-medium tracking-wide">
              Rural Housing Autonomous Verification & DBT Audit Matrix
            </p>
          </div>
        </div>

        {/* Clearance Role Banner */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] shadow-sm">
              <span className="micro-aura-cyan" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#F1F5F9] uppercase tracking-wider">
                    Executive Command HQ
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-[#94A3B8] font-mono font-medium">
                    Apex Clearance
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B] font-mono leading-tight">
                  District Oversight • DBT Grant Verification
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] shadow-sm">
              <span className="micro-aura-emerald" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#F1F5F9] uppercase tracking-wider">
                    Field Officer Terminal
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-[#94A3B8] font-mono font-medium">
                    Field Clearance
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B] font-mono leading-tight">
                  Jurisdiction: <span className="text-[#94A3B8] font-semibold">{user?.panchayat || 'Barkheda'} GP</span> • {user?.block || 'Berasia'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/[0.06] text-xs">
            <span className="micro-aura-emerald" />
            <span className="text-[11px] font-medium text-[#94A3B8] font-mono">Vision AI Engine Active</span>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-xs font-semibold text-[#F1F5F9]">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-medium text-[#F1F5F9] truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-[#64748B] font-mono capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign out of government workspace"
                className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-xs font-medium border border-white/[0.08]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

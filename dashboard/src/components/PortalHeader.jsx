import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full glass-header px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(169,205,224,0.45)] border border-white/60 p-0.5 shadow-xs flex items-center justify-center text-lg">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-[#28485A] text-base tracking-tight">
                Smart-Gram <span className="text-shimmer">Verify</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-[rgba(169,205,224,0.38)] text-[#1E465B] border border-white/50">
                PMAY-G
              </span>
              <span className="text-[10px] font-mono text-[#607887] font-semibold">v2.4</span>
            </div>
            <p className="text-[10px] text-[#607887] font-medium tracking-wide">
              Rural Housing Inspection & Digital Benefit Transfer (DBT) System
            </p>
          </div>
        </div>

        {/* Clearance Role Banner */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl glass-blue-panel shadow-2xs">
              <span className="micro-aura-sky" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#1E465B] uppercase tracking-wide">
                    Executive Command HQ
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/50 text-[#1E465B] font-bold font-mono">
                    Apex Clearance
                  </span>
                </div>
                <p className="text-[10px] text-[#607887] font-medium leading-tight">
                  State Oversight • DBT Grant Disbursements
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl glass-teal-panel shadow-2xs">
              <span className="micro-aura-teal" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#123C3A] uppercase tracking-wide">
                    Field Officer Workspace
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/50 text-[#123C3A] font-bold font-mono">
                    Field Clearance
                  </span>
                </div>
                <p className="text-[10px] text-[#607887] font-medium leading-tight">
                  Jurisdiction: <span className="font-bold text-[#123C3A]">{user?.panchayat || 'Barkheda'} GP</span>, {user?.block || 'Berasia'} Block
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(134,200,197,0.25)] border border-white/50 text-xs shadow-2xs">
            <span className="micro-aura-teal" />
            <span className="text-[11px] font-bold text-[#123C3A] font-mono">Vision AI Engine Active</span>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[rgba(169,205,224,0.6)] border border-white/60 flex items-center justify-center text-xs font-extrabold text-[#1E465B] shadow-2xs">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-[#28485A] truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-[#607887] font-bold capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign out of workspace"
                className="px-3 py-1.5 rounded-xl bg-[rgba(210,224,232,0.45)] hover:bg-rose-100/50 text-[#28485A] hover:text-rose-900 transition-colors text-xs font-bold border border-white/50 shadow-2xs"
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

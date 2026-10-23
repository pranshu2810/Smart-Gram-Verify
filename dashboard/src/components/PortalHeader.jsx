import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f8fafd]/95 backdrop-blur-md border-b border-[#d8e2ec] shadow-xs px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 p-0.5 shadow-xs">
            <div className="w-full h-full bg-[#f8fafd] rounded-[14px] flex items-center justify-center text-lg">
              🏛️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-slate-900 text-base tracking-tight">
                Smart-Gram <span className="text-indigo-600">Verify</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                PMAY-G
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-bold">Rural Housing Inspection & DBT System</p>
          </div>
        </div>

        {/* Authorized Clearance Status (No arbitrary switching - strictly authenticated role) */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 shadow-2xs">
              <span className="text-base">🛡️</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                    Admin Executive Command HQ
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-900 font-extrabold">
                    Apex Clearance
                  </span>
                </div>
                <p className="text-[10px] text-indigo-800 font-medium leading-tight">
                  District Oversight • DBT Grant Disbursements
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 shadow-2xs">
              <span className="text-base">👷</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                    Field Officer Workspace
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-extrabold">
                    Field Clearance
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 font-medium leading-tight">
                  Assigned GP: <strong className="text-emerald-950 font-bold">{user?.panchayat || 'Barkheda'}</strong>, {user?.block || 'Berasia'} Block
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Status & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-800">AI Verification Active</span>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-2xs">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-extrabold text-slate-900 truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-indigo-700 font-bold capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign Out to switch account or portal"
                className="px-3 py-1.5 rounded-xl bg-[#edf2f7] hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors text-xs font-bold border border-[#cbd5e1] hover:border-rose-200"
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

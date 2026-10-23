import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { path: '/admin', label: 'Executive Command', icon: '🛡️', badge: 'HQ' },
  { path: '/risk-map', label: 'Geo Risk & Progress Map', icon: '🗺️', badge: 'Leaflet' },
  { path: '/video-inspector', label: 'AI Video Forensics (Qwen)', icon: '🎥', badge: 'SHA-256' },
  { path: '/spatial-twin', label: '3D Spatial Twin & LiDAR', icon: '🏛️', badge: '3D AI' },
  { path: '/approvals', label: 'Disbursement Approvals', icon: '⚡', badge: 'Action' },
  { path: '/risk-cases', label: 'Fraud & Risk Triage', icon: '🚨' },
  { path: '/beneficiaries', label: 'Beneficiary Directory', icon: '👥' },
  { path: '/inspections', label: 'Inspection Audit', icon: '🔍' },
  { path: '/installments', label: 'DBT Grant Passbook', icon: '💰' },
  { path: '/audit-logs', label: 'Immutable Audit Trail', icon: '📋' },
  { path: '/test-ai', label: 'AI Forensics Lab', icon: '🧪' },
  { path: '/overview', label: 'Operations Analytics', icon: '📊' },
];

const OFFICER_NAV = [
  { path: '/officer', label: 'Field Workspace', icon: '👷', badge: 'Field' },
  { path: '/new-inspection', label: 'Start Stage Inspection', icon: '📸', highlight: true },
  { path: '/risk-map', label: 'Radius Risk Map', icon: '🗺️', badge: 'GPS' },
  { path: '/video-inspector', label: 'Video Walkthrough AI', icon: '🎥', badge: 'Qwen' },
  { path: '/spatial-twin', label: '3D Spatial Twin & LiDAR', icon: '🏛️', badge: '3D AI' },
  { path: '/beneficiaries', label: 'Assigned Beneficiaries', icon: '👥' },
  { path: '/inspections', label: 'My Submitted Evidence', icon: '🔍' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : OFFICER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-[61px] bottom-0 bg-[#f8fafd] border-r border-[#d8e2ec] text-slate-800 transition-all duration-300 z-30 flex flex-col shadow-xs ${
        collapsed ? 'w-[74px]' : 'w-[260px]'
      }`}
    >
      {/* Role Banner */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{isAdmin ? '🛡️' : '👷'}</span>
            <span className="text-xs font-extrabold text-slate-900">
              {isAdmin ? 'Admin Clearance' : 'Field Inspector'}
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
              isAdmin
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            {user?.role}
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-[#edf2f7] border border-transparent'
              } ${item.highlight ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : ''}`
            }
          >
            <div className="flex items-center gap-3 truncate">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </div>
            {!collapsed && item.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e2e8f0] text-slate-800 font-extrabold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-[#d8e2ec] bg-[#edf2f7]">
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-[#f8fafd] border border-[#d8e2ec] shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0 shadow-2xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-700 font-extrabold capitalize">
                {user?.panchayat ? `${user.panchayat} GP Inspector` : `${user?.role} Apex HQ`}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleLogout}
            className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 hover:text-rose-700 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#e2e8f0] transition-all text-xs font-bold"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>
    </aside>
  );
}

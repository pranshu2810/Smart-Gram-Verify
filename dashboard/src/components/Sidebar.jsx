import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { path: '/admin',          label: 'Executive HQ',         icon: '🛡️', badge: 'HQ' },
  { path: '/overview',       label: 'Analytics Overview',   icon: '📊' },
  { path: '/risk-map',       label: 'Geo Risk Telemetry',   icon: '🗺️', badge: 'Live' },
  { path: '/video-inspector',label: 'VLM Forensics Lab',    icon: '🎥', badge: 'AI' },
  { path: '/spatial-twin',   label: '3D Spatial Twin',      icon: '🏛️', badge: '3D' },
  { path: '/approvals',      label: 'DBT Authorizations',   icon: '⚡', badge: 'Action' },
  { path: '/risk-cases',     label: 'Risk & Fraud Triage',  icon: '🚨' },
  { path: '/beneficiaries',  label: 'Beneficiary Register', icon: '👥' },
  { path: '/inspections',    label: 'Field Audit Stream',   icon: '🔍' },
  { path: '/installments',   label: 'DBT Disbursement Log', icon: '💰' },
  { path: '/audit-logs',     label: 'Immutable Audit Trail',icon: '📋' },
  { path: '/test-ai',        label: 'Model Forensics Test', icon: '🧪' },
];

const OFFICER_NAV = [
  { path: '/officer',         label: 'Field Workspace',      icon: '👷', badge: 'Active' },
  { path: '/new-inspection',  label: 'Stage Verification',   icon: '📸', highlight: true },
  { path: '/risk-map',        label: 'Proximity GPS Map',    icon: '🗺️', badge: 'GPS' },
  { path: '/video-inspector', label: 'Video Walkthrough AI', icon: '🎥', badge: 'AI' },
  { path: '/spatial-twin',    label: '3D Spatial Twin',      icon: '🏛️', badge: '3D' },
  { path: '/beneficiaries',   label: 'Assigned Beneficiaries', icon: '👥' },
  { path: '/inspections',     label: 'Submitted Audits',     icon: '🔍' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : OFFICER_NAV;

  return (
    <aside
      className="fixed left-0 bottom-0 flex flex-col transition-all duration-300 z-30 select-none bg-white/85 backdrop-blur-2xl border-r border-slate-200/80 shadow-[4px_0_24px_rgba(15,23,42,0.04)]"
      style={{
        top: '61px',
        width: collapsed ? '70px' : '256px',
      }}
    >
      {/* Top subtle highlight */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      {/* Role Clearance Strip */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={isAdmin ? "micro-aura-cyan" : "micro-aura-emerald"} />
              <span className="text-xs font-bold text-[#0F172A]">
                {isAdmin ? 'Apex Clearance' : 'Field Clearance'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role || 'admin'}
            </span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 border-l-4 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${item.highlight ? 'bg-emerald-50/60 text-emerald-800 border border-emerald-200/80' : ''}`
            }
          >
            <div className="flex items-center gap-2.5 truncate min-w-0">
              <span className="text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </div>
            {!collapsed && item.badge && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs flex-shrink-0">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Collapse */}
      <div className="p-2 border-t border-slate-200/80 bg-white/70">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 mb-2 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-2xs flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-700 font-bold truncate">
                {user?.panchayat ? `${user.panchayat} GP` : 'Apex HQ'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
    </aside>
  );
}

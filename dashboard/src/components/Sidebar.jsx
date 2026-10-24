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
      className="fixed left-0 bottom-0 flex flex-col transition-all duration-300 z-30 select-none glass-sidebar"
      style={{
        top: '61px',
        width: collapsed ? '70px' : '256px',
      }}
    >
      {/* Top subtle highlight */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      {/* Role Clearance Strip */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 p-2.5 rounded-2xl bg-[rgba(255,255,255,0.45)] border border-white/60 shadow-2xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={isAdmin ? "micro-aura-sky" : "micro-aura-teal"} />
              <span className="text-xs font-bold text-[#28485A]">
                {isAdmin ? 'Apex Clearance' : 'Field Clearance'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-[rgba(169,205,224,0.4)] text-[#1E465B] border border-white/50">
              {user?.role || 'admin'}
            </span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-2 px-2.5 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
                isActive
                  ? 'bg-[rgba(169,205,224,0.48)] text-[#1A3644] border border-white/70 shadow-2xs'
                  : 'text-[#607887] hover:text-[#28485A] hover:bg-white/40'
              } ${item.highlight ? 'bg-[rgba(134,200,197,0.3)] text-[#123C3A] border border-[rgba(134,200,197,0.6)]' : ''}`
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
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold bg-white/50 text-[#28485A] border border-white/60 shadow-2xs flex-shrink-0">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Collapse */}
      <div className="p-2 border-t border-white/40 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/40 border border-white/50 mb-2 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[rgba(169,205,224,0.65)] border border-white/60 flex items-center justify-center text-xs font-bold text-[#1E465B] shadow-2xs flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#28485A] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#607887] font-semibold truncate">
                {user?.panchayat ? `${user.panchayat} GP` : 'Apex HQ'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#607887] hover:text-rose-900 hover:bg-rose-100/50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-[#607887] hover:text-[#28485A] hover:bg-white/50 transition-colors text-xs"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
    </aside>
  );
}

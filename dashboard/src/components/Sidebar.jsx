import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { path: '/admin',          label: 'Executive HQ',         icon: '🛡️', badge: 'HQ' },
  { path: '/overview',       label: 'Analytics Stream',     icon: '📊' },
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
      className="fixed left-0 bottom-0 flex flex-col transition-all duration-300 z-30 select-none"
      style={{
        top: '61px',
        width: collapsed ? '70px' : '256px',
        background: '#07090E',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Subtle top edge highlight */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Role Clearance Strip */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={isAdmin ? "micro-aura-cyan" : "micro-aura-emerald"} />
              <span className="text-xs font-semibold text-[#F1F5F9]">
                {isAdmin ? 'Apex Clearance' : 'Field Clearance'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-white/[0.05] text-[#94A3B8] border border-white/[0.06]">
              {user?.role || 'admin'}
            </span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 group ${
                isActive
                  ? 'bg-white/[0.08] text-[#F1F5F9] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/[0.03]'
              }`
            }
          >
            <div className="flex items-center gap-2.5 truncate min-w-0">
              <span className="text-sm opacity-80 group-hover:opacity-100 flex-shrink-0">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </div>
            {!collapsed && item.badge && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-[#94A3B8] border border-white/[0.06] flex-shrink-0">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Collapse */}
      <div className="p-2 border-t border-white/[0.06] bg-[#07090E]/60">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-2">
          <div className="w-7 h-7 rounded-md bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-xs font-semibold text-[#F1F5F9] flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#F1F5F9] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#64748B] font-mono truncate">
                {user?.panchayat ? `${user.panchayat} GP` : 'Govt of India'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-[#FF334B] hover:bg-white/[0.04] transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-white/[0.04] transition-colors text-xs"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
    </aside>
  );
}

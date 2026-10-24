import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { path: '/admin',          label: 'Command Center',       icon: '🛡️', color: '#6366f1', badge: 'HQ' },
  { path: '/overview',       label: 'Analytics Overview',   icon: '📊', color: '#a855f7' },
  { path: '/risk-map',       label: 'Geo Risk Map',         icon: '🗺️', color: '#22d3ee', badge: 'Live' },
  { path: '/video-inspector',label: 'VLM Video Forensics',  icon: '🎥', color: '#f43f5e', badge: 'AI' },
  { path: '/spatial-twin',   label: '3D Digital Twin',      icon: '🏛️', color: '#a855f7', badge: '3D' },
  { path: '/approvals',      label: 'DBT Approvals',        icon: '⚡', color: '#f59e0b', badge: 'Action' },
  { path: '/risk-cases',     label: 'Fraud & Risk Triage',  icon: '🚨', color: '#f43f5e' },
  { path: '/beneficiaries',  label: 'Beneficiary Directory',icon: '👥', color: '#10b981' },
  { path: '/inspections',    label: 'Inspection Audit',     icon: '🔍', color: '#6366f1' },
  { path: '/installments',   label: 'DBT Grant Passbook',   icon: '💰', color: '#10b981' },
  { path: '/audit-logs',     label: 'Immutable Audit Trail',icon: '📋', color: '#94a3b8' },
  { path: '/test-ai',        label: 'AI Forensics Lab',     icon: '🧪', color: '#a855f7', badge: 'Beta' },
];

const OFFICER_NAV = [
  { path: '/officer',         label: 'Field Workspace',      icon: '👷', color: '#10b981', badge: 'Field' },
  { path: '/new-inspection',  label: 'New Stage Inspection', icon: '📸', color: '#22d3ee', highlight: true },
  { path: '/risk-map',        label: 'Radius Risk Map',      icon: '🗺️', color: '#22d3ee', badge: 'GPS' },
  { path: '/video-inspector', label: 'Video Walkthrough AI', icon: '🎥', color: '#f43f5e', badge: 'AI' },
  { path: '/spatial-twin',    label: '3D Spatial Twin',      icon: '🏛️', color: '#a855f7', badge: '3D' },
  { path: '/beneficiaries',   label: 'My Beneficiaries',     icon: '👥', color: '#10b981' },
  { path: '/inspections',     label: 'Submitted Evidence',   icon: '🔍', color: '#6366f1' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : OFFICER_NAV;
  const roleColor = isAdmin ? '#6366f1' : '#10b981';

  return (
    <aside
      className={`fixed left-0 bottom-0 flex flex-col transition-all duration-300 z-30`}
      style={{
        top: '61px',
        width: collapsed ? '72px' : '256px',
        background: 'linear-gradient(180deg, #070b1e 0%, #050814 100%)',
        borderRight: '1px solid rgba(99,102,241,0.12)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Subtle top glow line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${roleColor}60, transparent)` }} />

      {/* Role Banner */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 p-3 rounded-xl animate-fadeIn"
          style={{ background: roleColor + '0d', border: `1px solid ${roleColor}25` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{isAdmin ? '🛡️' : '👷'}</span>
              <span className="text-xs font-bold text-white">{isAdmin ? 'Admin Clearance' : 'Field Inspector'}</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ background: roleColor + '20', border: `1px solid ${roleColor}40`, color: roleColor }}>
              {user?.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
                isActive ? 'nav-active' : 'text-slate-500 hover:text-slate-200'
              } ${item.highlight ? 'animate-borderGlow' : ''}`
            }
            style={({ isActive }) => isActive ? {
              borderLeft: `3px solid ${item.color}`,
              background: `linear-gradient(90deg, ${item.color}18, transparent)`,
              color: item.color,
              boxShadow: `0 0 20px ${item.color}10`,
            } : item.highlight ? {
              background: item.color + '10',
              border: `1px solid ${item.color}30`,
              color: item.color,
            } : {}}
          >
            <div className="flex items-center gap-2.5 truncate min-w-0">
              <span className={`text-base flex-shrink-0 transition-transform duration-200 ${!collapsed ? 'group-hover:scale-110' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </div>
            {!collapsed && item.badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
                style={{ background: item.color + '18', border: `1px solid ${item.color}35`, color: item.color }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-2 border-t" style={{ borderColor: 'rgba(99,102,241,0.1)', background: 'rgba(5,8,20,0.5)' }}>
        <div className="flex items-center gap-2 p-2.5 rounded-xl mb-2"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}90)`, boxShadow: `0 0 12px ${roleColor}50` }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] truncate" style={{ color: roleColor }}>
                {user?.panchayat ? `${user.panchayat} GP` : 'Apex HQ'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-400 transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ ':hover': { background: 'rgba(244,63,94,0.08)' } }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-300 transition-all text-sm"
            style={{ ':hover': { background: 'rgba(99,102,241,0.1)' } }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
    </aside>
  );
}

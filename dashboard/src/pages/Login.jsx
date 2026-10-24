import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PORTALS = [
  {
    id: 'admin',
    label: 'Admin Portal',
    icon: '🛡️',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.4)',
    badge: 'Apex Clearance',
    title: 'Administrative Command Center',
    desc: 'District & Block Officers — DBT approvals and full oversight',
    email: 'admin@smartgram.gov.in',
    pass: 'admin123',
    ctaText: 'Authenticate & Enter Command →',
    quickLabel: '⚡ Instant Admin Access',
    fieldLabel: 'HQ Admin Email',
    passLabel: 'Security Passcode',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  },
  {
    id: 'officer',
    label: 'Field Officer',
    icon: '👷',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    badge: 'Field Clearance',
    title: 'Field Inspector Workspace',
    desc: 'Gram Rozgar Sahayaks — GPS photos & AI stage inspections',
    email: 'rajesh@smartgram.gov.in',
    pass: 'officer123',
    ctaText: 'Open Officer Workspace →',
    quickLabel: '⚡ Officer Rajesh',
    fieldLabel: 'Field Officer Email',
    passLabel: 'Inspector Password',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  {
    id: 'citizen',
    label: 'Citizen Portal',
    icon: '🏛️',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    badge: 'Public Access',
    title: 'Nagarik & Beneficiary Portal',
    desc: 'No login needed — track your housing progress & DBT installments',
    email: '',
    pass: '',
    ctaText: 'Enter Citizen Portal →',
    fieldLabel: '',
    passLabel: '',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  },
];

export default function Login() {
  const [activePortal, setActivePortal] = useState(0);
  const [email, setEmail] = useState(PORTALS[0].email);
  const [password, setPassword] = useState(PORTALS[0].pass);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const portal = PORTALS[activePortal];

  useEffect(() => {
    setEmail(portal.email);
    setPassword(portal.pass);
    setError('');
  }, [activePortal]);

  const handleLogin = async (em, pw) => {
    setError('');
    const result = await login(em || email, pw || password);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/officer', { replace: true });
    } else {
      setError(result.message || 'Invalid government credentials');
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleLogin(); };

  return (
    <div className="min-h-screen bg-space grid-overlay flex items-center justify-center p-4 relative overflow-hidden">
      <div className="stars" />

      {/* Ambient orbs */}
      <div className="fixed pointer-events-none" style={{
        top: '-20%', left: '-10%', width: '600px', height: '600px',
        background: `radial-gradient(circle, ${portal.glow}20 0%, transparent 70%)`,
        filter: 'blur(40px)', transition: 'background 0.6s ease', borderRadius: '50%',
      }} />
      <div className="fixed pointer-events-none" style={{
        bottom: '-20%', right: '-10%', width: '500px', height: '500px',
        background: `radial-gradient(circle, ${portal.glow}15 0%, transparent 70%)`,
        filter: 'blur(40px)', transition: 'background 0.6s ease', borderRadius: '50%',
      }} />

      <div className="w-full max-w-lg relative z-10">

        {/* Back to Landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <span className="text-sm">🇮🇳</span>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Ministry of Rural Development · PMAY-G
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>
            Smart-Gram <span className="text-shimmer">Verify</span>
          </h1>
          <p className="text-sm text-slate-400">AI-Powered Housing Inspection & DBT Platform</p>
        </div>

        {/* Portal Selector */}
        <div className="flex gap-2 mb-6 p-1.5 rounded-2xl animate-fadeInUp"
          style={{ background: 'rgba(5,8,20,0.6)', border: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(20px)', animationDelay: '0.1s' }}>
          {PORTALS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePortal(i)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all duration-300"
              style={activePortal === i ? {
                background: p.gradient,
                color: '#fff',
                boxShadow: `0 4px 20px ${p.glow}60`,
                transform: 'scale(1.02)',
              } : {
                color: '#64748b',
              }}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Auth Card */}
        <div
          className="relative overflow-hidden rounded-2xl animate-fadeInUp"
          style={{
            background: 'linear-gradient(135deg, rgba(13,18,48,0.95) 0%, rgba(9,13,31,0.92) 100%)',
            border: `1px solid ${portal.color}30`,
            boxShadow: `0 0 40px ${portal.color}15, 0 20px 60px rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(24px)',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
            animationDelay: '0.15s',
          }}
        >
          {/* Top accent line */}
          <div className="h-0.5 w-full" style={{ background: portal.gradient }} />

          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-full h-[2px] animate-laser opacity-20"
              style={{ background: `linear-gradient(90deg, transparent, ${portal.color}, transparent)` }} />
          </div>

          <div className="p-8">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
                  style={{ background: portal.color + '15', border: `1px solid ${portal.color}35`, color: portal.color }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: portal.color }} />
                  {portal.badge}
                </span>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>{portal.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{portal.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 animate-float"
                style={{ background: portal.color + '15', border: `1px solid ${portal.color}35`, boxShadow: `0 0 20px ${portal.color}20` }}>
                {portal.icon}
              </div>
            </div>

            {/* Citizen portal — no form */}
            {portal.id === 'citizen' ? (
              <div>
                <div className="space-y-3 mb-7">
                  {[
                    { c: '#10b981', t: '✓ 4-Stage construction photos & AI verification' },
                    { c: '#6366f1', t: '✓ DBT installment receipt & transfer history' },
                    { c: '#f59e0b', t: '✓ Digital approval certificate download' },
                    { c: '#94a3b8', t: '✓ Request reinspection or raise grievance' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium"
                      style={{ background: item.c + '08', border: `1px solid ${item.c}20`, color: item.c }}>
                      {item.t}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/client')}
                  className="w-full py-4 rounded-xl font-bold text-base"
                  style={{ background: portal.gradient, boxShadow: `0 4px 20px ${portal.color}40` }}>
                  🏛️ Enter Citizen Housing Portal →
                </button>
                <p className="text-center text-xs text-slate-500 mt-4">
                  No registration required · Enter Household ID or Aadhaar directly
                </p>
              </div>
            ) : (
              /* Login Form */
              <>
                {error && (
                  <div className="mb-5 p-3 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2 animate-fadeIn"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {portal.fieldLabel}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="input-field"
                      placeholder={portal.email}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {portal.passLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="input-field pr-10"
                        placeholder="••••••••••••"
                      />
                      <button type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-xs">
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-sm mt-2 transition-all duration-300 relative overflow-hidden"
                    style={{ background: portal.gradient, boxShadow: `0 4px 20px ${portal.color}40` }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 30px ${portal.glow}70`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 20px ${portal.color}40`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Credentials...
                      </span>
                    ) : portal.ctaText}
                  </button>
                </form>

                {/* Quick Access */}
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Quick Demo Access:</span>
                    <div className="flex gap-2">
                      {portal.id === 'officer' && (
                        <button
                          onClick={() => handleLogin('sunita@smartgram.gov.in', 'officer123')}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: portal.color + '12', border: `1px solid ${portal.color}30`, color: portal.color }}
                        >
                          ⚡ Sunita
                        </button>
                      )}
                      <button
                        onClick={() => handleLogin(portal.email, portal.pass)}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: portal.color + '12', border: `1px solid ${portal.color}30`, color: portal.color }}
                      >
                        {portal.quickLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Ministry of Rural Development · Smart-Gram Verify · Digital Architecture 2026
        </p>
      </div>
    </div>
  );
}

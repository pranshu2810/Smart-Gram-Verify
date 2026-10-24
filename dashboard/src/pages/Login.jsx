import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PORTALS = [
  {
    id: 'admin',
    label: 'Command HQ',
    icon: '🛡️',
    badge: 'Apex Clearance',
    title: 'Administrative Command Center',
    desc: 'District & Block Executives — DBT approvals, anomaly audits, and governance',
    email: 'admin@smartgram.gov.in',
    pass: 'admin123',
    ctaText: 'Authenticate & Enter HQ',
    quickLabel: 'Demo: Apex Admin',
    fieldLabel: 'Executive Email',
    passLabel: 'Clearance Passcode',
  },
  {
    id: 'officer',
    label: 'Field Terminal',
    icon: '👷',
    badge: 'Field Clearance',
    title: 'Field Inspector Terminal',
    desc: 'Gram Rozgar Sahayaks — GPS-verified photos & AI stage inspections',
    email: 'rajesh@smartgram.gov.in',
    pass: 'officer123',
    ctaText: 'Authenticate Field Inspector',
    quickLabel: 'Demo: Officer Rajesh',
    fieldLabel: 'Officer Email',
    passLabel: 'Terminal Passcode',
  },
  {
    id: 'citizen',
    label: 'Citizen Tracker',
    icon: '🏛️',
    badge: 'Public Access',
    title: 'Nagarik & Beneficiary Portal',
    desc: 'No password required — track housing verification progress & DBT transfers',
    email: '',
    pass: '',
    ctaText: 'Enter Public Tracker →',
    fieldLabel: '',
    passLabel: '',
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
    <div className="min-h-screen bg-gov-command flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Subtle Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none opacity-50" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] mb-6 transition-colors font-mono"
        >
          <span>←</span> Back to Public Overview
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-3 bg-white/[0.03] border border-white/[0.08]">
            <span className="text-xs">🇮🇳</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8]">
              Ministry of Rural Development · PMAY-G
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] tracking-tight font-display">
            Smart-Gram <span className="text-[#94A3B8] font-normal">Verify</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-mono">Executive Command & Autonomous DBT Audit Matrix</p>
        </div>

        {/* Monochromatic Portal Selector */}
        <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-black/40 border border-white/[0.08] backdrop-blur-md">
          {PORTALS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePortal(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activePortal === i
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <span className="text-xs">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Gov-Tech Glass Auth Card */}
        <div className="gov-card p-6 sm:p-7 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={portal.id === 'admin' ? "micro-aura-cyan" : portal.id === 'officer' ? "micro-aura-emerald" : "micro-aura-slate"} />
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                  {portal.badge}
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#F1F5F9]">{portal.title}</h2>
              <p className="text-xs text-[#64748B] mt-0.5">{portal.desc}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-lg flex-shrink-0">
              {portal.icon}
            </div>
          </div>

          {/* Citizen portal — direct jump */}
          {portal.id === 'citizen' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-black/30 border border-white/[0.05] space-y-2 text-xs text-[#94A3B8]">
                <p>✓ 4-Stage construction photo & AI inspection ledger</p>
                <p>✓ DBT installment disbursements & transaction history</p>
                <p>✓ Digital sanction certificate download</p>
                <p>✓ Transparent grievance & reinspection tracker</p>
              </div>
              <button
                onClick={() => navigate('/client')}
                className="w-full gov-btn-primary py-2.5 text-xs font-semibold"
              >
                Enter Public Citizen Tracker →
              </button>
              <p className="text-center text-[11px] text-[#64748B] font-mono">
                No login required · Enter Household ID or Aadhaar
              </p>
            </div>
          ) : (
            /* Login Form */
            <>
              {error && (
                <div className="mb-4 p-2.5 rounded-lg text-xs font-medium text-[#FF334B] bg-[#FF334B]/10 border border-[#FF334B]/30 flex items-center gap-2">
                  <span className="micro-aura-crimson" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    {portal.fieldLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-field font-mono text-xs"
                    placeholder={portal.email}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    {portal.passLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="input-field font-mono text-xs pr-10"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] text-xs"
                    >
                      {showPass ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gov-btn-primary py-2.5 text-xs font-semibold mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 font-mono">
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Verifying Clearance...
                    </span>
                  ) : portal.ctaText}
                </button>
              </form>

              {/* Demo quick access */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-mono text-[11px]">Quick Credentials:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleLogin(portal.email, portal.pass)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[#94A3B8] hover:text-[#F1F5F9] border border-white/[0.08] font-mono text-[11px] transition-colors"
                  >
                    {portal.quickLabel}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#64748B] mt-5 font-mono">
          Ministry of Rural Development · Smart-Gram Verify · Gov-Tech Core
        </p>
      </div>
    </div>
  );
}

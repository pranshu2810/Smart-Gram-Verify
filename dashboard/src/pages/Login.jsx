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
    activeClass: 'bg-[rgba(169,205,224,0.45)] text-[#1A3644] border-white/70',
    btnClass: 'btn-sky',
  },
  {
    id: 'officer',
    label: 'Field Terminal',
    icon: '👷',
    badge: 'Field Clearance',
    title: 'Field Inspector Workspace',
    desc: 'Gram Rozgar Sahayaks — GPS-verified photos & AI stage inspections',
    email: 'rajesh@smartgram.gov.in',
    pass: 'officer123',
    ctaText: 'Authenticate Field Inspector',
    quickLabel: 'Demo: Officer Rajesh',
    fieldLabel: 'Officer Email',
    passLabel: 'Terminal Passcode',
    activeClass: 'bg-[rgba(134,200,197,0.4)] text-[#123C3A] border-white/70',
    btnClass: 'btn-teal',
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
    activeClass: 'bg-[rgba(210,224,232,0.5)] text-[#28485A] border-white/70',
    btnClass: 'btn-secondary',
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
    <div className="min-h-screen bg-glass-canvas text-[#28485A] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Soft Blurred Background Color Shapes */}
      <div className="fixed top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(169, 205, 224, 0.45) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-45 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(134, 200, 197, 0.40) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#607887] hover:text-[#28485A] mb-6 transition-colors font-mono font-bold"
        >
          <span>←</span> Back to Public Overview
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-white/40 border border-white/60 shadow-2xs backdrop-blur-md">
            <span className="text-xs">🇮🇳</span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#28485A]">
              Ministry of Rural Development · PMAY-G
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#28485A] tracking-tight font-display">
            Smart-Gram <span className="text-shimmer">Verify</span>
          </h1>
          <p className="text-xs text-[#607887] mt-1 font-mono font-medium">Executive Command & Autonomous DBT Audit Matrix</p>
        </div>

        {/* Medium-Tone Glass Portal Selector Tabs */}
        <div className="flex gap-1.5 mb-5 p-1 rounded-2xl bg-white/35 border border-white/50 backdrop-blur-md shadow-2xs">
          {PORTALS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePortal(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                activePortal === i
                  ? p.activeClass
                  : 'border-transparent text-[#607887] hover:text-[#28485A] hover:bg-white/25'
              }`}
            >
              <span className="text-xs">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Glassmorphic Auth Card (38% Opacity + 16px Blur) */}
        <div className="card p-6 sm:p-7 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={portal.id === 'admin' ? "micro-aura-sky" : portal.id === 'officer' ? "micro-aura-teal" : "micro-aura-slate"} />
                <span className="text-[11px] font-mono font-bold text-[#28485A] uppercase tracking-wider">
                  {portal.badge}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-[#28485A]">{portal.title}</h2>
              <p className="text-xs text-[#607887] mt-0.5 font-medium">{portal.desc}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
              {portal.icon}
            </div>
          </div>

          {/* Citizen portal — direct jump */}
          {portal.id === 'citizen' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/30 border border-white/50 space-y-2 text-xs text-[#28485A] font-medium backdrop-blur-md">
                <p>✓ 4-Stage construction photo & AI inspection ledger</p>
                <p>✓ DBT installment disbursements & transaction history</p>
                <p>✓ Digital sanction certificate download</p>
                <p>✓ Transparent grievance & reinspection tracker</p>
              </div>
              <button
                onClick={() => navigate('/client')}
                className="w-full btn-sky py-3 text-xs font-bold shadow-sm"
              >
                Enter Public Citizen Tracker →
              </button>
              <p className="text-center text-[11px] text-[#607887] font-mono">
                No login required · Enter Household ID or Aadhaar directly
              </p>
            </div>
          ) : (
            /* Login Form */
            <>
              {error && (
                <div className="mb-4 p-2.5 rounded-xl text-xs font-bold text-rose-900 bg-rose-100/50 border border-rose-300/60 flex items-center gap-2">
                  <span className="micro-aura-crimson" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#607887] mb-1.5">
                    {portal.fieldLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-field font-medium text-xs"
                    placeholder={portal.email}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#607887] mb-1.5">
                    {portal.passLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="input-field font-medium text-xs pr-10"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#607887] hover:text-[#28485A] text-xs font-bold font-mono"
                    >
                      {showPass ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-xs font-bold mt-2 shadow-sm ${portal.btnClass}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 font-mono">
                      <span className="w-3.5 h-3.5 border-2 border-slate-700/40 border-t-slate-800 rounded-full animate-spin" />
                      Verifying Clearance...
                    </span>
                  ) : portal.ctaText}
                </button>
              </form>

              {/* Demo quick access */}
              <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs">
                <span className="text-[#607887] font-mono text-[11px] font-medium">Quick Credentials:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleLogin(portal.email, portal.pass)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg bg-white/40 hover:bg-white/60 text-[#28485A] border border-white/50 font-mono text-[11px] font-bold transition-colors shadow-2xs"
                  >
                    {portal.quickLabel}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#607887] mt-5 font-mono">
          Ministry of Rural Development · Smart-Gram Verify · Gov-Tech Core
        </p>
      </div>
    </div>
  );
}

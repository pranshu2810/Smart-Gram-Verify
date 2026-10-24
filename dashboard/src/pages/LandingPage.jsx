import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '2.4M+', label: 'Beneficiaries Tracked', icon: '👥', color: '#4F46E5' },
  { value: '₹18,600 Cr', label: 'DBT Disbursed', icon: '💰', color: '#059669' },
  { value: '99.4%', label: 'AI Accuracy Rate', icon: '🎯', color: '#0891B2' },
  { value: '28 States', label: 'Coverage Nationwide', icon: '🗺️', color: '#7C3AED' },
];

const FEATURES = [
  { icon: '📸', title: 'Stage-wise AI Inspection', desc: 'GPS-tagged photos at Foundation → Plinth → Lintel → Completion with autonomous computer vision verification', color: '#4F46E5' },
  { icon: '📡', title: 'Offline-First Mobile Field Kit', desc: 'Upload stored records automatically when connectivity returns — zero packet or survey loss in remote rural hamlets', color: '#059669' },
  { icon: '🏛️', title: '3D Spatial Twin Studio', desc: 'LiDAR-assisted photogrammetry reconstruction with structural metrology and metric boundary checks', color: '#7C3AED' },
  { icon: '🎥', title: 'VLM Video AI Forensics', desc: 'Frame-by-frame Qwen 2.5-VL inspection detecting progress tampering and duplicate site footage', color: '#0891B2' },
  { icon: '🔍', title: 'Perceptual Hash Dedup AI', desc: 'Cross-verifies image hashes against 10M+ prior geo-surveys to eliminate ghost beneficiary duplicate claims', color: '#D97706' },
  { icon: '🗺️', title: 'Geo-Radius Risk Heat Map', desc: 'Real-time interactive Leaflet GIS cluster maps flagging high-risk cases, geofence breaches, and disbursement velocity', color: '#E11D48' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gov-command text-slate-800 relative overflow-x-hidden select-none">
      {/* Subtle Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none opacity-40 z-0" />

      {/* Frosted Acrylic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 p-0.5 shadow-sm">
              <div className="w-full h-full bg-white/95 rounded-[14px] flex items-center justify-center text-lg shadow-inner">
                🏛️
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-[#0F172A] text-lg tracking-tight">
                Smart-Gram <span className="text-shimmer">Verify</span>
              </span>
              <div className="text-[10px] text-[#64748B] font-mono font-medium">PMAY-G Autonomous Matrix</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span className="micro-aura-emerald" />
              Vision AI Online
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Ministry of Rural Development · Govt of India
            </span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="gov-btn-primary px-5 py-2.5 text-xs font-bold shadow-md"
          >
            Launch Command HQ →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-white/80 border border-indigo-200/80 shadow-2xs animate-fadeIn">
            <span className="text-sm">🇮🇳</span>
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest font-mono">
              Government of India · Ministry of Rural Development · PMAY-G 2026
            </span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-[#0F172A] font-display">
            Autonomous AI Verification for
            <br />
            <span className="text-shimmer">Rural Housing Delivery</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Next-generation PMAY-G inspection architecture. From GPS-verified multi-angle site photos to
            <strong className="text-[#0F172A] font-bold"> VLM video forensics</strong>, 3D spatial twins, and automated direct benefit transfer releases.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/login')}
              className="gov-btn-primary px-7 py-3.5 text-sm font-bold shadow-md hover:scale-102 transition-all"
            >
              🛡️ Admin Command HQ
            </button>
            <button
              onClick={() => navigate('/login')}
              className="gov-btn-secondary px-7 py-3.5 text-sm font-bold shadow-2xs hover:scale-102 transition-all"
            >
              👷 Field Officer Workspace
            </button>
            <button
              onClick={() => navigate('/client')}
              className="gov-btn-secondary px-7 py-3.5 text-sm font-bold shadow-2xs hover:scale-102 transition-all"
            >
              🏛️ Public Citizen Tracker →
            </button>
          </div>

          {/* Stats Row - Frosted Glass Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className="gov-card p-5 text-center group cursor-default">
                <div className="text-xl mb-1.5 opacity-90">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-extrabold mb-1 text-[#0F172A] font-mono tabular-nums tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs text-slate-600 font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-3 bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
              Engineered Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3 font-display">
              Built for <span className="text-shimmer">Ground Realities</span>
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto font-medium">
              Every AI model, spatial pipeline, and offline storage queue is optimized for rural infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="gov-card p-6 cursor-pointer group"
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2 font-display">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                <div className="mt-4 h-1 rounded-full transition-all duration-300"
                  style={{ background: f.color, width: activeFeature === i ? '100%' : '20%', opacity: activeFeature === i ? 1 : 0.2 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Portals Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2 font-display">
              Three Portals. <span className="text-shimmer">One Cohesive Mission.</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">Distinct clearances for state governance, field inspectors, and rural beneficiaries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Admin Command Center', desc: 'District & Block oversight, DBT disbursement authorizer, fraud triage, risk analytics & audit trails', role: 'admin', cta: 'Enter Admin HQ' },
              { icon: '👷', title: 'Field Officer Workspace', desc: 'GPS photos, stage inspection submission, offline storage sync, AI feedback & assigned beneficiary directory', role: 'officer', cta: 'Open Field Terminal' },
              { icon: '🏛️', title: 'Citizen Housing Tracker', desc: 'Check house completion progress, DBT installment receipts & download digital approval certificates', role: 'citizen', cta: 'Track Housing Status' },
            ].map((p, i) => (
              <div key={i} className="gov-card-hero p-7 text-center group flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 bg-slate-50 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2 font-display">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">{p.desc}</p>
                </div>
                <button
                  onClick={() => p.role === 'citizen' ? navigate('/client') : navigate('/login')}
                  className="w-full gov-btn-primary py-2.5 text-xs font-bold"
                >
                  {p.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-500 font-medium">
        <p>Smart-Gram Verify · Ministry of Rural Development · Pradhan Mantri Awaas Yojana - Gramin (PMAY-G) 2026</p>
      </footer>
    </div>
  );
}

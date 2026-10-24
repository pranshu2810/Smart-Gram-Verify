import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '2.4M+', label: 'Beneficiaries Tracked', icon: '👥', color: 'sky' },
  { value: '₹18,600 Cr', label: 'DBT Disbursed', icon: '💰', color: 'teal' },
  { value: '99.4%', label: 'AI Accuracy Rate', icon: '🎯', color: 'lavender' },
  { value: '28 States', label: 'Coverage Nationwide', icon: '🗺️', color: 'ice' },
];

const FEATURES = [
  { icon: '📸', title: 'Stage-wise AI Inspection', desc: 'GPS-tagged photos at Foundation → Plinth → Lintel → Completion with autonomous computer vision verification', accent: 'border-l-4 border-[#A9CDE0]' },
  { icon: '📡', title: 'Offline-First Mobile Field Kit', desc: 'Upload stored records automatically when connectivity returns — zero packet or survey loss in remote rural hamlets', accent: 'border-l-4 border-[#86C8C5]' },
  { icon: '🏛️', title: '3D Spatial Twin Studio', desc: 'LiDAR-assisted photogrammetry reconstruction with structural metrology and metric boundary checks', accent: 'border-l-4 border-[#B4B8D9]' },
  { icon: '🎥', title: 'VLM Video AI Forensics', desc: 'Frame-by-frame Qwen 2.5-VL inspection detecting progress tampering and duplicate site footage', accent: 'border-l-4 border-[#A9CDE0]' },
  { icon: '🔍', title: 'Perceptual Hash Dedup AI', desc: 'Cross-verifies image hashes against 10M+ prior geo-surveys to eliminate ghost beneficiary duplicate claims', accent: 'border-l-4 border-[#86C8C5]' },
  { icon: '🗺️', title: 'Geo-Radius Risk Heat Map', desc: 'Real-time interactive Leaflet GIS cluster maps flagging high-risk cases, geofence breaches, and disbursement velocity', accent: 'border-l-4 border-[#B4B8D9]' },
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
    <div className="min-h-screen bg-glass-canvas text-[#28485A] relative overflow-x-hidden select-none">
      {/* Soft Blurred Background Color Shapes */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(169, 205, 224, 0.45) 0%, transparent 70%)' }} />
      <div className="fixed top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full pointer-events-none opacity-45 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(134, 200, 197, 0.40) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(180, 184, 217, 0.35) 0%, transparent 70%)' }} />

      {/* Translucent Glass Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-header' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[rgba(169,205,224,0.45)] border border-white/60 p-0.5 shadow-xs flex items-center justify-center text-lg">
              🏛️
            </div>
            <div>
              <span className="font-display font-extrabold text-[#28485A] text-lg tracking-tight">
                Smart-Gram <span className="text-shimmer">Verify</span>
              </span>
              <div className="text-[10px] text-[#607887] font-mono font-medium">PMAY-G Civic Tech Platform</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[rgba(134,200,197,0.25)] text-[#123C3A] border border-white/50 shadow-2xs">
              <span className="micro-aura-teal" />
              Vision AI Online
            </span>
            <span className="text-xs font-semibold text-[#607887]">
              Ministry of Rural Development · Govt of India
            </span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn-sky px-5 py-2.5 text-xs font-bold"
          >
            Launch Command HQ →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-white/40 border border-white/60 shadow-2xs backdrop-blur-md animate-fadeIn">
            <span className="text-sm">🇮🇳</span>
            <span className="text-xs font-bold text-[#28485A] uppercase tracking-widest font-mono">
              Government of India · Ministry of Rural Development · PMAY-G 2026
            </span>
            <span className="w-2 h-2 rounded-full bg-[#86C8C5] animate-pulse" />
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-[#28485A] font-display">
            Autonomous AI Verification for
            <br />
            <span className="text-shimmer">Rural Housing Delivery</span>
          </h1>

          <p className="text-[#607887] text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Next-generation PMAY-G inspection architecture. From GPS-verified multi-angle site photos to
            <strong className="text-[#28485A] font-bold"> VLM video forensics</strong>, 3D spatial twins, and automated direct benefit transfer releases.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/login')}
              className="btn-sky px-7 py-3.5 text-sm font-bold shadow-md hover:scale-102 transition-all"
            >
              🛡️ Admin Command HQ
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-teal px-7 py-3.5 text-sm font-bold shadow-md hover:scale-102 transition-all"
            >
              👷 Field Officer Workspace
            </button>
            <button
              onClick={() => navigate('/client')}
              className="btn-secondary px-7 py-3.5 text-sm font-bold shadow-2xs hover:scale-102 transition-all"
            >
              🏛️ Public Citizen Tracker →
            </button>
          </div>

          {/* Stats Row - Medium-Tone Glass Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className="card p-5 text-center group cursor-default">
                <div className="text-xl mb-1.5 opacity-90">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-extrabold mb-1 text-[#28485A] font-mono tabular-nums tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs text-[#607887] font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-3 bg-[rgba(169,205,224,0.35)] border border-white/50 text-xs font-bold text-[#1A3644]">
              Engineered Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#28485A] mb-3 font-display">
              Built for <span className="text-shimmer">Ground Realities</span>
            </h2>
            <p className="text-[#607887] text-base max-w-2xl mx-auto font-medium">
              Every AI model, spatial pipeline, and offline storage queue is optimized for rural infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`card p-6 cursor-pointer group ${f.accent}`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-white/40 border border-white/60 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[#28485A] mb-2 font-display">{f.title}</h3>
                <p className="text-sm text-[#607887] leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Portals Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#28485A] mb-2 font-display">
              Three Portals. <span className="text-shimmer">One Cohesive Mission.</span>
            </h2>
            <p className="text-xs text-[#607887] font-medium">Distinct clearances for state governance, field inspectors, and rural beneficiaries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Admin Command Center', desc: 'District & Block oversight, DBT disbursement authorizer, fraud triage, risk analytics & audit trails', role: 'admin', cta: 'Enter Admin HQ', btnClass: 'btn-sky' },
              { icon: '👷', title: 'Field Officer Workspace', desc: 'GPS photos, stage inspection submission, offline storage sync, AI feedback & assigned beneficiary directory', role: 'officer', cta: 'Open Field Terminal', btnClass: 'btn-teal' },
              { icon: '🏛️', title: 'Citizen Housing Tracker', desc: 'Check house completion progress, DBT installment receipts & download digital approval certificates', role: 'citizen', cta: 'Track Housing Status', btnClass: 'btn-secondary' },
            ].map((p, i) => (
              <div key={i} className="glass-card-pro p-7 text-center group flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 bg-white/50 border border-white/60 shadow-2xs group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#28485A] mb-2 font-display">{p.title}</h3>
                  <p className="text-xs text-[#607887] leading-relaxed mb-6 font-medium">{p.desc}</p>
                </div>
                <button
                  onClick={() => p.role === 'citizen' ? navigate('/client') : navigate('/login')}
                  className={`w-full py-2.5 text-xs font-bold ${p.btnClass}`}
                >
                  {p.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/40 bg-white/20 backdrop-blur-md text-center text-xs text-[#607887] font-medium">
        <p>Smart-Gram Verify · Ministry of Rural Development · Pradhan Mantri Awaas Yojana - Gramin (PMAY-G) 2026</p>
      </footer>
    </div>
  );
}

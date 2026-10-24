import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '2.4M+', label: 'Beneficiaries Tracked', icon: '👥', color: '#6366f1' },
  { value: '₹18,600 Cr', label: 'DBT Disbursed', icon: '💰', color: '#10b981' },
  { value: '99.2%', label: 'AI Accuracy Rate', icon: '🎯', color: '#a855f7' },
  { value: '28 States', label: 'Coverage Nationwide', icon: '🗺️', color: '#22d3ee' },
];

const FEATURES = [
  { icon: '📸', title: 'Stage-wise AI Inspection', desc: 'GPS-tagged photos at Foundation → Plinth → Lintel → Completion with ML verification', color: '#6366f1' },
  { icon: '📡', title: 'Offline-First Mobile', desc: 'Upload stored records automatically when connectivity returns — zero data loss', color: '#10b981' },
  { icon: '🏛️', title: '3D Digital Twin', desc: 'NeRF-powered spatial reconstruction with civil metrology and dimension verification', color: '#a855f7' },
  { icon: '🎥', title: 'VLM Video Forensics', desc: 'Frame-by-frame AI analysis detecting progress gaps and construction anomalies', color: '#22d3ee' },
  { icon: '🔍', title: 'Beneficiary Dedup AI', desc: 'Cross-verify duplicate claims, previously received benefits and eligibility flags', color: '#f59e0b' },
  { icon: '🗺️', title: 'Geo Risk Heat Map', desc: 'Real-time cluster maps showing fraud risk, pending approvals and block progress', color: '#f43f5e' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState('0');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    // Just animate display
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      if (frame >= total) { setCount(target); clearInterval(timer); }
      else setCount(target.slice(0, Math.ceil((frame / total) * target.length)) || '0');
    }, 30);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: Math.random() * 3 + 1 + 'px',
        height: Math.random() * 3 + 1 + 'px',
        background: ['#6366f1','#a855f7','#22d3ee','#10b981'][Math.floor(Math.random()*4)],
        animation: `particleDrift ${3 + Math.random() * 4}s ease-out infinite`,
        animationDelay: Math.random() * 3 + 's',
        opacity: 0.7,
        ...style,
      }}
    />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-space grid-overlay relative overflow-x-hidden">
      <div className="stars" />

      {/* Ambient Glow Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-0 left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#050814]/90 backdrop-blur-xl border-b border-[rgba(99,102,241,0.2)] shadow-lg shadow-[rgba(0,0,0,0.5)]' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl animate-neonPulse"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }} />
              <div className="relative w-full h-full rounded-xl flex items-center justify-center text-xl">🏛️</div>
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight" style={{ fontFamily: 'Outfit' }}>
                Smart-Gram <span className="text-shimmer">Verify</span>
              </span>
              <div className="text-[10px] text-slate-500 font-medium">PMAY-G AI Platform</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Systems Online
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
              🇮🇳 Ministry of Rural Development
            </span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Launch Portal →
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <Particle key={i} style={{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }} />
        ))}

        {/* Central Glow Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full animate-rotateSlow opacity-10"
            style={{ border: '1px solid rgba(99,102,241,0.6)', boxShadow: '0 0 60px rgba(99,102,241,0.3)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{ border: '1px dashed rgba(168,85,247,0.4)', animation: 'orbitRing 15s linear infinite reverse' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fadeInUp"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}>
            <span className="text-sm">🇮🇳</span>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Government of India • Ministry of Rural Development • PMAY-G 2026
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight animate-fadeInUp"
            style={{ fontFamily: 'Outfit', animationDelay: '0.1s' }}>
            <span className="text-white">Digital Intelligence for</span>
            <br />
            <span className="text-shimmer">Rural Housing</span>
            <br />
            <span className="text-white">at Scale</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}>
            AI-powered inspection of PMAY-G housing works — from GPS-tagged field photos to 
            <strong className="text-slate-200"> 3D digital twins</strong>, fraud detection, and 
            <strong className="text-slate-200"> ₹1.5L DBT disbursement</strong> — all on one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-8 py-4 text-base animate-neonPulse"
            >
              🛡️ Admin Command Portal
            </button>
            <button
              onClick={() => navigate('/login')}
              className="glass-btn-emerald px-8 py-4 text-base"
            >
              👷 Field Officer Workspace
            </button>
            <button
              onClick={() => navigate('/client')}
              className="btn-secondary px-8 py-4 text-base"
            >
              🏛️ Citizen Portal →
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}>
            {STATS.map((s, i) => (
              <div key={i} className="card p-5 text-center group cursor-default"
                style={{ borderColor: s.color + '33', boxShadow: `0 0 20px ${s.color}15, 0 4px 20px rgba(0,0,0,0.4)` }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-black mb-1"
                  style={{ color: s.color, fontFamily: 'Outfit', textShadow: `0 0 20px ${s.color}80` }}>
                  {s.value}
                </div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-indigo-400 animate-pulse" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">Platform Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
              Built for <span className="text-shimmer">Real India</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every feature engineered for the ground realities of rural housing inspection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="glass-card-pro p-6 cursor-pointer group"
                style={{
                  borderColor: activeFeature === i ? f.color + '60' : 'rgba(99,102,241,0.15)',
                  boxShadow: activeFeature === i ? `0 0 30px ${f.color}25, 0 8px 32px rgba(0,0,0,0.5)` : '0 8px 32px rgba(0,0,0,0.4)',
                  transition: 'all 0.4s ease',
                }}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: f.color + '1a', border: `1px solid ${f.color}40`, boxShadow: `0 0 20px ${f.color}20` }}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="mt-4 h-0.5 rounded-full transition-all duration-300"
                  style={{ background: `linear-gradient(90deg, ${f.color}, transparent)`, width: activeFeature === i ? '100%' : '30%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTAL CARDS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              Three Portals. <span className="text-shimmer">One Mission.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Admin Command Center', desc: 'District-level oversight, DBT approvals, fraud triage, risk analytics & immutable audit trails', color: '#6366f1', role: 'admin', cta: 'Enter Admin Portal' },
              { icon: '👷', title: 'Field Officer Workspace', desc: 'GPS photo uploads, stage inspections, offline sync, AI verification & assigned beneficiaries', color: '#10b981', role: 'officer', cta: 'Open Field Workspace' },
              { icon: '🏛️', title: 'Citizen Housing Portal', desc: 'Check construction progress, DBT installment status & download digital certificates — no login needed', color: '#f59e0b', role: 'citizen', cta: 'View My House Status' },
            ].map((p, i) => (
              <div key={i} className="relative glass-card-pro p-8 text-center group overflow-hidden"
                style={{ borderColor: p.color + '30' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${p.color}10 0%, transparent 60%)` }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-5 animate-float"
                    style={{ animationDelay: `${i * 0.5}s`, background: p.color + '1a', border: `1px solid ${p.color}40`, boxShadow: `0 0 30px ${p.color}25` }}>
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Outfit' }}>{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{p.desc}</p>
                  <button
                    onClick={() => p.role === 'citizen' ? navigate('/client') : navigate('/login')}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 group-hover:shadow-lg"
                    style={{
                      background: p.color + '1a',
                      border: `1px solid ${p.color}40`,
                      color: p.color,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = p.color + '30';
                      e.currentTarget.style.boxShadow = `0 0 20px ${p.color}40`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = p.color + '1a';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {p.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card-pro p-12 relative overflow-hidden"
            style={{ borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.5)' }}>
            <div className="absolute inset-0 animate-laser opacity-30"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.1) 50%, transparent 100%)', height: '40%' }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
                Ready to <span className="text-shimmer-gold">Transform</span> Rural Housing Oversight?
              </h2>
              <p className="text-slate-400 mb-8">
                Join the national platform trusted by thousands of field officials across 28 states
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary px-10 py-4 text-base animate-neonPulse"
              >
                🚀 Launch Smart-Gram Verify
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(99,102,241,0.1)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <div>
              <span className="text-sm font-bold text-white">Smart-Gram Verify</span>
              <div className="text-xs text-slate-500">Ministry of Rural Development • PMAY-G Digital Platform</div>
            </div>
          </div>
          <div className="text-xs text-slate-600 text-center">
            Built with AI · 3D Digital Twins · Offline-First · Geo Intelligence · 2026
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

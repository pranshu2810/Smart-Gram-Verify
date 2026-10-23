import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'officer' | 'citizen'
  const [email, setEmail] = useState('admin@smartgram.gov.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setEmail('admin@smartgram.gov.in');
      setPassword('admin123');
    } else if (tab === 'officer') {
      setEmail('rajesh@smartgram.gov.in');
      setPassword('officer123');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    const result = await login(demoEmail, demoPass);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/officer', { replace: true });
      }
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/officer', { replace: true });
      }
    } else {
      setError(result.message || 'Invalid government credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-mesh p-4 sm:p-6 relative">
      <div className="w-full max-w-xl animate-fadeIn relative z-10">
        {/* Top National PMAY-G Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f8fafd] border border-[#d8e2ec] shadow-2xs mb-3">
            <span className="text-sm">🇮🇳</span>
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Ministry of Rural Development • PMAY-G
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Smart-Gram <span className="text-indigo-600">Verify</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto font-medium">
            AI-Powered Digital Housing Inspection & Stage-wise Direct Benefit Transfer (DBT) System
          </p>
        </div>

        {/* Multi-Portal Selector Tabs */}
        <div className="flex p-1.5 bg-slate-200/80 rounded-2xl mb-5 shadow-xs border border-slate-300">
          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <span>🛡️</span>
            <span>Admin Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('officer')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'officer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <span>👷</span>
            <span>Officer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('citizen')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'citizen'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <span>🏛️</span>
            <span>Citizen Portal</span>
          </button>
        </div>

        {/* Tab 1: ADMIN LOGIN */}
        {activeTab === 'admin' && (
          <div className="card p-6 sm:p-8 border-indigo-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="badge bg-indigo-50 text-indigo-800 border-indigo-200">
                  Apex Headquarters Clearance
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 mt-1.5">
                  Administrative Command Center
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  For District & Block Officers approving stage grant disbursements
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-2xl">
                🛡️
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  HQ Admin Email ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="admin@smartgram.gov.in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Security Passcode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-sm font-bold shadow-md mt-2"
              >
                {loading ? 'Verifying HQ Credentials...' : 'Authenticate & Enter Admin Command →'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-700 font-bold">1-Click Fast Access:</span>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@smartgram.gov.in', 'admin123')}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200 shadow-2xs transition-all"
              >
                ⚡ Instant Login as Admin
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: FIELD OFFICER LOGIN */}
        {activeTab === 'officer' && (
          <div className="card p-6 sm:p-8 border-emerald-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="badge bg-emerald-50 text-emerald-800 border-emerald-200">
                  Field Inspector Access
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 mt-1.5">
                  Field Officer Workspace
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  For Gram Rozgar Sahayaks recording GPS photos & AI inspections
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">
                👷
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Field Officer Email ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="rajesh@smartgram.gov.in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Inspector Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Panchayat:</span>
                  <strong className="text-slate-900">Barkheda GP, Berasia Block</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Offline Camera & Sync:</span>
                  <strong className="text-emerald-700 font-bold">READY</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-btn-emerald py-3.5 text-sm font-bold shadow-md mt-2"
              >
                {loading ? 'Connecting Device...' : 'Open Officer Workspace →'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-700 font-bold">1-Click Fast Access:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rajesh@smartgram.gov.in', 'officer123')}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200 transition-all"
                >
                  ⚡ Officer Rajesh
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('sunita@smartgram.gov.in', 'officer123')}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200 transition-all"
                >
                  ⚡ Officer Sunita
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CITIZEN DIRECT ACCESS */}
        {activeTab === 'citizen' && (
          <div className="card p-6 sm:p-8 border-amber-200 animate-fadeIn text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl mx-auto mb-4">
              🏛️
            </div>

            <span className="badge bg-amber-50 text-amber-800 border-amber-200">
              No Password Needed
            </span>

            <h3 className="text-2xl font-display font-extrabold text-slate-900 mt-3">
              Nagarik & Beneficiary Public Portal
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed font-medium">
              ग्रामीण आवास के हितग्राही सीधे अपनी <strong>Household ID</strong> या <strong>आधार नंबर</strong> डालकर अपनी निर्माण प्रगति एवं ₹1,50,000 की DBT किस्तों का विवरण देख सकते हैं।
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <span>✓</span> 4-चरण निर्माण फोटो एवं AI सत्यापन स्थिति
              </div>
              <div className="flex items-center gap-2 text-indigo-800 font-bold">
                <span>✓</span> बैंक खाते में DBT किस्त जमा होने की रसीद
              </div>
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <span>✓</span> डिजिटल स्वीकृति प्रमाण-पत्र डाउनलोड करें
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <span>✓</span> पुनः निरीक्षण या समस्या हेतु ऑनलाइन अनुरोध
              </div>
            </div>

            <button
              onClick={() => navigate('/client')}
              className="w-full glass-btn-amber py-4 text-base font-extrabold shadow-md"
            >
              🏛️ Open Citizen Housing Portal Directly →
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          Ministry of Rural Development • Smart-Gram Verify Digital Architecture • 2026
        </p>
      </div>
    </div>
  );
}

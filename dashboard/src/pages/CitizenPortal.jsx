import { useState } from 'react';
import api from '../api/axios';

const STAGES = [
  { key: 'Foundation', nameEn: 'Stage 1: Foundation', nameHi: 'चरण १: नींव स्तर', amount: 50000, desc: 'Trench excavation, stone masonry, footing' },
  { key: 'Plinth', nameEn: 'Stage 2: Plinth Level', nameHi: 'चरण २: कुर्सी स्तर', amount: 40000, desc: 'Damp-proof course & plinth beam casting' },
  { key: 'Lintel', nameEn: 'Stage 3: Lintel Level', nameHi: 'चरण ३: छत स्तर', amount: 30000, desc: 'Wall masonry up to lintel, door/window frames' },
  { key: 'Completion', nameEn: 'Stage 4: Completion', nameHi: 'चरण ४: पूर्ण आवास', amount: 30000, desc: 'Roof slab, plastering, whitewash & doors' }
];

export default function CitizenPortal() {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showCert, setShowCert] = useState(false);
  const [grievanceSent, setGrievanceSent] = useState(false);
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceStage, setGrievanceStage] = useState('Plinth');

  const handleSearch = async (searchVal) => {
    const val = (searchVal !== undefined ? searchVal : query).trim();
    if (!val) {
      setError(lang === 'hi' ? 'कृपया अपनी Household ID, आधार अंतिम 4 अंक, या मोबाइल नंबर दर्ज करें।' : 'Please enter your Household ID, last 4 digits of Aadhaar, or registered phone.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/beneficiaries/public/track?query=${encodeURIComponent(val)}`);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      } else {
        setError(lang === 'hi' ? 'इस विवरण से कोई हितग्राही रिकॉर्ड नहीं मिला।' : 'No beneficiary record found matching these credentials.');
        setData(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (lang === 'hi'
          ? 'हितग्राही रिकॉर्ड नहीं मिला। कृपया अपनी Household ID या आधार नंबर पुनः जांचें।'
          : 'Beneficiary record not found. Please verify your Household ID or credentials.')
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExitSession = () => {
    setData(null);
    setQuery('');
    setError('');
    setGrievanceSent(false);
  };

  const b = data?.beneficiary;
  const inspections = data?.inspections || [];
  const installments = data?.installments || [];

  const totalSanctioned = b?.estimatedCost || 150000;
  const disbursedTotal = installments
    .filter(i => i.status === 'disbursed' || i.status === 'approved')
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  const pendingAmount = Math.max(0, totalSanctioned - disbursedTotal);

  const getStageStatus = (stageKey) => {
    const insp = inspections.find(i => i.officerSelectedStage === stageKey);
    if (!insp) return { status: 'upcoming', label: lang === 'hi' ? 'प्रतीक्षित' : 'Upcoming', color: 'slate' };
    if (insp.status === 'verified' || insp.status === 'approved') {
      return { status: 'verified', label: lang === 'hi' ? 'सत्यापित एवं स्वीकृत' : 'Verified & Approved', color: 'emerald', insp };
    }
    if (insp.status === 'pending') {
      return { status: 'pending', label: lang === 'hi' ? 'समीक्षाधीन (AI)' : 'Under AI Review', color: 'amber', insp };
    }
    if (insp.status === 'rejected') {
      return { status: 'rejected', label: lang === 'hi' ? 'पुनः निरीक्षण आवश्यक' : 'Requires Reinspection', color: 'rose', insp };
    }
    return { status: 'in_progress', label: lang === 'hi' ? 'प्रक्रिया में' : 'In Progress', color: 'cyan', insp };
  };

  return (
    <div className="min-h-screen bg-surface-mesh text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="stars" />
      {/* Top Banner & Language Selector */}
      <div className="max-w-6xl mx-auto mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-[#090d22] rounded-[14px] flex items-center justify-center text-xl">
                🏛️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-extrabold border border-amber-500/30">
                  PMAY-G • भारत सरकार
                </span>
                <span className="text-xs text-indigo-300 font-extrabold">Digital Gramin Awaas</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-0.5">
                {lang === 'hi' ? 'प्रधानमंत्री ग्रामीण आवास योजना — नागरिक सेवा पोर्टल' : 'PMAY-G Citizen Housing & DBT Tracker'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {b && (
              <button
                onClick={handleExitSession}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 font-bold border border-slate-700 hover:border-rose-500/40 transition-all"
              >
                ← {lang === 'hi' ? 'सुरक्षित लॉगआउट' : 'Exit / New Search'}
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">भाषा:</span>
              <div className="flex bg-[#050814] p-1 rounded-xl border border-indigo-500/30">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('hi')}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${lang === 'hi' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 1: PRIVATE LOOKUP (When no beneficiary is loaded) */}
      {!b && (
        <div className="max-w-2xl mx-auto my-12 animate-fadeIn relative z-10">
          <div className="card glass-card-pro p-8 sm:p-10 border border-indigo-500/30 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl mx-auto mb-4">
              🔐
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'नागरिक व्यक्तिगत आवास सत्यापन' : 'Citizen Personal Housing Verification'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed font-medium">
              {lang === 'hi'
                ? 'गोपनीयता सुरक्षा के अंतर्गत आप केवल अपना आवास रिकॉर्ड देख सकते हैं। अपनी पंजीयन संख्या (Household ID), आधार अंतिम ४ अंक, या पंजीकृत मोबाइल नंबर दर्ज करें।'
                : 'For strict privacy protection, you can only access your own individual record. Enter your Sanctioned Household ID, last 4 digits of Aadhaar, or registered phone number.'}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="mt-6 space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'hi' ? 'पंजीयन संख्या / आधार (अंतिम ४) / मोबाइल नंबर:' : 'Household ID / Aadhaar Last 4 / Mobile Number:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    🔍
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. HH-BRK-001 या 4523 या 9876543210' : 'e.g. HH-BRK-001, 4523, or 9876543210'}
                    className="input-field pl-11 py-3.5 text-base font-semibold font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-base font-bold shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>{lang === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying Record...'}</span>
                ) : (
                  <span>🔍 {lang === 'hi' ? 'सत्यापित करें एवं आवास स्थिति देखें →' : 'Verify & Track Housing Record →'}</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-[#d8e2ec] text-left text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">
                {lang === 'hi' ? '💡 अपनी पंजीयन संख्या कैसे प्राप्त करें?' : '💡 How to find your Household ID?'}
              </p>
              <p>
                {lang === 'hi'
                  ? '• यह आपके PMAY-G स्वीकृति पत्र (Sanction Letter) के शीर्ष पर "HH-XXX-XXX" के प्रारूप में अंकित होता है।'
                  : '• Look at the top of your PMAY-G Sanction Letter for the code in format "HH-XXX-XXX".'}
              </p>
              <p>
                {lang === 'hi'
                  ? '• यदि आपके पास Household ID नहीं है, तो आवेदन में दर्ज आधार कार्ड के अंतिम ४ अंक या मोबाइल नंबर से खोजें।'
                  : '• If you do not have your Household ID, simply enter the last 4 digits of your Aadhaar card or registered phone.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: CITIZEN'S OWN VERIFIED RECORD (Only shown when citizen authenticated) */}
      {b && (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
          {/* Active Citizen Session Strip */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-600 font-medium">
                {lang === 'hi' ? 'सक्रिय नागरिक सत्र:' : 'Active Beneficiary Session:'}
              </span>
              <strong className="text-slate-900 font-extrabold text-sm">{b.name}</strong>
              <span className="font-mono text-indigo-700 font-extrabold">({b.householdId})</span>
            </div>
            <button
              onClick={handleExitSession}
              className="text-xs px-3 py-1 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold border border-slate-300 hover:border-rose-300 transition-all"
            >
              ← {lang === 'hi' ? 'सुरक्षित लॉगआउट' : 'Exit / Search Another Record'}
            </button>
          </div>

          {/* Beneficiary Header Card */}
          <div className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-3xl text-white shadow-md flex-shrink-0">
                  🏠
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-display font-extrabold text-slate-900">{b.name}</h3>
                    <span className="badge badge-verified">
                      ✓ {lang === 'hi' ? 'सत्यापित हितग्राही' : 'Verified Beneficiary'}
                    </span>
                    <span className="badge bg-slate-200 text-slate-800 border-slate-300 font-bold">
                      {b.category || 'General'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 font-medium">
                    {lang === 'hi' ? 'पिता / पति:' : 'Father / Husband:'} <strong>{b.fatherName}</strong> • {lang === 'hi' ? 'ग्राम पंचायत:' : 'GP:'} <strong>{b.village}</strong>, {b.block} Block, {b.district} District
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Household ID: <strong className="text-indigo-700">{b.householdId}</strong> • Aadhaar: XXXX-XXXX-{b.aadhaarLast4 || '****'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowCert(true)}
                  className="glass-btn-emerald py-2.5 px-4 text-xs font-bold shadow-sm"
                >
                  📜 {lang === 'hi' ? 'स्वीकृति प्रमाण-पत्र देखें' : 'View Sanction Certificate'}
                </button>
                <a
                  href="#grievance"
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  📢 {lang === 'hi' ? 'निरीक्षण हेतु अनुरोध' : 'Request Field Visit'}
                </a>
              </div>
            </div>

            {/* Financial Overview Progress Bar */}
            <div className="mt-8 pt-6 border-t border-[#d8e2ec]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'hi' ? 'कुल स्वीकृत अनुदान राशि:' : 'Total Sanctioned Grant:'} <strong className="text-slate-900 text-sm">₹{totalSanctioned.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  {lang === 'hi' ? 'बैंक खाते में जमा:' : 'Transferred to Bank:'} <strong>₹{disbursedTotal.toLocaleString('en-IN')}</strong> ({Math.round((disbursedTotal / totalSanctioned) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-3.5 rounded-full overflow-hidden border border-[#cbd5e1]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${Math.min(100, (disbursedTotal / totalSanctioned) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 font-bold mt-2">
                <span>{lang === 'hi' ? '४ किस्तों में प्रत्यक्ष लाभ अंतरण (DBT)' : 'Disbursed in 4 Stages via Aadhaar DBT'}</span>
                <span>{lang === 'hi' ? 'शेष राशि:' : 'Pending Balance:'} ₹{pendingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 4-Stage Construction Visual Roadmap */}
          <div className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-900">
                  {lang === 'hi' ? '४-चरण निर्माण प्रगति एवं AI सत्यापन' : '4-Stage Construction & AI Verification Roadmap'}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {lang === 'hi'
                    ? 'प्रत्येक चरण पूरा होने पर ग्राम रोजगार सहायक द्वारा जीपीएस फोटो ली जाती है और AI द्वारा सत्यापन के बाद किस्त स्वीकृत होती है।'
                    : 'Each completed stage is verified by Officer GPS photos and Gemini Vision AI before release of installment.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {STAGES.map((stg, i) => {
                const info = getStageStatus(stg.key);
                const insp = info.insp;
                const photoUrl = insp?.evidence?.[0]?.cloudinaryUrl;

                return (
                  <div
                    key={stg.key}
                    className={`rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                      info.status === 'verified'
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : info.status === 'pending'
                        ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                        : 'bg-[#edf2f7]/60 border-[#d8e2ec]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-slate-500">#{i + 1}</span>
                        <span className={`badge badge-${info.color}`}>
                          {info.label}
                        </span>
                      </div>

                      <h4 className="font-display font-extrabold text-slate-900 text-base">
                        {lang === 'hi' ? stg.nameHi : stg.nameEn}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {stg.desc}
                      </p>

                      <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-[#f8fafd] border border-[#d8e2ec] text-xs text-indigo-700 font-bold shadow-2xs">
                        ₹{stg.amount.toLocaleString('en-IN')} {lang === 'hi' ? 'किस्त' : 'Payout'}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200">
                      {photoUrl ? (
                        <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-200 group">
                          <img
                            src={photoUrl}
                            alt={stg.key}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white font-mono flex items-center justify-between">
                            <span>GPS VERIFIED</span>
                            <span>{new Date(insp.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center rounded-lg bg-[#edf2f7] border border-dashed border-[#cbd5e1] text-xs text-slate-600 font-medium">
                          <span>📷 {lang === 'hi' ? 'फोटो प्रतीक्षित' : 'Awaiting Inspection'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DBT Passbook / Installment Ledger */}
          <div className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
            <h3 className="text-xl font-display font-extrabold text-slate-900 mb-1">
              {lang === 'hi' ? 'प्रत्यक्ष लाभ अंतरण (DBT) पासबुक विवरण' : 'Direct Benefit Transfer (DBT) Installment History'}
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-6">
              {lang === 'hi'
                ? 'आधार-लिंक्ड बैंक खाते (Aadhaar Payment Bridge System) में हस्तांतरित किस्तों की आधिकारिक रसीद एवं UTR संदर्भ संख्या'
                : 'Official electronic transfer records linked to your verified bank account'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#edf2f7] border-b border-[#d8e2ec]">
                  <tr>
                    <th className="text-left py-3.5 px-4 text-xs font-extrabold text-slate-800">किस्त संख्या</th>
                    <th className="text-left py-3.5 px-4 text-xs font-extrabold text-slate-800">चरण (Milestone)</th>
                    <th className="text-left py-3.5 px-4 text-xs font-extrabold text-slate-800">राशि (Amount)</th>
                    <th className="text-left py-3.5 px-4 text-xs font-extrabold text-slate-800">हस्तांतरण स्थिति</th>
                    <th className="text-left py-3.5 px-4 text-xs font-extrabold text-slate-800">बैंक UTR संदर्भ</th>
                    <th className="text-left py-3.5 px-4 text-xs font-extrabold text-slate-800">दिनांक (Date)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#1st Installment</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">Foundation (नींव)</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹50,000</td>
                    <td className="py-3.5 px-4"><span className="badge badge-verified">✓ जमा हो गया (Disbursed)</span></td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-bold">UTR-RBI-PMAY-892341</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">12-Jan-2026</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#2nd Installment</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">Plinth (कुर्सी स्तर)</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹40,000</td>
                    <td className="py-3.5 px-4"><span className="badge badge-pending">⏳ समीक्षाधीन (Under Review)</span></td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold">Pending Approval</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">In Process</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#3rd Installment</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">Lintel (छत)</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-700">₹30,000</td>
                    <td className="py-3.5 px-4"><span className="badge badge-low">प्रतीक्षित (Upcoming)</span></td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">—</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">Upcoming</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#4th Installment</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">Completion (पूर्ण आवास)</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-700">₹30,000</td>
                    <td className="py-3.5 px-4"><span className="badge badge-low">प्रतीक्षित (Upcoming)</span></td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">—</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">Upcoming</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grievance / Request Inspection Form */}
          <div id="grievance" className="card p-6 sm:p-8 bg-[#f8fafd] border border-[#d8e2ec] shadow-sm">
            <h3 className="text-xl font-display font-extrabold text-slate-900 mb-1">
              {lang === 'hi' ? 'नागरिक सहायता एवं पुनः निरीक्षण अनुरोध' : 'Citizen Assistance & Inspection Request'}
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-6">
              {lang === 'hi'
                ? 'यदि आपका निर्माण पूरा हो गया है और अधिकारी का आगमन नहीं हुआ है, तो यहाँ तुरंत अनुरोध भेजें।'
                : 'Request an urgent field visit from your Panchayat Gram Rozgar Sahayak if your stage is ready.'}
            </p>

            {grievanceSent ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-fadeIn">
                <div className="text-4xl mb-2">✅</div>
                <h4 className="text-lg font-bold text-emerald-900">
                  {lang === 'hi' ? 'अनुरोध सफलतापूर्वक दर्ज हो गया है!' : 'Inspection Request Successfully Registered!'}
                </h4>
                <p className="text-xs text-emerald-800 mt-1 font-semibold">
                  Ticket Reference: <strong className="font-mono">REQ-SG-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  {lang === 'hi'
                    ? 'संबंधित पंचायत अधिकारी को सूचित कर दिया गया है। अगले ४८ घंटों में निरीक्षण सम्पन्न होगा।'
                    : 'The Block Development Officer and Field Inspector have been notified.'}
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setGrievanceSent(true);
                }}
                className="space-y-4 max-w-2xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'hi' ? 'निरीक्षण हेतु चरण:' : 'Ready Stage for Inspection:'}
                    </label>
                    <select
                      value={grievanceStage}
                      onChange={(e) => setGrievanceStage(e.target.value)}
                      className="input-field py-2.5 text-sm"
                    >
                      <option value="Foundation">Stage 1: Foundation (नींव)</option>
                      <option value="Plinth">Stage 2: Plinth (कुर्सी)</option>
                      <option value="Lintel">Stage 3: Lintel (छत)</option>
                      <option value="Completion">Stage 4: Completion (पूर्ण आवास)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'hi' ? 'संपर्क मोबाइल नंबर:' : 'Contact Mobile Number:'}
                    </label>
                    <input
                      type="tel"
                      defaultValue={b.phone || '9111111111'}
                      className="input-field py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'hi' ? 'टिप्पणी / समस्या का विवरण:' : 'Message / Details:'}
                  </label>
                  <textarea
                    rows={3}
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. कुर्सी स्तर का काम पूरा हो गया है, कृपया अधिकारी भेजें।' : 'e.g. Plinth masonry is completed with curing done. Please schedule inspection.'}
                    className="input-field text-sm"
                  />
                </div>

                <button type="submit" className="btn-primary px-6 py-3 text-sm font-bold shadow-md">
                  📤 {lang === 'hi' ? 'अनुरोध प्रेषित करें' : 'Submit Inspection Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Digital Sanction Certificate Modal */}
      {showCert && b && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#f8fafd] border border-[#d8e2ec] rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setShowCert(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold"
            >
              ✕
            </button>

            <div className="text-center border-b border-[#d8e2ec] pb-5">
              <div className="text-3xl mb-1">🇮🇳</div>
              <p className="text-xs tracking-widest uppercase text-amber-700 font-extrabold">
                Government of India • Ministry of Rural Development
              </p>
              <h3 className="text-xl font-display font-extrabold text-slate-900 mt-1">
                Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)
              </h3>
              <p className="text-xs text-emerald-700 font-bold mt-0.5">
                Digital Sanction Order & Housing Verification Certificate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 text-xs font-medium">
              <div>
                <span className="text-slate-500">Beneficiary Name:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{b.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Household ID:</span>
                <p className="text-sm font-bold text-indigo-700 font-mono mt-0.5">{b.householdId}</p>
              </div>
              <div>
                <span className="text-slate-500">Father / Husband:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{b.fatherName}</p>
              </div>
              <div>
                <span className="text-slate-500">Location:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{b.village}, {b.block}, {b.district}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Approved Amount:</span>
                <p className="text-base font-extrabold text-emerald-700 mt-0.5">₹{totalSanctioned.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500">Geofence Coordinates:</span>
                <p className="text-xs font-mono text-slate-700 font-bold mt-0.5">
                  {b.registeredLocation?.latitude || '23.6345'}, {b.registeredLocation?.longitude || '77.4231'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-[#cbd5e1] rounded-lg p-1 flex items-center justify-center text-slate-900 font-mono text-[9px] font-bold text-center">
                  QR VERIFIED
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  <p className="text-slate-900 font-bold">Digitally Signed & Blockchain Anchored</p>
                  <p>Smart-Gram AI Audit Hash: <span className="font-mono text-indigo-600 font-bold">0x7f8a...92b4</span></p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                🖨️ Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

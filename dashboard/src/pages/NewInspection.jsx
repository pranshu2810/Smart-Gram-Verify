import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NewInspection() {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [stage, setStage] = useState('Foundation');
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1); // 1=form, 2=result
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Getting GPS...');

  useEffect(() => {
    fetchBeneficiaries();
    getGPS();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const { data } = await api.get('/beneficiaries', { params: { limit: 100 } });
      setBeneficiaries(data.data || []);
    } catch (err) { console.error(err); }
  };

  const getGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
          setGpsStatus(`📍 ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)}m)`);
        },
        () => {
          // Fallback: use demo coordinates near Bhopal
          setGpsCoords({ latitude: 23.6345, longitude: 77.4231, accuracy: 15, simulated: true });
          setGpsStatus('📍 23.6345, 77.4231 (Simulated — Barkheda, Bhopal)');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setGpsCoords({ latitude: 23.6345, longitude: 77.4231, accuracy: 15, simulated: true });
      setGpsStatus('📍 23.6345, 77.4231 (Simulated)');
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBeneficiary) return alert('Select a beneficiary');
    if (photos.length === 0 && !videoFile) return alert('Upload at least one photo or walkthrough video');
    if (!gpsCoords) return alert('GPS not ready');

    setSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('beneficiaryId', selectedBeneficiary);
      formData.append('officerSelectedStage', stage);
      formData.append('latitude', gpsCoords.latitude.toString());
      formData.append('longitude', gpsCoords.longitude.toString());
      formData.append('accuracy', (gpsCoords.accuracy || 10).toString());
      formData.append('deviceTimestamp', new Date().toISOString());
      formData.append('officerNotes', 'Submitted from dashboard');
      formData.append('isOfflineCreated', 'false');

      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      if (videoFile) {
        formData.append('video', videoFile);
      }

      const { data } = await api.post('/inspections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      setResult(data);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (level) => ({
    LOW: 'text-emerald-600', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600'
  }[level] || 'text-gray-600');

  const getRiskBg = (level) => ({
    LOW: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500'
  }[level] || 'bg-gray-500');

  const selectedBen = beneficiaries.find(b => b._id === selectedBeneficiary);

  // ──── STEP 2: RESULT ────
  if (step === 2 && result) {
    const insp = result.data;
    const v = result.verification || {};
    const risk = insp.riskScore || {};
    const ai = insp.evidence?.[0]?.aiAnalysis || {};
    const dup = insp.evidence?.[0]?.duplicateCheck || {};
    const fake = insp.evidence?.[0]?.fakeImageCheck || {};
    const gps = v.gps || insp.gpsVerification || {};
    const ts = v.timestamp || insp.timestampVerification || {};

    return (
      <div className="space-y-5 animate-fadeIn max-w-4xl">
        <button onClick={() => { setStep(1); setResult(null); setPhotos([]); setPreviews([]); }} className="text-sm text-gray-500 hover:text-gray-700">← Submit Another</button>

        {/* SUCCESS HEADER */}
        <div className={`card border-l-4 ${risk.score > 50 ? 'border-l-red-500 bg-red-50/30' : risk.score > 25 ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-emerald-500 bg-emerald-50/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">✅ Inspection Submitted Successfully!</h1>
              <p className="text-sm text-gray-500 mt-1">{selectedBen?.name} — {stage} — ID: #{insp._id?.slice(-6).toUpperCase()}</p>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${getRiskBg(risk.level)} flex items-center justify-center`}>
              <span className="text-2xl font-black text-white">{risk.score || 0}</span>
            </div>
          </div>
          <p className={`text-sm font-semibold mt-2 ${getRiskColor(risk.level)}`}>
            Risk Level: {risk.level || 'N/A'} ({risk.score || 0}/100)
          </p>
        </div>

        {/* ⚖️ DUAL-EVIDENCE AI SYNTHESIS BANNER (Photo + Video Average) */}
        <div className="card p-5 bg-[#f8fafd] border-2 border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Dual-Evidence AI Synthesis &amp; Composite Average</h4>
                <p className="text-[11px] text-slate-500">Ensemble average of Photo (YOLOv8) + Walkthrough Video (Qwen 2.5-VL)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-100 text-indigo-800">
              {insp.dualEvidenceSynthesis?.finalVerdict || 'DUAL_SYNTHESIZED'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">📸 Photo Risk</span>
              <span className="text-base font-extrabold text-slate-800">{insp.dualEvidenceSynthesis?.photoRiskScore ?? risk.score}/100</span>
              <span className="text-[10px] text-slate-500 block truncate">{ai.detectedStage || stage}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">🎥 Video Risk</span>
              <span className="text-base font-extrabold text-purple-700">{insp.dualEvidenceSynthesis?.videoRiskScore ?? (insp.videoEvidence?.aiGeneratedRiskScore || 0)}/100</span>
              <span className="text-[10px] text-slate-500 block truncate">{insp.videoEvidence?.verdict || 'No Video'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[10px] text-indigo-700 uppercase font-bold block">⚖️ Final Average</span>
              <span className="text-base font-black text-indigo-900">{risk.score || 0}/100</span>
              <span className="text-[10px] font-bold text-indigo-700 block">[{risk.level || 'LOW'}]</span>
            </div>
          </div>

          {insp.dualEvidenceSynthesis?.synthesisReasoning && (
            <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-indigo-900">Synthesis: </span>{insp.dualEvidenceSynthesis.synthesisReasoning}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* AI ANALYSIS */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">🤖 AI Analysis (Gemini Vision)</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Officer Stage</span><span className="font-semibold">{stage}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">AI Detected Stage</span><span className="font-semibold">{ai.detectedStage || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Confidence</span><span className="font-semibold">{ai.confidence ? `${Math.round(ai.confidence)}%` : '—'}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stage Mismatch</span>
                <span className={`font-bold ${insp.stageMismatch ? 'text-red-600' : 'text-emerald-600'}`}>
                  {insp.stageMismatch ? '⚠️ YES — Mismatch!' : '✅ No Mismatch'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Suspicious Evidence</span>
                <span className={ai.suspiciousEvidence ? 'text-red-600 font-bold' : 'text-emerald-600'}>{ai.suspiciousEvidence ? '⚠️ Suspicious' : '✅ Clean'}</span>
              </div>
              {ai.observations?.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">AI Observations:</p>
                  {ai.observations.map((o, i) => <p key={i} className="text-xs text-gray-600">• {o}</p>)}
                </div>
              )}
              {ai.reason && <p className="text-xs text-gray-400 italic mt-2">"{ai.reason}"</p>}
            </div>
          </div>

          {/* GPS */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 GPS Geofencing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Within Geofence</span>
                <span className={`font-bold ${gps.withinFence ? 'text-emerald-600' : 'text-red-600'}`}>
                  {gps.withinFence ? '✅ Yes — Inside fence' : '❌ No — Outside fence'}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Distance from Registered Site</span><span className="font-semibold">{gps.distance || 0}m</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Max Allowed Radius</span><span className="font-semibold">{gps.maxRadius || 200}m</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GPS Risk</span><span className={`font-semibold ${gps.risk === 'HIGH' ? 'text-red-600' : gps.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>{gps.risk || 'LOW'}</span></div>
            </div>
          </div>

          {/* TIMESTAMP */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">⏰ Timestamp Verification</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Valid</span>
                <span className={`font-bold ${ts.valid ? 'text-emerald-600' : 'text-red-600'}`}>{ts.valid ? '✅ Valid' : '⚠️ Issues Detected'}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Device Time</span><span className="text-xs font-mono">{new Date().toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Server Time</span><span className="text-xs font-mono">{new Date(insp.serverTimestamp).toLocaleString('en-IN')}</span></div>
              {ts.issues?.map((issue, i) => (
                <div key={i} className="p-2 bg-amber-50 rounded text-xs text-amber-700">⚠️ {issue.message || JSON.stringify(issue)}</div>
              ))}
            </div>
          </div>

          {/* DUPLICATE + FAKE */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📸 Photo Integrity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Exact Duplicate</span>
                <span className={`font-bold ${dup.isExactDuplicate ? 'text-red-600' : 'text-emerald-600'}`}>{dup.isExactDuplicate ? '🚨 DUPLICATE FOUND!' : '✅ Unique'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Similar Photo</span>
                <span className={`font-bold ${dup.isSimilar ? 'text-amber-600' : 'text-emerald-600'}`}>{dup.isSimilar ? '⚠️ Similar Found' : '✅ No matches'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">AI-Generated Suspicion</span>
                <span className={`font-bold ${fake.isSuspicious ? 'text-red-600' : 'text-emerald-600'}`}>{fake.isSuspicious ? `⚠️ Suspicious (${fake.confidence}%)` : '✅ Looks Real'}</span>
              </div>
              {fake.flags?.length > 0 && (
                <div className="p-2 bg-red-50 rounded">
                  {fake.flags.map((f, i) => <p key={i} className="text-xs text-red-600">• {f}</p>)}
                </div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">SHA-256</span><span className="text-[10px] font-mono text-gray-400">{insp.evidence?.[0]?.sha256?.slice(0, 24)}...</span></div>
            </div>
          </div>
        </div>

        {/* RISK FACTORS */}
        {risk.factors?.length > 0 && (
          <div className="card border-amber-200">
            <h3 className="text-sm font-semibold text-amber-700 mb-3">⚠️ Risk Factors Breakdown</h3>
            <div className="space-y-2">
              {risk.factors.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{f.factor}</p>
                      <p className="text-xs text-gray-500">{f.detail}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-600">+{Math.round(f.score)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOADED PHOTO */}
        {previews.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📷 Uploaded Evidence</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {previews.map((url, i) => (
                <img key={i} src={url} alt={`Evidence ${i+1}`} className="rounded-lg w-full aspect-[4/3] object-cover border border-gray-200" />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate(`/inspections/${insp._id}`)} className="btn-primary text-sm">📋 View Full Inspection</button>
          <button onClick={() => navigate('/inspections')} className="btn-secondary text-sm">📊 All Inspections</button>
          <button onClick={() => { setStep(1); setResult(null); setPhotos([]); setPreviews([]); }} className="btn-secondary text-sm">🔄 Submit Another</button>
        </div>
      </div>
    );
  }

  // ──── STEP 1: FORM ────
  return (
    <div className="space-y-5 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="page-title">🔍 New Inspection</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a construction photo → AI analyzes stage → GPS/timestamp verified → Risk score calculated</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">1️⃣ Select Beneficiary & Stage</div>
        <span className="text-gray-300">→</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">2️⃣ Upload Photo</div>
        <span className="text-gray-300">→</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">3️⃣ See AI Results</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Beneficiary Selection */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Select Beneficiary</h3>
          <select value={selectedBeneficiary} onChange={(e) => setSelectedBeneficiary(e.target.value)} className="input-field">
            <option value="">— Choose beneficiary —</option>
            {beneficiaries.map(b => (
              <option key={b._id} value={b._id}>{b.name} — {b.village}, {b.district} ({b.category})</option>
            ))}
          </select>
          {selectedBen && (
            <div className="mt-3 p-3 bg-primary-50/50 rounded-lg text-sm space-y-1 animate-fadeIn">
              <p className="font-semibold text-gray-800">{selectedBen.name}</p>
              <p className="text-gray-500">S/o {selectedBen.fatherName}</p>
              <p className="text-gray-500">{selectedBen.village}, {selectedBen.block}, {selectedBen.district}</p>
              <p className="text-primary-600 text-xs font-semibold">{selectedBen.schemeName} • {selectedBen.category} • ₹{selectedBen.estimatedCost?.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>

        {/* Stage & GPS */}
        <div className="card p-6 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">🏗️ Target Construction Stage</h3>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {['Foundation', 'Plinth', 'Lintel', 'Completion'].map((s, i) => {
              const icons = ['🏗️', '🧱', '🪟', '🏠'];
              const amounts = ['₹50,000 Grant', '₹40,000 Grant', '₹30,000 Grant', '₹30,000 Grant'];
              return (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={`p-3 rounded-xl text-left transition-all border-2 ${
                    stage === s
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="text-xl">{icons[i]}</span>
                  <p className="text-sm font-bold mt-1 text-slate-900">{s}</p>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">{amounts[i]}</p>
                </button>
              );
            })}
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-xs font-bold text-emerald-800">{gpsStatus}</p>
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2">📷 Upload Construction Site Evidence</h3>
        <p className="text-xs text-slate-600 font-medium mb-3">
          Capture a photo of the construction site or upload from device. Analyzed in real-time by the Gemini Vision AI pipeline.
        </p>

        <label className={`block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          photos.length > 0
            ? 'border-emerald-500 bg-emerald-50/40'
            : 'border-slate-300 bg-slate-50 hover:border-indigo-500 hover:bg-indigo-50/30'
        }`}>
          <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
          {photos.length > 0 ? (
            <div>
              <p className="text-emerald-800 font-bold text-sm">✅ {photos.length} photo(s) selected & ready for analysis</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Click to change or select additional photos</p>
            </div>
          ) : (
            <div>
              <p className="text-3xl mb-2">📸</p>
              <p className="text-sm text-slate-900 font-bold">Click to upload geo-tagged construction photo</p>
              <p className="text-xs text-slate-500 font-bold mt-1">JPEG, PNG or WebP up to 10MB</p>
            </div>
          )}
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {previews.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Preview ${i+1}`}
                className="rounded-xl w-full aspect-[4/3] object-cover border border-slate-200 shadow-xs"
              />
            ))}
          </div>
        )}
      </div>

      {/* Walkthrough Video Upload (Optional / Multi-Modal Ensemble) */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🎥</span> Walkthrough Video Evidence (Ensemble AI)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
            Qwen 2.5-VL + OpenCV
          </span>
        </div>
        <p className="text-xs text-slate-600 font-medium mb-3">
          Attach a 3D site walkthrough video. Qwen 2.5-VL video forensics will evaluate keyframes and calculate a synthesized composite average with the photo evidence.
        </p>

        <label className={`block w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          videoFile
            ? 'border-purple-500 bg-purple-50/40'
            : 'border-slate-300 bg-slate-50 hover:border-purple-500 hover:bg-purple-50/20'
        }`}>
          <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
          {videoFile ? (
            <div>
              <p className="text-purple-800 font-bold text-sm">📹 Video Selected: {videoName}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">Ready for OpenCV keyframe extraction and dual-evidence synthesis</p>
            </div>
          ) : (
            <div>
              <p className="text-2xl mb-1.5">🎬</p>
              <p className="text-xs text-slate-900 font-bold">Upload 360° Walkthrough Video (MP4 / WebM / MOV)</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Optional — Combines with photo for weighted consensus score</p>
            </div>
          )}
        </label>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !selectedBeneficiary || (photos.length === 0 && !videoFile)}
        className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all shadow-md ${
          submitting
            ? 'bg-amber-500 text-white cursor-wait'
            : !selectedBeneficiary || photos.length === 0
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
            : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Uploading → AI Multi-Modal Inspection → Geofence Verification...
          </span>
        ) : (
          '🚀 Submit Inspection — Run Full AI Verification Pipeline'
        )}
      </button>

      {/* How it works */}
      <div className="card bg-surface-900 text-white border-0">
        <h3 className="text-sm font-semibold mb-3">🔬 What happens when you submit:</h3>
        <div className="grid md:grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2"><span>1️⃣</span><span>Photo uploaded to server (Cloudinary if configured)</span></div>
          <div className="flex items-start gap-2"><span>2️⃣</span><span>SHA-256 + Perceptual Hash computed for duplicate detection</span></div>
          <div className="flex items-start gap-2"><span>3️⃣</span><span>Gemini Vision AI analyzes construction stage</span></div>
          <div className="flex items-start gap-2"><span>4️⃣</span><span>GPS coordinates compared against registered house location</span></div>
          <div className="flex items-start gap-2"><span>5️⃣</span><span>Device timestamp vs server timestamp drift checked</span></div>
          <div className="flex items-start gap-2"><span>6️⃣</span><span>Fake/AI-generated image statistical analysis runs</span></div>
          <div className="flex items-start gap-2"><span>7️⃣</span><span>Duplicate photo check against all previous inspections</span></div>
          <div className="flex items-start gap-2"><span>8️⃣</span><span>Composite risk score (0-100) calculated from all signals</span></div>
        </div>
      </div>
    </div>
  );
}

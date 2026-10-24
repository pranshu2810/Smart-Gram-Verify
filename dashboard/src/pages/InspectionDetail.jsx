import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { StatusBadge, RiskBadge } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import ThreeSpatialTwin from '../components/ThreeSpatialTwin';

export default function InspectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [show3DTwin, setShow3DTwin] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState(null);

  useEffect(() => { fetchInspection(); }, [id]);

  const fetchInspection = async () => {
    try {
      const { data } = await api.get(`/inspections/${id}`);
      setInspection(data.data);
      if (data.data?.videoEvidence?.keyframes?.length > 0) {
        setSelectedKeyframe(data.data.videoEvidence.keyframes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    setSubmitting(true);
    try {
      await api.put(`/inspections/${id}/review`, { status, reviewNotes });
      await fetchInspection();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttachVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('numKeyframes', '5');
      const { data } = await api.post(`/inspections/${id}/attach-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      if (data.success) {
        await fetchInspection();
        alert('Walkthrough video analyzed and synthesized with photo evidence!');
      }
    } catch (err) {
      alert('Attach video failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSimulateVideo = async (type) => {
    setUploadingVideo(true);
    try {
      const videoUrl = type === 'fraud'
        ? 'DEMO_SCREEN_RECORDING_FRAUD_STREAM'
        : 'DEMO_AUTHENTIC_WALKTHROUGH_PMAYG';
      const { data } = await api.post(`/inspections/${id}/attach-video`, {
        videoUrl,
        numKeyframes: 5
      });
      if (data.success) {
        await fetchInspection();
      }
    } catch (err) {
      alert('Video simulation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingVideo(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading inspection...</div>;
  if (!inspection) return <div className="text-center py-16 text-gray-400">Inspection not found</div>;

  const ev = inspection.evidence?.[0] || {};
  const ai = ev.aiAnalysis || {};
  const ben = inspection.beneficiaryId || {};
  const video = inspection.videoEvidence || {};

  const hasRealVideo = Boolean(
    video.verdict ||
    video.sha256 ||
    (inspection.dualEvidenceSynthesis && inspection.dualEvidenceSynthesis.hasVideoEvidence && inspection.dualEvidenceSynthesis.videoRiskScore !== null)
  );

  // Dual-Evidence Synthesis fallback if older record
  const synth = inspection.dualEvidenceSynthesis || {
    hasPhotoEvidence: Boolean(inspection.evidence?.length > 0),
    hasVideoEvidence: hasRealVideo,
    photoRiskScore: inspection.riskScore?.score || 18,
    photoVerdict: inspection.stageMismatch ? 'PHOTO_STAGE_MISMATCH' : 'PHOTO_VERIFIED',
    photoDetectedStage: inspection.aiDetectedStage || inspection.officerSelectedStage,
    photoConfidence: ev.yolov8?.confidence || 85,
    videoRiskScore: hasRealVideo ? (video.aiGeneratedRiskScore ?? 0) : null,
    videoVerdict: hasRealVideo ? (video.verdict || 'AUTHENTIC') : 'AWAITING_VIDEO_WALKTHROUGH',
    videoDetectedStage: hasRealVideo ? (video.detectedStage || '—') : '—',
    videoConfidence: hasRealVideo ? (video.authenticityConfidence || 85) : null,
    stageAgreement: true,
    mathematicalAverage: inspection.riskScore?.score || 18,
    finalCompositeScore: inspection.riskScore?.score || 18,
    finalRiskLevel: inspection.riskScore?.level || 'LOW',
    finalVerdict: hasRealVideo ? 'DUAL_EVALUATED' : 'PHOTO_ONLY_VERIFIED',
    finalDecision: (inspection.riskScore?.score || 18) <= 25 ? 'APPROVE' : ((inspection.riskScore?.score || 18) > 50 ? 'REJECT' : 'MANUAL_REVIEW'),
    synthesisReasoning: hasRealVideo
      ? 'Dual evidence evaluated across photo and walkthrough video.'
      : 'Evaluated on photo evidence. Walkthrough video can be attached below.'
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-5xl">
      <button onClick={() => navigate(-1)} className="text-sm text-[#607887] hover:text-[#28485A] font-bold">← Back</button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl text-[#28485A]">Inspection #{inspection._id?.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-[#607887] font-medium mt-1">{ben.name} — {ben.village}, {ben.district}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={inspection.status} />
          <RiskBadge score={inspection.riskScore?.score} level={inspection.riskScore?.level} />
        </div>
      </div>

      {/* ⚖️ DUAL-EVIDENCE AI SYNTHESIS HERO CARD (Photo + Video Ensemble Average) */}
      <div className={`card p-5 sm:p-6 border shadow-md relative overflow-hidden transition-all ${
        synth.finalVerdict === 'CRITICAL_FRAUD_FLAGGED'
          ? 'bg-rose-100/40 border-rose-300'
          : synth.finalVerdict === 'MEDIA_DISCREPANCY_FLAGGED'
          ? 'bg-[#B4B8D9]/30 border-[#B4B8D9]/60'
          : synth.finalVerdict === 'DUAL_CONSENSUS_VERIFIED'
          ? 'bg-[#86C8C5]/25 border-[#86C8C5]/60'
          : 'border-white/50'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 text-[#28485A] flex items-center justify-center text-2xl shadow-xs backdrop-blur-md flex-shrink-0">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#28485A] bg-[#A9CDE0]/30 px-2 py-0.5 rounded-md border border-white/50">
                  Dual-Evidence AI Synthesis
                </span>
                <span className="text-[11px] text-[#607887] font-semibold font-mono">
                  Ensemble: Photo YOLOv8 + Video Qwen 2.5-VL
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#28485A] mt-0.5">
                Composite Result: Image 📸 + Walkthrough Video 🎥
              </h2>
            </div>
          </div>

          <div>
            {synth.finalVerdict === 'DUAL_CONSENSUS_VERIFIED' && (
              <span className="badge badge-teal py-1.5 px-3.5 text-xs shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#86C8C5] animate-pulse" />
                ✓ Dual-Consensus Verified
              </span>
            )}
            {synth.finalVerdict === 'CRITICAL_FRAUD_FLAGGED' && (
              <span className="badge badge-critical py-1.5 px-3.5 text-xs shadow-xs flex items-center gap-1.5 animate-pulse">
                <span>🚨</span> Critical Fraud Override
              </span>
            )}
            {synth.finalVerdict === 'MEDIA_DISCREPANCY_FLAGGED' && (
              <span className="badge badge-lavender py-1.5 px-3.5 text-xs shadow-xs flex items-center gap-1.5">
                <span>⚠️</span> Modality Discrepancy
              </span>
            )}
            {(!['DUAL_CONSENSUS_VERIFIED', 'CRITICAL_FRAUD_FLAGGED', 'MEDIA_DISCREPANCY_FLAGGED'].includes(synth.finalVerdict)) && (
              <span className="badge badge-sky py-1.5 px-3.5 text-xs shadow-xs">
                ⚖️ Composite Evaluated
              </span>
            )}
          </div>
        </div>

        {/* 3-Column Modality Breakdown & Average Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
          {/* Column 1: Photo Evidence AI */}
          <div className="p-4 rounded-xl bg-white/40 border border-white/50 shadow-xs backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/30">
              <span className="text-xs font-bold text-[#28485A] flex items-center gap-1.5">
                <span>📸</span> 1. Photo AI Analysis
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/40 text-[#607887]">
                YOLOv8 + DeepGuard
              </span>
            </div>
            <div className="space-y-1.5 text-xs mt-2.5">
              <div className="flex justify-between">
                <span className="text-[#607887]">Detected Stage:</span>
                <strong className="text-[#28485A] font-bold">{synth.photoDetectedStage || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607887]">DeepGuard Synthetic:</span>
                <strong className={(ev.deepGuard?.deepGuardScore || 0) > 40 ? 'text-rose-600 font-bold' : 'text-[#28485A]'}>
                  {ev.deepGuard?.deepGuardScore || 0}/100
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607887]">Stage Match:</span>
                <strong className={ev.yolov8?.mismatch ? 'text-rose-600' : 'text-[#28485A]'}>
                  {ev.yolov8?.mismatch ? '⚠️ Mismatch' : '✓ Matches Claim'}
                </strong>
              </div>
              <div className="pt-2 border-t border-white/30 flex items-center justify-between">
                <span className="font-bold text-[#28485A]">Photo Risk Score:</span>
                <span className={`text-base font-extrabold ${synth.photoRiskScore > 40 ? 'text-rose-600' : 'text-[#28485A]'}`}>
                  {synth.photoRiskScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Video Evidence AI */}
          <div className="p-4 rounded-xl bg-white/40 border border-white/50 shadow-xs backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/30">
              <span className="text-xs font-bold text-[#28485A] flex items-center gap-1.5">
                <span>🎥</span> 2. Video AI Analysis
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                hasRealVideo ? 'bg-[#B4B8D9]/40 text-[#28485A] font-bold' : 'bg-white/40 text-[#607887] font-semibold'
              }`}>
                {hasRealVideo ? 'Qwen 2.5-VL + OpenCV' : '⏳ Awaiting Video'}
              </span>
            </div>
            <div className="space-y-1.5 text-xs mt-2.5">
              <div className="flex justify-between">
                <span className="text-[#607887]">Video Verdict:</span>
                {hasRealVideo ? (
                  <strong className={`font-mono text-[11px] truncate max-w-[140px] ${
                    video.verdict === 'SCREEN_RECORDING_FRAUD' || video.isAIGeneratedSuspect
                      ? 'text-rose-600'
                      : video.verdict === 'AUTHENTIC_PHYSICAL_SITE'
                      ? 'text-[#28485A]'
                      : 'text-[#607887]'
                  }`}>
                    {video.verdict || synth.videoVerdict || 'AUTHENTIC'}
                  </strong>
                ) : (
                  <span className="font-semibold text-[#607887] text-[11px] bg-white/40 px-2 py-0.5 rounded border border-white/40">
                    Pending Walkthrough
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-[#607887]">Detected Milestone:</span>
                <strong className="text-[#28485A] font-bold">
                  {hasRealVideo ? (video.detectedStage || synth.videoDetectedStage || '—') : 'Not Analyzed'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607887]">Optical Flow:</span>
                <strong className="text-[#28485A] font-mono text-[10px]">
                  {hasRealVideo ? (video.opticalFlowVerdict || 'NATURAL_HANDHELD') : '—'}
                </strong>
              </div>
              <div className="pt-2 border-t border-white/30 flex items-center justify-between">
                <span className="font-bold text-[#28485A]">Video Risk Score:</span>
                {hasRealVideo && synth.videoRiskScore !== null && synth.videoRiskScore !== undefined ? (
                  <span className={`text-base font-extrabold ${synth.videoRiskScore > 40 ? 'text-rose-600' : 'text-[#28485A]'}`}>
                    {synth.videoRiskScore}/100
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#607887] bg-white/40 px-2 py-0.5 rounded-md border border-white/50">
                    Pending Video Upload
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Composite Average & Decision */}
          <div className="p-4 rounded-xl bg-white/40 border border-white/50 shadow-xs backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/30">
                <span className="text-xs font-bold text-[#28485A] flex items-center gap-1.5">
                  <span>⚖️</span> 3. Synthesized Average
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#A9CDE0] text-[#28485A]">
                  {hasRealVideo ? 'Dual Modality Average' : 'Single Modality (Photo)'}
                </span>
              </div>

              <div className="mt-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-[#607887]">
                  <span>{hasRealVideo ? 'Math Average:' : 'Modality Basis:'}</span>
                  {hasRealVideo && synth.videoRiskScore !== null ? (
                    <span className="font-mono font-semibold text-[#28485A]">
                      ({synth.photoRiskScore} + {synth.videoRiskScore}) / 2 = <strong>{synth.mathematicalAverage}/100</strong>
                    </span>
                  ) : (
                    <span className="font-semibold text-[#28485A]">
                      Photo Only ({synth.photoRiskScore}/100)
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-[#607887]">
                  <span>Cross-Modal Agreement:</span>
                  {hasRealVideo ? (
                    <strong className={synth.stageAgreement ? 'text-[#28485A]' : 'text-amber-700'}>
                      {synth.stageAgreement ? '✓ Photo & Video Agree' : '⚠️ Modality Mismatch (+15)'}
                    </strong>
                  ) : (
                    <span className="text-[#607887] italic text-[11px]">Awaiting Walkthrough Video</span>
                  )}
                </div>
                <div className="flex justify-between text-[#607887]">
                  <span>Admin Directive:</span>
                  <strong className={`font-mono font-bold ${
                    synth.finalDecision === 'APPROVE' ? 'text-[#28485A]' : synth.finalDecision === 'REJECT' ? 'text-rose-600' : 'text-amber-700'
                  }`}>
                    {synth.finalDecision}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/30 flex items-center justify-between mt-2">
              <div>
                <span className="text-[11px] font-bold text-[#28485A] block">Unified Risk Score:</span>
                <span className="text-[10px] text-[#607887] font-mono">Governs DBT Release</span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${
                  synth.finalCompositeScore > 50 ? 'text-rose-600' : synth.finalCompositeScore > 25 ? 'text-amber-600' : 'text-[#28485A]'
                }`}>
                  {synth.finalCompositeScore}/100
                </span>
                <span className="text-[10px] font-bold text-[#607887] block">
                  [{synth.finalRiskLevel}]
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Forensic Reasoning Explainer Box */}
        {synth.synthesisReasoning && (
          <div className="mt-3.5 p-3 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-indigo-900">Civil &amp; Media Synthesis Explanation: </span>
            <span>{synth.synthesisReasoning}</span>
          </div>
        )}

        {/* Video Forensic Details & Keyframe Carousel (if video exists) */}
        {video.keyframes?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>🎞️</span> Walkthrough Video Keyframes Extracted by OpenCV:
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                SHA-256: {video.sha256?.slice(0, 16)}...
              </span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {video.keyframes.map((kf, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedKeyframe(kf)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 w-28 bg-slate-100 ${
                    selectedKeyframe?.keyframeIndex === kf.keyframeIndex ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={kf.base64 ? `data:image/jpeg;base64,${kf.base64}` : kf.url}
                    alt={`Frame ${kf.keyframeIndex}`}
                    className="w-full h-16 object-cover"
                    onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect fill="%23e2e8f0" width="100" height="60"/><text x="50%" y="50%" text-anchor="middle" fill="%2364748b" font-size="10">Keyframe</text></svg>'; }}
                  />
                  <div className="p-1 bg-white text-[9px] text-slate-600 flex justify-between font-mono">
                    <span>#{kf.keyframeIndex + 1}</span>
                    <span>{kf.timestampSec?.toFixed(1)}s</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Qwen Observations Bullet points */}
            {video.qwenForensicExplanation?.length > 0 && (
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800 block mb-1">🤖 Qwen-2.5-VL Architectural Observations:</span>
                <ul className="space-y-0.5">
                  {video.qwenForensicExplanation.map((obs, i) => (
                    <li key={i} className="text-slate-600 flex items-start gap-1.5 text-[11px]">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Walkthrough Video Attach & Interactive Simulation Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="btn-secondary py-1.5 px-3 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
              <span>📹</span> {uploadingVideo ? 'Analyzing Video with Qwen...' : 'Attach Walkthrough Video'}
              <input
                type="file"
                accept="video/*"
                onChange={handleAttachVideo}
                disabled={uploadingVideo}
                className="hidden"
              />
            </label>
            {uploadingVideo && <span className="text-indigo-600 font-bold animate-pulse text-xs">Extracting OpenCV keyframes &amp; computing dual average...</span>}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-[11px]">Interactive Dual-Fusion Test:</span>
            <button
              onClick={() => handleSimulateVideo('authentic')}
              disabled={uploadingVideo}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] transition-all"
              title="Simulates authentic walkthrough video confirming milestone"
            >
              ✓ Test Authentic Video
            </button>
            <button
              onClick={() => handleSimulateVideo('fraud')}
              disabled={uploadingVideo}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px] transition-all"
              title="Simulates laptop screen recording fraud video overriding photo"
            >
              🚨 Test Screen-Recording Fraud
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Beneficiary Info */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Beneficiary</h3>
          <div className="space-y-2 text-sm">
            <Row label="Name" value={ben.name} />
            <Row label="Father's Name" value={ben.fatherName} />
            <Row label="Village" value={ben.village} />
            <Row label="Block / District" value={`${ben.block}, ${ben.district}`} />
            <Row label="Category" value={ben.category} />
            <Row label="Scheme" value={ben.schemeName} />
            <Row label="Aadhaar (last 4)" value={ben.aadhaarLast4 ? `XXXX-XXXX-${ben.aadhaarLast4}` : 'N/A'} />
          </div>
        </div>

        {/* Inspection Info */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Inspection Details</h3>
          <div className="space-y-2 text-sm">
            <Row label="Officer Stage" value={inspection.officerSelectedStage} />
            <Row label="AI Detected Stage" value={ai.detectedStage || '—'} />
            <Row label="AI Confidence" value={ai.confidence ? `${Math.round(ai.confidence)}%` : '—'} />
            <Row label="Stage Mismatch" value={inspection.stageMismatch ? '⚠️ YES' : '✅ No'} highlight={inspection.stageMismatch} />
            <Row label="Officer" value={inspection.officerId?.name || '—'} />
            <Row label="Date" value={new Date(inspection.createdAt).toLocaleString('en-IN')} />
            <Row label="Offline Created" value={inspection.isOfflineCreated ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* GPS Verification */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 GPS Verification</h3>
          <div className="space-y-2 text-sm">
            <Row label="Within Geofence" value={inspection.gpsVerification?.withinFence ? '✅ Yes' : '❌ No'} highlight={!inspection.gpsVerification?.withinFence} />
            <Row label="Distance from Site" value={`${inspection.gpsVerification?.distance || 0}m`} />
            <Row label="Max Radius" value={`${inspection.gpsVerification?.maxRadius || 200}m`} />
            <Row label="Risk" value={inspection.gpsVerification?.risk || 'LOW'} />
            {inspection.inspectionLocation && (
              <Row label="Coordinates" value={`${inspection.inspectionLocation.latitude?.toFixed(4)}, ${inspection.inspectionLocation.longitude?.toFixed(4)}`} />
            )}
          </div>
        </div>

        {/* Timestamp Verification */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⏰ Timestamp Verification</h3>
          <div className="space-y-2 text-sm">
            <Row label="Valid" value={inspection.timestampVerification?.valid ? '✅ Yes' : '⚠️ No'} highlight={!inspection.timestampVerification?.valid} />
            <Row label="Device Time" value={inspection.deviceTimestamp ? new Date(inspection.deviceTimestamp).toLocaleString('en-IN') : '—'} />
            <Row label="Server Time" value={new Date(inspection.serverTimestamp).toLocaleString('en-IN')} />
            {(inspection.timestampVerification?.issues || []).map((issue, i) => (
              <div key={i} className="p-2 bg-amber-50 rounded text-xs text-amber-700">{issue.message}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Modal AI Analysis (YOLOv8n + CLIP + DeepGuard + Gemini Vision) */}
      <div className="card space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span>⚡ Multi-Modal AI Verification Suite</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-50 text-primary-700">
              {ev.geminiReasoning?.engine || ev.yolov8?.model || 'YOLOv8 + Gemini Vision'}
            </span>
          </h3>
          <span className="text-xs font-semibold text-gray-500">
            Confidence: {ev.yolov8?.confidence || ai.confidence || 85}%
          </span>
        </div>

        {/* 5-Panel Multi-Modal Metric Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* 1. YOLOv8n Stage */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase">1. YOLOv8 Stage</p>
            <p className="text-base font-extrabold text-gray-900 mt-0.5">
              {ev.yolov8?.detectedStage || ai.detectedStage || '—'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {ev.yolov8?.mismatch ? '⚠️ Mismatch' : '✅ Matches submission'}
            </p>
          </div>

          {/* 2. CLIP Visual Similarity */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase">2. CLIP Visual Sim</p>
            <p className="text-base font-extrabold mt-0.5">
              {ev.clip?.isSimilar ? (
                <span className="text-amber-600 font-bold">{ev.clip.maxSimilarity}% Sim</span>
              ) : (
                <span className="text-emerald-600 font-bold">Unique (&lt;86%)</span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Cosine embedding check</p>
          </div>

          {/* 3. pHash + SHA-256 */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase">3. Hash Check</p>
            <p className="text-base font-extrabold mt-0.5">
              {ev.duplicateCheck?.isExactDuplicate ? (
                <span className="text-red-500">⚠ Duplicate</span>
              ) : ev.duplicateCheck?.isSimilar ? (
                <span className="text-amber-500">Similar</span>
              ) : (
                <span className="text-emerald-600">Clean</span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">SHA-256 &amp; pHash</p>
          </div>

          {/* 4. DeepGuard Synthetic Forensics */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase">4. DeepGuard AI</p>
            <p className="text-base font-extrabold mt-0.5">
              {ev.deepGuard?.isSuspicious || ev.fakeImageCheck?.isSuspicious ? (
                <span className="text-red-500 font-bold">AI Suspect</span>
              ) : (
                <span className="text-emerald-600 font-bold">Authentic</span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              2D FFT Spectral: {ev.deepGuard?.deepGuardScore || ev.fakeImageCheck?.confidence || 0}/100
            </p>
          </div>

          {/* 5. Optical Focus & Image Quality */}
          <div className={`p-3 rounded-xl border ${ev.imageQuality?.isBlurry ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase">5. Optical Focus</p>
            <p className="text-base font-extrabold mt-0.5">
              {ev.imageQuality?.isBlurry ? (
                <span className="text-red-600 font-bold">Blurry ({ev.imageQuality.sharpnessScore || 20}%)</span>
              ) : (
                <span className="text-emerald-600 font-bold">{ev.imageQuality?.sharpnessScore || 88}% Sharp</span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {ev.imageQuality?.blurSeverity || 'Forensic Focus'}
            </p>
          </div>
        </div>

        {/* YOLOv8 Detected Object Anchors */}
        {ev.yolov8?.detectedObjects?.length > 0 && (
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-900 mb-1.5">🏗️ YOLOv8n Structural Anchors Identified:</p>
            <div className="flex flex-wrap gap-1.5">
              {ev.yolov8.detectedObjects.map((obj, i) => (
                <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {obj.label} ({Math.round(obj.confidence * 100)}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gemini Vision Engineering Observations */}
        {(ev.geminiReasoning?.observations?.length > 0 || ai.observations?.length > 0) && (
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1.5">🤖 Gemini Vision Structural Engineering Notes:</p>
            <ul className="space-y-1">
              {(ev.geminiReasoning?.observations || ai.observations).map((obs, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Auditor Reason & Action */}
        {(ev.geminiReasoning?.reason || ai.reason) && (
          <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100">
            <span className="font-semibold text-gray-700">Engineering Verdict: </span>
            <span className="italic">"{ev.geminiReasoning?.reason || ai.reason}"</span>
            {ev.geminiReasoning?.recommendedAction && (
              <span className="ml-2 font-mono font-bold text-primary-700">
                [{ev.geminiReasoning.recommendedAction}]
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3D Spatial Digital Twin & LiDAR Studio Access Banner */}
      <div className="card p-5 bg-white/40 border border-white/60 text-[#28485A] shadow-lg rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/50 border border-white/60 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#28485A]">
                3D Spatial Digital Twin &amp; LiDAR Metrology Studio
              </h3>
              <span className="badge badge-teal text-[10px] uppercase">
                {inspection.officerSelectedStage || 'Plinth'} Milestone
              </span>
            </div>
            <p className="text-xs text-[#607887] mt-1 max-w-xl">
              Launch dedicated full-screen spatial twin with 4 procedural rendering modes (BIM Solid, LiDAR Laser Cloud, CAD Wireframe, X-Ray Rebar) and millimeter-precision structural gauges for {ben.name || 'this beneficiary'}.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/spatial-twin?beneficiaryId=${ben._id || ''}&inspectionId=${inspection._id}&stage=${inspection.officerSelectedStage || 'Plinth'}`)}
          className="btn-primary font-extrabold px-5 py-3 text-xs rounded-xl shadow-md transition-all flex items-center gap-2 flex-shrink-0"
        >
          <span>Open 3D Spatial Twin Studio</span>
          <span>→</span>
        </button>
      </div>

      {/* Risk Factors */}
      {inspection.riskScore?.factors?.length > 0 && (
        <div className="card border border-white/50">
          <h3 className="text-sm font-semibold text-[#28485A] mb-3">⚠️ Risk Factors (Score: {inspection.riskScore.score}/100)</h3>
          <div className="space-y-2">
            {inspection.riskScore.factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-xl backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span>{f.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[#28485A]">{f.factor}</p>
                    <p className="text-xs text-[#607887]">{f.detail}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-700">+{Math.round(f.score)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Walkthrough Video */}
      {(inspection.videoEvidence?.cloudinaryUrl || inspection.videoEvidence?.videoUrl) && (
        <div className="card p-5 space-y-3 border border-white/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#28485A] flex items-center gap-2">
              <span className="text-[#B4B8D9]">🎥</span>
              <span>Field Officer Walkthrough Video Evidence</span>
            </h3>
            <span className="badge badge-lavender text-[10px]">
              SHA: {inspection.videoEvidence.sha256?.slice(0, 10)}...
            </span>
          </div>

          <div className="rounded-xl overflow-hidden bg-[#28485A] max-w-xl max-h-80 shadow-md border border-white/40">
            <video
              src={inspection.videoEvidence.cloudinaryUrl || inspection.videoEvidence.videoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs">
            <button
              onClick={() => navigate(`/video-inspector?inspectionId=${inspection._id}&stage=${inspection.officerSelectedStage}`)}
              className="btn-secondary py-1.5 px-3 font-bold text-xs flex items-center gap-1.5"
            >
              <span>⚡ Open in Qwen 2.5-VL Video Forensics Studio</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Evidence Photos */}
      {inspection.evidence?.length > 0 && (
        <div className="card border border-white/50">
          <h3 className="text-sm font-semibold text-[#28485A] mb-3">📸 Evidence Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {inspection.evidence.map((e, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-white/40 border border-white/50 aspect-[4/3] shadow-xs">
                <img src={e.cloudinaryUrl} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover"
                  onError={(ev) => { ev.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%23D2E0E8" width="200" height="150"/><text x="50%" y="50%" text-anchor="middle" fill="%23607887" font-size="14">No Preview</text></svg>'; }} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[10px] text-white/90 font-mono">SHA-256: {e.sha256?.slice(0, 12)}...</p>
                </div>
                {e.fakeImageCheck?.isSuspicious && (
                  <div className="absolute top-2 right-2 badge badge-critical text-[10px]">AI Suspect</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Review */}
      {user?.role === 'admin' && ['pending', 'under_review'].includes(inspection.status) && (
        <div className="card border border-white/50">
          <h3 className="text-sm font-semibold text-[#28485A] mb-3">📝 Admin Review</h3>
          <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Review notes (optional)..."
            className="input-field mb-4 h-24 resize-none" />
          <div className="flex gap-3">
            <button onClick={() => handleReview('verified')} disabled={submitting}
              className="flex-1 py-2.5 btn-teal text-[#28485A] rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-sm">
              ✅ Verify & Approve
            </button>
            <button onClick={() => handleReview('reinspection')} disabled={submitting}
              className="flex-1 py-2.5 bg-amber-500/80 hover:bg-amber-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-sm">
              🔄 Request Reinspection
            </button>
            <button onClick={() => handleReview('rejected')} disabled={submitting}
              className="flex-1 py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-sm">
              ❌ Reject
            </button>
          </div>
        </div>
      )}

      {/* Review History */}
      {inspection.reviewedBy && (
        <div className="card border border-white/50">
          <h3 className="text-sm font-semibold text-[#28485A] mb-2">Review History</h3>
          <p className="text-sm text-[#607887]">Reviewed by <strong className="text-[#28485A]">{inspection.reviewedBy?.name}</strong> on {new Date(inspection.reviewedAt).toLocaleString('en-IN')}</p>
          {inspection.reviewNotes && <p className="text-sm text-[#607887] mt-1 italic">"{inspection.reviewNotes}"</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/20 last:border-0">
      <span className="text-[#607887] font-medium text-xs">{label}</span>
      <span className={`font-bold text-xs ${highlight ? 'text-rose-600' : 'text-[#28485A]'}`}>{value}</span>
    </div>
  );
}

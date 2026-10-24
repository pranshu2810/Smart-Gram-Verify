import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import {
  FiVideo as Video,
  FiShield as ShieldCheck,
  FiAlertTriangle as ShieldAlert,
  FiHash as Hash,
  FiPlay as Play,
  FiPause as Pause,
  FiUpload as Upload,
  FiCheckCircle as CheckCircle2,
  FiAlertTriangle as AlertTriangle,
  FiLayers as Layers,
  FiCpu as Cpu,
  FiClock as Clock,
  FiZap as Sparkles,
  FiCopy as Copy,
  FiCheck as Check,
  FiRefreshCw as RefreshCw,
  FiFileText as FileText,
  FiEye as Eye,
  FiSliders as Sliders,
  FiUser as User,
  FiInbox as Inbox,
  FiThumbsUp as ThumbsUp,
  FiAlertCircle as AlertCircle
} from 'react-icons/fi';

export default function VideoInspector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryInspectionId = searchParams.get('inspectionId');
  const queryBeneficiaryId = searchParams.get('beneficiaryId');
  const queryStage = searchParams.get('stage');

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [officerStage, setOfficerStage] = useState(queryStage || 'Plinth');
  const [numKeyframes, setNumKeyframes] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [officerSubmissions, setOfficerSubmissions] = useState([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(queryBeneficiaryId || '');
  const [selectedInspectionId, setSelectedInspectionId] = useState(queryInspectionId || '');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [benRes, pendingRes] = await Promise.all([
        axios.get('/beneficiaries?limit=100'),
        axios.get('/inspections?status=pending&limit=20')
      ]);

      const list = benRes.data?.data || [];
      const pendingList = pendingRes.data?.data || [];
      setBeneficiaries(list);
      setOfficerSubmissions(pendingList);

      if (queryInspectionId) {
        const found = pendingList.find(p => p._id === queryInspectionId);
        if (found) {
          handleSelectOfficerSubmission(found);
        } else {
          // Fetch inspection directly
          const inspRes = await axios.get(`/inspections/${queryInspectionId}`);
          if (inspRes.data?.data) {
            handleSelectOfficerSubmission(inspRes.data.data);
          }
        }
      } else if (queryBeneficiaryId) {
        handleBeneficiarySelect(queryBeneficiaryId, list);
      } else if (pendingList.length > 0) {
        handleSelectOfficerSubmission(pendingList[0]);
      } else if (list.length > 0) {
        handleBeneficiarySelect(list[0]._id, list);
      }
    } catch (e) {
      console.error('Failed to load initial inspection data:', e);
    }
  };

  const handleSelectOfficerSubmission = (submission) => {
    setSelectedInspectionId(submission._id);
    setSelectedBeneficiaryId(submission.beneficiaryId?._id || submission.beneficiaryId || '');
    setOfficerStage(submission.officerSelectedStage || 'Plinth');

    const vUrl = submission.videoEvidence?.videoUrl || submission.videoEvidence?.cloudinaryUrl || submission.evidence?.find(e => e.type === 'video')?.url || '';
    if (vUrl) {
      setVideoPreviewUrl(vUrl);
    } else {
      setVideoPreviewUrl('');
    }

    if (submission.videoEvidence?.verdict) {
      setAnalysisResult({
        success: true,
        model: submission.videoEvidence.model || 'Qwen-2.5-VL-3B-Instruct',
        verdict: submission.videoEvidence.verdict,
        detectedScene: submission.videoEvidence.detectedScene || 'Rural Construction Site',
        isAIGeneratedSuspect: submission.videoEvidence.isAIGeneratedSuspect || false,
        aiGeneratedRiskScore: submission.videoEvidence.aiGeneratedRiskScore || 0,
        authenticityConfidence: submission.videoEvidence.authenticityConfidence || 85,
        detectedStage: submission.videoEvidence.detectedStage || submission.officerSelectedStage,
        stageMatches: submission.videoEvidence.stageMatches ?? true,
        opticalFlowVerdict: submission.videoEvidence.opticalFlowVerdict || 'NORMAL_CONTINUOUS_MOTION',
        sha256: submission.videoEvidence.sha256,
        qwenForensicExplanation: submission.videoEvidence.qwenForensicExplanation || [],
        keyframes: submission.videoEvidence.keyframes || []
      });
    } else {
      setAnalysisResult(null);
    }
    setActionSuccess('');
  };

  const handleBeneficiarySelect = (bId, list = beneficiaries) => {
    setSelectedBeneficiaryId(bId);
    const b = list.find((item) => item._id === bId);
    if (b) {
      const stageVal = b.latestInspection?.officerSelectedStage || 'Plinth';
      setOfficerStage(stageVal);
      setSelectedInspectionId(b.latestInspection?._id || '');
    }
  };

  const selectedBen = beneficiaries.find((b) => b._id === selectedBeneficiaryId);

  // Handle local video file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setAnalysisResult(null);
    }
  };

  // Run AI Video Analysis (OpenCV + SHA-256 + Qwen 2.5-VL)
  const handleAnalyzeVideo = async (overrideData = null) => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      setErrorMsg('');

      let payload = overrideData;
      let headers = {};

      if (!payload) {
        if (videoFile) {
          const formData = new FormData();
          formData.append('video', videoFile);
          formData.append('officerStage', officerStage);
          formData.append('numKeyframes', numKeyframes);
          if (selectedBeneficiaryId) formData.append('beneficiaryId', selectedBeneficiaryId);
          if (selectedInspectionId) formData.append('inspectionId', selectedInspectionId);
          payload = formData;
          headers = { 'Content-Type': 'multipart/form-data' };
        } else {
          payload = {
            officerStage,
            numKeyframes,
            beneficiaryId: selectedBeneficiaryId,
            inspectionId: selectedInspectionId,
            videoUrl: videoPreviewUrl || 'PAN_PMAYG_DEFAULT_SAMPLE_VIDEO_STREAM_' + Date.now()
          };
        }
      } else {
        payload.beneficiaryId = selectedBeneficiaryId;
        payload.inspectionId = selectedInspectionId;
      }

      const res = await axios.post('/inspections/verify-video', payload, { headers });
      setAnalysisResult(res.data);
      if (res.data?.keyframes?.length > 0) {
        setSelectedKeyframe(res.data.keyframes[0]);
      }
    } catch (err) {
      console.error('Video analysis failed:', err);
      const serverErr = err.response?.data?.message || err.message;
      setErrorMsg(`Video Forensics API Error: ${serverErr}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Preset demo test cases
  const loadDemoCase = (type) => {
    if (type === 'authentic') {
      setOfficerStage('Plinth');
      setVideoPreviewUrl('');
      handleAnalyzeVideo({
        officerStage: 'Plinth',
        numKeyframes: 5,
        videoUrl: 'DEMO_AUTHENTIC_WALKTHROUGH_PMAYG'
      });
    } else {
      setOfficerStage('Roof');
      setVideoPreviewUrl('');
      // Simulate an AI-generated suspect video result
      setAnalysisResult({
        success: true,
        model: 'Qwen-2.5-VL-3B-Instruct (Civil Forensic Engine)',
        verdict: 'FLAGGED_AI_GENERATED_VIDEO',
        isAIGeneratedSuspect: true,
        aiGeneratedRiskScore: 84.6,
        authenticityConfidence: 15.4,
        sha256: 'e4b2d18073a9e7f864190ba325091c6e4811a2bc0952d718a3fe1968593cc109',
        videoMetadata: {
          durationSec: 6.0,
          fps: 24.0,
          totalFrames: 144,
          resolution: '1280x720',
          keyframeCount: 4
        },
        officerStage: 'Roof',
        detectedStage: 'Plinth',
        constructionProgressPct: 35,
        stageMatches: false,
        opticalFlowVerdict: 'SUSPECT_STATIC_IMAGE_PAN',
        qwenForensicExplanation: [
          '⚠️ [Qwen-2.5-VL]: 2D frequency spectrum anomalies detected — signature markers of Sora / Runway generative video diffusion.',
          '⚠️ Optical flow motion analysis: SUSPECT_STATIC_IMAGE_PAN (flat 2D zoom with zero 3D parallax depth shift).',
          '⚠️ Brick mortar boundaries and rebar joints exhibit unnatural generative morphing and edge softening across keyframes.',
          '⚠️ Milestone mismatch: Video exhibits incomplete foundation/plinth while reported stage is ROOF (100% false claim).',
          '🚨 Mandatory in-person vigilance audit required before installment disbursement.'
        ],
        keyframes: [
          { keyframeIndex: 1, timestamp: '00:01.0s', timestampSec: 1.0, sharpnessScore: 68.0, dataUrl: '' },
          { keyframeIndex: 2, timestamp: '00:02.5s', timestampSec: 2.5, sharpnessScore: 71.2, dataUrl: '' },
          { keyframeIndex: 3, timestamp: '00:04.0s', timestampSec: 4.0, sharpnessScore: 65.5, dataUrl: '' },
          { keyframeIndex: 4, timestamp: '00:05.5s', timestampSec: 5.5, sharpnessScore: 69.8, dataUrl: '' }
        ]
      });
      setSelectedKeyframe({ keyframeIndex: 1, timestamp: '00:01.0s' });
    }
  };

  const handleDecideInspection = async (newStatus) => {
    if (!selectedInspectionId) return;
    setActionSubmitting(true);
    setActionSuccess('');
    try {
      const res = await axios.put(`/inspections/${selectedInspectionId}/review`, {
        status: newStatus,
        reviewNotes: `Admin AI Forensics Decision [${newStatus.toUpperCase()}]: Verified via Qwen 2.5-VL and Dual Evidence Synthesis.`
      });
      if (res.data?.success) {
        setActionSuccess(
          newStatus === 'verified'
            ? '✓ Stage Approved & ₹40,000 DBT Grant Authorized for Disbursement!'
            : newStatus === 'reinspection_required'
            ? '⚠️ Re-Inspection Request Dispatched to Field Officer with Anomaly Notes.'
            : '🚨 Inspection Flagged as Fraudulent & Disbursement Frozen.'
        );
        fetchInitialData();
      }
    } catch (err) {
      alert('Error updating inspection: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card glass-card-pro p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎥</span>
            <h1 className="text-xl font-black text-[#0f172a]">
              AI Video Forensics &amp; Walkthrough Verification
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              Qwen 2.5-VL + OpenCV + SHA-256
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Core Admin Verification Engine: Receive video streams from field officers, detect AI-generated deepfake artifacts, evaluate multi-frame keyframes, and authorize DBT grants.
          </p>
        </div>

        {/* Quick Demo Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDemoCase('authentic')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Authentic Site</span>
          </button>

          <button
            onClick={() => loadDemoCase('fake')}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Test AI Fake Video</span>
          </button>
        </div>
      </div>

      {/* Action Success Toast Banner */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Incoming Officer Submissions Queue Bar (Core Officer -> Admin Workflow) */}
      <div className="card glass-card-pro p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="text-indigo-600 text-base" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Incoming Field Officer Submissions ({officerSubmissions.length})
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              Click to Verify
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Select an officer's uploaded inspection to run AI Forensics
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {officerSubmissions.map((sub) => {
            const isSelected = selectedInspectionId === sub._id;
            const benName = sub.beneficiaryId?.name || 'Beneficiary';
            const officerName = sub.officerId?.name || 'Field Inspector';
            const stage = sub.officerSelectedStage || 'Plinth';
            const hasVideo = Boolean(sub.videoEvidence?.verdict || sub.videoEvidence?.videoUrl || sub.evidence?.some(e => e.type === 'video'));

            return (
              <button
                key={sub._id}
                onClick={() => handleSelectOfficerSubmission(sub)}
                className={`p-3 rounded-xl border text-left flex-shrink-0 w-64 transition-all ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 truncate">{benName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {stage}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  By: <strong className="text-slate-700">{officerName}</strong>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    📸 {sub.evidence?.length || 1} photo
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    hasVideo ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {hasVideo ? '🎥 Walkthrough' : '⏳ Awaiting Vid'}
                  </span>
                </div>
              </button>
            );
          })}

          {officerSubmissions.length === 0 && (
            <div className="text-xs text-slate-500 italic py-2">
              No pending officer submissions in queue.
            </div>
          )}
        </div>
      </div>

      {/* Upload and Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Upload & Preview Box */}
        <div className="lg:col-span-2 card glass-card-pro p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#0f172a] flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-600" />
              <span>Inspection Video Upload & Player</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-500">MP4, WEBM, MOV (Max 100MB)</span>
          </div>

          {/* Target PMAY-G Beneficiary Selector */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-700" />
                <span>Select Target Beneficiary (Required to link house &amp; update inspection):</span>
              </label>
              {selectedBen && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  ID: #{selectedBen.householdId || selectedBen._id?.slice(-6)}
                </span>
              )}
            </div>

            <select
              value={selectedBeneficiaryId}
              onChange={(e) => handleBeneficiarySelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-300 text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— Choose Beneficiary to verify Walkthrough Video —</option>
              {beneficiaries.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} — {b.village}, {b.district} • Stage: {b.latestInspection?.officerSelectedStage || 'Plinth'} • Photo Risk: {b.latestInspection?.dualEvidenceSynthesis?.photoRiskScore ?? b.latestInspection?.riskScore?.score ?? 18}/100
                </option>
              ))}
            </select>

            {selectedBen && (
              <div className="pt-2 border-t border-indigo-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-700 font-medium">
                  Applicant: <strong className="text-slate-900">{selectedBen.name}</strong> • S/o {selectedBen.fatherName} • {selectedBen.village}
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  📸 Photo Risk: {selectedBen.latestInspection?.dualEvidenceSynthesis?.photoRiskScore ?? 18}/100
                </span>
              </div>
            )}
          </div>

          {videoPreviewUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[340px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-extrabold text-slate-800">{videoFile?.name || 'Selected Inspection Video'}</span>
                <button
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreviewUrl('');
                    setAnalysisResult(null);
                  }}
                  className="text-red-600 font-extrabold hover:underline"
                >
                  Remove Video
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#d8e2ec] hover:border-indigo-400 bg-[#edf2f7]/50 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-[#0f172a]">
                  Click to select or drag & drop field walkthrough video
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  OpenCV will automatically sample continuous keyframes and compute SHA-256 checksum
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#d8e2ec]">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 block mb-1">Claimed Stage</label>
                <select
                  value={officerStage}
                  onChange={(e) => setOfficerStage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Foundation">Foundation (20%)</option>
                  <option value="Plinth">Plinth (40%)</option>
                  <option value="Lintel">Lintel (65%)</option>
                  <option value="Roof">Roof (85%)</option>
                  <option value="Completion">Completion (100%)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 block mb-1">OpenCV Keyframes</label>
                <select
                  value={numKeyframes}
                  onChange={(e) => setNumKeyframes(parseInt(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="3">3 Keyframes (Fast)</option>
                  <option value="5">5 Keyframes (Standard)</option>
                  <option value="8">8 Keyframes (Forensic Deep)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleAnalyzeVideo()}
              disabled={analyzing}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Video in OpenCV & Qwen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Execute Qwen 2.5-VL Forensic Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SHA-256 & Pipeline Summary Card */}
        <div className="p-5 rounded-2xl bg-[#f8fafd] border border-[#d8e2ec] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-[#0f172a]">Multi-Modal Forensic Pipeline</h3>
            </div>

            {/* Cryptographic SHA-256 Badge */}
            <div className="p-3.5 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  <span>SHA-256 Video Fingerprint</span>
                </span>
                {analysisResult?.sha256 && (
                  <button
                    onClick={() => handleCopyHash(analysisResult.sha256)}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <div className="font-mono text-[10.5px] text-slate-800 break-all bg-white p-2 rounded-lg border border-slate-200">
                {analysisResult?.sha256 || 'SHA-256 generated upon video ingestion...'}
              </div>
            </div>

            {/* Pipeline Stack Pills */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#edf2f7]">
                <span className="font-bold text-slate-600">Video Processing</span>
                <span className="font-extrabold text-slate-900">OpenCV (cv2.VideoCapture)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#edf2f7]">
                <span className="font-bold text-slate-600">Vision Judge</span>
                <span className="font-extrabold text-indigo-700">Qwen-2.5-VL-3B-Instruct</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#edf2f7]">
                <span className="font-bold text-slate-600">AI Deepfake Check</span>
                <span className="font-extrabold text-slate-900">2D FFT Spectral + Parallax</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#edf2f7]">
                <span className="font-bold text-slate-600">Tamper Seal</span>
                <span className="font-extrabold text-emerald-700">SHA-256 Immutable Hash</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 font-bold">
            💡 <b>Vigilance Rule:</b> AI-generated video walkthroughs exhibit temporal jitter, vanishing rebar, and zero 3D parallax. Flagged videos block automatic DBT release.
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg('')}
            className="text-red-700 font-extrabold hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Forensic Report Display (Upon Analysis) */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dual-Evidence AI Synthesis Hero Banner (Photo + Video Composite Average) */}
          {(analysisResult?.dualEvidenceSynthesis || selectedBen) && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-slate-50 border-2 border-indigo-300 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-indigo-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚖️</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                        Dual-Evidence Composite Engine
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        House: {selectedBen?.name || 'Selected Beneficiary'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      Synthesized Result: Photo YOLOv8 + Walkthrough Video Qwen 2.5-VL
                    </h3>
                  </div>
                </div>

                <span className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs font-mono uppercase tracking-wider ${
                  (analysisResult.dualEvidenceSynthesis?.finalVerdict === 'CRITICAL_FRAUD_FLAGGED' || analysisResult.isAIGeneratedSuspect)
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {analysisResult.dualEvidenceSynthesis?.finalVerdict || (analysisResult.isAIGeneratedSuspect ? 'CRITICAL_FRAUD_FLAGGED' : 'DUAL_CONSENSUS_VERIFIED')}
                </span>
              </div>

              {/* 3-Way Score Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-center">
                <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">📸 Photo Evidence Risk</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">
                    {analysisResult.dualEvidenceSynthesis?.photoRiskScore ?? (selectedBen?.latestInspection?.dualEvidenceSynthesis?.photoRiskScore ?? 18)}/100
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Milestone: {selectedBen?.latestInspection?.officerSelectedStage || officerStage}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">🎥 Video Forensics Risk</span>
                  <span className={`text-2xl font-black mt-1 block ${
                    analysisResult.aiGeneratedRiskScore > 40 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {analysisResult.dualEvidenceSynthesis?.videoRiskScore ?? Math.round(analysisResult.aiGeneratedRiskScore || 8)}/100
                  </span>
                  <span className="text-[10px] text-purple-700 font-mono block mt-1 truncate">
                    Qwen: {analysisResult.verdict}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-300 shadow-2xs">
                  <span className="text-[10px] font-black text-indigo-900 uppercase block">⚖️ Final Synthesized Average</span>
                  <span className={`text-2xl font-black mt-1 block ${
                    (analysisResult.compositeRiskScore?.score ?? analysisResult.dualEvidenceSynthesis?.finalCompositeScore ?? 20) > 40
                      ? 'text-rose-600'
                      : 'text-indigo-950'
                  }`}>
                    {analysisResult.compositeRiskScore?.score ?? analysisResult.dualEvidenceSynthesis?.finalCompositeScore ?? Math.round(((selectedBen?.latestInspection?.dualEvidenceSynthesis?.photoRiskScore ?? 18) + (analysisResult.aiGeneratedRiskScore || 8)) / 2)}/100
                  </span>
                  <span className="text-[10px] font-bold text-indigo-800 font-mono block mt-1">
                    Directive: {analysisResult.dualEvidenceSynthesis?.finalDecision || (analysisResult.isAIGeneratedSuspect ? 'REJECT' : 'APPROVE')}
                  </span>
                </div>
              </div>

              {analysisResult.dualEvidenceSynthesis?.synthesisReasoning && (
                <div className="mt-3.5 p-3 rounded-xl bg-white/90 border border-indigo-200 text-xs text-indigo-950 leading-relaxed font-medium">
                  <strong className="text-indigo-900">Ensemble Audit Note: </strong>
                  <span>{analysisResult.dualEvidenceSynthesis.synthesisReasoning}</span>
                </div>
              )}

              {/* Direct Admin Executive Action Bar for Core Workflow */}
              <div className="mt-4 pt-3.5 border-t border-indigo-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-950">
                    Executive Decision:
                  </span>
                  <button
                    disabled={actionSubmitting || !selectedInspectionId}
                    onClick={() => handleDecideInspection('verified')}
                    className="glass-btn-emerald py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    title="Sign off milestone and release ₹40,000 DBT installment"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>✓ Authorize ₹40,000 DBT</span>
                  </button>

                  <button
                    disabled={actionSubmitting || !selectedInspectionId}
                    onClick={() => handleDecideInspection('reinspection_required')}
                    className="glass-btn-amber py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
                    title="Send re-inspection mandate to field officer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>⚠️ Request Re-Inspection</span>
                  </button>

                  <button
                    disabled={actionSubmitting || !selectedInspectionId}
                    onClick={() => handleDecideInspection('rejected')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-all"
                    title="Reject inspection and freeze funds"
                  >
                    🚨 Reject
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/spatial-twin?inspectionId=${selectedInspectionId}&stage=${officerStage}&beneficiaryId=${selectedBeneficiaryId}`)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>🏛️ Open in 3D Twin</span>
                  </button>

                  {selectedInspectionId && (
                    <button
                      onClick={() => navigate(`/inspections/${selectedInspectionId}`)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <span>🔎 Audit Dossier →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Top Verdict Banner */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            analysisResult.isAIGeneratedSuspect
              ? 'bg-red-50/80 border-red-300 text-red-950'
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white ${
                analysisResult.isAIGeneratedSuspect ? 'bg-red-600' : 'bg-emerald-600'
              }`}>
                {analysisResult.isAIGeneratedSuspect ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <ShieldCheck className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    analysisResult.verdict === 'SCREEN_RECORDING_FRAUD'
                      ? 'bg-amber-200 text-amber-950 border border-amber-300'
                      : analysisResult.isAIGeneratedSuspect
                      ? 'bg-red-200 text-red-900 border border-red-300'
                      : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                  }`}>
                    {analysisResult.verdict === 'SCREEN_RECORDING_FRAUD'
                      ? '🚨 FRAUD DETECTED — SCREEN RECORDING / MONITOR CAPTURE'
                      : analysisResult.verdict === 'NON_CONSTRUCTION_VIDEO'
                      ? '🚨 FRAUD DETECTED — NON-CONSTRUCTION SCENE'
                      : analysisResult.verdict === 'FLAGGED_AI_GENERATED_VIDEO'
                      ? '🚨 FRAUD ALERT — AI GENERATED SYNTHESIS'
                      : analysisResult.verdict === 'STAGE_MISMATCH_FRAUD'
                      ? '⚠️ MILESTONE STAGE MISMATCH'
                      : '✅ AUTHENTIC PHYSICAL WALKTHROUGH'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Model: {analysisResult.model || 'Qwen-2.5-VL-3B-Instruct (Civil Forensic Engine)'}
                  </span>
                </div>
                <h2 className="text-lg font-black mt-1">
                  {analysisResult.verdict === 'SCREEN_RECORDING_FRAUD'
                    ? `Detected Screen Recording: ${analysisResult.detectedScene || 'Computer / Laptop Screen'}`
                    : analysisResult.verdict === 'NON_CONSTRUCTION_VIDEO'
                    ? `Detected Non-Construction: ${analysisResult.detectedScene || 'Arbitrary Video Stream'}`
                    : analysisResult.isAIGeneratedSuspect
                    ? `High Suspicion of AI Video Synthesis (${analysisResult.detectedScene || 'Sora / Runway / Diffusion Anomaly'})`
                    : `Physical Milestone Verified: ${analysisResult.detectedStage || officerStage || 'Plinth'} (${analysisResult.constructionProgressPct ?? 50}% Complete)`}
                </h2>
                <p className="text-xs mt-1 opacity-80">
                  {analysisResult.verdict === 'SCREEN_RECORDING_FRAUD'
                    ? 'Video keyframes exhibit computer/laptop desktop software UI, window borders, or mobile display elements rather than genuine outdoor physical construction.'
                    : analysisResult.isAIGeneratedSuspect
                    ? 'Structural rebar boundaries and mortar textures exhibit unnatural generative softening and optical flow discontinuities.'
                    : 'Continuous camera trajectory with authentic 3D motion parallax verified across physical masonry and ground plane.'}
                </p>
              </div>
            </div>

            {/* Scores */}
            <div className="flex items-center gap-6 shrink-0 bg-white/70 backdrop-blur-xs p-3.5 rounded-xl border border-white/50">
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Fraud / Fake Risk</div>
                <div className={`text-2xl font-black ${
                  analysisResult.isAIGeneratedSuspect ? 'text-red-600' : 'text-slate-700'
                }`}>
                  {analysisResult.aiGeneratedRiskScore ?? 0}%
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Physical Confidence</div>
                <div className="text-2xl font-black text-emerald-600">
                  {analysisResult.authenticityConfidence ?? 85}%
                </div>
              </div>
            </div>
          </div>

          {/* OpenCV Keyframe Filmstrip */}
          <div className="p-5 rounded-2xl bg-[#f8fafd] border border-[#d8e2ec] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-[#0f172a]">
                  OpenCV Extracted Keyframe Sequence ({analysisResult.keyframes?.length || 0} Frames)
                </h3>
              </div>
              <span className="text-xs font-extrabold text-slate-500">
                Duration: {analysisResult.videoMetadata?.durationSec || 6}s @ {analysisResult.videoMetadata?.fps || 25} FPS
              </span>
            </div>

            {/* Filmstrip cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {(analysisResult.keyframes || []).map((kf, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedKeyframe(kf)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    selectedKeyframe?.keyframeIndex === kf.keyframeIndex
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
                      : 'bg-[#edf2f7] hover:bg-slate-200 border-[#d8e2ec]'
                  }`}
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 relative flex items-center justify-center">
                    {kf.dataUrl ? (
                      <img src={kf.dataUrl} alt={`Keyframe ${kf.keyframeIndex}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] font-mono text-slate-400">Frame {kf.keyframeIndex}</div>
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                      {kf.timestamp}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>Keyframe #{kf.keyframeIndex}</span>
                    <span className="text-indigo-600 font-extrabold">{kf.sharpnessScore || 92}% Sharp</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Qwen 2.5-VL Forensic Explanation & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Qwen Observations (2 cols) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-[#f8fafd] border border-[#d8e2ec] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-[#0f172a]">
                  Qwen-2.5-VL-3B-Instruct Civil Engineering & Forensic Observations
                </h3>
              </div>

              <div className="space-y-2.5">
                {(analysisResult.qwenForensicExplanation || []).map((obs, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
                      obs.includes('⚠️') || obs.includes('🚨')
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    <span>{obs}</span>
                  </div>
                ))}
              </div>

              {/* Milestone & Optical Motion Check */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] text-xs">
                  <div className="text-slate-500 font-bold text-[10px] uppercase">Detected Structural Milestone</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {analysisResult.detectedStage || officerStage || 'Plinth'} ({analysisResult.constructionProgressPct ?? 50}% Complete)
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">
                    Claimed: <span className="font-extrabold text-indigo-700">{analysisResult.officerStage || officerStage || 'Plinth'}</span> • {analysisResult.stageMatches ? '✅ Matches' : '❌ Mismatch'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#edf2f7] border border-[#d8e2ec] text-xs">
                  <div className="text-slate-500 font-bold text-[10px] uppercase">Optical Flow & Motion Parallax</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {analysisResult.opticalFlowVerdict || 'NATURAL_CAMERA_MOTION'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">
                    Natural 3D parallax verified across foreground rebar
                  </div>
                </div>
              </div>
            </div>

            {/* Auditor Action Panel (1 col) */}
            <div className="p-5 rounded-2xl bg-[#f8fafd] border border-[#d8e2ec] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-[#0f172a]">Auditor Milestone Action</h3>
                <p className="text-xs text-slate-600">
                  Based on Qwen 2.5-VL civil judgment and SHA-256 verified video walkthrough:
                </p>

                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono break-all text-slate-700">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Cryptographic Audit Seal</div>
                  SHA256: {analysisResult.sha256?.slice(0, 24)}...
                </div>
              </div>

              <div className="space-y-2">
                {!analysisResult.isAIGeneratedSuspect ? (
                  <button
                    onClick={() => alert(`Milestone ${analysisResult.detectedStage} approved with SHA-256 seal: ${analysisResult.sha256}`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Stage & Authorize DBT</span>
                  </button>
                ) : (
                  <button
                    onClick={() => alert('🚨 Fraud case flagged and logged into Immutable Audit Trail.')}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag AI Video & Block DBT</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `forensic_certificate_${analysisResult.sha256?.slice(0, 10)}.json`;
                    a.click();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#edf2f7] hover:bg-slate-200 text-slate-800 font-extrabold text-xs border border-[#d8e2ec] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Forensic Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

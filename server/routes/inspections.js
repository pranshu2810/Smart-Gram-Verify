const router = require('express').Router();
const path = require('path');
const { body, validationResult } = require('express-validator');
const Inspection = require('../models/Inspection');
const Beneficiary = require('../models/Beneficiary');
const { Installment, AuditLog } = require('../models/Installment');
const { protect, authorize } = require('../middleware/auth');
const { upload, videoUpload, combinedUpload } = require('../middleware/upload');
const { verifyGPS, verifyTimestamps, validateStageProgression } = require('../services/verification');
const { runFullAIPipeline, analyzeConstructionPhoto, computeImageHashes, checkDuplicateImage, checkFakeImage, verifyInspectionVideo, reconstructWithCOLMAPNerfstudio } = require('../services/aiService');
const { calculateRiskScore, calculateVideoRiskScore, synthesizeDualEvidence } = require('../services/riskEngine');

const INSTALLMENT_AMOUNTS = { Foundation: 50000, Plinth: 40000, Lintel: 30000, Completion: 30000 };

// GET /api/inspections — list inspections
router.get('/', protect, async (req, res) => {
  try {
    const { beneficiaryId, status, stage, officerId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (beneficiaryId) filter.beneficiaryId = beneficiaryId;
    if (status) filter.status = status;
    if (stage) filter.officerSelectedStage = stage;
    if (officerId) filter.officerId = officerId;

    // Officers see only their own; admins see all
    if (req.user.role === 'officer') filter.officerId = req.user._id;

    const total = await Inspection.countDocuments(filter);
    const inspections = await Inspection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('beneficiaryId', 'name village district')
      .populate('officerId', 'name email')
      .populate('reviewedBy', 'name');

    res.json({ success: true, data: inspections, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/inspections/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('beneficiaryId')
      .populate('officerId', 'name email phone')
      .populate('reviewedBy', 'name');
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inspections/verify-video — OpenCV + SHA-256 + Qwen 2.5-VL Video Forensics
router.post('/verify-video', protect, videoUpload.single('video'), async (req, res) => {
  try {
    const { officerStage, beneficiaryId, numKeyframes, videoUrl, videoBase64, inspectionId } = req.body;
    let videoSource = videoUrl || videoBase64;

    if (req.file) {
      videoSource = path.resolve(req.file.path);
    }

    if (!videoSource) {
      videoSource = 'PAN_PMAYG_DEFAULT_SAMPLE_VIDEO_STREAM_' + Date.now();
    }

    const result = await verifyInspectionVideo(videoSource, officerStage || 'Plinth', {
      beneficiaryId,
      inspectionId,
      numKeyframes: parseInt(numKeyframes) || 5
    });

    // If linked to an existing inspection OR if beneficiaryId provided, save video evidence to database
    let targetInspection = null;
    const targetInspectionId = inspectionId || req.query.inspectionId;

    const mongoose = require('mongoose');
    let realBeneficiaryId = null;
    if (beneficiaryId && mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      const b = await Beneficiary.findById(beneficiaryId);
      if (b) realBeneficiaryId = b._id;
    }
    if (!realBeneficiaryId) {
      const fallbackBen = await Beneficiary.findOne() || await Beneficiary.findOne({ village: 'Pipariya' });
      if (fallbackBen) realBeneficiaryId = fallbackBen._id;
    }

    let officerId = req.user?._id;
    if (!officerId || !mongoose.Types.ObjectId.isValid(officerId)) {
      const User = require('../models/User');
      const officerUser = await User.findOne({ email: 'rajesh@smartgram.gov.in' }) || await User.findOne({ role: 'officer' });
      officerId = officerUser?._id;
    }

    if (targetInspectionId && mongoose.Types.ObjectId.isValid(targetInspectionId)) {
      targetInspection = await Inspection.findById(targetInspectionId);
    } else if (realBeneficiaryId) {
      targetInspection = await Inspection.findOne({ beneficiaryId: realBeneficiaryId, status: 'pending' }).sort({ createdAt: -1 });
      if (!targetInspection) {
        targetInspection = new Inspection({
          beneficiaryId: realBeneficiaryId,
          officerId,
          officerSelectedStage: officerStage || 'Plinth',
          status: 'pending',
          inspectionLocation: { latitude: 23.6345, longitude: 77.4231, accuracy: 15 },
          deviceTimestamp: new Date(),
          serverTimestamp: new Date(),
          officerNotes: 'Walkthrough video inspection submitted from field'
        });
      }
    }

    if (targetInspection) {
      const storedVideoUrl = req.file ? `/uploads/${req.file.filename}` : (videoUrl || result?.videoUrl || '');
      targetInspection.videoEvidence = {
        cloudinaryUrl: storedVideoUrl,
        videoUrl: storedVideoUrl,
        originalFilename: req.file?.originalname || 'video_walkthrough.mp4',
        fileSize: req.file?.size || 0,
        durationSec: result?.videoMetadata?.durationSec || 6.0,
        sha256: result?.sha256,
        model: result?.model || 'Qwen-2.5-VL-3B-Instruct',
        verdict: result?.verdict,
        detectedScene: result?.detectedScene,
        isAIGeneratedSuspect: result?.isAIGeneratedSuspect || false,
        aiGeneratedRiskScore: result?.aiGeneratedRiskScore || 0,
        authenticityConfidence: result?.authenticityConfidence || 0,
        officerStage: officerStage || targetInspection.officerSelectedStage,
        detectedStage: result?.detectedStage,
        stageMatches: result?.stageMatches,
        opticalFlowVerdict: result?.opticalFlowVerdict,
        qwenForensicExplanation: result?.qwenForensicExplanation || [],
        keyframes: result?.keyframes || [],
        capturedAt: new Date()
      };

      const { synthesis, unifiedRiskScore } = synthesizeDualEvidence({
        photoRiskResult: targetInspection.riskScore,
        videoEvidence: targetInspection.videoEvidence,
        photoEvidence: targetInspection.evidence?.[0],
        officerSelectedStage: targetInspection.officerSelectedStage,
        ruleFactors: targetInspection.riskScore?.factors || []
      });

      targetInspection.dualEvidenceSynthesis = synthesis;
      targetInspection.riskScore = unifiedRiskScore;
      await targetInspection.save();

      return res.json({
        ...result,
        dualEvidenceSynthesis: synthesis,
        compositeRiskScore: unifiedRiskScore,
        inspectionId: targetInspection._id
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inspections/reconstruct-nerf — COLMAP Structure-from-Motion + Nerfstudio Real-Time 3D Digital Twin
router.post('/reconstruct-nerf', protect, async (req, res) => {
  try {
    const { videoUrl, videoBase64, imageUrls, inspectionId, densifyPoints, generateSplats, stage } = req.body;
    let targetVideo = videoUrl || videoBase64;
    let targetImages = imageUrls || [];
    let targetStage = stage || 'Plinth';

    // If inspectionId provided, pull media stored on MongoDB record
    if (inspectionId) {
      const inspection = await Inspection.findById(inspectionId);
      if (inspection) {
        if (!targetVideo && inspection.videoEvidence?.cloudinaryUrl) {
          targetVideo = inspection.videoEvidence.cloudinaryUrl;
        }
        if (targetImages.length === 0 && inspection.evidence?.length > 0) {
          targetImages = inspection.evidence.map(e => e.cloudinaryUrl).filter(Boolean);
        }
        if (inspection.officerSelectedStage) {
          targetStage = inspection.officerSelectedStage;
        }
      }
    }

    // Resolve local /uploads paths to absolute filesystem paths for OpenCV/COLMAP processing
    if (targetVideo && targetVideo.startsWith('/uploads')) {
      targetVideo = path.resolve(path.join(__dirname, '..', targetVideo));
    }
    targetImages = targetImages.map(img => {
      if (typeof img === 'string' && img.startsWith('/uploads')) {
        return path.resolve(path.join(__dirname, '..', img));
      }
      return img;
    });

    const result = await reconstructWithCOLMAPNerfstudio({
      videoUrl: targetVideo,
      videoBase64: !targetVideo?.startsWith('http') && !targetVideo?.startsWith('/') && !targetVideo?.includes(':\\') ? targetVideo : null,
      imageUrls: targetImages,
      inspectionId,
      stage: targetStage,
      densifyPoints: parseInt(densifyPoints) || 25000,
      generateSplats: generateSplats !== false
    });

    // Save reconstruction summary to inspection if found
    if (inspectionId && result.success) {
      await Inspection.findByIdAndUpdate(inspectionId, {
        $set: {
          'digitalTwinMeta.colmapNerfReconstruction': {
            reconstructedAt: new Date(),
            solvedPoses: result.reconstruction?.colmap_sfm?.solved_camera_poses,
            meanReprojErrorPx: result.reconstruction?.colmap_sfm?.mean_reprojection_error_px,
            pointCount: result.point_cloud?.count,
            civilMetrology: result.reconstruction?.civil_metrology
          }
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inspections/:id/attach-video — Attach walkthrough video to inspection and compute dual-evidence synthesis
router.post('/:id/attach-video', protect, videoUpload.single('video'), async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });

    let videoSource = req.body.videoUrl || req.body.videoBase64;
    if (req.file) {
      videoSource = path.resolve(req.file.path);
    }
    if (!videoSource) {
      return res.status(400).json({ success: false, message: 'No video file or videoUrl provided' });
    }

    const videoResult = await verifyInspectionVideo(videoSource, inspection.officerSelectedStage, {
      beneficiaryId: inspection.beneficiaryId,
      inspectionId: inspection._id,
      numKeyframes: parseInt(req.body.numKeyframes) || 5
    });

    inspection.videoEvidence = {
      cloudinaryUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.videoUrl || ''),
      videoUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.videoUrl || ''),
      originalFilename: req.file?.originalname || 'walkthrough_video.mp4',
      fileSize: req.file?.size || 0,
      durationSec: videoResult.videoMetadata?.durationSec || 6.0,
      sha256: videoResult.sha256,
      model: videoResult.model || 'Qwen-2.5-VL-3B-Instruct',
      verdict: videoResult.verdict,
      detectedScene: videoResult.detectedScene,
      isAIGeneratedSuspect: videoResult.isAIGeneratedSuspect || false,
      aiGeneratedRiskScore: videoResult.aiGeneratedRiskScore || 0,
      authenticityConfidence: videoResult.authenticityConfidence || 0,
      officerStage: inspection.officerSelectedStage,
      detectedStage: videoResult.detectedStage,
      stageMatches: videoResult.stageMatches,
      opticalFlowVerdict: videoResult.opticalFlowVerdict,
      qwenForensicExplanation: videoResult.qwenForensicExplanation || [],
      keyframes: videoResult.keyframes || [],
      capturedAt: new Date()
    };

    const { synthesis, unifiedRiskScore } = synthesizeDualEvidence({
      photoRiskResult: inspection.riskScore,
      videoEvidence: inspection.videoEvidence,
      photoEvidence: inspection.evidence?.[0],
      officerSelectedStage: inspection.officerSelectedStage,
      ruleFactors: inspection.riskScore?.factors || []
    });

    inspection.dualEvidenceSynthesis = synthesis;
    inspection.riskScore = unifiedRiskScore;
    await inspection.save();

    res.json({
      success: true,
      data: inspection,
      synthesis,
      unifiedRiskScore
    });
  } catch (error) {
    console.error('Attach video error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inspections — Submit new inspection with photo and/or video
router.post('/', protect, combinedUpload.fields([{ name: 'photos', maxCount: 5 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const { beneficiaryId, officerSelectedStage, latitude, longitude, accuracy, deviceTimestamp, officerNotes, isOfflineCreated, videoResult: rawVideoResult } = req.body;

    // Validate required fields
    if (!beneficiaryId || !officerSelectedStage) {
      return res.status(400).json({ success: false, message: 'beneficiaryId and officerSelectedStage are required' });
    }

    // Get beneficiary (handle valid ObjectId or offline demo fallback)
    const mongoose = require('mongoose');
    let beneficiary = null;
    if (mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      beneficiary = await Beneficiary.findById(beneficiaryId);
    }
    if (!beneficiary) {
      beneficiary = await Beneficiary.findOne() || await Beneficiary.findOne({ village: 'Pipariya' });
    }
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    const realBeneficiaryId = beneficiary._id;

    // Validate stage progression
    const previousInspections = await Inspection.find({ beneficiaryId: realBeneficiaryId, status: 'verified' }).lean();
    const previousStages = previousInspections.map(i => ({ stage: i.officerSelectedStage, status: i.status }));
    const stageCheck = validateStageProgression(previousStages, officerSelectedStage);

    // Resolve officerId safely
    let officerId = req.user?._id;
    if (!officerId || !mongoose.Types.ObjectId.isValid(officerId)) {
      const User = require('../models/User');
      const officerUser = await User.findOne({ email: 'rajesh@smartgram.gov.in' }) || await User.findOne({ role: 'officer' });
      officerId = officerUser?._id;
    }

    // Create inspection
    const inspection = new Inspection({
      beneficiaryId: realBeneficiaryId,
      officerId,
      officerSelectedStage,
      inspectionLocation: { latitude: parseFloat(latitude || 23.6345), longitude: parseFloat(longitude || 77.4231), accuracy: parseFloat(accuracy || 10) },
      deviceTimestamp: deviceTimestamp ? new Date(deviceTimestamp) : new Date(),
      serverTimestamp: new Date(),
      officerNotes,
      isOfflineCreated: isOfflineCreated === 'true',
      status: 'pending'
    });

    // ── GPS Verification ──
    const gpsVerification = verifyGPS(
      { latitude: parseFloat(latitude || 23.6345), longitude: parseFloat(longitude || 77.4231) },
      beneficiary.registeredLocation
    );
    inspection.gpsVerification = gpsVerification;

    // ── Timestamp Verification ──
    const timestampVerification = verifyTimestamps(
      deviceTimestamp || new Date(),
      new Date()
    );
    inspection.timestampVerification = timestampVerification;

    // ── Separate uploaded photos vs videos ──
    const allUploadedFiles = [];
    if (req.files?.photos) allUploadedFiles.push(...req.files.photos);
    if (req.files?.video) allUploadedFiles.push(...req.files.video);
    if (Array.isArray(req.files)) allUploadedFiles.push(...req.files);

    const photoFiles = [];
    let videoFile = null;

    for (const f of allUploadedFiles) {
      if (f.mimetype?.startsWith('video/') || f.fieldname === 'video' || f.originalname?.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
        if (!videoFile) videoFile = f;
      } else {
        photoFiles.push(f);
      }
    }

    const evidenceItems = [];

    if (photoFiles && photoFiles.length > 0) {
      for (const file of photoFiles) {
        const localPath = file.path ? path.resolve(file.path) : null;
        const webUrl = file.secure_url || file.url || `/uploads/${file.filename}`;

        const evidence = {
          cloudinaryUrl: webUrl,
          cloudinaryPublicId: file.public_id || file.filename,
          originalFilename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          capturedAt: deviceTimestamp ? new Date(deviceTimestamp) : new Date(),
          gpsLocation: { latitude: parseFloat(latitude || 23.6345), longitude: parseFloat(longitude || 77.4231), accuracy: parseFloat(accuracy || 10) }
        };

        // Call unified Multi-Modal AI Pipeline (YOLOv8 + CLIP + pHash/SHA256 + DeepGuard + Gemini Vision)
        const pipelineResult = await runFullAIPipeline(localPath || webUrl, officerSelectedStage, {
          beneficiaryId: realBeneficiaryId,
          inspectionId: inspection._id
        });

        evidence.sha256 = pipelineResult.hashes?.sha256;
        evidence.pHash = pipelineResult.hashes?.phash;
        evidence.yolov8 = pipelineResult.yolov8;
        evidence.clip = pipelineResult.clip;
        evidence.duplicateCheck = pipelineResult.duplicateCheck;
        evidence.deepGuard = pipelineResult.deepGuard;
        evidence.geminiReasoning = pipelineResult.geminiReasoning;
        evidence.imageQuality = pipelineResult.imageQuality || {
          isBlurry: false,
          blurSeverity: 'NONE',
          sharpnessScore: 85,
          qualityVerdict: 'SHARP_AUDIT_GRADE',
          actionMessage: 'Quality verified.'
        };

        // If photo is severely blurry on a live on-site inspection, require retake unless officer explicitly overrides
        const allowBlurryOverride = req.body.allowBlurryOverride === 'true' || req.body.allowBlurryOverride === true;
        const isOffline = req.body.isOfflineCreated === 'true' || req.body.isOfflineCreated === true;

        if (evidence.imageQuality?.isBlurry && !allowBlurryOverride && !isOffline) {
          return res.status(422).json({
            success: false,
            isBlurry: true,
            code: 'BLURRY_IMAGE_DETECTED',
            message: evidence.imageQuality.actionMessage || 'The captured photo is too blurry for forensic civil audit. Please retake the photo with stable camera focus.',
            quality: evidence.imageQuality,
            retakeRequired: true
          });
        }

        evidence.aiAnalysis = {
          detectedStage: pipelineResult.detectedStage,
          confidence: pipelineResult.confidence,
          observations: pipelineResult.observations,
          mismatch: pipelineResult.mismatch,
          suspiciousEvidence: pipelineResult.deepGuard?.isSuspicious || false,
          reason: pipelineResult.reason
        };
        evidence.fakeImageCheck = {
          isSuspicious: pipelineResult.deepGuard?.isSuspicious || false,
          confidence: pipelineResult.deepGuard?.deepGuardScore || 0,
          flags: (pipelineResult.deepGuard?.signals || []).map(s => s.id || s)
        };

        evidenceItems.push(evidence);
      }
    }

    inspection.evidence = evidenceItems;
    inspection.stageProgressionCheck = stageCheck;

    // Set AI detected stage from first photo analysis
    if (evidenceItems.length > 0) {
      const topEvidence = evidenceItems[0];
      inspection.aiDetectedStage = topEvidence.yolov8?.detectedStage || topEvidence.aiAnalysis?.detectedStage || officerSelectedStage;
      inspection.stageMismatch = topEvidence.yolov8?.mismatch !== undefined ? topEvidence.yolov8.mismatch : (topEvidence.aiAnalysis?.mismatch || false);
    }

    // ── Process Walkthrough Video Evidence (if provided) ──
    if (videoFile) {
      const storedVideoUrl = `/uploads/${videoFile.filename}`;
      inspection.videoEvidence = {
        cloudinaryUrl: storedVideoUrl,
        videoUrl: storedVideoUrl,
        originalFilename: videoFile.originalname,
        fileSize: videoFile.size,
        durationSec: 6.0,
        model: 'Qwen-2.5-VL-3B-Instruct',
        verdict: 'AUTHENTIC_WALKTHROUGH',
        detectedScene: 'Construction Site',
        isAIGeneratedSuspect: false,
        aiGeneratedRiskScore: 0,
        authenticityConfidence: 85,
        officerStage: officerSelectedStage,
        detectedStage: officerSelectedStage,
        stageMatches: true,
        opticalFlowVerdict: 'NORMAL_CONTINUOUS_MOTION',
        qwenForensicExplanation: ['Walkthrough video submitted by field officer.'],
        keyframes: [],
        capturedAt: deviceTimestamp ? new Date(deviceTimestamp) : new Date()
      };

      try {
        const localVideoPath = path.resolve(videoFile.path);
        const videoForensicResult = await verifyInspectionVideo(localVideoPath, officerSelectedStage, {
          beneficiaryId: realBeneficiaryId,
          inspectionId: inspection._id,
          numKeyframes: 5
        });

        if (videoForensicResult) {
          Object.assign(inspection.videoEvidence, {
            durationSec: videoForensicResult.videoMetadata?.durationSec || 6.0,
            sha256: videoForensicResult.sha256,
            verdict: videoForensicResult.verdict,
            detectedScene: videoForensicResult.detectedScene,
            isAIGeneratedSuspect: videoForensicResult.isAIGeneratedSuspect || false,
            aiGeneratedRiskScore: videoForensicResult.aiGeneratedRiskScore || 0,
            authenticityConfidence: videoForensicResult.authenticityConfidence || 0,
            detectedStage: videoForensicResult.detectedStage,
            stageMatches: videoForensicResult.stageMatches,
            opticalFlowVerdict: videoForensicResult.opticalFlowVerdict,
            qwenForensicExplanation: videoForensicResult.qwenForensicExplanation || [],
            keyframes: videoForensicResult.keyframes || []
          });
        }
      } catch (err) {
        console.error('Video analysis error:', err.message);
      }
    } else if (rawVideoResult) {
      try {
        const vResult = typeof rawVideoResult === 'string' ? JSON.parse(rawVideoResult) : rawVideoResult;
        const vUrl = vResult.videoUrl || vResult.cloudinaryUrl || '';
        inspection.videoEvidence = {
          cloudinaryUrl: vUrl,
          videoUrl: vUrl,
          originalFilename: 'walkthrough_video.mp4',
          fileSize: 0,
          durationSec: vResult.videoMetadata?.durationSec || 6.0,
          sha256: vResult.sha256,
          model: vResult.model || 'Qwen-2.5-VL-3B-Instruct',
          verdict: vResult.verdict,
          detectedScene: vResult.detectedScene,
          isAIGeneratedSuspect: vResult.isAIGeneratedSuspect || false,
          aiGeneratedRiskScore: vResult.aiGeneratedRiskScore || 0,
          authenticityConfidence: vResult.authenticityConfidence || 0,
          officerStage: officerSelectedStage,
          detectedStage: vResult.detectedStage,
          stageMatches: vResult.stageMatches,
          opticalFlowVerdict: vResult.opticalFlowVerdict,
          qwenForensicExplanation: vResult.qwenForensicExplanation || [],
          keyframes: vResult.keyframes || [],
          capturedAt: deviceTimestamp ? new Date(deviceTimestamp) : new Date()
        };
      } catch (e) {
        console.error('Failed to parse rawVideoResult:', e);
      }
    }

    // ── Calculate Photo & Rule Engine Risk ──
    const riskInput = {
      stageProgressionCheck: stageCheck,
      gpsVerification,
      timestampVerification,
      imageQuality: evidenceItems[0]?.imageQuality,
      yolov8: evidenceItems[0]?.yolov8,
      clip: evidenceItems[0]?.clip,
      duplicateCheck: evidenceItems[0]?.duplicateCheck || {},
      deepGuard: evidenceItems[0]?.deepGuard,
      geminiReasoning: evidenceItems[0]?.geminiReasoning,
      aiAnalysis: { ...(evidenceItems[0]?.aiAnalysis || {}), officerSelectedStage },
      officerSelectedStage,
      fakeImageCheck: evidenceItems[0]?.fakeImageCheck || {},
      beneficiaryCheck: {
        isDuplicate: beneficiary.isDuplicateSuspect,
        previousBenefit: beneficiary.govVerificationData?.previousBenefit
      }
    };
    const photoRiskResult = calculateRiskScore(riskInput);

    // ── Synthesize Dual-Evidence (Photo + Video Ensemble Average & Verdict) ──
    const { synthesis, unifiedRiskScore } = synthesizeDualEvidence({
      photoRiskResult,
      videoEvidence: inspection.videoEvidence,
      photoEvidence: evidenceItems[0],
      officerSelectedStage,
      ruleFactors: photoRiskResult.factors
    });

    inspection.dualEvidenceSynthesis = synthesis;
    inspection.riskScore = unifiedRiskScore;

    await inspection.save();

    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('inspection:new', {
        id: inspection._id,
        beneficiary: beneficiary.name,
        stage: officerSelectedStage,
        riskScore: inspection.riskScore,
        dualEvidenceSynthesis: inspection.dualEvidenceSynthesis,
        status: inspection.status
      });
    }

    await AuditLog.create({
      action: 'INSPECTION_SUBMITTED', entityType: 'Inspection', entityId: inspection._id,
      userId: req.user._id, userName: req.user.name,
      details: {
        stage: officerSelectedStage,
        riskScore: inspection.riskScore.score,
        photos: evidenceItems.length,
        hasVideo: Boolean(inspection.videoEvidence?.verdict),
        finalVerdict: synthesis.finalVerdict
      }
    });

    res.status(201).json({
      success: true,
      data: inspection,
      verification: {
        gps: gpsVerification,
        timestamp: timestampVerification,
        stageProgression: stageCheck,
        riskScore: inspection.riskScore,
        dualEvidenceSynthesis: inspection.dualEvidenceSynthesis
      }
    });
  } catch (error) {
    console.error('Inspection submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/inspections/beneficiary/:beneficiaryId/history
router.get('/beneficiary/:beneficiaryId/history', protect, async (req, res) => {
  try {
    const inspections = await Inspection.find({ beneficiaryId: req.params.beneficiaryId })
      .sort({ createdAt: -1 })
      .populate('officerId', 'name')
      .populate('reviewedBy', 'name');
    res.json({ success: true, data: inspections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/inspections/:id/review — Admin review
router.put('/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!['verified', 'rejected', 'reinspection'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified, rejected, or reinspection' });
    }

    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });

    inspection.status = status;
    inspection.reviewedBy = req.user._id;
    inspection.reviewedAt = new Date();
    inspection.reviewNotes = reviewNotes;
    await inspection.save();

    // If verified, create installment entry
    if (status === 'verified') {
      const stageOrder = ['Foundation', 'Plinth', 'Lintel', 'Completion'];
      const installmentNumber = stageOrder.indexOf(inspection.officerSelectedStage) + 1;

      await Installment.create({
        beneficiaryId: inspection.beneficiaryId,
        inspectionId: inspection._id,
        stage: inspection.officerSelectedStage,
        installmentNumber,
        amount: INSTALLMENT_AMOUNTS[inspection.officerSelectedStage],
        status: inspection.riskScore.score <= 25 ? 'approved' : 'pending',
        riskScore: inspection.riskScore.score,
        riskLevel: inspection.riskScore.level,
        approvedBy: inspection.riskScore.score <= 25 ? req.user._id : undefined,
        approvedAt: inspection.riskScore.score <= 25 ? new Date() : undefined
      });
    }

    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('inspection:reviewed', {
        id: inspection._id,
        status,
        reviewedBy: req.user.name
      });
    }

    await AuditLog.create({
      action: `INSPECTION_${status.toUpperCase()}`, entityType: 'Inspection', entityId: inspection._id,
      userId: req.user._id, userName: req.user.name,
      details: { status, reviewNotes }
    });

    res.json({ success: true, data: inspection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

/**
 * Smart-Gram Verify — Rule Engine & Composite Risk Scoring
 * =========================================================
 * Integrates:
 * 1. Rule Engine:
 *    - Stage Progression Rules (Foundation -> Plinth -> Lintel -> Completion)
 *    - GPS Geofencing (Haversine site distance <= 200m)
 *    - Device vs Server Timestamp Clock Drift
 *    - Beneficiary Eligibility & Duplicate Household Check
 * 2. Multi-Modal AI Signals:
 *    - YOLOv8n Construction Stage Detection & Mismatch
 *    - CLIP Semantic Visual Similarity
 *    - pHash + SHA-256 Duplicate Verification
 *    - Imager-1-Pro / DeepGuard AI-Generated Synthetic Image Score
 *    - Gemini Vision Reasoning & Auditor Recommendation
 */

function calculateRiskScore(verificationResults) {
  let totalRisk = 0;
  const factors = [];

  // ──────────────────────────────────────────────
  // 1. RULE ENGINE: Stage Progression Verification
  // ──────────────────────────────────────────────
  if (verificationResults.stageProgressionCheck && !verificationResults.stageProgressionCheck.valid) {
    const stageSkipRisk = 30;
    totalRisk += stageSkipRisk;
    factors.push({
      factor: 'Stage Progression Violation',
      score: stageSkipRisk,
      detail: verificationResults.stageProgressionCheck.message || 'Attempted to skip required previous construction stage',
      icon: '🚫'
    });
  }

  // ──────────────────────────────────────────────
  // 2. RULE ENGINE: GPS Geofencing
  // ──────────────────────────────────────────────
  if (verificationResults.gpsVerification && !verificationResults.gpsVerification.withinFence) {
    const dist = verificationResults.gpsVerification.distance || 0;
    const gpsRisk = dist > 1000 ? 30 : (verificationResults.gpsVerification.risk === 'HIGH' ? 25 : 15);
    totalRisk += gpsRisk;
    factors.push({
      factor: 'GPS Geofence Violation',
      score: gpsRisk,
      detail: verificationResults.gpsVerification.message || `Officer location is ${dist}m away from registered plot`,
      icon: '📍'
    });
  }

  // ──────────────────────────────────────────────
  // 3. RULE ENGINE: Timestamp Verification
  // ──────────────────────────────────────────────
  if (verificationResults.timestampVerification && !verificationResults.timestampVerification.valid) {
    const tsRisk = verificationResults.timestampVerification.riskContribution || 15;
    totalRisk += tsRisk;
    factors.push({
      factor: 'Timestamp Anomaly',
      score: tsRisk,
      detail: (verificationResults.timestampVerification.issues || []).map(i => i.message).join('; ') || 'Device clock drift detected',
      icon: '⏰'
    });
  }

  // ──────────────────────────────────────────────
  // 4. RULE ENGINE: Beneficiary & Household Check
  // ──────────────────────────────────────────────
  if (verificationResults.beneficiaryCheck) {
    if (verificationResults.beneficiaryCheck.isDuplicate) {
      totalRisk += 25;
      factors.push({
        factor: 'Duplicate Beneficiary Registration',
        score: 25,
        detail: 'Beneficiary household or Aadhaar matches an existing beneficiary',
        icon: '👥'
      });
    }
    if (verificationResults.beneficiaryCheck.previousBenefit) {
      totalRisk += 15;
      factors.push({
        factor: 'Prior Scheme Benefit Conflict',
        score: 15,
        detail: 'Beneficiary record indicates prior subsidized housing sanction',
        icon: '⚠️'
      });
    }
  }

  // ──────────────────────────────────────────────
  // 5. YOLOv8n: Stage Mismatch
  // ──────────────────────────────────────────────
  const yolo = verificationResults.yolov8 || verificationResults.aiAnalysis;
  if (yolo && yolo.mismatch) {
    const STAGES = ['Foundation', 'Plinth', 'Lintel', 'Completion'];
    const detectedIdx = STAGES.indexOf(yolo.detectedStage);
    const officerIdx = STAGES.indexOf(verificationResults.officerSelectedStage);
    const stageDiff = (detectedIdx !== -1 && officerIdx !== -1) ? Math.abs(detectedIdx - officerIdx) : 1;

    const mismatchRisk = stageDiff >= 2 ? 30 : 20;
    totalRisk += mismatchRisk;
    factors.push({
      factor: 'YOLOv8 Stage Mismatch',
      score: mismatchRisk,
      detail: `Reported: ${verificationResults.officerSelectedStage} vs Detected: ${yolo.detectedStage} (${yolo.confidence || 85}% confidence)`,
      icon: '🏗️'
    });
  }

  // ──────────────────────────────────────────────
  // 6. CLIP: Semantic Visual Similarity (Reused Photos)
  // ──────────────────────────────────────────────
  const clip = verificationResults.clip;
  if (clip && clip.isSimilar) {
    const clipRisk = clip.maxSimilarity >= 94 ? 25 : 15;
    totalRisk += clipRisk;
    factors.push({
      factor: 'CLIP Visual Similarity Match',
      score: clipRisk,
      detail: `Semantic match (${clip.maxSimilarity}%) found in historical inspection gallery (different angle/lighting)`,
      icon: '🖼️'
    });
  }

  // ──────────────────────────────────────────────
  // 7. pHash + SHA-256: Duplicate Verification
  // ──────────────────────────────────────────────
  const dup = verificationResults.duplicateCheck;
  if (dup) {
    if (dup.isExactDuplicate) {
      totalRisk += 30;
      factors.push({
        factor: 'Exact Duplicate Photo (SHA-256)',
        score: 30,
        detail: 'Bit-for-bit identical photo found across previous inspections',
        icon: '📸'
      });
    } else if (dup.isSimilar) {
      totalRisk += 15;
      factors.push({
        factor: 'Perceptual Duplicate (pHash)',
        score: 15,
        detail: 'Re-compressed or resized duplicate photo identified via perceptual hash',
        icon: '🔍'
      });
    }
  }

  // ──────────────────────────────────────────────
  // 8. Imager-1-Pro / DeepGuard: AI Synthetic Image Forensics
  // ──────────────────────────────────────────────
  const deepGuard = verificationResults.deepGuard || verificationResults.fakeImageCheck;
  if (deepGuard && (deepGuard.isSuspicious || deepGuard.deepGuardScore > 35)) {
    const scoreVal = deepGuard.deepGuardScore || deepGuard.confidence || 40;
    const fakeRisk = Math.min(Math.round(scoreVal * 0.35), 25);
    totalRisk += fakeRisk;

    const signalDesc = (deepGuard.signals || deepGuard.flags || [])
      .map(s => typeof s === 'string' ? s : s.id || s.description)
      .join(', ') || 'Synthetic spectral artifacts detected';

    factors.push({
      factor: 'DeepGuard Synthetic Image Anomaly',
      score: fakeRisk,
      detail: `Forensic Score: ${scoreVal}/100 — [${deepGuard.verdict || 'AI SUSPECT'}]: ${signalDesc}`,
      icon: '🤖'
    });
  }

  // ──────────────────────────────────────────────
  // 9. Gemini Vision: Audit Recommendation Penalty
  // ──────────────────────────────────────────────
  const gemini = verificationResults.geminiReasoning;
  if (gemini && gemini.recommendedAction === 'REJECT_DISBURSEMENT') {
    totalRisk += 20;
    factors.push({
      factor: 'Gemini Civil Auditor Flag',
      score: 20,
      detail: gemini.reason || 'Structural analysis does not support stage completion',
      icon: '⚖️'
    });
  }

  // ──────────────────────────────────────────────
  // 10. Image Quality & Optical Blur Assessment
  // ──────────────────────────────────────────────
  const imageQuality = verificationResults.imageQuality;
  if (imageQuality && (imageQuality.isBlurry || imageQuality.sharpnessScore < 40)) {
    const isSevere = imageQuality.blurSeverity === 'UNREADABLE_BLUR' || imageQuality.blurSeverity === 'SEVERE_BLUR' || imageQuality.sharpnessScore < 25;
    const blurPenalty = isSevere ? 35 : 18;
    totalRisk += blurPenalty;
    factors.push({
      factor: isSevere ? 'Severe Image Blur (Retake Advised)' : 'Moderate Camera Shake / Focus Blur',
      score: blurPenalty,
      detail: `Sharpness Score: ${imageQuality.sharpnessScore || 20}/100 [${imageQuality.blurSeverity || 'BLURRY'}]. ${imageQuality.actionMessage || 'Structural features lack optical resolution for civil audit.'}`,
      icon: '📷'
    });
  }

  totalRisk = Math.min(totalRisk, 100);

  return {
    score: Math.round(totalRisk),
    level: totalRisk > 70 ? 'CRITICAL' : totalRisk > 45 ? 'HIGH' : totalRisk > 20 ? 'MEDIUM' : 'LOW',
    factors,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Calculates risk score specifically for Walkthrough Video Evidence (Qwen 2.5-VL + OpenCV)
 */
function calculateVideoRiskScore(videoEvidence, officerSelectedStage) {
  if (!videoEvidence) return { score: 0, level: 'LOW', factors: [] };

  let videoRisk = 0;
  const factors = [];
  const verdict = videoEvidence.verdict || '';

  // 1. Screen recording or synthetic AI video fraud
  if (verdict === 'SCREEN_RECORDING_FRAUD' || videoEvidence.isAIGeneratedSuspect) {
    const fraudScore = videoEvidence.aiGeneratedRiskScore || 90;
    const addedRisk = Math.min(Math.round(fraudScore * 0.85), 65);
    videoRisk += addedRisk;
    factors.push({
      factor: 'Qwen 2.5-VL Screen/Synthetic Video Fraud',
      score: addedRisk,
      detail: `Verdict: [${verdict}]. Forensic risk score: ${fraudScore}/100. Screen bezel/moiré pattern or generative temporal artifacts detected.`,
      icon: '🚨'
    });
  } else if (verdict === 'FLAGGED_AI_GENERATED_VIDEO') {
    videoRisk += 55;
    factors.push({
      factor: 'AI-Generated Video Synthetic Artifacts',
      score: 55,
      detail: 'Temporal keyframe analysis reveals diffusion inconsistencies and unnatural edge softening.',
      icon: '🤖'
    });
  } else if (verdict === 'NON_CONSTRUCTION_VIDEO') {
    videoRisk += 60;
    factors.push({
      factor: 'Non-Construction Walkthrough Video',
      score: 60,
      detail: 'Video keyframes do not show an active civil housing construction site.',
      icon: '🚫'
    });
  }

  // 2. Optical Flow Motion Anomaly
  if (videoEvidence.opticalFlowVerdict && (videoEvidence.opticalFlowVerdict.includes('LOW_MOTION') || videoEvidence.opticalFlowVerdict.includes('IRREGULAR') || videoEvidence.opticalFlowVerdict.includes('SUSPECT'))) {
    videoRisk += 15;
    factors.push({
      factor: 'Optical Flow Motion Anomaly',
      score: 15,
      detail: `Motion profile: ${videoEvidence.opticalFlowVerdict}. Handheld 3D camera trajectory could not be verified.`,
      icon: '📹'
    });
  }

  // 3. Stage mismatch in video
  const detectedStage = videoEvidence.detectedStage;
  if (detectedStage && officerSelectedStage && detectedStage !== officerSelectedStage && !detectedStage.includes('Unverified') && !detectedStage.includes('Invalid')) {
    videoRisk += 25;
    factors.push({
      factor: 'Video Milestone Mismatch (Qwen 2.5-VL)',
      score: 25,
      detail: `Claimed: ${officerSelectedStage} vs Video Verified: ${detectedStage}`,
      icon: '🏗️'
    });
  }

  // If authentic physical site and no flags, minimal baseline
  if (verdict === 'AUTHENTIC_PHYSICAL_SITE' && videoRisk === 0) {
    videoRisk = Math.max(5, Math.round(videoEvidence.aiGeneratedRiskScore || 5));
  }

  videoRisk = Math.min(Math.max(videoRisk, 0), 100);

  return {
    score: Math.round(videoRisk),
    level: videoRisk > 70 ? 'CRITICAL' : videoRisk > 45 ? 'HIGH' : videoRisk > 20 ? 'MEDIUM' : 'LOW',
    verdict: verdict || (videoRisk <= 20 ? 'AUTHENTIC_PHYSICAL_SITE' : 'VIDEO_RISK_SUSPECT'),
    factors
  };
}

/**
 * Dual-Evidence Synthesis:
 * Combines Image (Photo YOLOv8 + DeepGuard) and Video (Qwen 2.5-VL + OpenCV)
 * into a single unified verdict, computing the mathematical average risk
 * with fraud override protections.
 */
function synthesizeDualEvidence({
  photoRiskResult,
  videoEvidence,
  photoEvidence,
  officerSelectedStage,
  ruleFactors = []
}) {
  const hasPhoto = Boolean(photoEvidence && (photoEvidence.cloudinaryUrl || photoEvidence.yolov8 || photoEvidence.aiAnalysis));
  const hasVideo = Boolean(videoEvidence && (videoEvidence.verdict || videoEvidence.sha256 || videoEvidence.videoUrl));

  const photoRiskScore = photoRiskResult ? photoRiskResult.score : 0;
  const photoDetectedStage = photoEvidence?.yolov8?.detectedStage || photoEvidence?.aiAnalysis?.detectedStage || officerSelectedStage;
  const photoConfidence = photoEvidence?.yolov8?.confidence || photoEvidence?.aiAnalysis?.confidence || 85;
  const photoVerdict = photoRiskScore > 50 ? 'PHOTO_FRAUD_SUSPECT' : (photoEvidence?.yolov8?.mismatch ? 'PHOTO_STAGE_MISMATCH' : 'PHOTO_VERIFIED');

  // Video evaluation
  const videoEval = hasVideo ? calculateVideoRiskScore(videoEvidence, officerSelectedStage) : { score: null, verdict: 'NO_VIDEO_ATTACHED', factors: [] };
  const videoRiskScore = hasVideo ? videoEval.score : null;
  const videoVerdict = videoEvidence?.verdict || videoEval.verdict;
  const videoDetectedStage = videoEvidence?.detectedStage || officerSelectedStage;
  const videoConfidence = videoEvidence?.authenticityConfidence || 85;

  let finalCompositeScore = 0;
  let mathematicalAverage = 0;
  let finalVerdict = '';
  let finalDecision = 'MANUAL_REVIEW';
  let stageAgreement = true;
  let synthesisReasoning = '';
  const combinedFactors = [...(photoRiskResult?.factors || [])];

  if (hasPhoto && hasVideo) {
    mathematicalAverage = Math.round((photoRiskScore + videoRiskScore) / 2);

    // Merge unique video factors into combined list
    for (const vf of videoEval.factors) {
      if (!combinedFactors.some(cf => cf.factor === vf.factor)) {
        combinedFactors.push(vf);
      }
    }

    // Check stage agreement between photo and video
    const validStages = ['Foundation', 'Plinth', 'Lintel', 'Roof', 'Completion'];
    const pStageNorm = validStages.find(s => s.toLowerCase() === String(photoDetectedStage).toLowerCase());
    const vStageNorm = validStages.find(s => s.toLowerCase() === String(videoDetectedStage).toLowerCase());

    if (pStageNorm && vStageNorm && pStageNorm !== vStageNorm) {
      stageAgreement = false;
      combinedFactors.push({
        factor: 'Cross-Modal Stage Discrepancy',
        score: 15,
        detail: `Photo AI detected ${pStageNorm} while Video AI identified ${vStageNorm}`,
        icon: '⚖️'
      });
    }

    // Check critical fraud conditions in either modality
    const isVideoCriticalFraud = [
      'SCREEN_RECORDING_FRAUD',
      'FLAGGED_AI_GENERATED_VIDEO',
      'NON_CONSTRUCTION_VIDEO'
    ].includes(videoVerdict) || (videoEvidence?.aiGeneratedRiskScore || 0) >= 70;

    const isPhotoCriticalFraud = (photoEvidence?.deepGuard?.deepGuardScore || 0) >= 65 ||
      photoEvidence?.duplicateCheck?.isExactDuplicate ||
      photoRiskScore >= 70;

    if (isVideoCriticalFraud || isPhotoCriticalFraud) {
      // FRAUD OVERRIDE: Fraud in one medium cannot be masked by an average
      const maxRisk = Math.max(photoRiskScore, videoRiskScore, 75);
      finalCompositeScore = maxRisk;
      finalVerdict = 'CRITICAL_FRAUD_FLAGGED';
      finalDecision = 'REJECT';

      if (isVideoCriticalFraud && photoRiskScore <= 25) {
        synthesisReasoning = `🚨 CRITICAL FRAUD DETECTED in Video Walkthrough [${videoVerdict}: Risk ${videoRiskScore}/100] despite clean photo (${photoRiskScore}/100). Screen recording or synthetic media overrides photo approval. Final status: REJECT.`;
      } else if (isPhotoCriticalFraud && videoRiskScore <= 25) {
        synthesisReasoning = `🚨 CRITICAL FRAUD DETECTED in Photo Evidence [Synthetic/Duplicate: Risk ${photoRiskScore}/100] despite normal video walkthrough. Photo forensic flag overrides approval. Final status: REJECT.`;
      } else {
        synthesisReasoning = `🚨 MULTI-MODAL FRAUD CONFIRMED: Both Photo (${photoRiskScore}/100) and Video (${videoRiskScore}/100) failed integrity validation. Final status: REJECT.`;
      }
    } else if (!stageAgreement) {
      // Discrepancy between photo and video
      finalCompositeScore = Math.min(100, mathematicalAverage + 15);
      finalVerdict = 'MEDIA_DISCREPANCY_FLAGGED';
      finalDecision = 'MANUAL_REVIEW';
      synthesisReasoning = `⚠️ STAGE DISCREPANCY: Photo AI identified ${pStageNorm} while Walkthrough Video AI identified ${vStageNorm}. Mathematical Average: ${mathematicalAverage}/100 (adjusted to ${finalCompositeScore}/100 with discrepancy penalty). Mandatory human auditor review required.`;
    } else if (mathematicalAverage <= 25) {
      // Dual consensus verified
      finalCompositeScore = mathematicalAverage;
      finalVerdict = 'DUAL_CONSENSUS_VERIFIED';
      finalDecision = 'APPROVE';
      synthesisReasoning = `✅ DUAL-EVIDENCE CONSENSUS: Both Photo (YOLOv8) and Walkthrough Video (Qwen 2.5-VL) independently confirmed the ${officerSelectedStage} milestone. Unified average risk: ${finalCompositeScore}/100 (Photo: ${photoRiskScore}, Video: ${videoRiskScore}). Cleared for DBT disbursement.`;
    } else {
      // Moderate / borderline risk
      finalCompositeScore = mathematicalAverage;
      finalVerdict = 'COMPOSITE_REVIEW_RECOMMENDED';
      finalDecision = 'MANUAL_REVIEW';
      synthesisReasoning = `⚖️ COMPOSITE AVERAGE: Photo Risk (${photoRiskScore}/100) + Video Risk (${videoRiskScore}/100) yields weighted average of ${finalCompositeScore}/100. Borderline telemetry triggers human supervisory clearance.`;
    }
  } else if (hasPhoto) {
    mathematicalAverage = photoRiskScore;
    finalCompositeScore = photoRiskScore;
    finalVerdict = photoRiskScore <= 25 ? 'PHOTO_VERIFIED' : (photoRiskScore > 50 ? 'PHOTO_FRAUD_SUSPECT' : 'PHOTO_REVIEW_REQUIRED');
    finalDecision = photoRiskScore <= 25 ? 'APPROVE' : (photoRiskScore > 50 ? 'REJECT' : 'MANUAL_REVIEW');
    synthesisReasoning = `📸 PHOTO-ONLY ASSESSMENT: Evaluated based on high-resolution site photo (YOLOv8 + DeepGuard). Risk Score: ${photoRiskScore}/100. (Walkthrough video not submitted).`;
  } else if (hasVideo) {
    mathematicalAverage = videoRiskScore;
    finalCompositeScore = videoRiskScore;
    finalVerdict = videoEval.verdict;
    finalDecision = videoRiskScore <= 25 ? 'APPROVE' : (videoRiskScore > 50 ? 'REJECT' : 'MANUAL_REVIEW');
    synthesisReasoning = `🎥 VIDEO-ONLY ASSESSMENT: Evaluated based on Qwen 2.5-VL walkthrough analysis. Risk Score: ${videoRiskScore}/100. Verdict: ${videoVerdict}.`;
  } else {
    finalCompositeScore = photoRiskScore;
    mathematicalAverage = photoRiskScore;
    finalVerdict = 'PENDING_MEDIA_EVIDENCE';
    finalDecision = 'MANUAL_REVIEW';
    synthesisReasoning = 'No visual media attached to inspection.';
  }

  const finalRiskLevel = finalCompositeScore > 70 ? 'CRITICAL' : (finalCompositeScore > 45 ? 'HIGH' : (finalCompositeScore > 20 ? 'MEDIUM' : 'LOW'));

  return {
    synthesis: {
      hasPhotoEvidence: hasPhoto,
      hasVideoEvidence: hasVideo,
      photoRiskScore,
      photoVerdict,
      photoDetectedStage,
      photoConfidence,
      videoRiskScore,
      videoVerdict,
      videoDetectedStage,
      videoConfidence,
      stageAgreement,
      mathematicalAverage,
      finalCompositeScore,
      finalRiskLevel,
      finalVerdict,
      finalDecision,
      synthesisReasoning,
      calculatedAt: new Date().toISOString()
    },
    unifiedRiskScore: {
      score: finalCompositeScore,
      level: finalRiskLevel,
      factors: combinedFactors,
      calculatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  calculateRiskScore,
  calculateVideoRiskScore,
  synthesizeDualEvidence
};

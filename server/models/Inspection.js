const mongoose = require('mongoose');

const STAGES = ['Foundation', 'Plinth', 'Lintel', 'Completion'];

const evidenceSchema = new mongoose.Schema({
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  sha256: String,
  pHash: String,
  clipEmbedding: [Number],
  originalFilename: String,
  fileSize: Number,
  mimeType: String,
  capturedAt: Date,

  gpsLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },

  // 1. YOLOv8n Construction Stage Detection
  yolov8: {
    model: { type: String, default: 'YOLOv8n-Construction' },
    detectedStage: { type: String, enum: [...STAGES, 'Unknown'] },
    confidence: Number,
    mismatch: Boolean,
    detectedObjects: [mongoose.Schema.Types.Mixed],
    keyMarkers: [String],
    featureMetrics: mongoose.Schema.Types.Mixed
  },

  // 2. CLIP Semantic Visual Similarity
  clip: {
    model: { type: String, default: 'CLIP-ViT-B32' },
    isSimilar: { type: Boolean, default: false },
    maxSimilarity: Number,
    matches: [mongoose.Schema.Types.Mixed]
  },

  // 3. pHash + SHA-256 Duplicate Check Results
  duplicateCheck: {
    isExactDuplicate: { type: Boolean, default: false },
    isSimilar: { type: Boolean, default: false },
    similarPhotos: [{
      inspectionId: mongoose.Schema.Types.Mixed,
      beneficiaryId: mongoose.Schema.Types.Mixed,
      similarity: Number,
      sha256: String,
      type: String
    }],
    exactMatches: [mongoose.Schema.Types.Mixed],
    perceptualMatches: [mongoose.Schema.Types.Mixed]
  },

  // 4. Imager-1-Pro / DeepGuard Synthetic Image Forensics
  deepGuard: {
    engine: { type: String, default: 'Imager-1-Pro / DeepGuard' },
    isSuspicious: { type: Boolean, default: false },
    deepGuardScore: Number,
    verdict: String,
    signals: [mongoose.Schema.Types.Mixed],
    metrics: mongoose.Schema.Types.Mixed,
    auditNote: String
  },

  // 5. Gemini Vision Qualitative Reasoning & Architectural Analysis
  geminiReasoning: {
    engine: String,
    detectedStage: { type: String, enum: [...STAGES, 'Unknown'] },
    confidence: Number,
    observations: [String],
    reason: String,
    recommendedAction: String,
    materialsIdentified: [String],
    mismatch: Boolean
  },

  // Backward-compatible alias fields
  aiAnalysis: {
    detectedStage: { type: String, enum: [...STAGES, 'Unknown'] },
    confidence: Number,
    observations: [String],
    mismatch: Boolean,
    suspiciousEvidence: Boolean,
    reason: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  fakeImageCheck: {
    isSuspicious: { type: Boolean, default: false },
    confidence: Number,
    flags: [String]
  },

  // Blockchain evidence hash
  blockchainTxHash: String,
  blockchainVerified: { type: Boolean, default: false }
}, { _id: true });

const inspectionSchema = new mongoose.Schema({
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary', required: true, index: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Stage info
  officerSelectedStage: { type: String, enum: STAGES, required: true },
  aiDetectedStage: { type: String, enum: [...STAGES, 'Unknown'] },
  stageMismatch: { type: Boolean, default: false },

  // Stage Progression Rule Check
  stageProgressionCheck: {
    valid: Boolean,
    message: String
  },

  // Evidence
  evidence: [evidenceSchema],

  // GPS
  inspectionLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  gpsVerification: {
    withinFence: Boolean,
    distance: Number,
    maxRadius: { type: Number, default: 200 },
    risk: String
  },

  // Timestamps
  deviceTimestamp: Date,
  serverTimestamp: { type: Date, default: Date.now },
  syncedAt: Date,
  timestampVerification: {
    valid: Boolean,
    issues: [mongoose.Schema.Types.Mixed],
    risk: String
  },

  // Risk & verification
  riskScore: {
    score: { type: Number, default: 0 },
    level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    factors: [{
      factor: String,
      score: Number,
      detail: String,
      icon: String
    }]
  },

  // Status workflow
  status: {
    type: String,
    enum: ['draft', 'pending', 'under_review', 'verified', 'rejected', 'reinspection'],
    default: 'pending',
    index: true
  },

  // Admin review
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNotes: String,

  // Officer notes
  officerNotes: String,
  isOfflineCreated: { type: Boolean, default: false },

  // Video Evidence (OpenCV + SHA-256 + Qwen 2.5-VL Walkthrough Forensics)
  videoEvidence: {
    cloudinaryUrl: String,
    videoUrl: String,
    originalFilename: String,
    fileSize: Number,
    durationSec: Number,
    sha256: String,
    model: { type: String, default: 'Qwen-2.5-VL-3B-Instruct' },
    verdict: String,
    detectedScene: String,
    isAIGeneratedSuspect: { type: Boolean, default: false },
    aiGeneratedRiskScore: { type: Number, default: 0 },
    authenticityConfidence: { type: Number, default: 0 },
    officerStage: String,
    detectedStage: String,
    stageMatches: Boolean,
    opticalFlowVerdict: String,
    qwenForensicExplanation: [String],
    keyframes: [mongoose.Schema.Types.Mixed],
    capturedAt: Date
  },

  // Dual-Evidence Synthesis (Unified Ensemble of Photo + Video Forensics)
  dualEvidenceSynthesis: {
    hasPhotoEvidence: { type: Boolean, default: false },
    hasVideoEvidence: { type: Boolean, default: false },
    photoRiskScore: { type: Number, default: 0 },
    photoVerdict: String,
    photoDetectedStage: String,
    photoConfidence: Number,
    videoRiskScore: { type: Number, default: 0 },
    videoVerdict: String,
    videoDetectedStage: String,
    videoConfidence: Number,
    stageAgreement: { type: Boolean, default: true },
    mathematicalAverage: { type: Number, default: 0 },
    finalCompositeScore: { type: Number, default: 0 },
    finalRiskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    finalVerdict: String,
    finalDecision: { type: String, enum: ['APPROVE', 'MANUAL_REVIEW', 'REJECT', 'REINSPECTION'], default: 'MANUAL_REVIEW' },
    synthesisReasoning: String,
    calculatedAt: Date
  }
}, { timestamps: true });

inspectionSchema.index({ status: 1, createdAt: -1 });
inspectionSchema.index({ beneficiaryId: 1, officerSelectedStage: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);

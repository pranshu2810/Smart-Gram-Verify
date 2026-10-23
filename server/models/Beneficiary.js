const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  aadhaarLast4: { type: String, maxlength: 4 },  // Store only last 4 digits
  phone: { type: String, trim: true },
  address: { type: String, required: true },
  village: { type: String, required: true, trim: true },
  block: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  state: { type: String, default: 'Madhya Pradesh', trim: true },
  category: { type: String, enum: ['SC', 'ST', 'OBC', 'General', 'Minority'], required: true },
  bplNumber: { type: String, trim: true },
  annualIncome: Number,
  familyMembers: { type: Number, default: 1 },
  householdId: { type: String, trim: true, index: true },

  // Registered construction location
  registeredLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String
  },

  // Scheme info
  schemeName: { type: String, default: 'PMAY-G' },
  schemeId: String,
  sanctionOrderNo: String,
  sanctionDate: Date,
  estimatedCost: { type: Number, default: 150000 },

  // Verification flags
  govVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'flagged'],
    default: 'pending'
  },
  govVerificationData: mongoose.Schema.Types.Mixed,
  isDuplicateSuspect: { type: Boolean, default: false },
  duplicateMatchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' }],

  status: {
    type: String,
    enum: ['active', 'completed', 'suspended', 'rejected'],
    default: 'active'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Text index for search
beneficiarySchema.index({ name: 'text', fatherName: 'text', village: 'text', address: 'text' });
beneficiarySchema.index({ village: 1, block: 1, district: 1 });
beneficiarySchema.index({ householdId: 1 });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);

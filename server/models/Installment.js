const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary', required: true, index: true },
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: true },
  stage: { type: String, enum: ['Foundation', 'Plinth', 'Lintel', 'Completion'], required: true },
  installmentNumber: { type: Number, required: true }, // 1, 2, 3, 4
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'disbursed', 'rejected', 'on_hold'],
    default: 'pending',
    index: true
  },
  riskScore: Number,
  riskLevel: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  disbursedAt: Date,
  rejectionReason: String,
  notes: String
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  entityType: { type: String, enum: ['User', 'Beneficiary', 'Inspection', 'Installment', 'System'] },
  entityId: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

const Installment = mongoose.model('Installment', installmentSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { Installment, AuditLog };

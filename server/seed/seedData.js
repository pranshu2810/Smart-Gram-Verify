require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Beneficiary = require('../models/Beneficiary');
const Inspection = require('../models/Inspection');
const { Installment, AuditLog } = require('../models/Installment');

const SEED_DATA = {
  users: [
    { name: 'Admin Sharma', email: 'admin@smartgram.gov.in', password: 'admin123', role: 'admin', phone: '9876543210', employeeId: 'ADM001', district: 'Bhopal', block: 'Huzur', panchayat: 'HQ' },
    { name: 'Officer Rajesh Kumar', email: 'rajesh@smartgram.gov.in', password: 'officer123', role: 'officer', phone: '9876543211', employeeId: 'OFF001', district: 'Bhopal', block: 'Berasia', panchayat: 'Barkheda' },
    { name: 'Officer Sunita Verma', email: 'sunita@smartgram.gov.in', password: 'officer123', role: 'officer', phone: '9876543212', employeeId: 'OFF002', district: 'Sehore', block: 'Sehore', panchayat: 'Piparia' },
  ],
  beneficiaries: [
    {
      name: 'Ramesh Kumar', fatherName: 'Shankar Prasad', aadhaarLast4: '4523', phone: '9111111111',
      address: 'Ward 3, Near Hanuman Mandir', village: 'Barkheda', block: 'Berasia', district: 'Bhopal', state: 'Madhya Pradesh',
      category: 'SC', bplNumber: 'BPL/MP/23/001', familyMembers: 5, householdId: 'HH-BRK-001',
      registeredLocation: { latitude: 23.6345, longitude: 77.4231, address: 'Plot 45, Barkheda' },
      schemeName: 'PMAY-G', estimatedCost: 150000, status: 'active'
    },
    {
      name: 'Sita Devi', fatherName: 'Mohan Lal', aadhaarLast4: '7891', phone: '9111111112',
      address: 'Ward 1, Main Road', village: 'Piparia', block: 'Sehore', district: 'Sehore', state: 'Madhya Pradesh',
      category: 'ST', bplNumber: 'BPL/MP/23/002', familyMembers: 4, householdId: 'HH-PIP-001',
      registeredLocation: { latitude: 23.1992, longitude: 77.0851, address: 'Plot 12, Piparia' },
      schemeName: 'PMAY-G', estimatedCost: 150000, status: 'active'
    },
    {
      name: 'Gopal Singh', fatherName: 'Bhagwan Das', aadhaarLast4: '3456', phone: '9111111113',
      address: 'Ward 5, School Ke Pass', village: 'Berasia', block: 'Berasia', district: 'Bhopal', state: 'Madhya Pradesh',
      category: 'OBC', bplNumber: 'BPL/MP/23/003', familyMembers: 6, householdId: 'HH-BER-001',
      registeredLocation: { latitude: 23.6312, longitude: 77.4300, address: 'Plot 78, Berasia' },
      schemeName: 'PMAY-G', estimatedCost: 150000, status: 'active'
    },
    {
      name: 'Kamla Bai', fatherName: 'Nathu Ram', aadhaarLast4: '9012', phone: '9111111114',
      address: 'Ward 2, Panchayat Bhawan', village: 'Sehore', block: 'Sehore', district: 'Sehore', state: 'Madhya Pradesh',
      category: 'SC', bplNumber: 'BPL/MP/23/004', familyMembers: 3, householdId: 'HH-SEH-001',
      registeredLocation: { latitude: 23.2035, longitude: 77.0872, address: 'Plot 33, Sehore' },
      schemeName: 'PMAY-G', estimatedCost: 150000, status: 'active'
    },
    {
      name: 'Lakhan Ahirwar', fatherName: 'Devi Prasad', aadhaarLast4: '5678', phone: '9111111115',
      address: 'Ward 3, Nadi Ke Pass', village: 'Barkheda', block: 'Berasia', district: 'Bhopal', state: 'Madhya Pradesh',
      category: 'SC', bplNumber: 'BPL/MP/23/005', familyMembers: 4, householdId: 'HH-BRK-002',
      registeredLocation: { latitude: 23.6350, longitude: 77.4240, address: 'Plot 46, Barkheda' },
      schemeName: 'PMAY-G', estimatedCost: 150000, status: 'active'
    },
  ]
};

const connectDB = require('../config/db');

async function seed() {
  try {
    await connectDB();


    // Clear existing data
    await User.deleteMany({});
    await Beneficiary.deleteMany({});
    await Inspection.deleteMany({});
    await Installment.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [];
    for (const userData of SEED_DATA.users) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`👤 Created user: ${user.name} (${user.role})`);
    }

    // Create beneficiaries
    const beneficiaries = [];
    for (const bData of SEED_DATA.beneficiaries) {
      const b = await Beneficiary.create({ ...bData, createdBy: users[1]._id });
      beneficiaries.push(b);
      console.log(`🏠 Created beneficiary: ${b.name} — ${b.village}`);
    }

    // Create sample inspections with different statuses
    const stages = ['Foundation', 'Plinth', 'Lintel', 'Completion'];
    const sampleInspections = [
      { benefIdx: 0, stage: 'Foundation', status: 'verified', riskScore: 8 },
      { benefIdx: 0, stage: 'Plinth', status: 'pending', riskScore: 22 },
      { benefIdx: 1, stage: 'Foundation', status: 'verified', riskScore: 5 },
      { benefIdx: 1, stage: 'Plinth', status: 'verified', riskScore: 12 },
      { benefIdx: 1, stage: 'Lintel', status: 'pending', riskScore: 45 },
      { benefIdx: 2, stage: 'Foundation', status: 'rejected', riskScore: 72 },
      { benefIdx: 3, stage: 'Foundation', status: 'pending', riskScore: 18 },
      { benefIdx: 4, stage: 'Foundation', status: 'verified', riskScore: 3 },
      { benefIdx: 4, stage: 'Plinth', status: 'verified', riskScore: 10 },
      { benefIdx: 4, stage: 'Lintel', status: 'verified', riskScore: 7 },
      { benefIdx: 4, stage: 'Completion', status: 'pending', riskScore: 15 },
    ];

    for (const si of sampleInspections) {
      const b = beneficiaries[si.benefIdx];
      const inspection = await Inspection.create({
        beneficiaryId: b._id,
        officerId: users[1]._id,
        officerSelectedStage: si.stage,
        aiDetectedStage: si.stage,
        stageMismatch: si.riskScore > 40,
        inspectionLocation: {
          latitude: b.registeredLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: b.registeredLocation.longitude + (Math.random() - 0.5) * 0.001,
          accuracy: 5 + Math.random() * 10
        },
        gpsVerification: { withinFence: si.riskScore < 50, distance: si.riskScore < 50 ? 45 : 850, maxRadius: 200, risk: si.riskScore < 50 ? 'LOW' : 'HIGH' },
        deviceTimestamp: new Date(Date.now() - Math.random() * 7 * 86400000),
        serverTimestamp: new Date(),
        timestampVerification: { valid: si.riskScore < 40, issues: si.riskScore >= 40 ? [{ type: 'DRIFT', message: 'Timestamp drift detected', severity: 'MEDIUM' }] : [], risk: si.riskScore >= 40 ? 'MEDIUM' : 'LOW' },
        riskScore: {
          score: si.riskScore,
          level: si.riskScore > 70 ? 'CRITICAL' : si.riskScore > 50 ? 'HIGH' : si.riskScore > 25 ? 'MEDIUM' : 'LOW',
          factors: si.riskScore > 25 ? [{ factor: 'Sample Risk Factor', score: si.riskScore, detail: 'Demo data', icon: '⚠️' }] : []
        },
        evidence: [{
          cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          pHash: Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          aiAnalysis: {
            detectedStage: si.stage,
            confidence: 70 + Math.random() * 25,
            observations: [`${si.stage} level construction visible`, 'Construction materials present'],
            mismatch: si.riskScore > 40,
            suspiciousEvidence: si.riskScore > 60,
            reason: si.riskScore > 40 ? 'Stage mismatch detected' : 'Construction consistent with selected stage'
          },
          duplicateCheck: { isExactDuplicate: false, isSimilar: false, similarPhotos: [] },
          fakeImageCheck: { isSuspicious: false, confidence: 5, flags: [] }
        }],
        status: si.status,
        reviewedBy: si.status !== 'pending' ? users[0]._id : undefined,
        reviewedAt: si.status !== 'pending' ? new Date() : undefined
      });

      // Create installment for verified inspections
      if (si.status === 'verified') {
        const amounts = { Foundation: 50000, Plinth: 40000, Lintel: 30000, Completion: 30000 };
        await Installment.create({
          beneficiaryId: b._id,
          inspectionId: inspection._id,
          stage: si.stage,
          installmentNumber: stages.indexOf(si.stage) + 1,
          amount: amounts[si.stage],
          status: 'approved',
          riskScore: si.riskScore,
          riskLevel: si.riskScore > 25 ? 'MEDIUM' : 'LOW',
          approvedBy: users[0]._id,
          approvedAt: new Date()
        });
      }

      console.log(`📋 Inspection: ${b.name} — ${si.stage} [${si.status}] Risk: ${si.riskScore}`);
    }

    // Audit log
    await AuditLog.create({ action: 'DATABASE_SEEDED', entityType: 'System', userName: 'System', details: { message: 'Demo data loaded' } });

    console.log('\n✅ Seed data loaded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Admin:   admin@smartgram.gov.in / admin123');
    console.log('   Officer: rajesh@smartgram.gov.in / officer123');
    console.log('   Officer: sunita@smartgram.gov.in / officer123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();

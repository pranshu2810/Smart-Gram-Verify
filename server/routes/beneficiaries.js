const router = require('express').Router();
const { body, validationResult, query } = require('express-validator');
const Beneficiary = require('../models/Beneficiary');
const { protect, authorize } = require('../middleware/auth');
const { verifyBeneficiaryEligibility, findDuplicateBeneficiaries } = require('../services/mockGovService');
const { AuditLog } = require('../models/Installment');

// GET /api/beneficiaries — list & search
router.get('/', protect, async (req, res) => {
  try {
    const { search, village, block, district, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (village) filter.village = new RegExp(village, 'i');
    if (block) filter.block = new RegExp(block, 'i');
    if (district) filter.district = new RegExp(district, 'i');
    if (status) filter.status = status;

    const Inspection = require('../models/Inspection');
    const total = await Beneficiary.countDocuments(filter);
    const beneficiaries = await Beneficiary.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    // Attach latest inspection with dual-evidence synthesis to each beneficiary
    const beneficiaryIds = beneficiaries.map(b => b._id);
    const latestInspections = await Inspection.find({ beneficiaryId: { $in: beneficiaryIds } })
      .sort({ createdAt: -1 })
      .lean();

    const inspMap = {};
    for (const insp of latestInspections) {
      const bKey = insp.beneficiaryId.toString();
      if (!inspMap[bKey]) {
        inspMap[bKey] = insp;
      }
    }

    const enriched = beneficiaries.map(b => {
      const bObj = b.toObject();
      bObj.latestInspection = inspMap[b._id.toString()] || null;
      return bObj;
    });

    res.json({ success: true, data: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/beneficiaries/public/track — Public tracking for Citizen/Beneficiary Portal
router.get('/public/track', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide householdId, aadhaarLast4, phone, or name' });
    }

    const q = query.trim();
    const filter = {
      $or: [
        { householdId: new RegExp('^' + q + '$', 'i') },
        { aadhaarLast4: q },
        { phone: q },
        { name: new RegExp(q, 'i') },
        { bplNumber: new RegExp(q, 'i') }
      ]
    };

    if (q.match(/^[0-9a-fA-F]{24}$/)) {
      filter.$or.push({ _id: q });
    }

    const beneficiary = await Beneficiary.findOne(filter);
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'No beneficiary found matching this query' });
    }

    const Inspection = require('../models/Inspection');
    const { Installment } = require('../models/Installment');

    const inspections = await Inspection.find({ beneficiaryId: beneficiary._id })
      .sort({ createdAt: 1 })
      .populate('officerId', 'name district block')
      .populate('reviewedBy', 'name');

    const installments = await Installment.find({ beneficiaryId: beneficiary._id })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        beneficiary,
        inspections,
        installments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/beneficiaries
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Beneficiary full name is required'),
  body('fatherName').trim().notEmpty().withMessage("Father's name is required"),
  body('village').trim().notEmpty().withMessage('Village / Gram Panchayat is required'),
  body('block').trim().notEmpty().withMessage('Block is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('category').optional().isIn(['SC', 'ST', 'OBC', 'General', 'Minority']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array().map(e => e.msg || `${e.param} is invalid`).join(', ');
      return res.status(400).json({ success: false, errors: errors.array(), message: errorMsg });
    }

    const data = { ...req.body, createdBy: req.user._id };

    // Clean Aadhaar to last 4 digits
    if (data.aadhaarLast4) {
      const digits = String(data.aadhaarLast4).replace(/\D/g, '');
      data.aadhaarLast4 = digits.length >= 4 ? digits.slice(-4) : digits;
    }

    // Clean phone number
    if (data.phone) {
      data.phone = String(data.phone).replace(/\D/g, '').slice(-10);
    }

    // Auto-generate Household ID if not provided
    if (!data.householdId || !data.householdId.trim()) {
      const vPrefix = (data.village || 'GP').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PMA';
      const rand = Math.floor(100 + Math.random() * 900);
      data.householdId = `HH-${vPrefix}-${rand}`;
    }

    // Auto-generate BPL Number if not provided
    if (!data.bplNumber) {
      data.bplNumber = `BPL-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // Ensure address is present (required by Mongoose schema)
    if (!data.address || !data.address.trim()) {
      data.address = `${data.village}, Block ${data.block}, ${data.district}`;
    }

    // Ensure category is valid (required by Mongoose schema)
    if (!data.category || !['SC', 'ST', 'OBC', 'General', 'Minority'].includes(data.category)) {
      data.category = 'General';
    }

    // Ensure registeredLocation has valid coordinates
    const lat = parseFloat(data.registeredLocation?.latitude);
    const lng = parseFloat(data.registeredLocation?.longitude);
    data.registeredLocation = {
      latitude: !isNaN(lat) && lat >= -90 && lat <= 90 ? lat : 23.2599,
      longitude: !isNaN(lng) && lng >= -180 && lng <= 180 ? lng : 77.4126,
      address: data.address || data.village
    };

    const beneficiary = await Beneficiary.create(data);

    // Run mock government verification
    const govCheck = verifyBeneficiaryEligibility(beneficiary);
    beneficiary.govVerificationStatus = govCheck.verified ? (govCheck.eligible ? 'verified' : 'failed') : 'pending';
    beneficiary.govVerificationData = govCheck;

    // Check for duplicates
    const duplicates = await findDuplicateBeneficiaries(beneficiary, Beneficiary);
    if (duplicates.length > 0) {
      beneficiary.isDuplicateSuspect = true;
      beneficiary.duplicateMatchIds = duplicates.map(d => d.existingId);
    }

    await beneficiary.save();

    await AuditLog.create({
      action: 'BENEFICIARY_CREATED',
      entityType: 'Beneficiary',
      entityId: beneficiary._id,
      userId: req.user._id,
      userName: req.user.name,
      details: { name: beneficiary.name, village: beneficiary.village, householdId: beneficiary.householdId }
    });

    res.status(201).json({ success: true, data: beneficiary, govVerification: govCheck, duplicates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/beneficiaries/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    await AuditLog.create({
      action: 'BENEFICIARY_UPDATED', entityType: 'Beneficiary', entityId: beneficiary._id,
      userId: req.user._id, userName: req.user.name
    });

    res.json({ success: true, data: beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/beneficiaries/:id/verify — Run mock government verification
router.post('/:id/verify', protect, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    const govCheck = verifyBeneficiaryEligibility(beneficiary);
    beneficiary.govVerificationStatus = govCheck.verified ? (govCheck.eligible ? 'verified' : 'failed') : 'pending';
    beneficiary.govVerificationData = govCheck;
    await beneficiary.save();

    res.json({ success: true, data: beneficiary, verification: govCheck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

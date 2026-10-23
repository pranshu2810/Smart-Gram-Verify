const router = require('express').Router();
const Inspection = require('../models/Inspection');
const Beneficiary = require('../models/Beneficiary');
const { Installment, AuditLog } = require('../models/Installment');
const { protect, authorize } = require('../middleware/auth');

// GET /api/dashboard/stats — Overview statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalBeneficiaries,
      activeBeneficiaries,
      totalInspections,
      pendingInspections,
      verifiedInspections,
      rejectedInspections,
      reinspections,
      totalInstallments,
      approvedInstallments
    ] = await Promise.all([
      Beneficiary.countDocuments(),
      Beneficiary.countDocuments({ status: 'active' }),
      Inspection.countDocuments(),
      Inspection.countDocuments({ status: 'pending' }),
      Inspection.countDocuments({ status: 'verified' }),
      Inspection.countDocuments({ status: 'rejected' }),
      Inspection.countDocuments({ status: 'reinspection' }),
      Installment.countDocuments(),
      Installment.countDocuments({ status: { $in: ['approved', 'disbursed'] } })
    ]);

    // Risk distribution
    const riskAgg = await Inspection.aggregate([
      { $group: { _id: '$riskScore.level', count: { $sum: 1 } } }
    ]);
    const riskDistribution = {};
    riskAgg.forEach(r => { riskDistribution[r._id || 'N/A'] = r.count; });

    // Stage distribution
    const stageAgg = await Inspection.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: '$officerSelectedStage', count: { $sum: 1 } } }
    ]);
    const stageDistribution = {};
    stageAgg.forEach(s => { stageDistribution[s._id] = s.count; });

    // Total disbursed amount
    const amountAgg = await Installment.aggregate([
      { $match: { status: { $in: ['approved', 'disbursed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDisbursed = amountAgg[0]?.total || 0;

    // Recent inspections
    const recentInspections = await Inspection.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('beneficiaryId', 'name village')
      .populate('officerId', 'name')
      .select('officerSelectedStage status riskScore createdAt');

    // High-risk cases
    const highRiskCases = await Inspection.find({ 'riskScore.score': { $gte: 50 } })
      .sort({ 'riskScore.score': -1 })
      .limit(10)
      .populate('beneficiaryId', 'name village')
      .populate('officerId', 'name');

    res.json({
      success: true,
      data: {
        overview: {
          totalBeneficiaries, activeBeneficiaries,
          totalInspections, pendingInspections, verifiedInspections, rejectedInspections, reinspections,
          totalInstallments, approvedInstallments, totalDisbursed
        },
        riskDistribution,
        stageDistribution,
        recentInspections,
        highRiskCases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/audit-logs
router.get('/audit-logs', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType } = req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (entityType) filter.entityType = entityType;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    res.json({ success: true, data: logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/installments
router.get('/installments', protect, async (req, res) => {
  try {
    const { status, stage, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (stage) filter.stage = stage;

    const total = await Installment.countDocuments(filter);
    const installments = await Installment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('beneficiaryId', 'name village district')
      .populate('inspectionId', 'officerSelectedStage riskScore')
      .populate('approvedBy', 'name');

    res.json({ success: true, data: installments, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/dashboard/installments/:id — Approve/reject installment
router.put('/installments/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const installment = await Installment.findById(req.params.id);
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });

    installment.status = status;
    installment.notes = notes;
    if (status === 'approved' || status === 'disbursed') {
      installment.approvedBy = req.user._id;
      installment.approvedAt = new Date();
    }
    if (status === 'disbursed') installment.disbursedAt = new Date();
    await installment.save();

    await AuditLog.create({
      action: `INSTALLMENT_${status.toUpperCase()}`, entityType: 'Installment', entityId: installment._id,
      userId: req.user._id, userName: req.user.name,
      details: { stage: installment.stage, amount: installment.amount, status }
    });

    res.json({ success: true, data: installment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/risk-map — Geo Risk & Progress Map Data for Officer & Admin
router.get('/risk-map', protect, async (req, res) => {
  try {
    const { lat, lng, radiusKm, village, riskLevel } = req.query;

    const beneficiaries = await Beneficiary.find()
      .populate('createdBy', 'name')
      .lean();

    const mapPoints = await Promise.all(beneficiaries.map(async (b) => {
      const inspections = await Inspection.find({ beneficiaryId: b._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();
      
      const latestInspection = inspections[0] || null;

      const verifiedInspections = await Inspection.find({ beneficiaryId: b._id, status: 'verified' }).lean();
      const verifiedStages = verifiedInspections.map(i => i.officerSelectedStage);
      
      let currentStage = 'Foundation';
      let progressPct = 20;

      if (verifiedStages.includes('Completion')) {
        currentStage = 'Completion';
        progressPct = 100;
      } else if (verifiedStages.includes('Roof')) {
        currentStage = 'Roof';
        progressPct = 85;
      } else if (verifiedStages.includes('Lintel')) {
        currentStage = 'Lintel';
        progressPct = 65;
      } else if (verifiedStages.includes('Plinth')) {
        currentStage = 'Plinth';
        progressPct = 40;
      } else if (latestInspection) {
        currentStage = latestInspection.officerSelectedStage || 'Foundation';
      }

      const riskScore = latestInspection?.riskScore?.score || (b.isDuplicateSuspect ? 80 : 15);
      const riskTier = latestInspection?.riskScore?.level || (riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low');

      let distanceKm = null;
      if (lat && lng && b.registeredLocation?.latitude && b.registeredLocation?.longitude) {
        const R = 6371; // Earth radius in km
        const dLat = (b.registeredLocation.latitude - parseFloat(lat)) * Math.PI / 180;
        const dLon = (b.registeredLocation.longitude - parseFloat(lng)) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(parseFloat(lat) * Math.PI / 180) * Math.cos(b.registeredLocation.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distanceKm = Math.round(R * c * 10) / 10;
      }

      return {
        _id: b._id,
        householdId: b.householdId,
        name: b.name,
        fatherName: b.fatherName,
        village: b.village,
        block: b.block,
        district: b.district,
        category: b.category,
        bplNumber: b.bplNumber,
        registeredLocation: b.registeredLocation,
        currentStage,
        progressPct,
        riskScore,
        riskTier,
        isDuplicateSuspect: b.isDuplicateSuspect,
        latestInspection: latestInspection ? {
          _id: latestInspection._id,
          officerSelectedStage: latestInspection.officerSelectedStage,
          status: latestInspection.status,
          riskScore: latestInspection.riskScore,
          photoUrl: latestInspection.photos?.[0]?.url,
          createdAt: latestInspection.createdAt
        } : null,
        distanceKm
      };
    }));

    let filteredPoints = mapPoints.filter(p => p.registeredLocation?.latitude && p.registeredLocation?.longitude);
    if (radiusKm && lat && lng) {
      const maxR = parseFloat(radiusKm);
      filteredPoints = filteredPoints.filter(p => p.distanceKm !== null && p.distanceKm <= maxR);
    }
    if (village) {
      filteredPoints = filteredPoints.filter(p => p.village.toLowerCase().includes(village.toLowerCase()));
    }
    if (riskLevel && riskLevel !== 'all') {
      filteredPoints = filteredPoints.filter(p => p.riskTier.toLowerCase() === riskLevel.toLowerCase());
    }

    const totalInRadius = filteredPoints.length;
    const completedCount = filteredPoints.filter(p => p.progressPct === 100).length;
    const highRiskCount = filteredPoints.filter(p => p.riskTier === 'high').length;
    const avgProgress = totalInRadius > 0 
      ? Math.round(filteredPoints.reduce((acc, p) => acc + p.progressPct, 0) / totalInRadius)
      : 0;

    res.json({
      success: true,
      data: {
        points: filteredPoints,
        summary: {
          totalInRadius,
          completedCount,
          inProgressCount: totalInRadius - completedCount,
          highRiskCount,
          avgProgress
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


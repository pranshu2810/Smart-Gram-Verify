/**
 * MOCK Government Verification Service
 * =====================================
 * THIS IS A MOCK/DEMO SERVICE — NOT connected to any real government system.
 * In production, this would integrate with actual government APIs for:
 * - Aadhaar verification (UIDAI)
 * - PMAY beneficiary database
 * - BPL/SECC database
 * - Land records
 * =====================================
 */

// Mock beneficiary database (simulating government records)
const MOCK_GOV_RECORDS = [
  { aadhaarLast4: '4523', name: 'Ramesh Kumar', fatherName: 'Shankar Prasad', village: 'Barkheda', eligible: true, previousBenefit: false },
  { aadhaarLast4: '7891', name: 'Sita Devi', fatherName: 'Mohan Lal', village: 'Piparia', eligible: true, previousBenefit: false },
  { aadhaarLast4: '3456', name: 'Gopal Singh', fatherName: 'Bhagwan Das', village: 'Berasia', eligible: true, previousBenefit: true },
  { aadhaarLast4: '9012', name: 'Kamla Bai', fatherName: 'Nathu Ram', village: 'Sehore', eligible: false, previousBenefit: false },
  { aadhaarLast4: '5678', name: 'Lakhan Ahirwar', fatherName: 'Devi Prasad', village: 'Barkheda', eligible: true, previousBenefit: false },
  { aadhaarLast4: '2345', name: 'Phool Bai', fatherName: 'Hari Shankar', village: 'Mandideep', eligible: true, previousBenefit: true },
];

/**
 * Verify beneficiary eligibility against mock government records
 * [MOCK SERVICE — Demo only]
 */
function verifyBeneficiaryEligibility(beneficiary) {
  const record = MOCK_GOV_RECORDS.find(r =>
    r.aadhaarLast4 === beneficiary.aadhaarLast4 ||
    (r.name.toLowerCase().includes(beneficiary.name.toLowerCase().split(' ')[0]) &&
     r.village.toLowerCase() === beneficiary.village.toLowerCase())
  );

  if (!record) {
    return {
      verified: false,
      source: 'MOCK_GOV_DATABASE',
      disclaimer: 'This is a MOCK verification — not connected to real government systems',
      eligible: null,
      previousBenefit: null,
      message: 'No matching record found in mock government database'
    };
  }

  return {
    verified: true,
    source: 'MOCK_GOV_DATABASE',
    disclaimer: 'This is a MOCK verification — not connected to real government systems',
    eligible: record.eligible,
    previousBenefit: record.previousBenefit,
    matchedName: record.name,
    matchedVillage: record.village,
    message: record.eligible
      ? (record.previousBenefit
        ? '⚠️ [MOCK] Beneficiary found but has PREVIOUS housing benefit on record'
        : '✅ [MOCK] Beneficiary verified and eligible')
      : '❌ [MOCK] Beneficiary found but NOT eligible per records'
  };
}

/**
 * Check for duplicate beneficiaries using fuzzy name matching
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
    }
  }
  return dp[m][n];
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  return Math.round((1 - levenshtein(a, b) / maxLen) * 100);
}

async function findDuplicateBeneficiaries(beneficiary, Beneficiary) {
  const allBeneficiaries = await Beneficiary.find({ _id: { $ne: beneficiary._id } }).lean();
  const duplicates = [];

  for (const existing of allBeneficiaries) {
    const nameMatch = stringSimilarity(beneficiary.name, existing.name);
    const fatherMatch = stringSimilarity(beneficiary.fatherName, existing.fatherName);
    const villageMatch = stringSimilarity(beneficiary.village, existing.village);
    const composite = (nameMatch * 0.4) + (fatherMatch * 0.3) + (villageMatch * 0.3);

    // Exact Aadhaar match
    if (beneficiary.aadhaarLast4 && existing.aadhaarLast4 && beneficiary.aadhaarLast4 === existing.aadhaarLast4 && composite > 50) {
      duplicates.push({ existingId: existing._id, matchScore: 100, type: 'AADHAAR_MATCH', name: existing.name });
      continue;
    }

    if (composite > 75) {
      duplicates.push({
        existingId: existing._id,
        matchScore: Math.round(composite),
        type: composite > 90 ? 'LIKELY_DUPLICATE' : 'POTENTIAL_DUPLICATE',
        name: existing.name,
        details: { nameMatch, fatherMatch, villageMatch }
      });
    }
  }

  return duplicates.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { verifyBeneficiaryEligibility, findDuplicateBeneficiaries, MOCK_GOV_RECORDS };

/**
 * GPS Geofencing — verify officer is near the registered construction site
 */
function verifyGPS(officerLocation, registeredLocation, maxRadiusMeters = 200) {
  if (!officerLocation || !registeredLocation) {
    return {
      withinFence: false,
      distance: null,
      maxRadius: maxRadiusMeters,
      risk: 'HIGH',
      message: 'GPS data missing'
    };
  }

  const distance = haversineDistance(
    officerLocation.latitude, officerLocation.longitude,
    registeredLocation.latitude, registeredLocation.longitude
  );

  const withinFence = distance <= maxRadiusMeters;

  return {
    withinFence,
    distance: Math.round(distance),
    maxRadius: maxRadiusMeters,
    risk: !withinFence ? (distance > maxRadiusMeters * 5 ? 'HIGH' : 'MEDIUM') : 'LOW',
    message: withinFence
      ? `Officer within ${Math.round(distance)}m of site (limit: ${maxRadiusMeters}m)`
      : `GPS mismatch: ${Math.round(distance)}m from site (limit: ${maxRadiusMeters}m)`
  };
}

/**
 * Timestamp verification — detect backdated or manipulated timestamps
 */
function verifyTimestamps(deviceTimestamp, serverTimestamp) {
  const device = new Date(deviceTimestamp);
  const server = new Date(serverTimestamp || Date.now());
  const diffSeconds = Math.abs(device - server) / 1000;
  const issues = [];
  let riskScore = 0;

  if (device > server && (device - server) / 1000 > 300) {
    issues.push({ type: 'FUTURE_TIMESTAMP', message: 'Device timestamp is in the future', severity: 'HIGH' });
    riskScore += 25;
  }

  if (diffSeconds > 86400) {
    issues.push({ type: 'LARGE_DRIFT', message: `Timestamp differs by ${Math.round(diffSeconds / 3600)} hours`, severity: 'HIGH' });
    riskScore += 20;
  } else if (diffSeconds > 3600) {
    issues.push({ type: 'MODERATE_DRIFT', message: `Timestamp differs by ${Math.round(diffSeconds / 60)} minutes`, severity: 'MEDIUM' });
    riskScore += 10;
  }

  return {
    valid: issues.length === 0,
    deviceTimestamp: device.toISOString(),
    serverTimestamp: server.toISOString(),
    diffSeconds: Math.round(diffSeconds),
    issues,
    riskContribution: Math.min(riskScore, 30),
    risk: riskScore > 20 ? 'HIGH' : riskScore > 10 ? 'MEDIUM' : 'LOW'
  };
}

/**
 * Haversine formula — distance in meters between two GPS coordinates
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }

/**
 * Validate stage progression — prevent skipping stages
 */
function validateStageProgression(previousStages, newStage) {
  const STAGES = ['Foundation', 'Plinth', 'Lintel', 'Completion'];
  const newIdx = STAGES.indexOf(newStage);
  if (newIdx === -1) return { valid: false, message: 'Invalid stage' };
  if (newIdx === 0) return { valid: true, message: 'Foundation is the first stage' };

  const requiredPrevious = STAGES[newIdx - 1];
  const hasRequired = previousStages.some(s =>
    s.stage === requiredPrevious && s.status === 'verified'
  );

  if (!hasRequired) {
    return {
      valid: false,
      message: `Cannot start ${newStage} — ${requiredPrevious} stage must be verified first`
    };
  }
  return { valid: true, message: `Stage progression valid: ${requiredPrevious} → ${newStage}` };
}

module.exports = { verifyGPS, verifyTimestamps, haversineDistance, validateStageProgression };

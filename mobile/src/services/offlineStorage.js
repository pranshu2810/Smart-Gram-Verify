import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = 'sg_offline_queue';
const CACHED_BENEFICIARIES_KEY = 'sg_cached_beneficiaries';
const CACHED_INSPECTIONS_KEY = 'sg_cached_inspections';
const OFFLINE_MODE_FLAG = 'sg_offline_mode_flag';

/**
 * Offline storage service for inspections that couldn't be synced
 * Supports both Photo inspections and Video Walkthrough inspections
 */
export async function getOfflineQueue() {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export async function addToOfflineQueue(inspection) {
  const queue = await getOfflineQueue();
  const newItem = {
    ...inspection,
    mediaType: inspection.mediaType || (inspection.videoUri ? 'video' : 'photo'),
    offlineId: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    savedAt: new Date().toISOString(),
    syncStatus: 'pending'
  };
  queue.push(newItem);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return queue;
}

export async function removeFromOfflineQueue(offlineId) {
  const queue = await getOfflineQueue();
  const filtered = queue.filter(i => i.offlineId !== offlineId);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  return filtered;
}

export async function clearOfflineQueue() {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function getOfflineQueueCount() {
  const queue = await getOfflineQueue();
  return queue.length;
}

// ── Offline Beneficiaries Cache ──
export async function cacheBeneficiaries(beneficiaries) {
  try {
    if (Array.isArray(beneficiaries) && beneficiaries.length > 0) {
      await AsyncStorage.setItem(CACHED_BENEFICIARIES_KEY, JSON.stringify(beneficiaries));
    }
  } catch (e) {
    console.log('Error caching beneficiaries:', e);
  }
}

export async function getCachedBeneficiaries() {
  try {
    const data = await AsyncStorage.getItem(CACHED_BENEFICIARIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ── Offline Inspections Cache ──
export async function cacheInspections(inspections) {
  try {
    if (Array.isArray(inspections) && inspections.length > 0) {
      await AsyncStorage.setItem(CACHED_INSPECTIONS_KEY, JSON.stringify(inspections));
    }
  } catch (e) {
    console.log('Error caching inspections:', e);
  }
}

export async function getCachedInspections() {
  try {
    const data = await AsyncStorage.getItem(CACHED_INSPECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ── Manual Offline Mode Simulation Toggle ──
export async function setSimulatedOffline(isOffline) {
  await AsyncStorage.setItem(OFFLINE_MODE_FLAG, isOffline ? 'true' : 'false');
}

export async function isSimulatedOffline() {
  const flag = await AsyncStorage.getItem(OFFLINE_MODE_FLAG);
  return flag === 'true';
}

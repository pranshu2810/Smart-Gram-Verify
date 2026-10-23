import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import {
  getOfflineQueue,
  removeFromOfflineQueue,
  clearOfflineQueue,
  isSimulatedOffline,
  setSimulatedOffline
} from '../services/offlineStorage';
import api from '../api/client';

export default function OfflineQueueScreen({ navigation }) {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [offlineSimulated, setOfflineSimulatedState] = useState(false);

  useEffect(() => {
    loadQueue();
    checkOfflineStatus();
  }, []);

  const loadQueue = async () => {
    const q = await getOfflineQueue();
    setQueue(q);
  };

  const checkOfflineStatus = async () => {
    const status = await isSimulatedOffline();
    setOfflineSimulatedState(status);
  };

  const toggleOfflineSimulation = async (value) => {
    await setSimulatedOffline(value);
    setOfflineSimulatedState(value);
  };

  // Sync a single offline item (photo or video)
  const syncItem = async (item) => {
    try {
      const isVideo = item.mediaType === 'video' || !!item.videoUri;
      const formData = new FormData();

      if (isVideo) {
        // Video Sync Endpoint
        formData.append('beneficiaryId', item.beneficiaryId || '');
        formData.append('officerStage', item.officerSelectedStage || 'Plinth');
        formData.append('latitude', (item.latitude || 23.6345).toString());
        formData.append('longitude', (item.longitude || 77.4231).toString());
        formData.append('accuracy', (item.accuracy || 10).toString());
        formData.append('deviceTimestamp', item.deviceTimestamp || new Date().toISOString());
        formData.append('numKeyframes', '5');

        const uri = item.videoUri;
        const filename = uri.split('/').pop() || `offline_video_${Date.now()}.mp4`;
        formData.append('video', {
          uri,
          type: 'video/mp4',
          name: filename,
        });

        const res = await api.post('/inspections/verify-video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000
        });

        if (res.data) {
          await removeFromOfflineQueue(item.offlineId);
          return true;
        }
      } else {
        // Photo Sync Endpoint
        formData.append('beneficiaryId', item.beneficiaryId);
        formData.append('officerSelectedStage', item.officerSelectedStage);
        formData.append('latitude', (item.latitude || 23.6345).toString());
        formData.append('longitude', (item.longitude || 77.4231).toString());
        formData.append('accuracy', (item.accuracy || 10).toString());
        formData.append('deviceTimestamp', item.deviceTimestamp || new Date().toISOString());
        formData.append('officerNotes', item.notes || '');
        formData.append('isOfflineCreated', 'true');

        if (item.photoUri) {
          const uri = item.photoUri;
          const filename = uri.split('/').pop() || `offline_photo_${Date.now()}.jpg`;
          formData.append('photos', {
            uri,
            type: 'image/jpeg',
            name: filename,
          });
        }

        const res = await api.post('/inspections', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 90000
        });

        if (res.data && res.data.success) {
          await removeFromOfflineQueue(item.offlineId);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.log('Sync failed for item:', item.offlineId, err.message);
      return false;
    }
  };

  const syncAll = async () => {
    if (offlineSimulated) {
      return Alert.alert('Offline Mode Active', 'Turn off "Simulated Offline Mode" above to sync records with the server.');
    }

    setSyncing(true);
    let success = 0, failed = 0;
    for (const item of queue) {
      const res = await syncItem(item);
      if (res) success++;
      else failed++;
    }
    await loadQueue();
    setSyncing(false);
    Alert.alert('Sync Finished', `✅ ${success} uploaded successfully\n${failed > 0 ? `❌ ${failed} failed to sync (server error or invalid file)` : ''}`);
  };

  const handleClear = () => {
    Alert.alert('Clear Queue', 'Delete all pending offline inspections? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await clearOfflineQueue();
          await loadQueue();
        }
      }
    ]);
  };

  const renderItem = ({ item }) => {
    const isVideo = item.mediaType === 'video' || !!item.videoUri;
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemBadgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: isVideo ? '#f3e8ff' : '#eff6ff' }]}>
              <Text style={[styles.typeBadgeText, { color: isVideo ? '#9333ea' : '#3b82f6' }]}>
                {isVideo ? '🎥 Walkthrough Video' : '📸 Photo Evidence'}
              </Text>
            </View>
            <View style={styles.pendingDot} />
          </View>
          <Text style={styles.itemName}>{item.beneficiaryName || 'Beneficiary Site'}</Text>
        </View>

        <Text style={styles.itemDetail}>
          Stage: <Text style={{ fontWeight: '700', color: '#1e293b' }}>{item.officerSelectedStage || 'Plinth'}</Text>
        </Text>
        <Text style={styles.itemGps}>
          📍 GPS: {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)} (±{Math.round(item.accuracy || 10)}m)
        </Text>
        <Text style={styles.itemTime}>Saved: {new Date(item.savedAt).toLocaleString('en-IN')}</Text>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.singleSyncBtn}
            onPress={async () => {
              setSyncing(true);
              const ok = await syncItem(item);
              await loadQueue();
              setSyncing(false);
              if (ok) Alert.alert('Success', 'Inspection synced to central server');
              else Alert.alert('Failed', 'Could not sync. Ensure server is online.');
            }}
            disabled={syncing}
          >
            <Text style={styles.singleSyncText}>🔄 Sync Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Simulation Toggle Banner */}
      <View style={styles.simCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.simTitle}>⚡ Simulate Offline Mode</Text>
          <Text style={styles.simSub}>Enables full offline workflow testing on this device</Text>
        </View>
        <Switch
          value={offlineSimulated}
          onValueChange={toggleOfflineSimulation}
          trackColor={{ false: '#cbd5e1', true: '#a855f7' }}
          thumbColor={offlineSimulated ? '#7c3aed' : '#f8fafc'}
        />
      </View>

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.countText}>{queue.length} inspection(s) queued on device</Text>
        {queue.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.syncBtn} onPress={syncAll} disabled={syncing}>
              {syncing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.syncText}>🔄 Sync All</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.offlineId}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📶</Text>
            <Text style={styles.emptyTitle}>Offline Queue is Empty</Text>
            <Text style={styles.emptySub}>
              Inspections recorded without cellular connectivity will appear here and can be synced with one tap.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  simCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  simTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  simSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  countText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  syncBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  clearBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearText: { fontSize: 14 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  itemHeader: { marginBottom: 6 },
  itemBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  itemDetail: { fontSize: 13, color: '#475569', marginTop: 2 },
  itemGps: { fontSize: 11, color: '#64748b', marginTop: 3 },
  itemTime: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  itemActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  singleSyncBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  singleSyncText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  emptySub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6, lineHeight: 18 },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import api from '../api/client';
import { cacheInspections, getCachedInspections } from '../services/offlineStorage';

export default function HistoryScreen({ navigation }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/inspections', { params: { limit: 50 } });
      if (data.data && data.data.length > 0) {
        setInspections(data.data);
        setIsFromCache(false);
        await cacheInspections(data.data);
      } else {
        await loadOfflineCache();
      }
    } catch (err) {
      console.log('History online fetch failed, loading cache:', err.message);
      await loadOfflineCache();
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineCache = async () => {
    const cached = await getCachedInspections();
    setInspections(cached);
    setIsFromCache(true);
  };

  const getStatusStyle = (status) => {
    return {
      pending: { bg: '#eff6ff', text: '#3b82f6', label: 'Pending Review' },
      verified: { bg: '#f0fdf4', text: '#16a34a', label: 'Verified & Approved' },
      rejected: { bg: '#fef2f2', text: '#ef4444', label: 'Rejected / Flagged' },
      reinspection: { bg: '#fffbeb', text: '#f59e0b', label: 'Re-inspection Required' },
    }[status] || { bg: '#f1f5f9', text: '#64748b', label: status || 'Pending' };
  };

  const renderItem = ({ item }) => {
    const ss = getStatusStyle(item.status);
    const risk = item.riskScore?.score || 0;
    const isHighRisk = risk > 35;

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('InspectionResult', {
            inspection: item,
            verification: {
              gps: item.gpsVerification,
              timestamp: item.timestampVerification
            },
            beneficiary: item.beneficiaryId || { name: 'Beneficiary Site' }
          })
        }
      >
        <View style={styles.itemTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.beneficiaryId?.name || 'Beneficiary Site'}</Text>
            <Text style={styles.itemVillage}>{item.beneficiaryId?.village || 'PMAY-G Allotment'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
            <Text style={[styles.statusText, { color: ss.text }]}>{ss.label}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>🏗️ {item.officerSelectedStage || 'Plinth'}</Text>
          </View>

          {item.videoEvidence?.cloudinaryUrl || item.videoEvidence?.videoUrl || item.videoEvidence?.verdict ? (
            <View style={[styles.badgePill, { backgroundColor: '#f3e8ff' }]}>
              <Text style={[styles.badgePillText, { color: '#7e22ce' }]}>🎥 Video Attached</Text>
            </View>
          ) : (
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>📸 Photo Only</Text>
            </View>
          )}

          <View style={[styles.badgePill, { backgroundColor: isHighRisk ? '#fef2f2' : '#f0fdf4' }]}>
            <Text style={[styles.badgePillText, { color: isHighRisk ? '#dc2626' : '#16a34a' }]}>
              📊 Risk: {risk}%
            </Text>
          </View>

          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>
              {item.gpsVerification?.withinFence ? '📍 In Geofence' : '📍 Distance Flagged'}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>
          Recorded: {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Recent Inspection'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFromCache && (
        <View style={styles.cacheBanner}>
          <Text style={styles.cacheText}>📦 Offline Mode: Displaying locally cached inspection records</Text>
        </View>
      )}

      <FlatList
        data={inspections}
        keyExtractor={(item) => item._id || item.offlineId || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>📋</Text>
            <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600' }}>No inspections recorded yet</Text>
            <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>
              Start an inspection from the Home Dashboard.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  cacheBanner: {
    backgroundColor: '#fffbeb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  cacheText: { fontSize: 11, color: '#b45309', textAlign: 'center', fontWeight: '600' },
  item: {
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
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  itemVillage: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badgePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 10 },
  empty: { alignItems: 'center', marginTop: 80 },
});

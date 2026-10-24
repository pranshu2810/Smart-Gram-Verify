import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Switch
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  getOfflineQueueCount,
  isSimulatedOffline,
  setSimulatedOffline
} from '../services/offlineStorage';
import NetInfo from '@react-native-community/netinfo';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [offlineCount, setOfflineCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [simulatedOffline, setSimulatedOfflineState] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role || 'officer';

  useEffect(() => {
    loadData();
    checkConnection();
  }, []);

  const loadData = async () => {
    const count = await getOfflineQueueCount();
    setOfflineCount(count);
    const sim = await isSimulatedOffline();
    setSimulatedOfflineState(sim);
  };

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      const sim = await isSimulatedOffline();
      setIsOnline(state.isConnected && !sim);
    } catch {
      setIsOnline(!simulatedOffline);
    }
  };

  const toggleOfflineMode = async (value) => {
    await setSimulatedOffline(value);
    setSimulatedOfflineState(value);
    setIsOnline(!value);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await checkConnection();
    setRefreshing(false);
  };

  // Officer Menu Actions
  const officerMenuItems = [
    {
      icon: '📸',
      title: 'New Inspection (Photo / Video)',
      subtitle: 'Start on-site verification workflow',
      screen: 'Beneficiary',
      color: '#4f46e5'
    },
    {
      icon: '🎥',
      title: 'Video Walkthrough AI Inspector',
      subtitle: 'OpenCV keyframes + Qwen-2.5-VL detection',
      screen: 'VideoInspection',
      color: '#7c3aed'
    },
    {
      icon: '🗺️',
      title: 'PMAY-G Data Risk Map',
      subtitle: 'Geofenced sites & progress radius view',
      screen: 'RiskMap',
      color: '#10b981'
    },
    {
      icon: '📶',
      title: 'Offline Queue',
      subtitle: `${offlineCount} inspection(s) queued on phone`,
      screen: 'OfflineQueue',
      color: '#f59e0b',
      badge: offlineCount
    },
    {
      icon: '📋',
      title: 'Inspection History',
      subtitle: 'Audit logs & past stage evaluations',
      screen: 'History',
      color: '#0284c7'
    },
  ];

  // Admin Menu Actions
  const adminMenuItems = [
    {
      icon: '🗺️',
      title: 'PMAY-G Data Risk Map',
      subtitle: 'Live geographic fraud & milestone cluster map',
      screen: 'RiskMap',
      color: '#10b981'
    },
    {
      icon: '🎥',
      title: 'Video Forensics Audit Tool',
      subtitle: 'Verify anti-fraud & AI diffusion signatures',
      screen: 'VideoInspection',
      color: '#7c3aed'
    },
    {
      icon: '📋',
      title: 'Inspection Registry & Audits',
      subtitle: 'Review all field submissions and logs',
      screen: 'History',
      color: '#0284c7'
    },
    {
      icon: '👥',
      title: 'All Beneficiaries & Schemes',
      subtitle: 'View sanctioned allocations & GPS plots',
      screen: 'Beneficiary',
      color: '#4f46e5'
    },
    {
      icon: '📶',
      title: 'Offline Queue Monitor',
      subtitle: `${offlineCount} items awaiting synchronization`,
      screen: 'OfflineQueue',
      color: '#f59e0b',
      badge: offlineCount
    },
  ];

  // Beneficiary Menu Actions
  const beneficiaryMenuItems = [
    {
      icon: '🏠',
      title: 'My House Construction Status',
      subtitle: 'Current milestone: Plinth • Installment 2 of 4',
      screen: 'History',
      color: '#16a34a'
    },
    {
      icon: '📋',
      title: 'Disbursement Receipts',
      subtitle: 'Bank credit alerts & PFMS tracker',
      screen: 'History',
      color: '#0284c7'
    },
    {
      icon: '🎥',
      title: 'Video Walkthrough Evidence',
      subtitle: 'View submitted 360° site video audits',
      screen: 'VideoInspection',
      color: '#7c3aed'
    },
  ];

  const currentMenuItems =
    role === 'admin' ? adminMenuItems :
    role === 'beneficiary' ? beneficiaryMenuItems :
    officerMenuItems;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Network / Offline Status Header */}
      <View style={[styles.statusBar, { backgroundColor: isOnline ? '#15803d' : '#b91c1c' }]}>
        <Text style={styles.statusText}>
          {isOnline ? '🟢 Connected to Server • Live Mode' : '🔴 Offline Mode • Inspections Saved Locally'}
        </Text>
      </View>

      {/* User Greeting Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Namaste, {user?.name?.split(' ')[0]} 🙏</Text>
          <Text style={styles.roleText}>
            {role.toUpperCase()} PORTAL • {user?.district || 'Madhya Pradesh'}
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Offline Simulation Toggle */}
      <View style={styles.offlineToggleCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>📶 Work in Offline Village Mode</Text>
          <Text style={styles.toggleSub}>Store all photos & videos locally without internet</Text>
        </View>
        <Switch
          value={simulatedOffline}
          onValueChange={toggleOfflineMode}
          trackColor={{ false: '#cbd5e1', true: '#a855f7' }}
          thumbColor={simulatedOffline ? '#7c3aed' : '#f8fafc'}
        />
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>PMAY-G</Text>
          <Text style={styles.statLabel}>Scheme</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, offlineCount > 0 && { color: '#d97706' }]}>{offlineCount}</Text>
          <Text style={styles.statLabel}>Pending Sync</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>₹1.20L</Text>
          <Text style={styles.statLabel}>Sanctioned</Text>
        </View>
      </View>

      {/* Role Notice Banner */}
      {role === 'admin' && (
        <View style={styles.roleBanner}>
          <Text style={styles.roleBannerText}>🏛️ Administrator Console: Reviewing Gram Panchayat inspections & AI flags.</Text>
        </View>
      )}
      {role === 'beneficiary' && (
        <View style={[styles.roleBanner, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <Text style={[styles.roleBannerText, { color: '#15803d' }]}>👤 Beneficiary Dashboard: Direct PMAY-G DBT installment tracking.</Text>
        </View>
      )}

      {/* Actions Section */}
      <Text style={styles.sectionTitle}>
        {role === 'admin' ? 'Administrative Tools' : role === 'beneficiary' ? 'My Services' : 'Field Actions'}
      </Text>

      {currentMenuItems.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
            <Text style={{ fontSize: 24 }}>{item.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          {item.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <Text style={{ color: '#94a3b8', fontSize: 18, fontWeight: '700' }}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Video Walkthrough Highlights Card */}
      <View style={styles.featureCard}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 22 }}>🤖</Text>
          <Text style={styles.featureTitle}>Qwen-2.5-VL Multimodal Vision AI</Text>
        </View>
        <Text style={styles.featureDesc}>
          • Detects laptop/mobile screen recording fraud instantly.{'\n'}
          • Extracts 5 OpenCV keyframes with cryptographic SHA-256.{'\n'}
          • Evaluates 3D optical flow motion and real physical masonry.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  statusBar: { paddingVertical: 6, alignItems: 'center' },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  greeting: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  roleText: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  logoutText: { color: '#dc2626', fontSize: 11, fontWeight: '700' },
  offlineToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleTitle: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  toggleSub: { fontSize: 10, color: '#64748b', marginTop: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '500' },
  roleBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
  },
  roleBannerText: { fontSize: 11, color: '#1e40af', fontWeight: '600' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  menuSubtitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
  badge: { backgroundColor: '#f59e0b', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  featureCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  featureDesc: { fontSize: 11, color: '#475569', lineHeight: 18 },
});

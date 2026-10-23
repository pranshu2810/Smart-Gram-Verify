import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import api from '../api/client';
import { cacheBeneficiaries, getCachedBeneficiaries } from '../services/offlineStorage';

const DEFAULT_OFFLINE_BENEFICIARIES = [
  {
    _id: '65f000000000000000000001',
    name: 'Ramesh Kumar',
    fatherName: 'Ram Prasad',
    village: 'Pipariya',
    block: 'Sohagpur',
    district: 'Hoshangabad',
    schemeName: 'PMAY-G Rural Housing',
    category: 'SC',
    status: 'active',
    allottedAmount: 120000,
    currentStage: 'Plinth'
  },
  {
    _id: '65f000000000000000000002',
    name: 'Sunita Devi',
    fatherName: 'Late Mohan Lal',
    village: 'Semri',
    block: 'Babai',
    district: 'Hoshangabad',
    schemeName: 'PMAY-G Rural Housing',
    category: 'OBC',
    status: 'active',
    allottedAmount: 120000,
    currentStage: 'Foundation'
  },
  {
    _id: '65f000000000000000000003',
    name: 'Kamlesh Patel',
    fatherName: 'Shyamlal Patel',
    village: 'Bankhedi',
    block: 'Bankhedi',
    district: 'Hoshangabad',
    schemeName: 'PMAY-G Rural Housing',
    category: 'GEN',
    status: 'active',
    allottedAmount: 120000,
    currentStage: 'Lintel'
  }
];

export default function BeneficiaryScreen({ navigation }) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async (query = '') => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (query) params.search = query;

      const { data } = await api.get('/beneficiaries', { params });
      if (data.data && data.data.length > 0) {
        setBeneficiaries(data.data);
        setIsFromCache(false);
        await cacheBeneficiaries(data.data);
      } else {
        await loadOfflineFallback(query);
      }
    } catch (err) {
      console.log('Online fetch failed, loading offline cache:', err.message);
      await loadOfflineFallback(query);
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineFallback = async (query = '') => {
    const cached = await getCachedBeneficiaries();
    const source = cached.length > 0 ? cached : DEFAULT_OFFLINE_BENEFICIARIES;
    setIsFromCache(true);

    if (query) {
      const q = query.toLowerCase();
      const filtered = source.filter(
        b => b.name?.toLowerCase().includes(q) || b.village?.toLowerCase().includes(q)
      );
      setBeneficiaries(filtered);
    } else {
      setBeneficiaries(source);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 1 || text.length === 0) fetchBeneficiaries(text);
  };

  const selectBeneficiary = (beneficiary) => {
    navigation.navigate('StageSelection', { beneficiary });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => selectBeneficiary(item)} activeOpacity={0.7}>
      <View style={styles.itemIcon}>
        <Text style={{ fontSize: 20 }}>🏠</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetail}>S/o {item.fatherName}</Text>
        <Text style={styles.itemDetail}>{item.village}, {item.block}, {item.district}</Text>
        <Text style={styles.itemScheme}>{item.schemeName} • {item.category}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#22c55e' : '#ef4444' }]} />
        <Text style={styles.stagePill}>{item.currentStage || 'Plinth'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Offline Mode Banner */}
      {isFromCache && (
        <View style={styles.cacheBanner}>
          <Text style={styles.cacheText}>📦 Offline Mode: Showing cached village beneficiaries</Text>
        </View>
      )}

      <TextInput
        style={styles.searchBar}
        placeholder="🔍 Search beneficiary by name or village..."
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={beneficiaries}
          keyExtractor={(item) => item._id || item.offlineId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>👥</Text>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>No beneficiaries found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  cacheBanner: {
    backgroundColor: '#fffbeb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  cacheText: { fontSize: 11, color: '#b45309', textAlign: 'center', fontWeight: '600' },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  itemDetail: { fontSize: 12, color: '#64748b', marginTop: 1 },
  itemScheme: { fontSize: 10, color: '#4f46e5', fontWeight: '600', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  stagePill: { fontSize: 10, color: '#0284c7', fontWeight: '700', backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
});

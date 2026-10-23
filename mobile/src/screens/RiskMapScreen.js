import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import api from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHED_MAP_DATA_KEY = 'sg_cached_risk_map_data';

const PRESET_CENTERS = [
  { id: 'bhopal', name: 'Bhopal HQ', lat: 23.2599, lng: 77.4126 },
  { id: 'barkheda', name: 'Barkheda GP', lat: 23.6345, lng: 77.4231 },
  { id: 'piparia', name: 'Piparia GP', lat: 23.1992, lng: 77.0851 },
  { id: 'berasia', name: 'Berasia Block', lat: 23.6312, lng: 77.4300 },
  { id: 'sehore', name: 'Sehore Center', lat: 23.2035, lng: 77.0872 },
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

const DEFAULT_MAP_POINTS = [
  {
    _id: 'ben_map_1',
    name: 'Ramesh Kumar',
    village: 'Pipariya',
    district: 'Hoshangabad',
    currentStage: 'Plinth',
    progressPct: 40,
    riskScore: 78,
    riskTier: 'high',
    distanceKm: 3.2,
    registeredLocation: { latitude: 23.2645, longitude: 77.4180 }
  },
  {
    _id: 'ben_map_2',
    name: 'Sunita Devi',
    village: 'Semri',
    district: 'Hoshangabad',
    currentStage: 'Foundation',
    progressPct: 20,
    riskScore: 12,
    riskTier: 'low',
    distanceKm: 6.5,
    registeredLocation: { latitude: 23.2510, longitude: 77.4050 }
  },
  {
    _id: 'ben_map_3',
    name: 'Kamlesh Patel',
    village: 'Bankhedi',
    district: 'Hoshangabad',
    currentStage: 'Lintel',
    progressPct: 65,
    riskScore: 35,
    riskTier: 'medium',
    distanceKm: 8.9,
    registeredLocation: { latitude: 23.2720, longitude: 77.4290 }
  },
  {
    _id: 'ben_map_4',
    name: 'Gopal Meena',
    village: 'Barkheda',
    district: 'Bhopal',
    currentStage: 'Completion',
    progressPct: 100,
    riskScore: 8,
    riskTier: 'low',
    distanceKm: 1.4,
    registeredLocation: { latitude: 23.6345, longitude: 77.4231 }
  }
];

export default function RiskMapScreen({ navigation }) {
  const [selectedCenter, setSelectedCenter] = useState(PRESET_CENTERS[0]);
  const [radiusKm, setRadiusKm] = useState(25);
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [loading, setLoading] = useState(true);
  const [mapPoints, setMapPoints] = useState([]);
  const [summary, setSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const webViewRef = useRef(null);

  useEffect(() => {
    fetchMapData();
  }, [selectedCenter, radiusKm]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/risk-map', {
        params: {
          lat: selectedCenter.lat,
          lng: selectedCenter.lng,
          radiusKm
        }
      });

      if (res.data?.success && res.data.data?.points) {
        const pts = res.data.data.points;
        const sm = res.data.data.summary || calculateSummary(pts);
        setMapPoints(pts);
        setSummary(sm);
        setIsOffline(false);
        if (pts.length > 0) setSelectedPoint(pts[0]);
        await AsyncStorage.setItem(CACHED_MAP_DATA_KEY, JSON.stringify({ points: pts, summary: sm }));
      } else {
        await loadCachedMapData();
      }
    } catch (err) {
      console.log('Online map fetch failed, loading offline cache:', err.message);
      await loadCachedMapData();
    } finally {
      setLoading(false);
    }
  };

  const loadCachedMapData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHED_MAP_DATA_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMapPoints(parsed.points || []);
        setSummary(parsed.summary || calculateSummary(parsed.points));
        if (parsed.points?.length > 0) setSelectedPoint(parsed.points[0]);
      } else {
        setMapPoints(DEFAULT_MAP_POINTS);
        setSummary(calculateSummary(DEFAULT_MAP_POINTS));
        setSelectedPoint(DEFAULT_MAP_POINTS[0]);
      }
      setIsOffline(true);
    } catch (e) {
      setMapPoints(DEFAULT_MAP_POINTS);
      setSummary(calculateSummary(DEFAULT_MAP_POINTS));
      setSelectedPoint(DEFAULT_MAP_POINTS[0]);
      setIsOffline(true);
    }
  };

  const calculateSummary = (pts) => {
    const high = pts.filter(p => p.riskTier === 'high' || p.riskScore >= 50).length;
    const med = pts.filter(p => (p.riskTier === 'medium' || (p.riskScore >= 25 && p.riskScore < 50))).length;
    const low = pts.length - high - med;
    return { total: pts.length, high, medium: med, low: Math.max(0, low) };
  };

  // Filtered Points
  const filteredPoints = mapPoints.filter(p => {
    if (riskFilter === 'all') return true;
    if (riskFilter === 'high') return p.riskTier === 'high' || p.riskScore >= 50;
    if (riskFilter === 'medium') return p.riskTier === 'medium' || (p.riskScore >= 25 && p.riskScore < 50);
    if (riskFilter === 'low') return p.riskTier === 'low' || p.riskScore < 25;
    return true;
  });

  // Generate Leaflet HTML for WebView
  const generateLeafletHtml = () => {
    const centerLat = selectedCenter.lat;
    const centerLng = selectedCenter.lng;
    const pointsJson = JSON.stringify(filteredPoints);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #0f172a; font-family: sans-serif; }
          .custom-pin {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            border: 2px solid #fff;
          }
          .pin-high { background: #ef4444; }
          .pin-med { background: #f59e0b; }
          .pin-low { background: #10b981; }
          .center-pin { background: #6366f1; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px #6366f1; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 11);
          L.control.zoom({ position: 'topright' }).addTo(map);

          // Free OpenStreetMap Tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Radius Circle
          L.circle([${centerLat}, ${centerLng}], {
            color: '#6366f1',
            fillColor: '#818cf8',
            fillOpacity: 0.12,
            radius: ${radiusKm * 1000}
          }).addTo(map);

          // Center Marker
          const centerIcon = L.divIcon({
            className: '',
            html: '<div class="center-pin"></div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          L.marker([${centerLat}, ${centerLng}], { icon: centerIcon }).addTo(map).bindPopup('<b>${selectedCenter.name}</b><br>Radius: ${radiusKm} km');

          // Add Construction Site Markers
          const points = ${pointsJson};
          points.forEach(p => {
            const lat = p.registeredLocation?.latitude;
            const lng = p.registeredLocation?.longitude;
            if (!lat || !lng) return;

            const isHigh = p.riskTier === 'high' || p.riskScore >= 50;
            const isMed = p.riskTier === 'medium' || (p.riskScore >= 25 && p.riskScore < 50);
            const pinClass = isHigh ? 'pin-high' : isMed ? 'pin-med' : 'pin-low';
            const riskChar = isHigh ? '!' : Math.round(p.riskScore || 0);

            const pinIcon = L.divIcon({
              className: '',
              html: '<div class="custom-pin ' + pinClass + '">' + riskChar + '</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            const m = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
            m.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify(p));
            });
          });
        </script>
      </body>
      </html>
    `;
  };

  const onWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.name) {
        setSelectedPoint(data);
      }
    } catch (e) {
      console.log('Map message error:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Offline Alert Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>📦 Offline Mode: Displaying locally cached Geo-Risk data</Text>
        </View>
      )}

      {/* Summary KPI Badges */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{summary.total || mapPoints.length}</Text>
          <Text style={styles.kpiLabel}>Total Sites</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#fca5a5' }]}>
          <Text style={[styles.kpiValue, { color: '#ef4444' }]}>{summary.high}</Text>
          <Text style={styles.kpiLabel}>High Risk</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#fde68a' }]}>
          <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>{summary.medium}</Text>
          <Text style={styles.kpiLabel}>Moderate</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#bbf7d0' }]}>
          <Text style={[styles.kpiValue, { color: '#16a34a' }]}>{summary.low}</Text>
          <Text style={styles.kpiLabel}>Verified</Text>
        </View>
      </View>

      {/* Filter Controls Bar */}
      <View style={styles.controlsBar}>
        {/* Preset Locations */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
          {PRESET_CENTERS.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, selectedCenter.id === c.id && styles.chipActive]}
              onPress={() => setSelectedCenter(c)}
            >
              <Text style={[styles.chipText, selectedCenter.id === c.id && styles.chipTextActive]}>
                📍 {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Radius & Risk Tier Filters */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {RADIUS_OPTIONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.smallChip, radiusKm === r && styles.smallChipActive]}
                onPress={() => setRadiusKm(r)}
              >
                <Text style={[styles.smallChipText, radiusKm === r && styles.smallChipTextActive]}>
                  {r}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 4 }}>
            {['all', 'high', 'medium', 'low'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.riskFilterBtn, riskFilter === t && styles.riskFilterBtnActive]}
                onPress={() => setRiskFilter(t)}
              >
                <Text style={[styles.riskFilterText, riskFilter === t && styles.riskFilterTextActive]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Interactive Map View */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>Plotting PMAY-G Geofenced Sites...</Text>
          </View>
        ) : null}

        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: generateLeafletHtml() }}
          style={styles.webView}
          onMessage={onWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      {/* Selected Site Bottom Detail Card */}
      {selectedPoint && (
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{selectedPoint.name}</Text>
              <Text style={styles.detailVillage}>
                {selectedPoint.village}, {selectedPoint.district} • {selectedPoint.distanceKm ? `${selectedPoint.distanceKm} km away` : 'Near Center'}
              </Text>
            </View>
            <View style={[
              styles.riskPill,
              { backgroundColor: selectedPoint.riskScore >= 50 ? '#fee2e2' : selectedPoint.riskScore >= 25 ? '#fef3c7' : '#dcfce7' }
            ]}>
              <Text style={[
                styles.riskPillText,
                { color: selectedPoint.riskScore >= 50 ? '#b91c1c' : selectedPoint.riskScore >= 25 ? '#b45309' : '#15803d' }
              ]}>
                Risk: {Math.round(selectedPoint.riskScore || 0)}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressRow}>
            <Text style={styles.stageLabel}>Stage: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{selectedPoint.currentStage || 'Plinth'}</Text></Text>
            <Text style={styles.progressPercent}>{selectedPoint.progressPct || 40}% Complete</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${selectedPoint.progressPct || 40}%` }]} />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.inspectBtn}
              onPress={() => navigation.navigate('Camera', {
                beneficiary: selectedPoint,
                stage: selectedPoint.currentStage || 'Plinth'
              })}
            >
              <Text style={styles.inspectBtnText}>📸 Start Photo Inspection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.inspectBtn, { backgroundColor: '#7c3aed' }]}
              onPress={() => navigation.navigate('VideoInspection', {
                beneficiary: selectedPoint,
                stage: selectedPoint.currentStage || 'Plinth'
              })}
            >
              <Text style={styles.inspectBtnText}>🎥 Walkthrough AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  offlineBanner: {
    backgroundColor: '#fffbeb',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  offlineBannerText: { fontSize: 11, color: '#b45309', textAlign: 'center', fontWeight: '600' },
  kpiRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiValue: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  kpiLabel: { fontSize: 9, color: '#64748b', fontWeight: '600', marginTop: 1 },
  controlsBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: '#4f46e5', borderColor: '#4338ca' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#fff' },
  smallChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  smallChipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  smallChipText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  smallChipTextActive: { color: '#fff' },
  riskFilterBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  riskFilterBtnActive: { backgroundColor: '#334155' },
  riskFilterText: { fontSize: 9, fontWeight: '700', color: '#64748b' },
  riskFilterTextActive: { color: '#fff' },
  mapContainer: { flex: 1, position: 'relative' },
  webView: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  detailCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  detailVillage: { fontSize: 12, color: '#64748b', marginTop: 2 },
  riskPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  riskPillText: { fontSize: 11, fontWeight: '800' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  stageLabel: { fontSize: 12, color: '#475569' },
  progressPercent: { fontSize: 11, fontWeight: '700', color: '#0284c7' },
  progressBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  inspectBtn: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  inspectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

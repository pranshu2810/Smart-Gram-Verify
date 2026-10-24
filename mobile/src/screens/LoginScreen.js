import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { setSimulatedOffline } from '../services/offlineStorage';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (customEmail, customPass) => {
    const e = customEmail || email;
    const p = customPass || password;

    if (!e || !p) return Alert.alert('Credentials Required', 'Please enter email and password');
    setLoading(true);

    try {
      await setSimulatedOffline(false);
      const { data } = await api.post('/auth/login', { email: e, password: p });
      if (data.success) {
        await login(data.token, data.user);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.log('Login error:', err.message);
      Alert.alert(
        'Server Unreachable',
        'Could not reach server. Would you like to enter in Offline Mode to conduct field inspections?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enter Offline Mode', onPress: enterOfflineMode }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const enterOfflineMode = async () => {
    await setSimulatedOffline(true);
    const offlineOfficer = {
      _id: 'offline_officer_01',
      name: 'Rajesh Sharma (Offline)',
      role: 'officer',
      district: 'Hoshangabad',
      email: 'rajesh@smartgram.gov.in',
      isOfflineMode: true
    };
    await login('mock_offline_token_' + Date.now(), offlineOfficer);
  };

  const setPreset = (role) => {
    if (role === 'officer') {
      setEmail('rajesh@smartgram.gov.in');
      setPassword('officer123');
    } else if (role === 'admin') {
      setEmail('admin@smartgram.gov.in');
      setPassword('admin123');
    } else if (role === 'beneficiary') {
      setEmail('ramesh@example.com');
      setPassword('beneficiary123');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Logo Badge */}
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 32 }}>🏛️</Text>
          </View>

          <Text style={styles.title}>Smart-Gram Verify</Text>
          <Text style={styles.subtitle}>Rural Housing PMAY-G AI Inspection System</Text>

          {/* Role Presets */}
          <Text style={styles.presetLabel}>QUICK DEMO ROLES:</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset('officer')}>
              <Text style={styles.presetBtnText}>👮 Officer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset('admin')}>
              <Text style={styles.presetBtnText}>🏛️ Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset('beneficiary')}>
              <Text style={styles.presetBtnText}>👤 Client</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OFFICIAL EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. rajesh@smartgram.gov.in"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In to Portal</Text>
            )}
          </TouchableOpacity>

          {/* Direct Offline Mode Entry Button */}
          <TouchableOpacity style={styles.offlineBtn} onPress={enterOfflineMode} activeOpacity={0.8}>
            <Text style={styles.offlineBtnText}>📶 Continue in Offline Field Mode</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Secure biometric & cryptographic SHA-256 evidence verification compliant with Ministry of Rural Development standards.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#f8fafc', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  presetLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 8 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  presetBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  presetBtnText: { color: '#f1f5f9', fontSize: 12, fontWeight: '600' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#f8fafc',
  },
  loginBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  offlineBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
    alignItems: 'center',
  },
  offlineBtnText: { color: '#c7d2fe', fontSize: 13, fontWeight: '700' },
  footerNote: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 20, lineHeight: 15 },
});

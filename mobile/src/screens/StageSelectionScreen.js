import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const STAGES = [
  { key: 'Foundation', icon: '🏗️', description: 'Excavation, footing, foundation walls', color: '#f59e0b', installment: '₹50,000' },
  { key: 'Plinth', icon: '🧱', description: 'Plinth beam, walls rising above ground', color: '#3b82f6', installment: '₹40,000' },
  { key: 'Lintel', icon: '🪟', description: 'Lintel beam, door/window frames placed', color: '#8b5cf6', installment: '₹30,000' },
  { key: 'Completion', icon: '🏠', description: 'Roof slab, plastering, finishing work', color: '#22c55e', installment: '₹30,000' },
];

export default function StageSelectionScreen({ route, navigation }) {
  const { beneficiary } = route.params;

  const selectStage = (stage) => {
    navigation.navigate('Camera', { beneficiary, stage: stage.key });
  };

  return (
    <View style={styles.container}>
      {/* Beneficiary Info */}
      <View style={styles.benefCard}>
        <Text style={styles.benefName}>{beneficiary.name}</Text>
        <Text style={styles.benefDetail}>S/o {beneficiary.fatherName} • {beneficiary.village}</Text>
        <Text style={styles.benefScheme}>{beneficiary.schemeName}</Text>
      </View>

      <Text style={styles.sectionTitle}>SELECT CONSTRUCTION STAGE</Text>

      {/* Stage Cards */}
      {STAGES.map((stage, i) => (
        <TouchableOpacity key={stage.key} style={styles.stageCard} onPress={() => selectStage(stage)} activeOpacity={0.7}>
          <View style={[styles.stageIcon, { backgroundColor: stage.color + '15' }]}>
            <Text style={{ fontSize: 28 }}>{stage.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stageName}>{stage.key}</Text>
            <Text style={styles.stageDesc}>{stage.description}</Text>
          </View>
          <View style={styles.installmentBadge}>
            <Text style={styles.installmentText}>{stage.installment}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>⚠️ Stage progression is validated. Foundation must be verified before Plinth, etc.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 16 },
  benefCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  benefName: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  benefDetail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  benefScheme: { fontSize: 11, color: '#6366f1', fontWeight: '600', marginTop: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 12 },
  stageCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  stageIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stageName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  stageDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  installmentBadge: { backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  installmentText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  noteBox: { marginTop: 12, padding: 14, backgroundColor: '#fef3c7', borderRadius: 10 },
  noteText: { fontSize: 11, color: '#92400e', lineHeight: 16 },
});

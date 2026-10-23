import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../api/client';
import { addToOfflineQueue } from '../services/offlineStorage';

export default function CameraScreen({ route, navigation }) {
  const { beneficiary, stage } = route.params;

  // Mode: 'photo' or 'video'
  const [inspectionMode, setInspectionMode] = useState('photo');

  // Media state
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);

  // GPS state
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Form state
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS permission is required for inspection');
        setLocation({ latitude: 23.6345, longitude: 77.4231, accuracy: 10, simulated: true });
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy
      });
    } catch (err) {
      console.log('Location error:', err);
      // Fallback for emulator / simulated environment
      setLocation({ latitude: 23.6345, longitude: 77.4231, accuracy: 10, simulated: true });
    } finally {
      setLocationLoading(false);
    }
  };

  // ── PHOTO HANDLERS ──
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        setPhoto(result.assets[0]);
        setVideo(null);
      }
    } catch (err) {
      console.log('Take photo error:', err);
      pickPhoto();
    }
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setPhoto(result.assets[0]);
        setVideo(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open image library');
    }
  };

  // ── VIDEO HANDLERS ──
  const recordVideo = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to record video');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 60,
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        setVideo(result.assets[0]);
        setPhoto(null);
      }
    } catch (err) {
      console.log('Record video error:', err);
      pickVideo();
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setVideo(result.assets[0]);
        setPhoto(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open video library');
    }
  };

  // ── SUBMISSION ──
  const submitInspection = async () => {
    if (inspectionMode === 'photo' && !photo) {
      return Alert.alert('Missing Photo', 'Please capture or select an evidence photo first');
    }
    if (inspectionMode === 'video' && !video) {
      return Alert.alert('Missing Video', 'Please record or select a walkthrough video first');
    }
    if (!location) {
      return Alert.alert('GPS Required', 'Waiting for GPS location lock...');
    }

    setSubmitting(true);

    if (inspectionMode === 'video') {
      await submitVideoInspection();
    } else {
      await submitPhotoInspection();
    }
  };

  // Submit Photo Inspection
  const submitPhotoInspection = async () => {
    try {
      const formData = new FormData();
      formData.append('beneficiaryId', beneficiary._id);
      formData.append('officerSelectedStage', stage);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('accuracy', (location.accuracy || 10).toString());
      formData.append('deviceTimestamp', new Date().toISOString());
      formData.append('officerNotes', notes);
      formData.append('isOfflineCreated', 'false');

      const photoUri = photo.uri;
      const filename = photoUri.split('/').pop() || `inspection_${Date.now()}.jpg`;
      formData.append('photos', {
        uri: photoUri,
        type: 'image/jpeg',
        name: filename,
      });

      const { data } = await api.post('/inspections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000
      });

      if (data.success) {
        navigation.navigate('InspectionResult', {
          inspection: data.data,
          verification: data.verification,
          beneficiary
        });
      }
    } catch (err) {
      console.log('Photo upload error:', err.message);

      // Known 4xx validation error
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        Alert.alert('Submission Error', err.response.data?.message || 'Invalid inspection parameters');
        setSubmitting(false);
        return;
      }

      // Offline fallback: save locally to queue
      await addToOfflineQueue({
        mediaType: 'photo',
        beneficiaryId: beneficiary._id,
        beneficiaryName: beneficiary.name,
        officerSelectedStage: stage,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        deviceTimestamp: new Date().toISOString(),
        photoUri: photo.uri,
        notes,
      });

      Alert.alert(
        'Saved to Offline Queue',
        'Device is offline or network is unavailable. Your inspection evidence and GPS coordinates have been safely saved locally and can be synced from the Offline Queue.',
        [{ text: 'View Offline Queue', onPress: () => navigation.navigate('OfflineQueue') }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Video Inspection
  const submitVideoInspection = async () => {
    try {
      const formData = new FormData();
      formData.append('beneficiaryId', beneficiary._id);
      formData.append('officerStage', stage);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('accuracy', (location.accuracy || 10).toString());
      formData.append('deviceTimestamp', new Date().toISOString());
      formData.append('numKeyframes', '5');

      const videoUri = video.uri;
      const filename = videoUri.split('/').pop() || `walkthrough_${Date.now()}.mp4`;
      const mimeType = video.mimeType || 'video/mp4';

      formData.append('video', {
        uri: videoUri,
        type: mimeType,
        name: filename,
      });

      const { data } = await api.post('/inspections/verify-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      if (data.success !== false) {
        navigation.navigate('VideoInspection', {
          videoResult: data,
          beneficiary,
          stage,
          videoUri
        });
      } else {
        Alert.alert('Video Analysis Alert', data.error || data.verdict);
      }
    } catch (err) {
      console.log('Video upload error:', err.message);

      // Offline fallback: save video to offline queue
      await addToOfflineQueue({
        mediaType: 'video',
        beneficiaryId: beneficiary._id,
        beneficiaryName: beneficiary.name,
        officerSelectedStage: stage,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        deviceTimestamp: new Date().toISOString(),
        videoUri: video.uri,
        notes,
      });

      Alert.alert(
        'Video Saved to Offline Queue',
        'Walkthrough video and GPS metadata have been saved locally on this device. You can sync and verify with Qwen AI once network connectivity is restored.',
        [{ text: 'Go to Offline Queue', onPress: () => navigation.navigate('OfflineQueue') }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Top Beneficiary Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoTitle}>{beneficiary.name}</Text>
        <Text style={styles.infoSub}>{beneficiary.village}, {beneficiary.district} • Stage: {stage}</Text>
      </View>

      {/* Mode Selector Toggle: Photo vs Video */}
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[styles.modeToggleBtn, inspectionMode === 'photo' && styles.modeToggleActive]}
          onPress={() => setInspectionMode('photo')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeToggleText, inspectionMode === 'photo' && styles.modeToggleTextActive]}>
            📸 Photo Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeToggleBtn, inspectionMode === 'video' && styles.modeToggleActive]}
          onPress={() => setInspectionMode('video')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeToggleText, inspectionMode === 'video' && styles.modeToggleTextActive]}>
            🎥 Video Walkthrough
          </Text>
        </TouchableOpacity>
      </View>

      {/* GPS Status Indicator */}
      <View style={styles.gpsBar}>
        {locationLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ActivityIndicator size="small" color="#0284c7" />
            <Text style={styles.gpsText}>Acquiring high-accuracy GPS coordinates...</Text>
          </View>
        ) : location ? (
          <Text style={styles.gpsText}>
            📍 GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (±{Math.round(location.accuracy || 0)}m) {location.simulated ? '[SIMULATED]' : ''}
          </Text>
        ) : (
          <Text style={[styles.gpsText, { color: '#ef4444' }]}>❌ GPS unavailable</Text>
        )}
      </View>

      {/* Media Capture Area */}
      <View style={styles.mediaContainer}>
        {inspectionMode === 'photo' ? (
          // Photo Capture UI
          photo ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewMeta}>Resolution: {photo.width || 1280}x{photo.height || 720}</Text>
                <TouchableOpacity style={styles.retakeBtn} onPress={takePhoto}>
                  <Text style={styles.retakeText}>📷 Retake Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <TouchableOpacity style={styles.cameraActionBtn} onPress={takePhoto} activeOpacity={0.8}>
                <View style={styles.actionIconCircle}>
                  <Text style={{ fontSize: 32 }}>📸</Text>
                </View>
                <Text style={styles.actionTitle}>Take Construction Photo</Text>
                <Text style={styles.actionSub}>Capture clear view of {stage} structural elements</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryLink} onPress={pickPhoto}>
                <Text style={styles.galleryLinkText}>📁 Select photo from Device Gallery</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          // Video Capture UI
          video ? (
            <View style={styles.videoCard}>
              <View style={styles.videoHeader}>
                <Text style={{ fontSize: 28 }}>🎬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoTitle}>Walkthrough Video Ready</Text>
                  <Text style={styles.videoDetail}>
                    Duration: {video.duration ? `${Math.round(video.duration / 1000)}s` : 'Captured'} • {video.fileSize ? `${(video.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'MP4'}
                  </Text>
                  <Text style={styles.videoHint}>OpenCV will extract 5 keyframes & SHA-256 hash for Qwen-2.5-VL inspection.</Text>
                </View>
              </View>
              <View style={styles.videoActionsRow}>
                <TouchableOpacity style={styles.videoSmallBtn} onPress={recordVideo}>
                  <Text style={styles.videoSmallBtnText}>🎥 Re-record</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.videoSmallBtn} onPress={pickVideo}>
                  <Text style={styles.videoSmallBtnText}>📁 Choose Other</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <TouchableOpacity style={[styles.cameraActionBtn, { borderColor: '#a855f7' }]} onPress={recordVideo} activeOpacity={0.8}>
                <View style={[styles.actionIconCircle, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={{ fontSize: 32 }}>🎥</Text>
                </View>
                <Text style={styles.actionTitle}>Record 360° Walkthrough Video</Text>
                <Text style={styles.actionSub}>Walk around the site for 5-15 seconds capturing terrain & bricks</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryLink} onPress={pickVideo}>
                <Text style={[styles.galleryLinkText, { color: '#9333ea' }]}>📁 Select Video from Device Gallery</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      {/* Field Officer Notes */}
      <View style={styles.notesBox}>
        <Text style={styles.notesLabel}>Officer Observations / Site Notes:</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="E.g., Plinth beam concrete poured; soil excavation verified."
          placeholderTextColor="#94a3b8"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Offline Notice Badge */}
      <View style={styles.offlineNotice}>
        <Text style={styles.offlineNoticeText}>
          ⚡ Offline-Ready: If no internet is detected in this village, the {inspectionMode} will be safely queued locally on your phone.
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          ((inspectionMode === 'photo' && !photo) || (inspectionMode === 'video' && !video) || submitting) && styles.submitDisabled
        ]}
        onPress={submitInspection}
        disabled={(inspectionMode === 'photo' && !photo) || (inspectionMode === 'video' && !video) || submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitText}>
              {inspectionMode === 'video' ? 'Analyzing Video with Qwen 2.5-VL...' : 'Evaluating Evidence...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.submitText}>
            {inspectionMode === 'video' ? '🚀 Verify Video Walkthrough' : '✅ Submit Inspection Evidence'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  infoBar: { backgroundColor: '#0f172a', paddingVertical: 14, paddingHorizontal: 16 },
  infoTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  infoSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  modeToggleContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeToggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeToggleText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  modeToggleTextActive: { color: '#0f172a', fontWeight: '700' },
  gpsBar: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
    marginBottom: 8,
  },
  gpsText: { fontSize: 11, color: '#16a34a', textAlign: 'center', fontWeight: '500' },
  mediaContainer: { marginHorizontal: 16, marginTop: 8 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  cameraActionBtn: { alignItems: 'center', width: '100%', paddingVertical: 16 },
  actionIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  actionSub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4, paddingHorizontal: 16 },
  galleryLink: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  galleryLinkText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  previewBox: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    height: 320,
    position: 'relative',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15,23,42,0.75)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewMeta: { color: '#e2e8f0', fontSize: 11, fontWeight: '500' },
  retakeBtn: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retakeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  videoHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  videoTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  videoDetail: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },
  videoHint: { fontSize: 11, color: '#9333ea', marginTop: 6, fontStyle: 'italic' },
  videoActionsRow: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'flex-end' },
  videoSmallBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  videoSmallBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  notesBox: { marginHorizontal: 16, marginTop: 14 },
  notesLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  offlineNotice: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
  },
  offlineNoticeText: { fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 16 },
  submitBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

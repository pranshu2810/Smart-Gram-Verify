import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isSimulatedOffline } from '../services/offlineStorage';

// Environment auto-detection:
// - Web: localhost:5000
// - Android Emulator: 10.0.2.2:5000
// - Physical device / Expo: LAN IP or localhost
const CURRENT_LAN_IP = '11.20.17.86';
const API_URL = Platform.select({
  web: 'http://localhost:5000/api',
  android: `http://${CURRENT_LAN_IP}:5000/api`,
  ios: `http://${CURRENT_LAN_IP}:5000/api`,
  default: `http://${CURRENT_LAN_IP}:5000/api`
});

const api = axios.create({ baseURL: API_URL, timeout: 60000 });

api.interceptors.request.use(async (config) => {
  // Check if simulated offline mode is turned on
  const offline = await isSimulatedOffline();
  if (offline) {
    const error = new Error('Device is in Offline Mode');
    error.isOffline = true;
    return Promise.reject(error);
  }

  const customUrl = await AsyncStorage.getItem('sg_custom_api_url');
  if (customUrl) {
    config.baseURL = customUrl;
  }

  const token = await AsyncStorage.getItem('sg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['sg_token', 'sg_user']);
    }
    return Promise.reject(err);
  }
);

export default api;
export { API_URL };

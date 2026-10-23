import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import BeneficiaryScreen from './src/screens/BeneficiaryScreen';
import StageSelectionScreen from './src/screens/StageSelectionScreen';
import CameraScreen from './src/screens/CameraScreen';
import InspectionResultScreen from './src/screens/InspectionResultScreen';
import VideoInspectionScreen from './src/screens/VideoInspectionScreen';
import RiskMapScreen from './src/screens/RiskMapScreen';
import OfflineQueueScreen from './src/screens/OfflineQueueScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// ── Auth Context ──
export const AuthContext = createContext(null);

export function useAuth() { return useContext(AuthContext); }

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('sg_token');
        const savedUser = await AsyncStorage.getItem('sg_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.log('Auth check error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (t, u) => {
    await AsyncStorage.setItem('sg_token', t);
    await AsyncStorage.setItem('sg_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['sg_token', 'sg_user']);
    setToken(null);
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          contentStyle: { backgroundColor: '#f8fafc' }
        }}>
          {!token ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Smart-Gram Verify' }} />
              <Stack.Screen name="Beneficiary" component={BeneficiaryScreen} options={{ title: 'Select Beneficiary' }} />
              <Stack.Screen name="StageSelection" component={StageSelectionScreen} options={{ title: 'Select Stage' }} />
              <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Capture Evidence' }} />
              <Stack.Screen name="InspectionResult" component={InspectionResultScreen} options={{ title: 'Inspection Analysis' }} />
              <Stack.Screen name="VideoInspection" component={VideoInspectionScreen} options={{ title: 'Walkthrough AI Inspector' }} />
              <Stack.Screen name="RiskMap" component={RiskMapScreen} options={{ title: 'PMAY-G Geo Risk Map' }} />
              <Stack.Screen name="OfflineQueue" component={OfflineQueueScreen} options={{ title: 'Offline Queue & Sync' }} />
              <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Audit Registry' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

import { registerRootComponent } from 'expo';
registerRootComponent(App);

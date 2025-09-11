import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

// Firebase configuration - these should be filled in your .env file
const firebaseConfig = {
  apiKey: 'AIzaSyDkFOcjU04aONSbQWUu_KRtXLrLOxmBU5E',
  authDomain: 'the-statlocker.firebaseapp.com',
  projectId: 'the-statlocker',
  storageBucket: 'the-statlocker.firebasestorage.app',
  messagingSenderId: '454030243479',
  appId: '1:454030243479:web:86ff3112995715c66c1bd2',
  measurementId: 'G-D1YK7S2M9Y',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
let auth: Auth;
try {
  // For React Native, Firebase v9+ automatically uses AsyncStorage when available
  auth = initializeAuth(app);
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only if supported)
let analytics;
if (Platform.OS === 'web') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, analytics };
export default app;

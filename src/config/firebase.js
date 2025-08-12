import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with React Native persistence
let auth;
try {
  auth = getAuth(app);
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
} catch {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // For React Native
  });
}

// Initialize Storage
export const storage = getStorage(app);

// Connect to emulators in development (only for testing)
if (__DEV__) {
  try {
    // Check if we're not already connected to avoid errors
    if (!auth._delegate._config?.emulator) {
      const { connectAuthEmulator } = require('firebase/auth');
      connectAuthEmulator(auth, "http://127.0.0.1:9099", {
        disableWarnings: true
      });
      console.log('Auth emulator connected');
    }
  } catch (error) {
    console.warn('Auth emulator connection failed:', error.message);
  }

  try {
    if (!db._delegate._settings?.host?.includes('127.0.0.1')) {
      const { connectFirestoreEmulator } = require('firebase/firestore');
      connectFirestoreEmulator(db, '127.0.0.1', 8088);
      console.log('Firestore emulator connected');
    }
  } catch (error) {
    console.warn('Firestore emulator connection failed:', error.message);
  }

  try {
    if (!storage._delegate._host?.includes('127.0.0.1')) {
      const { connectStorageEmulator } = require('firebase/storage');
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      console.log('Storage emulator connected');
    }
  } catch (error) {
    console.warn('Storage emulator connection failed:', error.message);
  }
}

// Export the services
export { auth, db };
export default app;
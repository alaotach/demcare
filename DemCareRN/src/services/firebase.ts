import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCD5KwxaAfMayIlM-W27EmFj4vJDCYcZM",
  authDomain: "demcare-2e3f6.firebaseapp.com",
  projectId: "demcare-2e3f6",
  storageBucket: "demcare-2e3f6.firebasestorage.app",
  messagingSenderId: "1059749517384",
  appId: "1:1059749517384:web:139575721dae92766da07d",
  measurementId: "G-YM23FFLNKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Realtime Database for live vitals
const database = getDatabase(app);

export { auth, firestore, database };
export default app;

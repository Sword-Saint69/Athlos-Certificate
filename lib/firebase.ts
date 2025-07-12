import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCl3EAP1gTi0m3HuelpCwd4bd9vigxMHsU",
  authDomain: "cem-certificate.firebaseapp.com",
  projectId: "cem-certificate",
  storageBucket: "cem-certificate.firebasestorage.app",
  messagingSenderId: "797787148412",
  appId: "1:797787148412:web:5fc038ce44edac43d539f9",
  measurementId: "G-Y792NZF0R0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 
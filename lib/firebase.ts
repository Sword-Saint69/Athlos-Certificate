import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHrvhT6GKehlEcxMx5IKGp9kKuyDimHbU",
  authDomain: "athlos-25.firebaseapp.com",
  projectId: "athlos-25",
  storageBucket: "athlos-25.firebasestorage.app",
  messagingSenderId: "1040745981700",
  appId: "1:1040745981700:web:94c1b7d8fe52da723ad251",
  measurementId: "G-S4TMQLBL2N"
};

// Prevent re-initialization in Next.js hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app); 
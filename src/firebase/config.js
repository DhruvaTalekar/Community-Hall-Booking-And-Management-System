import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration provided in PRD Section 5
const firebaseConfig = {
  apiKey: "AIzaSyD6ajeKAnEHT39ftfxdoaMqKAklgyv5z-s",
  authDomain: "community-hall-booking-b97e8.firebaseapp.com",
  projectId: "community-hall-booking-b97e8",
  storageBucket: "community-hall-booking-b97e8.firebasestorage.app",
  messagingSenderId: "461308326258",
  appId: "1:461308326258:web:fb0338dc60047c14d2adeb",
  measurementId: "G-CXXSP956S1"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

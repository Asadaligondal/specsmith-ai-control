import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBiawUVfK55AEjgEV7n7tEG9NbvA4Iw0Co",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "my-new-compass.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "my-new-compass",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "my-new-compass.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "669327593632",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:669327593632:web:dfe918a1cde2bbd562f9c5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-NMMN7DQVDB",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

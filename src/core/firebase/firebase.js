import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCHs_9FfHWx_2XvdYmvc2JSXWDZRW4f4H4",
  authDomain: "svtech-soft.firebaseapp.com",
  projectId: "svtech-soft",
  storageBucket: "svtech-soft.appspot.com",
  messagingSenderId: "319656463983",
  appId: "1:319656463983:web:f58a71ddaf7b4255b6c79a",
  measurementId: "G-19SXP5TQD8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export default app;

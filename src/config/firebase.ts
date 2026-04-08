import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyASLkiR4twjDXLL73ORlTgfuOxysyijzjg",
  authDomain: "toy-page.firebaseapp.com",
  projectId: "toy-page",
  storageBucket: "toy-page.firebasestorage.app",
  messagingSenderId: "395320189088",
  appId: "1:395320189088:web:a1375d403cdbbcba7ee9c5",
  measurementId: "G-YRGSZQR9Y8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;

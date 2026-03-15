import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDZ9y1XLS0wMR0kKdEOO91utF7-5p9vp_M',
  authDomain: 'sabeel-platform-official.firebaseapp.com',
  projectId: 'sabeel-platform-official',
  storageBucket: 'sabeel-platform-official.firebasestorage.app',
  messagingSenderId: '150583731393',
  appId: '1:150583731393:web:8c181e212832356af2e040',
  measurementId: 'G-65HE8PB0XT',
  databaseURL: 'https://sabeel-platform-official-default-rtdb.asia-southeast1.firebasedatabase.app'
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
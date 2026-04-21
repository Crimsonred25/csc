import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Demo Firebase config - REPLACE WITH YOUR PROJECT CONFIG from console.firebase.google.com
const firebaseConfig = {
  apiKey: "demo-api-key-placeholder-update-in-console",\n  authDomain: "csc-demo.firebaseapp.com",\n  projectId: "csc-demo-project",\n  storageBucket: "csc-demo.appspot.com",\n  messagingSenderId: "123456789",\n  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyA6PwFmMuUGZ637kFs1NUcz0qb-G2Apc10",
  authDomain: "mybookingapp-3eb1c.firebaseapp.com",
  projectId: "mybookingapp-3eb1c",
  storageBucket: "mybookingapp-3eb1c.firebasestorage.app",
  messagingSenderId: "677103365119",
  appId: "1:677103365119:web:2f4d99a4f85205f9e115ca"
};

const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

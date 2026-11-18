import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- NUEVO

const firebaseConfig = {
  apiKey: "AIzaSyDeUrTX49Ig7sVkd6ihXPr1RP63d7XJT4U",
  authDomain: "tony-barber-addea.firebaseapp.com",
  projectId: "tony-barber-addea",
  storageBucket: "tony-barber-addea.firebasestorage.app",
  messagingSenderId: "1059735836315",
  appId: "1:1059735836315:web:ea7b6e4b07e5839265583e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- NUEVO
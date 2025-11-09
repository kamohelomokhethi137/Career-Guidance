import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDkOwKg0w1fasT5rZuU7kANsOTiLVOTojU",
  authDomain: "carear-64cbe.firebaseapp.com",
  projectId: "carear-64cbe",
  // storageBucket: "carear-64cbe.appspot.com", 
  messagingSenderId: "531290173873",
  appId: "1:531290173873:web:0c4f261ef4ad40cbf08d90",
  measurementId: "G-44H07G9BFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);     
export const storage = getStorage(app);  
const analytics = getAnalytics(app);

// ==========================================
// Asprients Firebase Configuration
// ==========================================

// ---------- Firebase App ----------
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

// ---------- Firebase Authentication ----------
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ---------- Cloud Firestore ----------
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// ==========================================
// Firebase Config
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyDHRDRRm2KBmCuUf3qvTIRI5hO0aXFFx3w",
  authDomain: "asprients-95c1f.firebaseapp.com",
  projectId: "asprients-95c1f",
  storageBucket: "asprients-95c1f.appspot.com",
  messagingSenderId: "453218332819",
  appId: "1:453218332819:web:5740173fa4d8156dae9d66"
};

// ==========================================
// Initialize Firebase
// ==========================================

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// ==========================================
// Firebase Services
// ==========================================

const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// Exports
// ==========================================

// App
export {
  app,
  auth,
  db
};

// Authentication
export {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
};

// Firestore
export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
Timestamp
};
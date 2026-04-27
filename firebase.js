
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updateProfile
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    collection,
    getDocs,
    updateDoc,
    deleteDoc
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyADZphyLztYYeMV130uyq_3CYthr6QzBo0",
    authDomain: "coringa-c0bce.firebaseapp.com",
    projectId: "coringa-c0bce",
    storageBucket: "coringa-c0bce.firebasestorage.app",
    messagingSenderId: "346363639454",
    appId: "1:346363639454:web:38b288fe0d7abf66daad8f"
  };

  const app = initializeApp(firebaseConfig);
  window._fbAuth = getAuth(app);
  window._fbDb  = getFirestore(app);
  window._fbFns = {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updateProfile,
    doc, setDoc, getDoc, onSnapshot, collection, getDocs, updateDoc, deleteDoc
  };

  // Notifica o app quando o Firebase está pronto
  window.dispatchEvent(new Event('firebaseReady'));

// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxp11XkdErFb4W8hMu8dS0TOecbTJoxcc",
  authDomain: "file-management-bdb77.firebaseapp.com",
  projectId: "file-management-bdb77",
  storageBucket: "file-management-bdb77.appspot.com", // Corrected storage bucket
  messagingSenderId: "365915369824",
  appId: "1:365915369824:web:d4870dc4158e12b1ffee05",
  measurementId: "G-765TW3NH1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };

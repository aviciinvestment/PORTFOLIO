// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrAhyLhsjZgBHFxJjryJpDqENiZlFuiTM",
  authDomain: "portfolio-d8cb2.firebaseapp.com",
  projectId: "portfolio-d8cb2",
  storageBucket: "portfolio-d8cb2.firebasestorage.app",
  messagingSenderId: "595060053482",
  appId: "1:595060053482:web:e1bc1d1eed8f44fb8a8e93",
  measurementId: "G-F5CBS4E8EB"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };

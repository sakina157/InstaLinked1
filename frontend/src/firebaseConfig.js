import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBI2OCnoogOxNVj3HUtDQHALQbRE9ad9Bs",
  authDomain: "instalinked-ef5ae.firebaseapp.com",
  projectId: "instalinked-ef5ae",
  storageBucket: "instalinked-ef5ae.firebasestorage.app",
  messagingSenderId: "1095988910603",
  appId: "1:1095988910603:web:12290c72c90945aee1c50e"
};


//databaseURL: "https://instalinked-ef5ae-default-rtdb.firebaseio.com"
// Initialize Firebase app
const app = initializeApp(firebaseConfig);


// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

console.log("🔥 Firebase Initialized:", app);
console.log("🔑 Firebase Auth Instance:", auth);


export { auth, googleProvider, facebookProvider, signInWithPopup };
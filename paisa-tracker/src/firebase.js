// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMW10X0qnVfFcUMN0FryZhKLAAbqGdQIA",
  authDomain: "paisa-tracker-e23e3.firebaseapp.com",
  projectId: "paisa-tracker-e23e3",
  storageBucket: "paisa-tracker-e23e3.firebasestorage.app",
  messagingSenderId: "356898187675",
  appId: "1:356898187675:web:1383f711bfe20e364dd93e",
  measurementId: "G-10Q2L542KV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
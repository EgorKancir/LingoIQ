import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBBn_-ncRy17JQRHSzwROwAVNv0VXIZANI",
    authDomain: "lingoiq-d286e.firebaseapp.com",
    projectId: "lingoiq-d286e",
    storageBucket: "lingoiq-d286e.firebasestorage.app",
    messagingSenderId: "605588246260",
    appId: "1:605588246260:web:3e0d7baf950b7b2de1d8a1",
    measurementId: "G-JMET3NPKF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
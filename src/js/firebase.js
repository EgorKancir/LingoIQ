window.Buffer = window.Buffer || require('buffer/').Buffer;

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

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
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Додаємо підказку для вибору акаунта (уникає зациклення сесії)
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Замінюємо getFirestore на initializeFirestore з локальним кешем та оптимізацією з'єднання
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
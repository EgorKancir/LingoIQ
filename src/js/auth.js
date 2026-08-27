// ============================================================================
// 1. ІНІЦІАЛІЗАЦІЯ ТА РОБОТА З FIREBASE AUTH
// ============================================================================

import { auth, googleProvider, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import DEFAULT_AVATAR from 'url:../img/avatars/raccoon-1.jpeg';

// ============================================================================
// 2. БІЗНЕС-ЛОГІКА ПРОФІЛЮ ТА АВТОРИЗАЦІЇ
// ============================================================================

/**
 * Створення або оновлення профілю користувача у Firestore.
 */
export async function createUserProfile(user, customData = {}) {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const timestamp = new Date().toISOString();

    try {
        const snapshot = await getDoc(userRef);
        const inputName = customData.displayName ? customData.displayName.trim() : '';
        const finalDisplayName = inputName || user.displayName || 'Learner';

        if (!snapshot.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: finalDisplayName,
                photoURL: user.photoURL || DEFAULT_AVATAR,
                createdAt: timestamp,
                nativeLang: customData.nativeLang || 'uk',
                languages: []
            });
            console.log('Профіль успішно створено у Firestore');
        } else {
            const data = snapshot.data();
            const updates = {};
            
            if (!data.createdAt) {
                updates.createdAt = timestamp;
            }
            
            if (inputName !== '' || !data.displayName || data.displayName === 'Learner') {
                updates.displayName = finalDisplayName;
            }

            if (Object.keys(updates).length > 0) {
                await setDoc(userRef, updates, { merge: true });
                console.log('Профіль оновлено у Firestore');
            }
        }
    } catch (error) {
        console.error('Помилка Firestore:', error);
    }
}

export async function loginWithGoogle() {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, googleProvider);
        await createUserProfile(result.user);
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка Google Auth:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            alert(`Помилка авторизації: ${error.message}`);
        }
    }
}

export async function registerWithEmail(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (displayName) {
            await updateProfile(user, { displayName });
        }
        
        await createUserProfile(user, { displayName });
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка реєстрації:', error);
        alert(`Помилка реєстрації: ${error.message}`);
    }
}

export async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user);
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка входу:', error);
        alert(`Помилка входу: ${error.message}`);
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = './index.html';
    } catch (error) {
        console.error('Помилка виходу:', error);
    }
}
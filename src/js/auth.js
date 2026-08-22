// ============================================================================
// 1. ІМПОРТИ МОДУЛІВ ТА СЕРВІСІВ
// ============================================================================
import { auth, googleProvider, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Імпортуємо дефолтний аватар через Parcel
import DEFAULT_AVATAR from '../img/avatars/raccoon-1.jpeg';

// ============================================================================
// 2. ДОПОМІЖНІ ФУНКЦІЇ (FIRESTORE PROFILES)
// ============================================================================
/**
 * Створення або оновлення профілю користувача у Firestore.
 * Гарантує, що введене ім'я з форми коректно зберігається та не замінюється на 'Learner'.
 */
async function createUserProfile(user, customData = {}) {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const timestamp = new Date().toISOString();

    try {
        const snapshot = await getDoc(userRef);

        // Очищаємо та перевіряємо кастомне ім'я з форми
        const inputName = customData.displayName ? customData.displayName.trim() : '';
        const finalDisplayName = inputName || user.displayName || 'Learner';

        if (!snapshot.exists()) {
            // Створення нового профілю
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: finalDisplayName,
                photoURL: user.photoURL || DEFAULT_AVATAR,
                createdAt: timestamp,
                nativeLang: customData.nativeLang || 'uk'
            });
            console.log('Профіль успішно створено у Firestore');
        } else {
            // Оновлюємо дані, якщо в базі було 'Learner', а тепер є реальне ім'я
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

// ============================================================================
// 3. ФУНКЦІЇ АВТОРИЗАЦІЇ ТА РЕЄСТРАЦІЇ
// ============================================================================
/**
 * Вхід через Google
 */
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

/**
 * Реєстрація через Email
 */
export async function registerWithEmail(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Оновлюємо ім'я у самому Firebase Auth об'єкті
        if (displayName) {
            await updateProfile(user, { displayName });
        }
        
        // Зберігаємо профіль у Firestore з урахуванням введеного імені
        await createUserProfile(user, { displayName });
        
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка реєстрації:', error);
        alert(`Помилка реєстрації: ${error.message}`);
    }
}

/**
 * Вхід через Email
 */
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

/**
 * Вихід з акаунту
 */
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Помилка виходу:', error);
    }
}

// ============================================================================
// 4. СЛУХАЧІ СТАНУ АВТОРИЗАЦІЇ
// ============================================================================
/**
 * Глобальний слухач авторизації для головної сторінки (index.html)
 */
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;
    const isIndex = currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '';

    if (user && isIndex) {
        window.location.href = 'userpage.html';
    }
});
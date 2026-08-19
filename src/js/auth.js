import { auth, googleProvider, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Створення профілю користувача у Firestore
 */
async function createUserProfile(user, customData = {}) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: customData.displayName || user.displayName || 'Learner',
                createdAt: new Date().toISOString(),
                nativeLang: customData.nativeLang || 'uk'
            });
            console.log('Профіль успішно створено у Firestore');
        }
    } catch (error) {
        console.error('Помилка запису профілю Firestore:', error);
    }
}

/**
 * Вхід / Реєстрація через Google
 */
export async function loginWithGoogle() {
    try {
        // Фіксуємо збереження сесії в LocalStorage перед відкриттям Popup
        await setPersistence(auth, browserLocalPersistence);

        console.log('Відкриваємо вікно авторизації Google...');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Успішний вхід:', result.user);

        // Створюємо профіль
        await createUserProfile(result.user);

        // Перенаправлення на сторінку користувача
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка Google Auth:', error);
        // Якщо це просто закриття вікна користувачем, не виводимо помилку
        if (error.code !== 'auth/popup-closed-by-user') {
            alert(`Помилка авторизації Google: ${error.message}`);
        }
    }
}

/**
 * Вхід та реєстрація через Email
 */
export async function registerWithEmail(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user, { displayName });
        window.location.href = 'userpage.html';
    } catch (error) {
        alert(`Помилка реєстрації: ${error.message}`);
    }
}

export async function loginWithEmail(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'userpage.html';
    } catch (error) {
        alert(`Помилка входу: ${error.message}`);
    }
}

/**
 * Глобальний слухач авторизації
 */
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;
    const isIndex = currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '';

    if (user && isIndex) {
        window.location.href = 'userpage.html';
    }
});

export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Помилка виходу:', error);
    }
}
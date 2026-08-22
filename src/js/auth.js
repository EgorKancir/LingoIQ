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

// Імпортуємо дефолтний аватар через Parcel
import DEFAULT_AVATAR from '../img/avatars/raccoon-1.jpeg';

/**
 * Створення або оновлення профілю користувача у Firestore
 * Гарантує, що поле createdAt завжди буде присутнє.
 */
async function createUserProfile(user, customData = {}) {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const timestamp = new Date().toISOString();

    try {
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            // Створення нового профілю
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: customData.displayName || user.displayName || 'Learner',
                photoURL: user.photoURL || DEFAULT_AVATAR,
                createdAt: timestamp,
                nativeLang: customData.nativeLang || 'uk'
            });
            console.log('Профіль успішно створено у Firestore');
        } else {
            // Якщо профіль існує, але немає поля createdAt (наприклад, старі акаунти)
            const data = snapshot.data();
            if (!data.createdAt) {
                await setDoc(userRef, { createdAt: timestamp }, { merge: true });
                console.log('Поле createdAt було додано до існуючого профілю');
            }
        }
    } catch (error) {
        console.error('Помилка Firestore (можливо, проблеми з Rules):', error);
        // Не перериваємо процес, якщо Firestore не відповів, 
        // щоб користувач все одно міг увійти
    }
}

/**
 * Вхід через Google
 */
export async function loginWithGoogle() {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, googleProvider);
        
        // Чекаємо обробки профілю в БД перед переходом
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
        await createUserProfile(userCredential.user, { displayName });
        
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
        await signInWithEmailAndPassword(auth, email, password);
        // Після входу також перевіряємо профіль
        await createUserProfile(auth.currentUser);
        
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка входу:', error);
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

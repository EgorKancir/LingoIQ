import { auth, googleProvider, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Створює або перевіряє документ користувача у Firestore
 * @param {Object} user - об'єкт користувача з Firebase Auth
 * @param {Object} customData - додаткові дані (наприклад, username)
 */
async function createUserProfile(user, customData = {}) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        // Якщо користувач новий (немає запису в БД), створюємо його профіль
        if (!snapshot.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: customData.displayName || user.displayName || 'Learner',
                createdAt: new Date().toISOString(),
                nativeLang: customData.nativeLang || 'uk'
            });
            console.log('Профіль користувача успішно створено в Firestore');
        }
    } catch (error) {
        console.error('Помилка створення профілю в Firestore:', error);
    }
}

/**
 * Реєстрація через Email та пароль
 */
export async function registerWithEmail(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user, { displayName });

        // Перенаправлення на сторінку користувача
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка реєстрації:', error.message);
        alert(`Помилка реєстрації: ${error.message}`);
    }
}

/**
 * Вхід через Email та пароль
 */
export async function loginWithEmail(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);

        // Перенаправлення на сторінку користувача
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка входу:', error.message);
        alert(`Помилка входу: ${error.message}`);
    }
}

/**
 * Вхід / Реєстрація через Google
 */
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserProfile(result.user);

        // Перенаправлення на сторінку користувача
        window.location.href = 'userpage.html';
    } catch (error) {
        console.error('Помилка входу через Google:', error.message);
        alert(`Помилка Google Sign-In: ${error.message}`);
    }
}

/**
 * Вихід з акаунта
 */
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Помилка виходу з акаунта:', error.message);
    }
}
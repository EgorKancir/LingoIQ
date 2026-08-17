console.log("Hi, I am here!");

// src/js/index.js
import { initLanguagePicker } from './i18n';

// Додаємо подію, яка викликає ініціалізацію після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    // 1. Прив'язуємо події кліку на кнопку та поп-ап вибору мови
    initLanguagePicker();

    console.log('LingoIQ: i18n успішно ініціалізовано!');
});

// Реєстрація Акаунта------------------------------------------------------------

import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle
} from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Попапи
    const signupPopup = document.querySelector('.header-registration-signup-popup');
    const signinPopup = document.querySelector('.header-registration-signin-popup');

    // Кнопки відкриття в хедері
    const openSigninBtn = document.getElementById('open-signin-btn');
    const openSignupBtn = document.getElementById('open-signup-btn');

    // Відкрити вікно ВХОДУ (Sign In)
    const openSignin = () => {
        if (signinPopup) signinPopup.classList.remove('disable');
        if (signupPopup) signupPopup.classList.add('disable');
    };

    // Відкрити вікно РЕЄСТРАЦІЇ (Sign Up / Start Learning)
    const openSignup = () => {
        if (signupPopup) signupPopup.classList.remove('disable');
        if (signinPopup) signinPopup.classList.add('disable');
    };

    // Прив'язка подій до кнопок у хедері
    if (openSigninBtn) openSigninBtn.addEventListener('click', openSignin);
    if (openSignupBtn) openSignupBtn.addEventListener('click', openSignup);

    // Перемикачі
    const switchToSignin = document.getElementById('switch-to-signin');
    const switchToSignup = document.getElementById('switch-to-signup');

    // Форми та кнопки авторизації
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const googleSigninBtn = document.getElementById('google-signin-btn');

   // --- 1. ВІДКРИТТЯ ТА ЗАКРИТТЯ ПОПАПІВ ---

    // Відкрити модальне вікно (показуємо signup, ховаємо signin)
    const openModal = () => {
        if (signupPopup) signupPopup.classList.remove('disable');
        if (signinPopup) signinPopup.classList.add('disable');
    };

    // Закрити всі попапи реєстрації/входу
    const closeModal = () => {
        if (signupPopup) signupPopup.classList.add('disable');
        if (signinPopup) signinPopup.classList.add('disable');
    }

    // Закриття клавішею Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // --- 2. ПЕРЕМИКАННЯ МІЖ SIGN UP ТА SIGN IN ---

    if (switchToSignin && switchToSignup && signupPopup && signinPopup) {
        // Перехід до Sign In
        switchToSignin.addEventListener('click', (e) => {
            e.preventDefault();
            signupPopup.classList.add('disable');
            signinPopup.classList.remove('disable');
        });

        // Перехід до Sign Up
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            signinPopup.classList.add('disable');
            signupPopup.classList.remove('disable');
        });
    }

    // --- 3. ОБРОБКА ФОРМ ТА FIREBASE AUTH ---

    // Реєстрація через Email/Password
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username-signup').value.trim();
            const email = document.getElementById('email-signup').value.trim();
            const password = document.getElementById('password-signup').value.trim();

            if (email && password) {
                await registerWithEmail(email, password, username);
            }
        });
    }

    // Вхід через Email/Password
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email-signin').value.trim();
            const password = document.getElementById('password-signin').value.trim();

            if (email && password) {
                await loginWithEmail(email, password);
            }
        });
    }

    // Вхід через Google
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => loginWithGoogle());
    if (googleSigninBtn) googleSigninBtn.addEventListener('click', () => loginWithGoogle());
});

// ---------------------------------------------------------------------------------
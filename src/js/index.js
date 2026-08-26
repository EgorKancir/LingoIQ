import { Buffer } from 'buffer';


import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle
} from './auth.js';
import { initLanguagePicker } from './i18n.js';
// Призначаємо Buffer та global для браузерного середовища Parcel
window.global = window;
window.Buffer = Buffer;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ініціалізація вибору мови
    initLanguagePicker();
    console.log('LingoIQ: i18n успішно ініціалізовано!');

    // 2. Елементи попапів
    const signupPopup = document.querySelector('.header-registration-signup-popup');
    const signinPopup = document.querySelector('.header-registration-signin-popup');

    // Кнопки відкриття в хедері
    const openSigninBtn = document.getElementById('open-signin-btn');
    const openSignupBtn = document.getElementById('open-signup-btn');

    // Відкрити вікно ВХОДУ (Sign In)
    const openSignin = () => {
        if (signinPopup) signinPopup.classList.remove('disable');
        if (signupPopup) signupPopup.classList.add('disable');
        document.body.classList.add('no-scroll');
    };

    // Відкрити вікно РЕЄСТРАЦІЇ (Sign Up / Start Learning)
    const openSignup = () => {
        if (signupPopup) signupPopup.classList.remove('disable');
        if (signinPopup) signinPopup.classList.add('disable');
        document.body.classList.add('no-scroll');
    };

    // Прив'язка подій до кнопок у хедері
    if (openSigninBtn) openSigninBtn.addEventListener('click', openSignin);
    if (openSignupBtn) openSignupBtn.addEventListener('click', openSignup);

    // Перемикачі всередині попапів
    const switchToSignin = document.getElementById('switch-to-signin');
    const switchToSignup = document.getElementById('switch-to-signup');

    // Форми та кнопки авторизації
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const googleSigninBtn = document.getElementById('google-signin-btn');

    // Закрити всі попапи реєстрації/входу
    const closeModal = () => {
        if (signupPopup) signupPopup.classList.add('disable');
        if (signinPopup) signinPopup.classList.add('disable');
        document.body.classList.remove('no-scroll');
    };

    // Закриття клавішею Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Перемикання між Sign Up та Sign In
    if (switchToSignin && signupPopup && signinPopup) {
        switchToSignin.addEventListener('click', (e) => {
            e.preventDefault();
            signupPopup.classList.add('disable');
            signinPopup.classList.remove('disable');
        });
    }

    if (switchToSignup && signupPopup && signinPopup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            signinPopup.classList.add('disable');
            signupPopup.classList.remove('disable');
        });
    }

    // Реєстрація через Email/Password
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username-signup');
            const emailInput = document.getElementById('email-signup');
            const passwordInput = document.getElementById('password-signup');

            const username = usernameInput ? usernameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (email && password) {
                await registerWithEmail(email, password, username);
            }
        });
    }

    // Вхід через Email/Password
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email-signin');
            const passwordInput = document.getElementById('password-signin');

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (email && password) {
                await loginWithEmail(email, password);
            }
        });
    }

    // Вхід через Google (Pop-up)
    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await loginWithGoogle();
    };

    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleLogin);
    }
    if (googleSigninBtn) {
        googleSigninBtn.addEventListener('click', handleGoogleLogin);
    }
});
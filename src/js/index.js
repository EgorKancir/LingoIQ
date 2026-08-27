// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА БІБЛІОТЕК
// ============================================================================

import { Buffer } from 'buffer';
import { registerWithEmail, loginWithEmail, loginWithGoogle } from './auth.js';
import { initLanguagePicker } from './i18n.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

window.global = window;
window.Buffer = Buffer;

// ============================================================================
// 2. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ ТА ОБРОБНИКІВ ПОДІЙ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initLanguagePicker();
    console.log('LingoIQ: i18n успішно ініціалізовано!');

    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname;
        const isIndex = currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '';
        if (user && isIndex) {
            window.location.href = 'userpage.html';
        }
    });

    const signupPopup = document.querySelector('.header-registration-signup-popup');
    const signinPopup = document.querySelector('.header-registration-signin-popup');
    const openSigninBtn = document.getElementById('open-signin-btn');
    const openSignupBtn = document.getElementById('open-signup-btn');
    const openSignupHeroBtn = document.getElementById('open-signup-hero-btn');

    const openSignin = () => {
        if (signinPopup) signinPopup.classList.remove('disable');
        if (signupPopup) signupPopup.classList.add('disable');
        document.body.classList.add('no-scroll');
    };

    const openSignup = () => {
        if (signupPopup) signupPopup.classList.remove('disable');
        if (signinPopup) signinPopup.classList.add('disable');
        document.body.classList.add('no-scroll');
    };

    if (openSigninBtn) openSigninBtn.addEventListener('click', openSignin);
    if (openSignupBtn) openSignupBtn.addEventListener('click', openSignup);
    if (openSignupHeroBtn) openSignupHeroBtn.addEventListener('click', openSignup);

    const switchToSignin = document.getElementById('switch-to-signin');
    const switchToSignup = document.getElementById('switch-to-signup');
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const googleSigninBtn = document.getElementById('google-signin-btn');

    const closeModal = () => {
        if (signupPopup) signupPopup.classList.add('disable');
        if (signinPopup) signinPopup.classList.add('disable');
        document.body.classList.remove('no-scroll');
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

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

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username-signup')?.value.trim() || '';
            const email = document.getElementById('email-signup')?.value.trim() || '';
            const password = document.getElementById('password-signup')?.value.trim() || '';

            if (email && password) {
                await registerWithEmail(email, password, username);
            }
        });
    }

    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email-signin')?.value.trim() || '';
            const password = document.getElementById('password-signin')?.value.trim() || '';

            if (email && password) {
                await loginWithEmail(email, password);
            }
        });
    }

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await loginWithGoogle();
    };

    if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleLogin);
    if (googleSigninBtn) googleSigninBtn.addEventListener('click', handleGoogleLogin);
});
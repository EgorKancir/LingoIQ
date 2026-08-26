// ============================================================================
// 1. ІМПОРТИ МОДУЛІВ ТА БІБЛІОТЕК
// ============================================================================
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const defaultAvatar = './src/img/avatars/raccoon-1.jpeg';

let userInfoPopup;
let closePopupBtn;
let userMenuTrigger;
let logoutBtn;

const urlParams = new URLSearchParams(window.location.search);
const currentLangCode = urlParams.get('lang');

// ============================================================================
// 2. ГОЛОВНИЙ СЛУХАЧ ЗАВАНТАЖЕННЯ СТОРІНКИ
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!currentLangCode) {
        window.location.href = './userpage.html';
        return;
    }

    console.log('Відкрита сторінка для мови:', currentLangCode);

    userInfoPopup = document.querySelector('.user-info');
    closePopupBtn = document.querySelector('.user-info__button-close');
    userMenuTrigger = document.querySelector('.header__username-settings') || document.querySelector('.header__username');
    logoutBtn = document.getElementById('logout-btn');

    initHeaderEventListeners();
    initLanguageDataUI(currentLangCode);
    updateNavigationLinks(currentLangCode);

    // Додаткова перевірка ключів локального сховища Firebase, 
    // щоб зрозуміти, чи користувач взагалі був залогінений
    const firebaseLocalStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('firebase:authUser:'));
    const hasLocalSession = firebaseLocalStorageKeys.length > 0;

    let isAuthorized = false;

    // Слухач Firebase Auth
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            isAuthorized = true;
            await loadHeaderUserData(user);
        } else {
            // Якщо локально сесії немає взагалі — тоді точно кидаємо на index.html
            // Якщо ж сесія колись була, даємо трохи більше часу на відновлення
            if (!hasLocalSession) {
                setTimeout(() => {
                    if (!auth.currentUser) {
                        window.location.href = './index.html';
                    }
                }, 1000);
            }
        }
    });

    // Запобіжник: якщо за 2.5 секунди стейт не змінився і користувача немає
    setTimeout(async () => {
        if (!isAuthorized && !auth.currentUser) {
            // Остання перевірка: можливо Firebase просто довго думає, 
            // але в базі є кешований юзер
            if (!hasLocalSession) {
                console.warn('Користувач не авторизований, редирект на index.html');
                window.location.href = './index.html';
            }
        }
    }, 2500);
});

// ============================================================================
// 3. ІНШІ ФУНКЦІЇ UI ТА ДАНИХ
// ============================================================================
function initLanguageDataUI(langCode) {
    const lowerCode = langCode.toLowerCase();
    const upperCode = langCode.toUpperCase();

    const flagMap = { en: 'gb', uk: 'ua', pl: 'pl', de: 'de', es: 'es', fr: 'fr' };
    const countryCode = flagMap[lowerCode] || lowerCode;
    const flagImg = document.querySelector('.languge-falg');
    if (flagImg) {
        flagImg.src = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
        flagImg.alt = `${upperCode} Flag`;
    }

    const displayNames = new Intl.DisplayNames(['en', 'uk', 'de'], { type: 'language' });
    const fullLangName = displayNames.of(lowerCode) || upperCode;
    
    const titleElement = document.querySelector('.language-name');
    if (titleElement) {
        titleElement.textContent = fullLangName;
    }
}

function updateNavigationLinks(langCode) {
    const glossaryLink = document.querySelector('.web-navigation__page-link[href*="glossary.html"]');
    if (glossaryLink) {
        glossaryLink.href = `./glossary.html?lang=${langCode}`;
    }

    const rulesLink = document.querySelector('.web-navigation__page-link[href*="rules.html"]');
    if (rulesLink) {
        rulesLink.href = `./rules.html?lang=${rulesLink.getAttribute('href')?.includes('lang=') ? '' : 'lang=' + langCode}`; // безпечне оновлення
    }
}

function initHeaderEventListeners() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = './index.html';
            } catch (error) {
                console.error('Помилка виходу:', error);
            }
        });
    }

    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userInfoPopup) userInfoPopup.classList.remove('disable');
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userInfoPopup) userInfoPopup.classList.add('disable');
        });
    }

    document.addEventListener('click', (e) => {
        if (userInfoPopup && !userInfoPopup.classList.contains('disable')) {
            if (!userInfoPopup.contains(e.target) && !userMenuTrigger?.contains(e.target)) {
                userInfoPopup.classList.add('disable');
            }
        }
    });
}

async function loadHeaderUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            const name = data.displayName || user.displayName || 'Learner';
            const currentAvatar = data.photoURL || user.photoURL || defaultAvatar;
            const nativeLang = data.nativeLang || 'uk';
            
            let days = 0;
            if (data.createdAt) {
                const regDate = new Date(data.createdAt);
                const today = new Date();
                const diffTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());
                days = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            }

            const usernameElement = document.querySelector('.header__username');
            const headerAvatar = document.querySelector('.header__username-avatar');
            const popupUsername = document.querySelector('.user-info__username');
            const popupAvatar = document.querySelector('.user-info__img');
            const nativeLangSpan = document.getElementById('nativlang');
            const daysLearningSpan = document.getElementById('daysLearning');

            if (usernameElement) usernameElement.textContent = name;
            if (headerAvatar) headerAvatar.src = currentAvatar;
            if (popupUsername) popupUsername.textContent = name;
            if (popupAvatar) popupAvatar.src = currentAvatar;
            if (nativeLangSpan) nativeLangSpan.textContent = nativeLang;
            if (daysLearningSpan) daysLearningSpan.textContent = days;
        }
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
    }
}
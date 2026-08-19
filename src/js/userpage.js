import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Перевірка авторизації
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Якщо користувач не увійшов — повертаємо на головну
            window.location.href = './index.html';
            return;
        }

        // 2. Отримуємо дані користувача з Firestore
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                renderUserData(userData, user);
            } else {
                renderUserData({ displayName: user.displayName || 'Learner' }, user);
            }
        } catch (error) {
            console.error('Помилка завантаження даних користувача:', error);
        }
    });

    // 3. Логіка попапу профілю (відкриття / закриття)
    const userMenuTrigger = document.querySelector('.header__username-wrapper') || document.querySelector('.header__username');
    const userInfoPopup = document.querySelector('.header__user-info');
    const closePopupBtn = document.querySelector('.header__user-info-button-close');

    // Відкрити попап
    const openPopup = () => {
        if (userInfoPopup) userInfoPopup.classList.remove('disable');
    };

    // Закрити попап
    const closePopup = () => {
        if (userInfoPopup) userInfoPopup.classList.add('disable');
    };

    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopup();
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });
    }

    // Закриття при кліку поза межами попапу
    document.addEventListener('click', (e) => {
        if (userInfoPopup && !userInfoPopup.classList.contains('disable')) {
            if (!userInfoPopup.contains(e.target) && !userMenuTrigger?.contains(e.target)) {
                closePopup();
            }
        }
    });

    // Закриття клавішею Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePopup();
        }
    });

    // 4. Обробка виходу з акаунта (logout)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = './index.html';
            } catch (error) {
                console.error('Помилка під час виходу з акаунта:', error);
            }
        });
    }
});

/**
 * Рендеринг даних у HTML
 */
function renderUserData(data, user) {
    // Оновлюємо ім'я користувача
    const usernameElement = document.querySelector('.header__username');
    const popupNameElement = document.querySelector('.header__user-info-name');
    
    const name = data.displayName || user.displayName || 'Learner';
    if (usernameElement) usernameElement.textContent = name;
    if (popupNameElement) popupNameElement.textContent = name;

    // Оновлюємо аватарки у хедері та в попапі
    if (user.photoURL) {
        const headerAvatar = document.querySelector('.header__username-avatar');
        const popupAvatar = document.querySelector('.header__user-info-img');
        
        if (headerAvatar) headerAvatar.src = user.photoURL;
        if (popupAvatar) popupAvatar.src = user.photoURL;
    }

    // Рендер списку мов (якщо збережені в Firestore)
    if (data.languages && Array.isArray(data.languages)) {
        renderLanguages(data.languages);
    }
}

/**
 * Генератор шаблону для мов
 */
function renderLanguages(languages) {
    const listContainer = document.querySelector('.your-languages__language-list');
    if (!listContainer) return;

    listContainer.innerHTML = languages.map(lang => `
        <li class="your-languages__item">
            <a href="./languagepage.html?lang=${lang.code}" class="your-languages__item-link">
                <img src="./src/img/country-flags-main/svg/${lang.flag}.svg" alt="Flag" class="your-languages__item-flag">
                <span class="your-languages__item-title">${lang.code.toUpperCase()}</span>
            </a>
        </li>
    `).join('');
}
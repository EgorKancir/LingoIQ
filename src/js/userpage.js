// ============================================================================
// 1. ІМПОРТИ МОДУЛІВ
// ============================================================================
import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ============================================================================
// 2. ГЛОБАЛЬНІ ЕЛЕМЕНТИ DOM
// ============================================================================
const editForm = document.getElementById('edit-user-info-form');
const editToggleBtn = document.getElementById('edit-profile-toggle-btn');
const userInfoPopup = document.querySelector('.header__user-info');
const closePopupBtn = document.querySelector('.header__user-info-button-close');
const userMenuTrigger = document.querySelector('.header__username-settings') || document.querySelector('.header__username');
const logoutBtn = document.getElementById('logout-btn');

// ============================================================================
// 3. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ ТА АВТОРИЗАЦІЯ
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Перевірка стану авторизації користувача
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = './index.html';
            return;
        }

        // Отримання додаткових даних із Firestore
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

    // Обробка кнопка виходу з акаунта
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

// ============================================================================
// 4. ФУНКЦІЇ РЕНДЕРИНГУ ДАНИХ (UI)
// ============================================================================

/**
 * Оновлення персональних даних користувача у DOM
 */
function renderUserData(data, user) {
    const usernameElement = document.querySelector('.header__username');
    const popupNameElement = document.querySelector('.header__user-info-name');
    const nativeLangElement = document.getElementById('nativlang');
    
    const name = data.displayName || user.displayName || 'Learner';
    if (usernameElement) usernameElement.textContent = name;
    if (popupNameElement) popupNameElement.textContent = name;

    // Рендер рідної мови (якщо вказана в Firestore)
    if (nativeLangElement && data.nativeLang) {
        nativeLangElement.textContent = data.nativeLang;
    }

    // Оновлення фото аватара
    if (user.photoURL) {
        const headerAvatar = document.querySelector('.header__username-avatar');
        const popupAvatar = document.querySelector('.header__user-info-img');
        
        if (headerAvatar) headerAvatar.src = user.photoURL;
        if (popupAvatar) popupAvatar.src = user.photoURL;
    }

    // Рендер вивчаємих мов
    if (data.languages && Array.isArray(data.languages)) {
        renderLanguages(data.languages);
    }
}

/**
 * Рендеринг списку вивчаємих мов
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

// ============================================================================
// 5. ЛОГІКА ВІДКРИТТЯ ТА ЗАКРИТТЯ ПОПАПІВ
// ============================================================================

/**
 * Повне закриття профілю та приховування форми редагування
 */
const closeAllPopups = () => {
    if (userInfoPopup) userInfoPopup.classList.add('disable');
    if (editForm) {
        editForm.classList.add('disable');
        editForm.reset();
    }
};

// Відкриття головного попапу профілю
if (userMenuTrigger) {
    userMenuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (userInfoPopup) userInfoPopup.classList.remove('disable');
    });
}

// Перемикання форми редагування при кліку на олівець
if (editToggleBtn && editForm) {
    editToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editForm.classList.toggle('disable');
    });
}

// Закриття через кнопку-хрестик
if (closePopupBtn) {
    closePopupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPopups();
    });
}

// Закриття кліком поза межами попапу
document.addEventListener('click', (e) => {
    if (userInfoPopup && !userInfoPopup.classList.contains('disable')) {
        if (!userInfoPopup.contains(e.target) && !userMenuTrigger?.contains(e.target)) {
            closeAllPopups();
        }
    }
});

// Закриття клавішею Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllPopups();
    }
});

// ============================================================================
// 6. ОБРОБКА РЕДАГУВАННЯ ПРОФІЛЮ (SAVE / UPLOAD)
// ============================================================================
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) return;

        const submitBtn = document.getElementById('edit-user-info-btn');
        const newUsername = document.getElementById('username-edit')?.value.trim();
        const avatarFileInput = document.getElementById('avatar-file-edit');
        const file = avatarFileInput?.files?.[0];

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            let photoURL = user.photoURL;

            // Завантаження файлу в Firebase Storage
            if (file) {
                const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                photoURL = await getDownloadURL(snapshot.ref);
            }

            // Формування оновленого об'єкта
            const updatedData = {};
            if (newUsername) updatedData.displayName = newUsername;
            if (photoURL) updatedData.photoURL = photoURL;

            // Оновлення в Firebase Auth & Firestore
            await updateProfile(user, updatedData);
            await updateDoc(doc(db, 'users', user.uid), updatedData);

            // Оновлення інтерфейсу без перезавантаження
            if (newUsername) {
                document.querySelectorAll('.header__user-info-name, .header__username').forEach(el => el.textContent = newUsername);
            }
            if (photoURL) {
                document.querySelectorAll('.header__user-info-img, .header__username-avatar').forEach(img => img.src = photoURL);
            }

            closeAllPopups();

        } catch (error) {
            console.error('Помилка під час збереження даних:', error);
            alert('Не вдалося зберегти зміни. Спробуйте ще раз.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save';
            }
        }
    });
}
// ============================================================================
// 1. ІМПОРТИ МОДУЛІВ
// ============================================================================
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Для Parcel v2 обов'язково використовуємо префікс "url:" при імпорті статичних файлів
import defaultAvatar from 'url:../img/avatars/raccoon-1.jpeg';

// ============================================================================
// 2. ГЛОБАЛЬНІ ЗМІННІ ТА СТАН
// ============================================================================
let editForm;
let userSection;
let editToggleBtn;
let userInfoPopup;
let closePopupBtn;
let userMenuTrigger;
let logoutBtn;
let cancelEditBtn;

let selectedAvatarURL = '';
let isRedirecting = false; // Прапорець для запобігання подвійних редіректів

// ============================================================================
// 3. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ ТА АВТОРИЗАЦІЯ
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Ініціалізація DOM елементів
    editForm = document.getElementById('edit-user-info-form');
    userSection = document.querySelector('.user-info__user-section');
    editToggleBtn = document.getElementById('edit-profile-toggle-btn');
    userInfoPopup = document.querySelector('.user-info');
    closePopupBtn = document.querySelector('.user-info__button-close');
    userMenuTrigger = document.querySelector('.header__username-settings') || document.querySelector('.header__username');
    logoutBtn = document.getElementById('logout-btn');
    cancelEditBtn = document.getElementById('cancel-edit-btn');

    populateLanguageList();
    initEventListeners();
    initAvatarSelection();

    // Слухач авторизації
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (!isRedirecting) {
                isRedirecting = true;
                window.location.href = './index.html';
            }
            return;
        }

        console.log("Користувач успішно авторизований:", user.uid);

        // Додаємо глобальну функцію для перевірки бази прямо з консолі браузера
        window.debugGetData = async function() {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                console.log("АНАЛІЗ БАЗИ ДАНИХ ФІРЕБЕЙС:", snap.data());
            } else {
                console.log("Документ для цього юзера відсутній у Firestore!");
            }
        };

        // Завантажуємо дані профілю
        await loadUserData(user);
    });
});

// ============================================================================
// 4. ФУНКЦІЯ ЗАВАНТАЖЕННЯ ДАНИХ ПРОФІЛЮ (loadUserData)
// ============================================================================
async function loadUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            console.log("=== ДАНІ З ФІРЕБЕЙСУ ===", userSnap.data());
            renderUserData(userSnap.data(), user);
        } else {
            console.log("=== ДОКУМЕНТ НЕ ЗНАЙДЕНО, СТВОРЮЮ НОВИЙ В БАЗІ ===");
            
            // Створюємо базовий профіль автоматично, якщо його немає
            const newUserData = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Learner',
                photoURL: user.photoURL || '',
                nativeLang: 'uk',
                createdAt: new Date().toISOString()
            };

            await setDoc(userRef, newUserData);
            console.log("=== НОВИЙ ДОКУМЕНТ УСПІШНО СТВОРЕНО ===");
            
            renderUserData(newUserData, user);
        }
    } catch (error) {
        console.warn('Помилка завантаження або створення профілю:', error);
        renderUserData({ displayName: user.displayName || 'Learner', photoURL: user.photoURL }, user);
    }
}

// ============================================================================
// 5. ФУНКЦІЇ РЕНДЕРИНГУ ДАНИХ (UI)
// ============================================================================
function renderUserData(data, user) {
    const usernameElement = document.querySelector('.header__username');
    const popupNameElement = document.querySelector('.user-info__username');
    const nativeLangElement = document.getElementById('nativlang');
    const daysElement = document.getElementById('daysLearning');

    const name = data.displayName || user.displayName || 'Learner';
    if (usernameElement) usernameElement.textContent = name;
    if (popupNameElement) popupNameElement.textContent = name;

    if (nativeLangElement) {
        nativeLangElement.textContent = data.nativeLang || 'uk';
    }

    const currentAvatar = data.photoURL || user.photoURL || defaultAvatar;
    const headerAvatar = document.querySelector('.header__username-avatar');
    const popupAvatar = document.querySelector('.user-info__img');

    if (headerAvatar) headerAvatar.src = currentAvatar;
    if (popupAvatar) popupAvatar.src = currentAvatar;

    // Підрахунок днів навчання
    if (daysElement) {
        if (data.createdAt) {
            const registrationDate = new Date(data.createdAt);
            const today = new Date();
            
            const regDay = new Date(registrationDate.getFullYear(), registrationDate.getMonth(), registrationDate.getDate());
            const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const diffTime = todayDay - regDay;
            const daysStudying = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            daysElement.textContent = daysStudying >= 0 ? daysStudying : 0;
        } else {
            daysElement.textContent = '0';
        }
    }
}

// ============================================================================
// 6. УПРАВЛІННЯ ПОПАПАМИ ТА ПОДІЯМИ
// ============================================================================
function showUserSection() {
    if (editForm) {
        editForm.classList.add('disable');
        editForm.reset();
    }
    if (userSection) {
        userSection.classList.remove('disable');
    }
}

const closeAllPopups = () => {
    if (userInfoPopup) {
        userInfoPopup.classList.add('disable');
    }
    showUserSection();
};

function initEventListeners() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = './index.html';
            } catch (error) {
                console.error('Помилка під час виходу:', error);
            }
        });
    }

    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userInfoPopup) userInfoPopup.classList.remove('disable');
        });
    }

    if (editToggleBtn) {
        editToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userSection) userSection.classList.add('disable');
            if (editForm) editForm.classList.remove('disable');
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showUserSection();
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllPopups();
        });
    }

    document.addEventListener('click', (e) => {
        if (userInfoPopup && !userInfoPopup.classList.contains('disable')) {
            if (!userInfoPopup.contains(e.target) && !userMenuTrigger?.contains(e.target)) {
                closeAllPopups();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllPopups();
    });

    if (editForm) {
        editForm.addEventListener('submit', handleFormSubmit);
    }
}

// ============================================================================
// 7. ВИБІР АВАТАРА
// ============================================================================
function initAvatarSelection() {
    const avatarOptions = document.querySelectorAll('.user-info__avatar-option');
    avatarOptions.forEach(avatarImg => {
        avatarImg.addEventListener('click', (e) => {
            avatarOptions.forEach(img => img.classList.remove('active'));
            e.target.classList.add('active');
            selectedAvatarURL = e.target.src;
        });
    });
}

// ============================================================================
// 8. ЗБЕРЕЖЕННЯ ФОРМИ
// ============================================================================
async function handleFormSubmit(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const submitBtn = document.getElementById('edit-user-info-btn');
    const newUsername = document.getElementById('username-edit')?.value.trim();
    const newNativeLang = document.getElementById('native-lang-input')?.value.trim();

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        const firestoreUpdates = {};
        if (newUsername) firestoreUpdates.displayName = newUsername;
        if (newNativeLang) firestoreUpdates.nativeLang = newNativeLang;
        if (selectedAvatarURL) firestoreUpdates.photoURL = selectedAvatarURL;

        if (Object.keys(firestoreUpdates).length > 0) {
            await setDoc(doc(db, 'users', user.uid), firestoreUpdates, { merge: true });
        }

        if (newUsername) {
            document.querySelectorAll('.user-info__username, .header__username').forEach(el => {
                el.textContent = newUsername;
            });
        }

        if (selectedAvatarURL) {
            document.querySelectorAll('.user-info__img, .header__username-avatar').forEach(img => {
                img.src = selectedAvatarURL;
            });
        }

        if (newNativeLang) {
            const nativeLangSpan = document.getElementById('nativlang');
            if (nativeLangSpan) nativeLangSpan.textContent = newNativeLang;
        }

        showUserSection();

    } catch (error) {
        console.error('Помилка збереження:', error);
        alert('Не вдалося зберегти зміни.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save';
        }
    }
}

// ============================================================================
// 9. СПИСОК МОВ
// ============================================================================
function populateLanguageList() {
    const datalist = document.getElementById('languages-list');
    if (!datalist) return;

    const langCodes = [
        'uk', 'de', 'en', 'es', 'fr', 'it', 'pl', 'pt', 'ro', 'tr', 'zh',
        'ja', 'ko', 'ar', 'hi', 'bn', 'cs', 'sk', 'hu', 'nl', 'sv', 'no', 'fi',
        'da', 'el', 'he', 'id', 'ms', 'th', 'vi', 'bg', 'hr', 'sr', 'sl', 'lt', 'lv', 'et'
    ];

    const displayNames = new Intl.DisplayNames(['uk', 'en'], { type: 'language' });

    datalist.innerHTML = langCodes.map(code => {
        const langName = displayNames.of(code);
        return `<option value="${langName} (${code.toUpperCase()})">${langName}</option>`;
    }).join('');
}
// ============================================================================
// 1. ІМПОРТИ МОДУЛІВ
// ============================================================================
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

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
let isRedirecting = false;
let currentUserLanguages = [];

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

    // Заповнюємо списки мов (datalists)
    populateLanguageList();
    populateAddLanguageList();

    initEventListeners();
    initAvatarSelection();
    initYourLanguagesLogic();

    // Виклик глобальної функції перекладу
    if (typeof window.initLanguagePicker === 'function') {
        window.initLanguagePicker();
        console.log('LingoIQ: i18n успішно ініціалізовано!');
    }

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

        window.debugGetData = async function () {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                console.log("АНАЛІЗ БАЗИ ДАНИХ ФІРЕБЕЙС:", snap.data());
            } else {
                console.log("Документ для цього юзера відсутній у Firestore!");
            }
        };

        // Завантажуємо профіль та мови користувача
        await loadUserData(user);
        currentUserLanguages = await loadUserLanguages(user.uid);
        renderUserLanguages(currentUserLanguages);
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

            const newUserData = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Learner',
                photoURL: user.photoURL || '',
                nativeLang: 'uk',
                languages: [],
                createdAt: new Date().toISOString()
            };

            await setDoc(userRef, newUserData);
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
// 8. ЗБЕРЕЖЕННЯ ФОРМИ ПРОФІЛЮ
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
// 9. СПИСКИ МОВ (DATALISTS)
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

function populateAddLanguageList() {
    const datalist = document.getElementById('add-languages-list');
    if (!datalist) return;

    const langCodes = [
        'uk', 'de', 'en', 'es', 'fr', 'it', 'pl', 'pt', 'ro', 'tr', 'zh',
        'ja', 'ko', 'ar', 'hi', 'bn', 'cs', 'sk', 'hu', 'nl', 'sv', 'no', 'fi',
        'da', 'el', 'he', 'id', 'ms', 'th', 'vi', 'bg', 'hr', 'sr', 'sl', 'lt', 'lv', 'et'
    ];

    const displayNames = new Intl.DisplayNames(['uk', 'en'], { type: 'language' });

    datalist.innerHTML = langCodes.map(code => {
        const langName = displayNames.of(code);
        return `<option value="${langName} (${code.toUpperCase()})" data-code="${code}"></option>`;
    }).join('');
}

// ------------------------------------------------------------------------------------------------------------------
// --------------------------------------- YOUR-LANGUAGES & FIRESTORE -----------------------------------------------
// ------------------------------------------------------------------------------------------------------------------

function getFlagUrl(langCode) {
    const flagMap = {
        en: 'gb',
        uk: 'ua'
    };
    const countryCode = flagMap[langCode] || langCode;
    return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
}

function renderUserLanguages(userLanguages = []) {
    const languageListContainer = document.querySelector('.your-languages__language-list');
    if (!languageListContainer) return;

    languageListContainer.innerHTML = '';

    if (!userLanguages || userLanguages.length === 0) {
        languageListContainer.innerHTML = '<p class="no-languages-text" style="color: white; padding: 10px;">No languages added yet</p>';
        return;
    }

    userLanguages.forEach(langObj => {
        const langCode = langObj.code.toLowerCase();
        const langUpper = langCode.toUpperCase();
        const flagSrc = getFlagUrl(langCode);
        
        const listItem = document.createElement('li');
        listItem.className = 'your-languages__item';

        listItem.innerHTML = `
            <a href="./languagepage.html?lang=${langCode}" class="your-languages__item-link"> 
                <img src="${flagSrc}" alt="${langUpper} Flag"
                    class="your-languages__item-flag" onerror="this.src='./src/img/default-flag.svg'">
                <span class="your-languages__item-title">${langUpper}</span>
            </a>
        `;

        languageListContainer.appendChild(listItem);
    });
}

function getSelectedLanguageCode() {
    const input = document.getElementById('add-language-input');
    const datalist = document.getElementById('add-languages-list');
    if (!input || !datalist) return null;

    const val = input.value.trim();
    const options = datalist.querySelectorAll('option');
    let code = null;

    options.forEach(opt => {
        if (opt.value === val) {
            code = opt.getAttribute('data-code');
        }
    });

    return code;
}

async function loadUserLanguages(userId) {
    try {
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            return userData.languages || [];
        } else {
            return [];
        }
    } catch (error) {
        console.error("Помилка завантаження мов з бази:", error);
        return [];
    }
}

async function saveLanguageToFirestore(userId, langCode) {
    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            languages: arrayUnion({ code: langCode, addedAt: new Date().toISOString() })
        });
        console.log("Мову успішно збережено в Firestore!");
    } catch (error) {
        console.error("Помилка збереження мови в базу:", error);
        throw error;
    }
}

function initYourLanguagesLogic() {
    const addBtn = document.querySelector('.your-languages__language-addbutton');
    const form = document.getElementById('add-language-form');
    const cancelBtn = document.getElementById('add-language-cencel-btn');
    const submitBtn = document.getElementById('add-language-btn');
    const input = document.getElementById('add-language-input');

    if (addBtn && form) {
        addBtn.addEventListener('click', () => {
            form.classList.toggle('disable');
            addBtn.classList.toggle('disable');
            if (input) input.value = '';
        });
    }

    if (cancelBtn && form) {
        cancelBtn.addEventListener('click', () => {
            form.classList.add('disable');
            if (addBtn) addBtn.classList.remove('disable');
            if (input) input.value = '';
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const langCode = getSelectedLanguageCode();
            const user = auth.currentUser;

            if (!langCode) {
                alert('Будь ласка, оберіть мову зі списку!');
                return;
            }

            if (!user) {
                alert('Будь ласка, увійдіть у систему!');
                return;
            }

            const languageExists = currentUserLanguages.some(lang => lang.code === langCode);
            
            if (languageExists) {
                alert('Ця мова вже є у вашому списку вивчення!');
                return;
            }

            try {
                await saveLanguageToFirestore(user.uid, langCode);

                currentUserLanguages.push({ code: langCode });
                renderUserLanguages(currentUserLanguages);

                form.classList.add('disable');
                if (addBtn) addBtn.classList.remove('disable');
                input.value = '';
            } catch (error) {
                alert('Не вдалося зберегти мову. Спробуйте ще раз.');
            }
        });
    }
}
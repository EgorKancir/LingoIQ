// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА БАЗОВИХ МОДУЛІВ
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { initLanguagePicker } from './i18n.js';

let editForm;
let userSection;
let editToggleBtn;
let cancelEditBtn;
let selectedAvatarURL = '';
let isRedirecting = false;
let currentUserLanguages = [];

// ============================================================================
// 2. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ ТА ПЕРЕВІРКА СЕСІЇ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    editForm = document.getElementById('edit-user-info-form');
    userSection = document.querySelector('.user-info__user-section');
    editToggleBtn = document.getElementById('edit-profile-toggle-btn');
    cancelEditBtn = document.getElementById('cancel-edit-btn');

    initHeader();
    initLanguagePicker();

    populateLanguageList();
    populateAddLanguageList();

    initEventListeners();
    initAvatarSelection();
    initYourLanguagesLogic();

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (!isRedirecting) {
                isRedirecting = true;
                window.location.href = './index.html';
            }
            return;
        }

        await loadHeaderUserData(user);
        currentUserLanguages = await loadUserLanguages(user.uid);
        renderUserLanguages(currentUserLanguages);
    });
});

// ============================================================================
// 3. ДОПОМІЖНІ ФУНКЦІЇ ТА ЛОГІКА ФОРМ
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

function initEventListeners() {
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

    if (editForm) {
        editForm.addEventListener('submit', handleFormSubmit);
    }
}

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

        await loadHeaderUserData(user);
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
// 4. РОБОТА З БАЗОЮ ДАНИХ (FIRESTORE) ТА СПИСКАМИ
// ============================================================================

function populateLanguageList() {
    const datalist = document.getElementById('languages-list');
    if (!datalist) return;

    const langCodes = ['uk', 'de', 'en', 'es', 'fr', 'it', 'pl', 'pt', 'ro', 'tr', 'zh', 'ja', 'ko', 'ar', 'hi', 'cs', 'nl', 'sv'];
    const displayNames = new Intl.DisplayNames(['uk', 'en'], { type: 'language' });

    datalist.innerHTML = langCodes.map(code => {
        const langName = displayNames.of(code);
        return `<option value="${langName} (${code.toUpperCase()})">${langName}</option>`;
    }).join('');
}

function populateAddLanguageList() {
    const datalist = document.getElementById('add-languages-list');
    if (!datalist) return;

    const langCodes = ['uk', 'de', 'en', 'es', 'fr', 'it', 'pl', 'pt', 'ro', 'tr', 'zh', 'ja', 'ko', 'ar', 'hi', 'cs', 'nl', 'sv'];
    const displayNames = new Intl.DisplayNames(['uk', 'en'], { type: 'language' });

    datalist.innerHTML = langCodes.map(code => {
        const langName = displayNames.of(code);
        return `<option value="${langName} (${code.toUpperCase()})" data-code="${code}"></option>`;
    }).join('');
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
        return userSnap.exists() ? (userSnap.data().languages || []) : [];
    } catch (error) {
        console.error("Помилка завантаження мов з бази:", error);
        return [];
    }
}

async function saveLanguageToFirestore(userId, langCode) {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
        languages: arrayUnion({ code: langCode, addedAt: new Date().toISOString() })
    });
}

// ============================================================================
// 5. ФУНКЦІЇ РЕНДЕРИНГУ ДАНИХ (UI)
// ============================================================================

function getFlagUrl(langCode) {
    const lower = langCode.toLowerCase();
    
    // Словник виключень для мов, коди яких відрізняються від кодів країн на FlagCDN
    const flagMap = {
        en: 'gb', // Англійська -> Велика Британія
        uk: 'ua', // Українська -> Україна
        ja: 'jp', // Японська -> Японія
        da: 'dk', // Данська -> Данія
        sv: 'se', // Шведська -> Швеція
        el: 'gr', // Грецька -> Греція
        cs: 'cz', // Чеська -> Чехія
        et: 'ee'  // Естонська -> Естонія
    };

    const countryCode = flagMap[lower] || lower;
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
                <img src="${flagSrc}" alt="${langUpper} Flag" class="your-languages__item-flag" onerror="this.src='./src/img/default-flag.svg'">
                <span class="your-languages__item-title">${langUpper}</span>
            </a>
        `;
        languageListContainer.appendChild(listItem);
    });
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
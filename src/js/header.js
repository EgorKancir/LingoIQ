// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ
// ============================================================================

import { auth, db } from './firebase.js';
import { logoutUser } from './auth.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import defaultAvatar from 'url:../img/avatars/raccoon-1.jpeg';

let selectedAvatarURL = '';

// ============================================================================
// 2. ІНІЦІАЛІЗАЦІЯ ЕЛЕМЕНТІВ ІНТЕРФЕЙСУ ТА ПОПАПІВ ХЕДЕРА
// ============================================================================

export function initHeader() {
    const userInfoPopup = document.querySelector('.user-info');
    const closePopupBtn = document.querySelector('.user-info__button-close');
    const userMenuTrigger = document.querySelector('.header__username-settings') || document.querySelector('.header__username');
    const logoutBtn = document.getElementById('logout-btn');

    const editToggleBtn = document.getElementById('edit-profile-toggle-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const userSection = document.querySelector('.user-info__user-section');
    const editForm = document.getElementById('edit-user-info-form');
    const avatarOptions = document.querySelectorAll('.user-info__avatar-option');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
        });
    }

    if (userMenuTrigger && userInfoPopup) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userInfoPopup.classList.remove('disable');
        });
    }

    if (closePopupBtn && userInfoPopup) {
        closePopupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userInfoPopup.classList.add('disable');
            if (userSection && editForm) {
                userSection.classList.remove('disable');
                editForm.classList.add('disable');
                editForm.reset();
            }
        });
    }

    if (editToggleBtn && userSection && editForm) {
        editToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userSection.classList.add('disable');
            editForm.classList.remove('disable');
            
            // Підставляємо поточні значення в інпути при відкритті
            const currentNameEl = document.querySelector('.user-info__username');
            const nameInput = document.getElementById('username-edit');
            if (currentNameEl && nameInput && !nameInput.value) {
                nameInput.value = currentNameEl.textContent;
            }
        });
    }

    if (cancelEditBtn && userSection && editForm) {
        cancelEditBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editForm.classList.add('disable');
            editForm.reset();
            userSection.classList.remove('disable');
            selectedAvatarURL = '';
            avatarOptions.forEach(img => img.classList.remove('active'));
        });
    }

    // Вибір аватарки всередині хедера
    avatarOptions.forEach(avatarImg => {
        avatarImg.addEventListener('click', (e) => {
            avatarOptions.forEach(img => img.classList.remove('active'));
            e.target.classList.add('active');
            selectedAvatarURL = e.target.src;
        });
    });

    // Обробник сабміту форми редагування профілю
    if (editForm) {
        // Уникаємо дублювання слухачів, якщо initHeader викликається повторно
        editForm.removeEventListener('submit', handleHeaderFormSubmit);
        editForm.addEventListener('submit', handleHeaderFormSubmit);
    }

    document.addEventListener('click', (e) => {
        if (userInfoPopup && !userInfoPopup.classList.contains('disable')) {
            if (!userInfoPopup.contains(e.target) && !userMenuTrigger?.contains(e.target)) {
                userInfoPopup.classList.add('disable');
                if (userSection && editForm) {
                    userSection.classList.remove('disable');
                    editForm.classList.add('disable');
                    editForm.reset();
                }
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userInfoPopup) {
            userInfoPopup.classList.add('disable');
            if (userSection && editForm) {
                userSection.classList.remove('disable');
                editForm.classList.add('disable');
                editForm.reset();
            }
        }
    });
}

// ============================================================================
// 3. ДОПОМІЖНІ ФУНКЦІЇ ЗБЕРЕЖЕННЯ
// ============================================================================

async function handleHeaderFormSubmit(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const editForm = document.getElementById('edit-user-info-form');
    const userSection = document.querySelector('.user-info__user-section');
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

        // Оновлюємо інтерфейс хедера на поточній сторінці
        await loadHeaderUserData(user);

        // Повертаємося до режиму перегляду
        if (editForm) {
            editForm.classList.add('disable');
            editForm.reset();
        }
        if (userSection) {
            userSection.classList.remove('disable');
        }
        selectedAvatarURL = '';

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
// 5. ФУНКЦІЇ РЕНДЕРИНГУ ДАНИХ (UI) ДЛЯ ХЕДЕРА
// ============================================================================

export async function loadHeaderUserData(user) {
    if (!user) return;

    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let data = {};
        if (userSnap.exists()) {
            data = userSnap.data();
        }

        const name = data.displayName || user.displayName || 'Learner';
        const currentAvatar = data.photoURL || user.photoURL || defaultAvatar;
        const nativeLang = data.nativeLang || 'uk';
        
        let days = 0;
        if (data.createdAt) {
            const regDate = new Date(data.createdAt);
            const today = new Date();
            const regDay = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());
            const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const diffTime = todayDay - regDay;
            days = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        }

        document.querySelectorAll('.header__username, .user-info__username').forEach(el => {
            el.textContent = name;
        });

        document.querySelectorAll('.header__username-avatar, .user-info__img').forEach(img => {
            img.src = currentAvatar;
        });

        const nativeLangSpan = document.getElementById('nativlang');
        if (nativeLangSpan) nativeLangSpan.textContent = nativeLang;

        const daysLearningSpan = document.getElementById('daysLearning');
        if (daysLearningSpan) daysLearningSpan.textContent = days;

        return data;
    } catch (error) {
        console.error('Помилка завантаження даних хедера:', error);
    }
}
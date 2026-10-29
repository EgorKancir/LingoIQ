// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА МОДУЛІВ
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { updateFlagAndLinksByUrl } from './utils.js';
import { initLanguagePicker } from './i18n.js';

// Отримуємо код мови з URL (наприклад: glossary.html?lang=de)
const urlParams = new URLSearchParams(window.location.search);
const currentLangCode = urlParams.get('lang');

let currentGlossary = [];
let editingWordId = null;

// ============================================================================
// 2. СИСТЕМА ЛОКАЛІЗАЦІЇ (LINGOIQ_LANG)
// ============================================================================

function getCurrentLang() {
    const rawLang = localStorage.getItem('lingoiq_lang') || 'en';
    return rawLang.substring(0, 2).toLowerCase();
}

const LOCALIZATION = {
    alerts: {
        fillAll: {
            en: 'Please fill in all fields!',
            de: 'Bitte füllen Sie alle Felder aus!',
            uk: 'Будь ласка, заповніть усі поля!'
        },
        saveError: {
            en: 'Failed to save changes. Please try again.',
            de: 'Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.',
            uk: 'Не вдалося зберегти зміни. Спробуйте ще раз.'
        },
        deleteConfirm: {
            en: 'Are you sure you want to delete this word?',
            de: 'Möchten Sie dieses Wort wirklich löschen?',
            uk: 'Ви впевнені, що хочете видалити це слово?'
        },
        noWords: {
            en: 'No words in the glossary yet. Add your first word!',
            de: 'Noch keine Wörter im Glossar. Fügen Sie Ihr erstes Wort hinzu!',
            uk: 'У словнику ще немає слів. Додайте своє перше слово!'
        }
    },
    types: {
        noun: { en: 'noun', de: 'Nomen', uk: 'іменник' },
        verb: { en: 'verb', de: 'Verb', uk: 'дієслово' },
        adjective: { en: 'adjective', de: 'Adjektiv', uk: 'прикметник' },
        adverb: { en: 'adverb', de: 'Adverb', uk: 'прислівник' },
        pronoun: { en: 'pronoun', de: 'Pronomen', uk: 'займенник' },
        preposition: { en: 'preposition', de: 'Präposition', uk: 'прийменник' },
        conjunction: { en: 'conjunction', de: 'Konjunktion', uk: 'сполучник' }
    },
    statuses: {
        'studied': { en: 'Studied', de: 'Gelernt', uk: 'Вивчено' },
        'study': { en: 'Study', de: 'Am Lernen', uk: 'Вчиться' },
        'not studied': { en: 'Not Studied', de: 'Nicht gelernt', uk: 'Не вивчено' }
    }
};

function getAlertText(key) {
    const lang = getCurrentLang();
    return LOCALIZATION.alerts[key]?.[lang] || LOCALIZATION.alerts[key]?.en || '';
}

function getLocalizedType(rawType) {
    if (!rawType) return '';
    const key = rawType.toLowerCase();
    const lang = getCurrentLang();
    return LOCALIZATION.types[key]?.[lang] || LOCALIZATION.types[key]?.en || rawType;
}

function getLocalizedStatus(rawStatus) {
    if (!rawStatus) return '';
    const key = rawStatus.toLowerCase();
    const lang = getCurrentLang();
    return LOCALIZATION.statuses[key]?.[lang] || LOCALIZATION.statuses[key]?.en || rawStatus;
}

// Допоміжна функція для отримання сьогоднішньої дати YYYY-MM-DD
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================================================
// 3. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!currentLangCode) {
        window.location.href = './userpage.html';
        return;
    }

    initHeader();
    initLanguagePicker();
    initGlossaryUI();
    updateFlagAndLinksByUrl();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadHeaderUserData(user);
            await loadGlossaryData(user.uid, currentLangCode);
        } else {
            window.location.href = './index.html';
        }
    });
});

// ============================================================================
// 4. ЗАВАНТАЖЕННЯ ТА ЗБЕРЕЖЕННЯ СЛОВНИКА У FIRESTORE
// ============================================================================

async function loadGlossaryData(userId, langCode) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const languages = userData.languages || [];

        const currentLangObj = languages.find(
            lang => lang.code.toLowerCase() === langCode.toLowerCase()
        );

        currentGlossary = currentLangObj?.words || currentLangObj?.glossary || [];
        renderGlossaryTable(currentGlossary);

    } catch (error) {
        console.error('Помилка завантаження словника:', error);
    }
}

async function saveGlossaryToFirestore(userId, langCode, newGlossary) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const languages = userData.languages || [];

        const updatedLanguages = languages.map(lang => {
            if (lang.code.toLowerCase() === langCode.toLowerCase()) {
                return { 
                    ...lang, 
                    words: newGlossary,
                    glossary: newGlossary 
                };
            }
            return lang;
        });

        await updateDoc(userDocRef, { languages: updatedLanguages });
    } catch (error) {
        console.error('Помилка збереження словника в Firestore:', error);
        alert(getAlertText('saveError'));
    }
}

// ============================================================================
// 5. РЕНДЕРИНГ ТАБЛИЦІ СЛОВНИКА
// ============================================================================

function renderGlossaryTable(glossaryArray) {
    const tableBody = document.getElementById('glossary-table__body');
    const template = document.getElementById('glossary-table__row-template');
    
    if (!tableBody || !template) return;

    tableBody.innerHTML = '';

    if (!glossaryArray || glossaryArray.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: white; padding: 20px;">
                    ${getAlertText('noWords')}
                </td>
            </tr>
        `;
        return;
    }

    glossaryArray.forEach((item, index) => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.glossary-table__body-td--number').textContent = index + 1;
        clone.querySelectorAll('.glossary-table__body-td')[1].textContent = item.word || '';
        clone.querySelectorAll('.glossary-table__body-td')[2].textContent = item.translation || '';
        
        // Локалізований тип слова
        clone.querySelectorAll('.glossary-table__body-td')[3].textContent = getLocalizedType(item.typ);

        const statusSpan = clone.querySelector('.glossary-table__status');
        const st = (item.status || 'Not Studied').toLowerCase();
        
        // Локалізований статус слова
        statusSpan.textContent = getLocalizedStatus(st);
        
        let statusClass = 'not-studied';
        if (st === 'studied') statusClass = 'studied';
        else if (st === 'study') statusClass = 'study';
        
        statusSpan.className = `glossary-table__status glossary-table__status--${statusClass}`;

        const editBtn = clone.querySelector('.glossary-table__body-btn--edit');
        const deleteBtn = clone.querySelector('.glossary-table__body-btn--delete');
        
        if (editBtn) editBtn.setAttribute('data-id', item.id);
        if (deleteBtn) deleteBtn.setAttribute('data-id', item.id);

        if (deleteBtn) deleteBtn.addEventListener('click', () => handleDeleteWord(item.id));
        if (editBtn) editBtn.addEventListener('click', () => handleEditClick(item));

        tableBody.appendChild(clone);
    });
}

// ============================================================================
// 6. ІТЕРАЦІЇ З ФОРМОЮ ТА КНОПКАМИ
// ============================================================================

function initGlossaryUI() {
    const addBtn = document.getElementById('glossary-table__add-btn');
    const formRow = document.querySelector('.glossary-form__tr');
    const cancelBtn = document.querySelector('.glossary-form__btn-cencel');
    const submitForm = document.getElementById('add-word-form');
    const formNumberCell = document.querySelector('.glossary-form__number');

    if (addBtn && formRow) {
        addBtn.addEventListener('click', () => {
            editingWordId = null;
            submitForm.reset();
            
            if (formNumberCell) formNumberCell.textContent = 'New';

            formRow.classList.remove('disable');
            addBtn.parentElement.parentElement.style.display = 'none';
        });
    }

    if (cancelBtn && formRow) {
        cancelBtn.addEventListener('click', () => {
            formRow.classList.add('disable');
            editingWordId = null;
            if (formNumberCell) formNumberCell.textContent = 'New';
            if (addBtn) {
                addBtn.parentElement.parentElement.style.display = '';
            }
            submitForm.reset();
        });
    }

    if (submitForm) {
        submitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;

            const wordInput = document.getElementById('new-word');
            const translationInput = document.getElementById('new-translation');
            const typSelect = document.getElementById('new-typ');
            const statusSelect = document.getElementById('new-status');

            const word = wordInput.value.trim();
            const translation = translationInput.value.trim();
            const typ = typSelect.value;
            const status = statusSelect.value;

            if (!word || !translation || !typ || !status) {
                alert(getAlertText('fillAll'));
                return;
            }

            if (editingWordId) {
                currentGlossary = currentGlossary.map(item => {
                    if (item.id === editingWordId) {
                        return { 
                            ...item, 
                            word, 
                            translation, 
                            typ, 
                            status,
                            stage: item.stage || 1,
                            nextReviewDate: item.nextReviewDate || getTodayString()
                        };
                    }
                    return item;
                });
            } else {
                const newItem = {
                    id: Date.now().toString(),
                    word,
                    translation,
                    typ,
                    status,
                    stage: 1,
                    nextReviewDate: getTodayString(),
                    createdAt: new Date().toISOString()
                };
                currentGlossary.push(newItem);
            }

            await saveGlossaryToFirestore(user.uid, currentLangCode, currentGlossary);

            renderGlossaryTable(currentGlossary);
            submitForm.reset();
            formRow.classList.add('disable');
            editingWordId = null;
            if (formNumberCell) formNumberCell.textContent = 'New';
            if (addBtn) {
                addBtn.parentElement.parentElement.style.display = '';
            }
        });
    }
}

function handleEditClick(item) {
    const formRow = document.querySelector('.glossary-form__tr');
    const addBtn = document.getElementById('glossary-table__add-btn');
    const formNumberCell = document.querySelector('.glossary-form__number');

    if (!formRow) return;

    editingWordId = item.id;

    if (formNumberCell) formNumberCell.textContent = 'Edit';

    document.getElementById('new-word').value = item.word || '';
    document.getElementById('new-translation').value = item.translation || '';
    document.getElementById('new-typ').value = item.typ || '';
    document.getElementById('new-status').value = item.status || '';

    formRow.classList.remove('disable');
    if (addBtn) {
        addBtn.parentElement.parentElement.style.display = 'none';
    }
}

// ============================================================================
// 7. ВИДАЛЕННЯ СЛОВА
// ============================================================================

async function handleDeleteWord(wordId) {
    const isConfirmed = confirm(getAlertText('deleteConfirm'));
    if (!isConfirmed) return;

    const user = auth.currentUser;
    if (!user) return;

    currentGlossary = currentGlossary.filter(item => item.id !== wordId);

    await saveGlossaryToFirestore(user.uid, currentLangCode, currentGlossary);
    renderGlossaryTable(currentGlossary);
}
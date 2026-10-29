// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА МОДУЛІВ
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { updateFlagAndLinksByUrl } from './utils.js';
import { initLanguagePicker } from './i18n.js';

// Отримуємо код мови з URL (наприклад: rules.html?lang=de)
const urlParams = new URLSearchParams(window.location.search);
const currentLangCode = urlParams.get('lang') || 'en';

let currentCategory = '';
let editingRuleIndex = null;
let allCategoryRules = []; // Зберігаємо всі правила поточної категорії для пошуку

// ============================================================================
// 2. СИСТЕМА ЛОКАЛІЗАЦІЇ ДИНАМІЧНИХ ТЕКСТІВ
// ============================================================================

function getRuleTranslation(key) {
    const rawLang = localStorage.getItem('lingoiq_lang') || 'en';
    const currentLang = rawLang.substring(0, 2).toLowerCase();

    const translations = {
        en: {
            loading: 'Loading...',
            'no-rules-added-yet': 'No rules added yet.',
            'no-rules-for-this-language-yet': 'No rules for this language yet.',
            'failed-to-load-rules': 'Failed to load rules',
            'no-rules-found': 'No rules found.'
        },
        de: {
            loading: 'Wird geladen...',
            'no-rules-added-yet': 'Noch keine Regeln hinzugefügt.',
            'no-rules-for-this-language-yet': 'Noch keine Regeln für diese Sprache vorhanden.',
            'failed-to-load-rules': 'Fehler beim Laden der Regeln',
            'no-rules-found': 'Keine Regeln gefunden.'
        },
        uk: {
            loading: 'Завантаження...',
            'no-rules-added-yet': 'Правил ще не додано.',
            'no-rules-for-this-language-yet': 'Для цієї мови ще немає правил.',
            'failed-to-load-rules': 'Не вдалося завантажити правила',
            'no-rules-found': 'Правил не знайдено.'
        }
    };

    return translations[currentLang]?.[key] || translations.en[key] || key;
}

// ============================================================================
// 3. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initLanguagePicker();
    initRulesNavigation();
    initAddRuleForm();
    initImagePopup();
    initSearchBox();
    updateFlagAndLinksByUrl();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadHeaderUserData(user);
        } else {
            window.location.href = './index.html';
        }
    });
});

// ============================================================================
// 4. НАВІГАЦІЯ ТА ПЕРЕМИКАННЯ МІЖ КАТЕГОРІЯМИ І РОЗДІЛАМИ
// ============================================================================

function initRulesNavigation() {
    const rulesInfoGroup = document.querySelector('.rules__info-group');
    const rulesListBox = document.querySelector('.rules-group');
    const ruleSection = document.querySelector('.rule-section');
    const backBtn = document.querySelector('.rule-section__btn-back');
    const ruleTitle = document.querySelector('.rule-section__title');
    const icons = document.querySelectorAll('.rule-section__icon');

    const categoryButtons = document.querySelectorAll('.rules-group__rules-element');

    categoryButtons.buttonList = categoryButtons; // для зручності

    categoryButtons.forEach(button => {
        button.addEventListener('click', async () => {
            // Отримуємо системний ключ категорії з атрибута (наприклад, "grammar")
            const categoryKey = button.getAttribute('data-category');
            const categoryTitleText = button.querySelector('.rules-group__rules-title').textContent;
            
            currentCategory = categoryKey; // Використовуємо його як ключ для бази даних

            if (rulesInfoGroup) rulesInfoGroup.classList.add('disable');
            rulesListBox.classList.add('disable');
            ruleSection.classList.remove('disable');

            if (ruleTitle) {
                // Заголовок залишається локалізованим текстом кнопки
                ruleTitle.textContent = categoryTitleText;
            }

            // Порівнюємо іконки за унікальним атрибутом data-category замість alt
            icons.forEach(icon => {
                icon.classList.add('disable');
                if (icon.getAttribute('data-category') === categoryKey) {
                    icon.classList.remove('disable');
                }
            });

            // Очищуємо поле пошуку при переході в іншу категорію
            const searchInput = document.getElementById('search-rules');
            if (searchInput) searchInput.value = '';

            await loadRulesFromArray(currentCategory);
        });
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            ruleSection.classList.add('disable');
            rulesListBox.classList.remove('disable');
            if (rulesInfoGroup) rulesInfoGroup.classList.remove('disable');
            currentCategory = '';
            resetFormState();
        });
    }
}

// ============================================================================
// 5. РОБОТА З МАСИВОМ LANGUAGES ТА ОБ'ЄКТОМ RULES У ДОКУМЕНТІ КОРИСТУВАЧА
// ============================================================================

function initAddRuleForm() {
    const addBtn = document.querySelector('.rule-section__add-btn');
    const form = document.getElementById('form-add-new-rule');
    const closeBtn = document.querySelector('.rule-section__form-close-btn');

    if (addBtn && form) {
        addBtn.addEventListener('click', () => {
            resetFormState();
            addBtn.classList.add('disable');
            form.classList.remove('disable');
        });
    }

    if (closeBtn && form && addBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetFormState();
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = auth.currentUser;

            const rawLang = localStorage.getItem('lingoiq_lang') || 'en';
            const currentLang = rawLang.substring(0, 2).toLowerCase();
            const alerts = {
                loginAgain: {
                    en: 'Please log in again.',
                    de: 'Bitte melden Sie sich erneut an.',
                    uk: 'Будь ласка, увійдіть знову.'
                }
            };
            if (!user) {
                alert(alerts.loginAgain[currentLang] || alerts.loginAgain.en);
                return;
            }

            const title = document.getElementById('add-new-rule-title').value.trim();
            const url = document.getElementById('add-new-rule-url').value.trim();
            const paragraf = document.getElementById('add-new-rule-paragraf').value.trim();

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) return;

                let userData = docSnap.data();
                let languagesArray = userData.languages || [];

                let langObjIndex = languagesArray.findIndex(l => l.code === currentLangCode);

                if (langObjIndex === -1) {
                    languagesArray.push({
                        code: currentLangCode,
                        addedAt: new Date().toISOString(),
                        rules: {}
                    });
                    langObjIndex = languagesArray.length - 1;
                }

                if (!languagesArray[langObjIndex].rules) {
                    languagesArray[langObjIndex].rules = {};
                }

                let rulesMap = languagesArray[langObjIndex].rules;
                let currentCategoryRules = rulesMap[currentCategory] || [];

                const ruleObj = {
                    id: Date.now().toString(),
                    title,
                    url,
                    paragraf,
                    createdAt: new Date().toISOString()
                };

                if (editingRuleIndex !== null) {
                    ruleObj.id = currentCategoryRules[editingRuleIndex].id;
                    currentCategoryRules[editingRuleIndex] = ruleObj;
                } else {
                    currentCategoryRules.push(ruleObj);
                }

                rulesMap[currentCategory] = currentCategoryRules;
                languagesArray[langObjIndex].rules = rulesMap;
                userData.languages = languagesArray;

                await setDoc(userDocRef, userData, { merge: true });

                const searchInput = document.getElementById('search-rules');
                if (searchInput) searchInput.value = '';

                await loadRulesFromArray(currentCategory);
                resetFormState();

            } catch (error) {
                console.error('Error saving rule:', error);
                
                const saveErrorAlerts = {
                    en: `Error saving rule: ${error.message}`,
                    de: `Fehler beim Speichern der Regel: ${error.message}`,
                    uk: `Помилка збереження правила: ${error.message}`
                };

                alert(saveErrorAlerts[currentLang] || saveErrorAlerts.en);
            }
        });
    }
}

function resetFormState() {
    const form = document.getElementById('form-add-new-rule');
    const addBtn = document.querySelector('.rule-section__add-btn');

    if (form) {
        form.classList.add('disable');
        form.reset();
    }
    if (addBtn) {
        addBtn.classList.remove('disable');
    }
    editingRuleIndex = null;
}

// Завантаження правил із масиву languages за кодом поточної мови та об'єктом rules
async function loadRulesFromArray(category) {
    const container = document.querySelector('.rule-section__rules-container');
    if (!container) return;

    container.innerHTML = `<p class="loading-text" style="color: white; text-align: center;">${getRuleTranslation('loading')}</p>`;

    try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            container.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getRuleTranslation('no-rules-added-yet')}</p>`;
            allCategoryRules = [];
            return;
        }

        const data = docSnap.data();
        const languagesArray = data.languages || [];

        const langObj = languagesArray.find(l => l.code === currentLangCode);
        if (!langObj || !langObj.rules) {
            container.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getRuleTranslation('no-rules-for-this-language-yet')}</p>`;
            allCategoryRules = [];
            return;
        }

        allCategoryRules = langObj.rules[category] || [];

        renderRulesList(allCategoryRules);

    } catch (error) {
        console.error('Error loading rules:', error);
        container.innerHTML = `<p class="error-text" style="color: red; text-align: center;"><span>${getRuleTranslation('failed-to-load-rules')}</span>: ${error.message}</p>`;
    }
}

// Рендеринг списку правил
function renderRulesList(rulesArray) {
    const container = document.querySelector('.rule-section__rules-container');
    if (!container) return;

    container.innerHTML = '';

    if (rulesArray.length === 0) {
        container.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getRuleTranslation('no-rules-found')}</p>`;
        return;
    }

    rulesArray.forEach((ruleData) => {
        // Знаходимо реальний індекс правила в повному масиві категорії
        const originalIndex = allCategoryRules.findIndex(r => r.id === ruleData.id);
        renderRuleItem(ruleData, originalIndex);
    });
}

// ============================================================================
// 6. ПОШУК ТА ФІЛЬТРАЦІЯ ПРАВИЛ
// ============================================================================

function initSearchBox() {
    const searchInput = document.getElementById('search-rules');
    const searchButton = document.querySelector('.rule-search-box__button');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        filterRules(e.target.value);
    });

    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            filterRules(searchInput.value);
        });
    }
}

function filterRules(queryText) {
    const query = queryText.toLowerCase().trim();

    if (!query) {
        renderRulesList(allCategoryRules);
        return;
    }

    const filteredRules = allCategoryRules.filter(rule => {
        const title = (rule.title || '').toLowerCase();
        const paragraf = (rule.paragraf || '').toLowerCase();
        return title.includes(query) || paragraf.includes(query);
    });

    renderRulesList(filteredRules);
}

// ============================================================================
// 7. РЕНДЕРИНГ ОКРЕМОЇ КАРТКИ ПРАВИЛА ЧЕРЕЗ TEMPLATE
// ============================================================================

function renderRuleItem(ruleData, index) {
    const container = document.querySelector('.rule-section__rules-container');
    const template = document.querySelector('.rule-item__template');

    if (!container || !template) return;

    const clone = template.content.cloneNode(true);

    const titleEl = clone.querySelector('.rule-item__title');
    const imgEl = clone.querySelector('img.rule-item__img');
    const textEl = clone.querySelector('.rule-item__paragrf');
    const imgButton = clone.querySelector('.rule-item__img');
    const editBtn = clone.querySelector('.rule-item__btn--edit');
    const deleteBtn = clone.querySelector('.rule-item__btn--delete');

    if (titleEl) titleEl.textContent = ruleData.title;
    if (textEl) textEl.textContent = ruleData.paragraf;

    if (imgEl) {
        if (ruleData.url) {
            imgEl.src = ruleData.url;
            imgEl.setAttribute('data-src', ruleData.url);
        } else {
            const imgGroup = clone.querySelector('.rule-item__image-group');
            if (imgGroup) imgGroup.style.display = 'none';
        }
    }

    if (imgButton && imgEl) {
        imgButton.addEventListener('click', (e) => {
            e.preventDefault();
            const imageUrl = imgEl.src;
            if (imageUrl) {
                openImagePopup(imageUrl);
            }
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            editingRuleIndex = index;

            document.getElementById('add-new-rule-title').value = ruleData.title || '';
            document.getElementById('add-new-rule-url').value = ruleData.url || '';
            document.getElementById('add-new-rule-paragraf').value = ruleData.paragraf || '';

            const addBtn = document.querySelector('.rule-section__add-btn');
            const form = document.getElementById('form-add-new-rule');
            if (addBtn) addBtn.classList.add('disable');
            if (form) form.classList.remove('disable');

            form.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    let userData = docSnap.data();
                    let languagesArray = userData.languages || [];
                    let langObjIndex = languagesArray.findIndex(l => l.code === currentLangCode);

                    if (langObjIndex !== -1 && languagesArray[langObjIndex].rules) {
                        let rulesMap = languagesArray[langObjIndex].rules;
                        if (rulesMap[currentCategory]) {
                            rulesMap[currentCategory].splice(index, 1);
                            userData.languages = languagesArray;
                            await setDoc(userDocRef, userData, { merge: true });

                            const searchInput = document.getElementById('search-rules');
                            const currentQuery = searchInput ? searchInput.value : '';

                            allCategoryRules = rulesMap[currentCategory];
                            filterRules(currentQuery);
                        }
                    }
                }
            } catch (error) {
                console.error('Error deleting rule:', error);
            }
        });
    }

    container.appendChild(clone);
}

// ============================================================================
// 8. ПОПАП ПЕРЕГЛЯДУ ЗОБРАЖЕННЯ НА ВЕСЬ ЕКРАН
// ============================================================================

function initImagePopup() {
    const popup = document.querySelector('.rule-section__popup');
    const closeBtn = document.querySelector('.rule-section__popup-close-btn');

    if (!popup) return;

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.classList.add('disable');
        });
    }

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.add('disable');
        }
    });
}

function openImagePopup(url) {
    const popup = document.querySelector('.rule-section__popup');
    const popupImg = document.querySelector('.rule-section__popup-img');

    if (popup && popupImg) {
        popupImg.src = url;
        popup.classList.remove('disable');
    }
}
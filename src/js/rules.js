// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА МОДУЛІВ
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { initLanguagePicker } from './i18n.js';

// Отримуємо код мови з URL (наприклад: rules.html?lang=de)
const urlParams = new URLSearchParams(window.location.search);
const currentLangCode = urlParams.get('lang') || 'en';

// Поточна відкрита категорія та ID правила, що редагується
let currentCategory = '';
let editingRuleId = null;

// ============================================================================
// 2. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initLanguagePicker();
    initRulesNavigation();
    initAddRuleForm();
    initImagePopup();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadHeaderUserData(user);
        } else {
            window.location.href = './index.html';
        }
    });
});

// ============================================================================
// 3. НАВІГАЦІЯ ТА ПЕРЕМИКАННЯ МІЖ КАТЕГОРІЯМИ І РОЗДІЛАМИ
// ============================================================================

function initRulesNavigation() {
    const rulesInfoGroup = document.querySelector('.rules__info-group');
    const rulesListBox = document.querySelector('.rules-group');
    const ruleSection = document.querySelector('.rule-section');
    const backBtn = document.querySelector('.rule-section__btn-back');
    const ruleTitle = document.querySelector('.rule-section__title');
    const icons = document.querySelectorAll('.rule-section__icon');

    const categoryButtons = document.querySelectorAll('.rules-group__rules-element');

    categoryButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const categoryTitle = button.querySelector('.rules-group__rules-title').textContent;
            currentCategory = categoryTitle.toLowerCase().trim().replace(/\s+/g, '-');

            if (rulesInfoGroup) rulesInfoGroup.classList.add('disable');
            rulesListBox.classList.add('disable');
            ruleSection.classList.remove('disable');

            if (ruleTitle) {
                ruleTitle.textContent = categoryTitle;
            }

            icons.forEach(icon => {
                icon.classList.add('disable');
                if (icon.alt.toLowerCase() === categoryTitle.toLowerCase()) {
                    icon.classList.remove('disable');
                }
            });

            // Завантажуємо правила для користувача, категорії ТА поточної мови
            await loadRulesFromFirestore(currentCategory);
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
// 4. РОБОТА З БАЗОЮ ДАНИХ (FIRESTORE) ТА ФОРМОЮ
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
            if (!user) {
                alert('Please log in again.');
                return;
            }

            const title = document.getElementById('add-new-rule-title').value.trim();
            const url = document.getElementById('add-new-rule-url').value.trim();
            const paragraf = document.getElementById('add-new-rule-paragraf').value.trim();

            try {
                if (editingRuleId) {
                    const ruleRef = doc(db, 'rules', editingRuleId);
                    await updateDoc(ruleRef, {
                        title,
                        url,
                        paragraf,
                        updatedAt: new Date()
                    });
                } else {
                    const newRuleData = {
                        userId: user.uid,
                        category: currentCategory,
                        lang: currentLangCode, // Зберігаємо поточну мову інтерфейсу
                        title,
                        url,
                        paragraf,
                        createdAt: new Date()
                    };
                    await addDoc(collection(db, 'rules'), newRuleData);
                }

                await loadRulesFromFirestore(currentCategory);
                resetFormState();

            } catch (error) {
                console.error('Error saving rule:', error);
                alert(`Error saving rule: ${error.message}`);
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
    editingRuleId = null;
}

// Завантаження правил з урахуванням користувача, категорії та мови
async function loadRulesFromFirestore(category) {
    const container = document.querySelector('.rule-section__rules-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-text" style="color: white; text-align: center;">Loading...</p>';

    try {
        const user = auth.currentUser;
        if (!user) return;

        // Додано фільтрацію за lang разом з userId та category
        const q = query(
            collection(db, 'rules'),
            where('userId', '==', user.uid),
            where('category', '==', category),
            where('lang', '==', currentLangCode)
        );

        const querySnapshot = await getDocs(q);
        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="empty-text" style="color: white; text-align: center;">No rules added for this language yet.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const ruleData = { id: docSnap.id, ...docSnap.data() };
            renderRuleItem(ruleData);
        });

    } catch (error) {
        console.error('Error loading rules:', error);
        container.innerHTML = `<p class="error-text" style="color: red; text-align: center;">Failed to load rules: ${error.message}</p>`;
    }
}

// ============================================================================
// 5. РЕНДЕРИНГ КАРТОК ПРАВИЛ ЧЕРЕЗ TEMPLATE
// ============================================================================

function renderRuleItem(ruleData) {
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
        editBtn.setAttribute('data-id', ruleData.id);
        editBtn.addEventListener('click', () => {
            editingRuleId = ruleData.id;

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
        deleteBtn.setAttribute('data-id', ruleData.id);
        deleteBtn.addEventListener('click', async () => {
            try {
                await deleteDoc(doc(db, 'rules', ruleData.id));
                await loadRulesFromFirestore(currentCategory);
            } catch (error) {
                console.error('Error deleting rule:', error);
            }
        });
    }

    container.appendChild(clone);
}

// ============================================================================
// 6. ПОПАП ПЕРЕГЛЯДУ ЗОБРАЖЕННЯ НА ВЕСЬ ЕКРАН
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
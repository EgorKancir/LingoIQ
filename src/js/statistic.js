// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА МОДУЛІВ
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { updateFlagAndLinksByUrl } from './utils.js';
import { initLanguagePicker } from './i18n.js';

let isRedirecting = false;

// ============================================================================
// 2. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ ТА ПЕРЕВІРКА СЕСІЇ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initLanguagePicker();
    updateFlagAndLinksByUrl();

    // Визначаємо поточну мову з URL (наприклад, ?lang=de)
    const currentLangCode = getCurrentLanguageCode();
    console.log('Поточна мова сторінки:', currentLangCode);

    // Тут у майбутньому можна буде легко вивести назву мови на сторінку (як підказку)
    // updateLanguageHintUI(currentLangCode);

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (!isRedirecting) {
                isRedirecting = true;
                window.location.href = './index.html';
            }
            return;
        }

        await loadHeaderUserData(user);
        await loadAndCalculateStatistics(user, currentLangCode);
    });
});

// ============================================================================
// 3. ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ ВИЗНАЧЕННЯ ПОТОЧНОЇ МОВИ
// ============================================================================

function getCurrentLanguageCode() {
    const urlParams = new URLSearchParams(window.location.search);
    // Повертає код мови у нижньому регістрі (наприклад, 'de', 'en', 'uk') або 'en' за замовчуванням
    return (urlParams.get('lang') || 'en').toLowerCase();
}

// ============================================================================
// 4. ЗБИРАННЯ ТА РОЗРАХУНОК СТАТИСТИКИ ДЛЯ ПОТОЧНОЇ МОВИ
// ============================================================================

async function loadAndCalculateStatistics(user, langCode) {
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            console.warn('Документ користувача не знайдено в базі.');
            updateStatisticUI(0, 0, 0);
            return;
        }

        const userData = docSnap.data();
        const languagesArray = userData.languages || [];

        // Знаходимо об'єкт лише для поточної мови
        const targetLanguageData = languagesArray.find(
            langObj => (langObj.code || '').toLowerCase() === langCode
        );

        if (!targetLanguageData) {
            // Якщо для цієї мови ще немає записів у базі
            updateStatisticUI(0, 0, 0);
            return;
        }

        const words = targetLanguageData.words || targetLanguageData.glossary || [];

        let totalWordsCount = 0;
        let learningWordsCount = 0;
        let learnedWordsCount = 0;

        // Рахуємо статистику виключно по словах цієї мови
        words.forEach(wordObj => {
            totalWordsCount++;

            const status = (wordObj.status || '').toLowerCase();
            
            if (status === 'studied' || status === 'learned') {
                learnedWordsCount++;
            } else {
                learningWordsCount++;
            }
        });

        // Оновлюємо інтерфейс підрахованими значеннями
        updateStatisticUI(totalWordsCount, learningWordsCount, learnedWordsCount);

    } catch (error) {
        console.error('Помилка завантаження статистики:', error);
    }
}

// ============================================================================
// 5. ОНОВЛЕННЯ ІНТЕРФЕЙСУ (UI)
// ============================================================================

function updateStatisticUI(total, learning, learned) {
    const totalElement = document.getElementById('statistic-data-total-words');
    const learningElement = document.getElementById('statistic-data-learning-words');
    const learnedElement = document.getElementById('statistic-data-learned-words');

    if (totalElement) totalElement.textContent = total;
    if (learningElement) learningElement.textContent = learning;
    if (learnedElement) learnedElement.textContent = learned;
}
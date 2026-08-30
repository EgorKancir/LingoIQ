// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА МОДУЛІВ[cite: 3]
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { initLanguagePicker } from './i18n.js';

// Отримуємо код мови з URL (наприклад: languagepage.html?lang=de)[cite: 3]
const urlParams = new URLSearchParams(window.location.search);
const currentLangCode = urlParams.get('lang');

// ============================================================================
// 2. ІНІЦІАЛІЗАЦІЯ СТОРІНКИ[cite: 3]
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!currentLangCode) {
        window.location.href = './userpage.html';
        return;
    }

    initHeader();
    initLanguagePicker();
    initLanguageDataUI(currentLangCode);
    updateNavigationLinks(currentLangCode);

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadHeaderUserData(user);
            await loadLanguageSpecificData(user.uid, currentLangCode);
        } else {
            window.location.href = './index.html';
        }
    });
});

// ============================================================================
// 3. ЗАВАНТАЖЕННЯ ДАНИХ ДЛЯ КОНКРЕТНОЇ МОВИ З FIRESTORE[cite: 3]
// ============================================================================

async function loadLanguageSpecificData(userId, langCode) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const languages = userData.languages || [];

        const currentLangObj = languages.find(
            lang => lang.code.toLowerCase() === langCode.toLowerCase()
        );

        // Підрахунок кількості днів вивчення мови від дати `addedAt`[cite: 3]
        let daysLearning = 0;
        if (currentLangObj && currentLangObj.addedAt) {
            const addedDate = new Date(currentLangObj.addedAt);
            const today = new Date();
            
            const addedDay = new Date(addedDate.getFullYear(), addedDate.getMonth(), addedDate.getDate());
            const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const diffTime = todayDay - addedDay;
            daysLearning = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        }

        const daysElement = document.getElementById('languageDaysLearning');
        if (daysElement) {
            daysElement.textContent = daysLearning;
        }

        // Оновлення слів та графіків[cite: 3]
        updateDictionaryStats(currentLangObj);

    } catch (error) {
        console.error('Помилка завантаження специфічних даних мови:', error);
    }
}

// ============================================================================
// 4. РОБОТА ЗІ СЛОВНИКОМ ТА ГРАФІКОМ ПРОГРЕСУ
// ============================================================================

function updateDictionaryStats(langObj) {
    // Отримуємо масив словника для цієї мови (якщо його немає, то порожній масив)
    const glossaryArray = langObj?.glossary || [];

    // 1. Загальна кількість слів у словнику
    const totalWordsCount = glossaryArray.length;
    const wordsElement = document.getElementById('languageWordsCount');
    if (wordsElement) {
        wordsElement.textContent = totalWordsCount;
    }

    // 2. Рахуємо кількість слів зі статусом 'Studied' (вивчені)
    const studiedWordsCount = glossaryArray.filter(item => item.status === 'Studied').length;

    // 3. Рахуємо відсоток вивчених від загальної кількості (захист від ділення на нуль)
    const progressPercent = totalWordsCount > 0 
        ? Math.round((studiedWordsCount / totalWordsCount) * 100) 
        : 0;

    // Виводимо відсоток текстом
    const progressPercentElement = document.getElementById('languageProgressPercent');
    if (progressPercentElement) {
        progressPercentElement.textContent = `${progressPercent}%`;
    }

    // 4. Оновлюємо ширину графіка-шкали (мінімум 10%, навіть якщо прогрес 0%)
    const graphBlock = document.querySelector('.progress__graph-block');
    if (graphBlock) {
        const displayWidth = Math.max(progressPercent, 10);
        graphBlock.style.width = `${displayWidth}%`;
    }
}

// ============================================================================
// 5. ДОПОМІЖНІ ФУНКЦІЇ (Векторні SVG прапори через flagcdn, Назва, Навігація)[cite: 3]
// ============================================================================

function initLanguageDataUI(langCode) {
    const lowerCode = langCode.toLowerCase();
    const upperCode = langCode.toUpperCase();
    
    // Словник виключень для мов, чиї коди відрізняються від кодів країн на FlagCDN
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

    const countryCode = (flagMap[lowerCode] || lowerCode).toLowerCase();
    
    // Встановлюємо векторне SVG-зображення прапорця через flagcdn.com для ідеальної чіткості[cite: 3]
    const flagImg = document.querySelector('.languge-falg');
    if (flagImg) {
        flagImg.src = `https://flagcdn.com/${countryCode}.svg`;
        flagImg.alt = `${upperCode} Flag`;
    }

    // Локалізована повна назва мови[cite: 3]
    const displayNames = new Intl.DisplayNames(['en', 'uk', 'de'], { type: 'language' });
    const fullLangName = displayNames.of(lowerCode) || upperCode;
    
    const titleElement = document.querySelector('.language-name');
    if (titleElement) {
        titleElement.textContent = fullLangName;
    }
}

// Динамічне оновлення шляхів для всіх посилань у блоці навігації[cite: 3]
function updateNavigationLinks(langCode) {
    const navLinks = document.querySelectorAll('.web-navigation__page-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('.html')) {
            const cleanHref = href.split('?')[0];
            link.href = `${cleanHref}?lang=${langCode}`;
        }
    });
}
// ============================================================================
// МОДУЛЬ КАЛЕНДАРЯ (CALENDAR.JS)
// ============================================================================

import { db } from './firebase.js';
import { doc, getDoc } from 'firebase/firestore';

// Допоміжна функція для отримання посилань на прапори з FlagCDN
function getFlagUrl(langCode) {
    const lower = (langCode || 'en').toLowerCase();
    
    // Словник виключень мова -> країна
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
    return `https://flagcdn.com/${countryCode}.svg`;
}

// Назви мов для всіх зазначених кодів
const LANGUAGE_NAMES = {
    uk: 'Українська',
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    pl: 'Polski',
    pt: 'Português',
    ro: 'Română',
    tr: 'Türkçe',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
    hi: 'हिन्दी',
    cs: 'Čeština',
    nl: 'Nederlands',
    sv: 'Svenska'
};

// Отримати сьогоднішню дату у форматі 'YYYY-MM-DD'
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Очищення дати від потенційного часу (якщо збереглася в форматі ISO)
function cleanDateStr(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
}

// Форматування дати: якщо сьогодні — "Today", інакше 'DD.MM.YYYY'
function formatDate(dateStr, todayStr) {
    if (!dateStr) return '';
    if (dateStr === todayStr) {
        return 'Today';
    }
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
}

// Визначення CSS-класу для дати залежно від умов (минула, сьогодні, майбутня)
function getDateClass(dateStr, todayStr) {
    if (dateStr < todayStr) {
        return 'calendar__element-date-number--overdue'; // Червоний (прострочено)
    } else if (dateStr === todayStr) {
        return 'calendar__element-date-number--today';    // Зелений (сьогодні)
    }
    return ''; // Стандартний для майбутніх
}

// Головна функція ініціалізації календаря
export async function initCalendar(user) {
    const calendarContainer = document.querySelector('.calendar__date-group');
    if (!calendarContainer) return;

    calendarContainer.innerHTML = '<p class="loading-text" style="color: white; text-align: center; width: 100%;">Loading calendar schedule...</p>';

    try {
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            calendarContainer.innerHTML = '<p class="empty-text" style="color: white; text-align: center; width: 100%;">No data found.</p>';
            return;
        }

        const userData = docSnap.data();
        const languagesArray = userData.languages || [];

        let calendarItems = [];
        const todayStr = getTodayString();

        // Групуємо слова за датами повторення
        languagesArray.forEach(langObj => {
            const langCode = (langObj.code || 'en').toLowerCase();
            const words = langObj.words || langObj.glossary || [];

            // Фільтруємо невивчені слова
            const activeWords = words.filter(word => {
                const st = (word.status || '').toLowerCase();
                return st !== 'studied' && st !== 'learned';
            });

            // Групуємо за датами
            const groupedByDate = {};
            activeWords.forEach(wordObj => {
                const rawDate = wordObj.nextReviewDate || todayStr;
                const dateKey = cleanDateStr(rawDate);

                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                }
                groupedByDate[dateKey].push(wordObj);
            });

            // Формуємо об'єкти карток
            for (const [dateKey, dateWords] of Object.entries(groupedByDate)) {
                calendarItems.push({
                    date: dateKey,
                    formattedDate: formatDate(dateKey, todayStr),
                    dateClass: getDateClass(dateKey, todayStr),
                    langCode: langCode,
                    langName: LANGUAGE_NAMES[langCode] || langCode.toUpperCase(),
                    flagSrc: getFlagUrl(langCode),
                    wordsCount: dateWords.length
                });
            }
        });

        // Сортуємо картки за датою від найранішої до найпізнішої
        calendarItems.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Рендеримо картки
        renderCalendarCards(calendarItems);

    } catch (error) {
        console.error('Error loading calendar data:', error);
        calendarContainer.innerHTML = `<p class="error-text" style="color: red; text-align: center; width: 100%;">Failed to load calendar: ${error.message}</p>`;
    }
}

function renderCalendarCards(items) {
    const calendarContainer = document.querySelector('.calendar__date-group');
    if (!calendarContainer) return;

    calendarContainer.innerHTML = '';

    if (items.length === 0) {
        calendarContainer.innerHTML = '<p class="empty-text" style="color: white; text-align: center; width: 100%;">No active repetition tasks found!</p>';
        return;
    }

    items.forEach(item => {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'calendar__element';

        elementDiv.innerHTML = `
            <p class="calendar__element-date">Date: <span class="calendar__element-date-number ${item.dateClass}">${item.formattedDate}</span></p>
            <div class="calendar__element-language-block">
                <img src="${item.flagSrc}" alt="${item.langName} Flag" class="calendar__element-language-icon">
                <p class="calendar__element-language-name">${item.langName}</p>
            </div>
            <p class="calendar__element-words">Number of words: <span class="calendar__element-number">${item.wordsCount}</span></p>
            <a href="./training-center.html?lang=${item.langCode}" class="calendar__element-repeat">Repeat</a>
        `;

        calendarContainer.appendChild(elementDiv);
    });
}
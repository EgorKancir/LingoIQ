// ============================================================================
// 1. ІМПОРТ ЗАЛЕЖНОСТЕЙ ТА МОДУЛІВ
// ============================================================================

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initHeader, loadHeaderUserData } from './header.js';
import { updateFlagAndLinksByUrl } from './utils.js';
import { initLanguagePicker } from './i18n.js';

// Отримуємо код мови з URL (наприклад: training-center.html?lang=de)
const urlParams = new URLSearchParams(window.location.search);
const currentLangCode = urlParams.get('lang') || 'en';

// Конфігурація 6 етапів інтервального повторення (у днях)
const REVIEW_STAGES = {
    1: 0,  // Сьогодні / Одразу
    2: 1,  // Через 1 день
    3: 3,  // Через 3 дні
    4: 7,  // Через 7 днів
    5: 14, // Через 14 днів
    6: 30  // Через 30 днів
};

let allLanguageWords = [];      // Всі слова поточної мови
let activeTrainingWords = [];   // Слова, які беруть участь у тренуванні (не вивчено)
let groupedWordsByDate = {};    // Слова, згруповані за датами повторення
let currentActiveDateKey = null;// Дата групи слів, яку зараз тренуємо
let currentSessionWords = [];   // Масив слів для поточної сесії тренування
let currentWordIndex = 0;       // Індекс поточного слова в тренажері

// ============================================================================
// 2. СИСТЕМА ЛОКАЛІЗАЦІЇ ДИНАМІЧНИХ ТЕКСТІВ ТА ПОВІДОМЛЕНЬ
// ============================================================================

function getTrainingTranslation(key) {
    const rawLang = localStorage.getItem('lingoiq_lang') || 'en';
    const currentLang = rawLang.substring(0, 2).toLowerCase();

    const translations = {
        en: {
            loadingSchedule: 'Loading training schedule...',
            noWords: 'No words found.',
            noLanguage: 'No language found.',
            noWordsAdded: 'No words added for this language yet.',
            allLearned: 'Congratulations! All words are learned.',
            noSessions: 'No active training sessions.',
            today: 'Today',
            start: 'Start',
            sessionCompleted: 'Training session completed successfully!',
            loginAgain: 'Please log in again.',
            failedLoad: 'Failed to load data',
            failedUpdate: 'Error updating word progress in Firestore:'
        },
        de: {
            loadingSchedule: 'Trainingsplan wird geladen...',
            noWords: 'Keine Wörter gefunden.',
            noLanguage: 'Keine Sprache gefunden.',
            noWordsAdded: 'Noch keine Wörter für diese Sprache hinzugefügt.',
            allLearned: 'Herzlichen Glückwunsch! Alle Wörter wurden gelernt.',
            noSessions: 'Keine aktiven Trainingseinheiten.',
            today: 'Heute',
            start: 'Starten',
            sessionCompleted: 'Trainingseinheit erfolgreich abgeschlossen!',
            loginAgain: 'Bitte melden Sie sich erneut an.',
            failedLoad: 'Fehler beim Laden der Daten',
            failedUpdate: 'Fehler beim Aktualisieren des Wortfortschritts in Firestore:'
        },
        uk: {
            loadingSchedule: 'Завантаження розкладу тренувань...',
            noWords: 'Слів не знайдено.',
            noLanguage: 'Мову не знайдено.',
            noWordsAdded: 'Для цієї мови ще не додано слів.',
            allLearned: 'Вітаємо! Усі слова вивчено.',
            noSessions: 'Немає активних сесій тренування.',
            today: 'Сьогодні',
            start: 'Почати',
            sessionCompleted: 'Тренування успішно завершено!',
            loginAgain: 'Будь ласка, увійдіть знову.',
            failedLoad: 'Не вдалося завантажити дані',
            failedUpdate: 'Помилка оновлення прогресу слова у Firestore:'
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
    initTrainingConsole();
    updateFlagAndLinksByUrl();


    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadHeaderUserData(user);
            await loadAndProcessTrainingData();
        } else {
            window.location.href = './index.html';
        }
    });
});

// ============================================================================
// 4. ДОПОМІЖНІ ФУНКЦІЇ ДАТ ТА ФОРМАТУВАННЯ
// ============================================================================

// Отримати сьогоднішню дату у форматі 'YYYY-MM-DD'
function getTodayString() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Додати певну кількість днів до дати та отримати 'YYYY-MM-DD'
function calculateNextReviewDate(daysToAdd) {
    let date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// ============================================================================
// 5. ЗАВАНТАЖЕННЯ ТА ОБРОБКА ДАНИХ ІЗ FIRESTORE
// ============================================================================

async function loadAndProcessTrainingData() {
    const trainingGroup = document.querySelector('.training-group');
    if (!trainingGroup) return;

    trainingGroup.innerHTML = `<p class="loading-text" style="color: white; text-align: center;">${getTrainingTranslation('loadingSchedule')}</p>`;

    try {
        const user = auth.currentUser;
        const rawLang = localStorage.getItem('lingoiq_lang') || 'en';
        const currentLang = rawLang.substring(0, 2).toLowerCase();

        if (!user) {
            alert(getTrainingTranslation('loginAgain'));
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            trainingGroup.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getTrainingTranslation('noWords')}</p>`;
            return;
        }

        const data = docSnap.data();
        const languagesArray = data.languages || [];
        
        const langObj = languagesArray.find(l => l.code.toLowerCase() === currentLangCode.toLowerCase());
        if (!langObj) {
            trainingGroup.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getTrainingTranslation('noLanguage')}</p>`;
            return;
        }

        // Читаємо слова з масиву `words` або резервного `glossary`
        allLanguageWords = langObj.words || langObj.glossary || [];

        if (allLanguageWords.length === 0) {
            trainingGroup.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getTrainingTranslation('noWordsAdded')}</p>`;
            return;
        }

        // Фільтруємо: виключаємо слова зі статусом "Studied" або "learned" (вивчено)
        activeTrainingWords = allLanguageWords.filter(word => {
            const st = (word.status || '').toLowerCase();
            return st !== 'studied' && st !== 'learned';
        });

        if (activeTrainingWords.length === 0) {
            trainingGroup.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getTrainingTranslation('allLearned')}</p>`;
            return;
        }

        // Групуємо слова за датами (nextReviewDate), а якщо її нема — ставимо сьогодні
        groupedWordsByDate = {};
        activeTrainingWords.forEach(wordObj => {
            const dateKey = wordObj.nextReviewDate || getTodayString();
            if (!groupedWordsByDate[dateKey]) {
                groupedWordsByDate[dateKey] = [];
            }
            groupedWordsByDate[dateKey].push(wordObj);
        });

        renderTrainingBlocks();

    } catch (error) {
        console.error('Error loading training data:', error);
        trainingGroup.innerHTML = `<p class="error-text" style="color: red; text-align: center;">${getTrainingTranslation('failedLoad')}: ${error.message}</p>`;
    }
}

// ============================================================================
// 6. РЕНДЕРИНГ КАРТОК ДАТ НА ГОЛОВНІЙ СТОРІНЦІ
// ============================================================================

function renderTrainingBlocks() {
    const trainingGroup = document.querySelector('.training-group');
    if (!trainingGroup) return;

    trainingGroup.innerHTML = '';

    const todayStr = getTodayString();
    
    // Сортуємо дати від найранішої до найпізнішої
    const sortedDateKeys = Object.keys(groupedWordsByDate).sort((a, b) => new Date(a) - new Date(b));

    if (sortedDateKeys.length === 0) {
        trainingGroup.innerHTML = `<p class="empty-text" style="color: white; text-align: center;">${getTrainingTranslation('noSessions')}</p>`;
        return;
    }

    sortedDateKeys.forEach(dateKey => {
        const blockEl = document.createElement('div');
        blockEl.className = 'training-block';

        const iconEl = document.createElement('img');
        iconEl.className = 'training-block__icon';
        iconEl.src = 'https://cdn-icons-png.flaticon.com/128/16994/16994368.png';
        iconEl.alt = 'Repeating icon';

        const dateTitleEl = document.createElement('h2');
        dateTitleEl.className = 'training-block__date';

        const startBtn = document.createElement('button');
        startBtn.className = 'training-block__button';

        // Логіка станів (Today, Overdue, Майбутні дати)
        if (dateKey === todayStr) {
            dateTitleEl.textContent = getTrainingTranslation('today');
            startBtn.textContent = getTrainingTranslation('start');
            startBtn.disabled = false;
            startBtn.addEventListener('click', () => startTrainingSession(dateKey));
        } else if (dateKey < todayStr) {
            dateTitleEl.textContent = `(${dateKey})`;
            startBtn.style.background = 'linear-gradient(90deg, #FF4D4D 0%, #C90000 100%)';
            startBtn.textContent = getTrainingTranslation('start');
            startBtn.addEventListener('click', () => startTrainingSession(dateKey));
        } else {
            dateTitleEl.textContent = dateKey;
            startBtn.style.background = 'linear-gradient(135deg, #7E8AF4 22%, #6C6C6C 85%)';
            startBtn.style.cursor = 'not-allowed';
            startBtn.disabled = true;
            startBtn.textContent = getTrainingTranslation('start');
        }

        blockEl.appendChild(iconEl);
        blockEl.appendChild(dateTitleEl);
        blockEl.appendChild(startBtn);
        trainingGroup.appendChild(blockEl);
    });
}

// ============================================================================
// 7. ЛОГІКА ІНТЕРАКТИВНОГО ТРЕНАЖЕРА (ПОПАПУ)
// ============================================================================

function initTrainingConsole() {
    const consoleEl = document.querySelector('.training-console');
    const backBtn = document.querySelector('.training-console__back-btn');
    const translationElement = document.querySelector('.training-console__translation-element');
    
    const btnKnown = document.querySelector('.training-console__btn--known');
    const btnPractice = document.querySelector('.training-console__btn--practice');
    const btnUnknown = document.querySelector('.training-console__btn--unknown');

    if (!consoleEl) return;

    // Кнопка Back всередині попапу
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeTrainingConsole();
        });
    }

    // Підглядання перекладу при кліку на контейнер перекладу
    if (translationElement) {
        translationElement.addEventListener('click', () => {
            const translationWordEl = document.querySelector('.training-console__translation-word');
            if (translationWordEl) {
                translationWordEl.classList.remove('disable');
                translationWordEl.classList.toggle('visible');
            }
        });
    }

    // Обробка відповідей користувача
    if (btnKnown) {
        btnKnown.addEventListener('click', () => handleAnswerAction('known'));
    }
    if (btnPractice) {
        btnPractice.addEventListener('click', () => handleAnswerAction('practice'));
    }
    if (btnUnknown) {
        btnUnknown.addEventListener('click', () => handleAnswerAction('unknown'));
    }
}

function startTrainingSession(dateKey) {
    currentActiveDateKey = dateKey;
    currentSessionWords = [...groupedWordsByDate[dateKey]];
    currentWordIndex = 0;

    const consoleEl = document.querySelector('.training-console');
    if (consoleEl) {
        consoleEl.classList.remove('disable'); // Про всяк випадок прибираємо disable
        consoleEl.classList.add('active');    // Активуємо flex-відображення через клас active
    }

    renderCurrentWord();
}

function closeTrainingConsole() {
    const consoleEl = document.querySelector('.training-console');
    if (consoleEl) {
        consoleEl.classList.remove('active');
        consoleEl.classList.add('disable');    // Повертаємо приховування
    }
    loadAndProcessTrainingData(); // Перезавантажуємо головний екран
}

function renderCurrentWord() {
    const currentWordEl = document.querySelector('.training-console__main-word');
    const translationWordEl = document.querySelector('.training-console__translation-word');
    const numberEl = document.getElementById('training-console-number');
    const totalEl = document.getElementById('training-console-total-number');

    if (currentWordIndex >= currentSessionWords.length) {
        alert(getTrainingTranslation('sessionCompleted'));
        closeTrainingConsole();
        return;
    }

    const wordData = currentSessionWords[currentWordIndex];

    if (currentWordEl) {
        currentWordEl.textContent = wordData.word || wordData.title || '';
    }
    
    if (translationWordEl) {
        translationWordEl.textContent = wordData.translation || wordData.paragraf || '';
        translationWordEl.classList.remove('visible');
        translationWordEl.classList.add('disable'); // Ховаємо переклад для нового слова
    }
    
    if (numberEl) numberEl.textContent = currentWordIndex + 1;
    if (totalEl) totalEl.textContent = currentSessionWords.length;
}

// ============================================================================
// 8. ОБРОБКА КНОПОК ТРЕНАЖЕРА ТА ЗБЕРЕЖЕННЯ В FIRESTORE
// ============================================================================

async function handleAnswerAction(actionType) {
    if (currentWordIndex >= currentSessionWords.length) return;

    let currentWord = currentSessionWords[currentWordIndex];
    
    let nextStage = Number(currentWord.stage) || 1;
    let newStatus = currentWord.status || "Study";

    if (actionType === 'known') {
        if (nextStage < 6) {
            nextStage += 1;
            if (nextStage >= 2) {
                newStatus = "Study";
            }
        } else if (nextStage === 6) {
            newStatus = "Studied";
        }
    } else if (actionType === 'practice') {
        nextStage = Number(currentWord.stage) || 1;
    } else if (actionType === 'unknown') {
        nextStage = 1;
        newStatus = "Study";
    }

    // Розраховуємо нову дату повторення від сьогоднішнього дня
    const daysToAdd = REVIEW_STAGES[nextStage];
    const newReviewDate = calculateNextReviewDate(daysToAdd);

    // Оновлюємо об'єкт слова
    currentWord.stage = nextStage;
    currentWord.status = newStatus;
    currentWord.nextReviewDate = newReviewDate;

    // Оновлюємо в загальному масиві всіх слів мови
    const globalIndex = allLanguageWords.findIndex(w => (w.id && w.id === currentWord.id) || (w.word && w.word === currentWord.word));
    if (globalIndex !== -1) {
        allLanguageWords[globalIndex] = { ...currentWord };
    }

    // Зберігаємо зміни у Firestore
    await saveWordsToFirestore();

    // Переходимо до наступного слова
    currentWordIndex++;
    renderCurrentWord();
}

async function saveWordsToFirestore() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) return;

        let userData = docSnap.data();
        let languagesArray = userData.languages || [];
        let langObjIndex = languagesArray.findIndex(l => l.code.toLowerCase() === currentLangCode.toLowerCase());

        if (langObjIndex !== -1) {
            languagesArray[langObjIndex].words = allLanguageWords;
            languagesArray[langObjIndex].glossary = allLanguageWords; // Синхронізуємо обидва масиви
            userData.languages = languagesArray;

            await setDoc(userDocRef, userData, { merge: true });
        }
    } catch (error) {
        console.error(getTrainingTranslation('failedUpdate'), error);
    }
}
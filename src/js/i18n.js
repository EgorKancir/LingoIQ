// src/js/i18n.js
import en from '../i18n/en.json';
import de from '../i18n/de.json';
import uk from '../i18n/uk.json';

const translations = { en, de, uk };
let currentLang = localStorage.getItem('lingoiq_lang') || 'en';
// Робдимо функцію доступною глобально
window.initLanguagePicker = initLanguagePicker;

// 1. Підстановка тексту на сторінці
function applyTranslations(lang) {
    const currentTranslation = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const keyPath = el.getAttribute('data-i18n').split('.');
        let text = currentTranslation;

        keyPath.forEach(key => {
            if (text) text = text[key];
        });

        if (text) {
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = text;
            } else {
                el.innerHTML = text;
            }
        }
    });
}

// 2. Зміна активної мови та оновлення UI
export function setLanguage(lang) {
    if (!translations[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('lingoiq_lang', lang);

    // Оновлюємо стилі активної кнопки в попапі
    document.querySelectorAll('.header-language-popup__button').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('header-language-popup__button--active');
        } else {
            btn.classList.remove('header-language-popup__button--active');
        }
    });

    applyTranslations(lang);
}

// 3. Ініціалізація подій відкриття/закриття попапу та вибору мови
export function initLanguagePicker() {
    const toggleBtn = document.getElementById('language-toggle-btn');
    const popup = document.getElementById('language-popup');

    if (toggleBtn && popup) {
        // Відкриття / закриття попапу при кліку на кнопку
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Зупиняємо спливання події, щоб document її одразу не закрив
            popup.classList.toggle('disable');
        });

        // Закриття попапу при кліку в будь-яку іншу точку сторінки
        document.addEventListener('click', (e) => {
            if (!popup.contains(e.target) && !toggleBtn.contains(e.target)) {
                popup.classList.add('disable');
            }
        });
    }

    // Обробка кліку на варіанти мов у списках попапу
    document.querySelectorAll('.header-language-popup__button').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            setLanguage(selectedLang);
            if (popup) popup.classList.add('disable'); // Автоматично закриваємо попап після вибору
        });
    });

    // Первинне встановлення мови при завантаженні
    setLanguage(currentLang);
}
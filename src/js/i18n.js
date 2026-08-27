// ============================================================================
// 1. ІМПОРТ МОВНИХ СЛОВНИКІВ
// ============================================================================

import en from '../i18n/en.json';
import de from '../i18n/de.json';
import uk from '../i18n/uk.json';

const translations = { en, de, uk };
let currentLang = localStorage.getItem('lingoiq_lang') || 'en';

// ============================================================================
// 2. ФУНКЦІЇ РЕНДЕРИНГУ ДАНИХ (UI) ТА ПЕРЕКЛАДУ
// ============================================================================

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

export function setLanguage(lang) {
    if (!translations[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('lingoiq_lang', lang);

    document.querySelectorAll('.header-language-popup__button').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('header-language-popup__button--active');
        } else {
            btn.classList.remove('header-language-popup__button--active');
        }
    });

    applyTranslations(lang);
}

export function initLanguagePicker() {
    const toggleBtn = document.getElementById('language-toggle-btn');
    const popup = document.getElementById('language-popup');

    if (toggleBtn && popup) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.toggle('disable');
        });

        document.addEventListener('click', (e) => {
            if (!popup.contains(e.target) && !toggleBtn.contains(e.target)) {
                popup.classList.add('disable');
            }
        });
    }

    document.querySelectorAll('.header-language-popup__button').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            setLanguage(selectedLang);
            if (popup) popup.classList.add('disable');
        });
    });

    setLanguage(currentLang);
}
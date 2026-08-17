console.log("Hi, I am here!");

// src/js/index.js
import { initLanguagePicker } from './i18n';

// Додаємо подію, яка викликає ініціалізацію після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    // 1. Прив'язуємо події кліку на кнопку та поп-ап вибору мови
    initLanguagePicker();

    console.log('LingoIQ: i18n успішно ініціалізовано!');
});
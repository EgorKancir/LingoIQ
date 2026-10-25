// ============================================================================
// ДОПОМІЖНІ ФУНКЦІЇ (UTILS.JS)
// ============================================================================

export function updateFlagAndLinksByUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const langCode = (urlParams.get('lang') || 'en').toLowerCase();
    const upperCode = langCode.toUpperCase();

    const flagMap = {
        en: 'gb',
        uk: 'ua',
        ja: 'jp',
        da: 'dk',
        sv: 'se',
        el: 'gr',
        cs: 'cz',
        et: 'ee'
    };

    const countryCode = flagMap[langCode] || langCode;
    const flagUrl = `https://flagcdn.com/${countryCode}.svg`;

    const flagHeader = document.querySelector('.header__lang-flag');
    const flagImg = document.querySelector('.languge-falg');

    if (flagHeader) {
        flagHeader.src = flagUrl;
        flagHeader.alt = `${upperCode} Flag`;
    }

    if (flagImg) {
        flagImg.src = flagUrl;
        flagImg.alt = `${upperCode} Flag`;
    }

    const navLinks = document.querySelectorAll('.home-navigation__link');
    navLinks.forEach(link => {
        const currentHref = link.getAttribute('href');
        if (currentHref && !currentHref.startsWith('#') && !currentHref.startsWith('http')) {
            const baseUrl = currentHref.split('?')[0];
            link.setAttribute('href', `${baseUrl}?lang=${langCode}`);
        }
    });
}
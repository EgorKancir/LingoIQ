// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/i18n/en.json":[function(require,module,exports) {
module.exports = {
  "header": {
    "features": "Features",
    "howItWorks": "How it works",
    "signIn": "Sign In",
    "startLearning": "Start Learning",
    "hello": "Hello!",
    "craeteYourAccount": "Create your Account",
    "username": "Username",
    "email": "Email",
    "password": "Password",
    "signUp": "Sign Up",
    "alreadyHaveAnAccount": "Already have an account?",
    "dontHaveAnAccount": "Don't have an account?"
  },
  "hero": {
    "learnLanguages": "Learn languages",
    "rememberForever": "Remember forever",
    "untertitle": "A platform that turns words into knowledge — powered by the science of memory",
    "startNow": "Start Now"
  },
  "main": {
    "quote": "Less memorizing More understanding"
  },
  "features": {
    "features": "Features",
    "basedOn": "Based on the Ebbinghaus method",
    "onePlace": "All in one place",
    "madeBy": "Made by a learner, for learners"
  },
  "how-it-works": {
    "howItWorks": "How it works",
    "add": "Add",
    "learn": "Learn",
    "repeat": "Repeat",
    "remember": "Remember"
  },
  "vwa": {
    "creator": "(Creator of LingoIQ)",
    "pharagrph": "Hi! I’m Yehor, and LingoIQ is my VWA project.<br><br>I created this site to make language learning <b>simpler and more structured.</b><br>Here, you can find words, grammar rules, and learning tools <b>all in one place.</b><br><br>The site includes a program I developed using <b>Hermann Ebbinghaus’ spaced repetition method</b> to help you remember words efficiently. It’s designed for students, migrants, and anyone eager to learn languages, offering <b>clear structures and easy navigation.</b><br><br>With LingoIQ, I want to give everyone the same opportunity I had: a clear path to mastering a new language."
  },
  "footer": {
    "privacy": "Privacy",
    "terms": "Terms",
    "cookies": "Cookies"
  }
};
},{}],"src/i18n/de.json":[function(require,module,exports) {
module.exports = {
  "header": {
    "features": "Funktionen",
    "howItWorks": "Wie es funktioniert",
    "signIn": "Anmelden",
    "startLearning": "Lernen starten",
    "hello": "Hallo!",
    "craeteYourAccount": "Erstelle dein Konto",
    "username": "Benutzername",
    "email": "E-Mail",
    "password": "Passwort",
    "signUp": "Registrieren",
    "alreadyHaveAnAccount": "Hast du bereits ein Konto?",
    "dontHaveAnAccount": "Noch kein Konto?"
  },
  "hero": {
    "learnLanguages": "Sprachen lernen",
    "rememberForever": "Für immer erinnern",
    "untertitle": "Eine Plattform, die Wörter in Wissen verwandelt — angetrieben von der Gedächtniswissenschaft",
    "startNow": "Jetzt starten"
  },
  "main": {
    "quote": "Weniger Auswendiglernen Mehr Verstehen"
  },
  "features": {
    "features": "Funktionen",
    "basedOn": "Basiert auf der Ebbinghaus-Methode",
    "onePlace": "Alles an einem Ort",
    "madeBy": "Von einem Lernenden für Lernende gemacht"
  },
  "how-it-works": {
    "howItWorks": "Wie es funktioniert",
    "add": "Hinzufügen",
    "learn": "Lernen",
    "repeat": "Wiederholen",
    "remember": "Behalten"
  },
  "vwa": {
    "creator": "(Ersteller von LingoIQ)",
    "pharagrph": "Hallo! Ich bin Yehor und LingoIQ ist mein VWA-Projekt.<br><br>Ich habe diese Website erstellt, um das Sprachenlernen <b>einfacher und strukturierter</b> zu machen.<br>Hier findest du Wörter, Grammatikregeln und Lernwerkzeuge <b>alles an einem Ort.</b><br><br>Die Website enthält ein von mir entwickeltes Programm, das die <b>Spaced-Repetition-Methode von Hermann Ebbinghaus</b> nutzt, um dir zu helfen, Wörter effizient zu behalten. Es wurde für Schüler, Migranten und alle entwickelt, die motiviert sind, Sprachen zu lernen, und bietet <b>klare Strukturen und einfache Navigation.</b><br><br>Mit LingoIQ möchte ich jedem dieselbe Möglichkeit geben, die ich hatte: einen klaren Weg zur Erlernung einer neuen Sprache."
  },
  "footer": {
    "privacy": "Datenschutz",
    "terms": "Nutzungsbedingungen",
    "cookies": "Cookies"
  }
};
},{}],"src/i18n/uk.json":[function(require,module,exports) {
module.exports = {
  "header": {
    "features": "Можливості",
    "howItWorks": "Як це працює",
    "signIn": "Увійти",
    "startLearning": "Розпочати навчання",
    "hello": "Привіт!",
    "craeteYourAccount": "Створи свій акаунт",
    "username": "Ім'я користувача",
    "email": "Електронна пошта",
    "password": "Пароль",
    "signUp": "Зареєструватися",
    "alreadyHaveAnAccount": "Вже є акаунт?",
    "dontHaveAnAccount": "Немає акаунту?"
  },
  "hero": {
    "learnLanguages": "Вивчайте мови",
    "rememberForever": "Пам'ятайте назавжди",
    "untertitle": "Платформа, яка перетворює слова на знання — на основі науки про пам'ять",
    "startNow": "Почати зараз"
  },
  "main": {
    "quote": "Менше заучування Більше розуміння"
  },
  "features": {
    "features": "Можливості",
    "basedOn": "На основі методу Еббінгауза",
    "onePlace": "Все в одному місці",
    "madeBy": "Створено здобувачем знань для здобувачів знань"
  },
  "how-it-works": {
    "howItWorks": "Як це працює",
    "add": "Додай",
    "learn": "Вивчи",
    "repeat": "Повтори",
    "remember": "Запам'ятай"
  },
  "vwa": {
    "creator": "(Творець LingoIQ)",
    "pharagrph": "Привіт! Я Єгор, і LingoIQ — це мій VWA-проєкт.<br><br>Я створив цей сайт, щоб зробити вивчення мов <b>простішим та структурованішим.</b><br>Тут ви можете знайти слова, граматичні правила та інструменти для навчання <b>все в одному місці.</b><br><br>Сайт містить програму, яку я розробив за допомогою <b>методу інтервальних повторень Германна Еббінгауза</b>, щоб допомогти вам ефективно запам'ятовувати слова. Вона розроблена для школярів, мігрантів та всіх, хто прагне вивчати мови, пропонуючи <b>чітку структуру та легку навігацію.</b><br><br>За допомогою LingoIQ я хочу дати кожному таку ж можливість, яка була в мене: чіткий шлях до опанування нової мови."
  },
  "footer": {
    "privacy": "Конфіденційність",
    "terms": "Умови використання",
    "cookies": "Файли cookie"
  }
};
},{}],"src/js/i18n.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initLanguagePicker = initLanguagePicker;
exports.setLanguage = setLanguage;
var _en = _interopRequireDefault(require("../i18n/en.json"));
var _de = _interopRequireDefault(require("../i18n/de.json"));
var _uk = _interopRequireDefault(require("../i18n/uk.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// src/js/i18n.js

const translations = {
  en: _en.default,
  de: _de.default,
  uk: _uk.default
};
let currentLang = localStorage.getItem('lingoiq_lang') || 'en';

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
function setLanguage(lang) {
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
function initLanguagePicker() {
  const toggleBtn = document.getElementById('language-toggle-btn');
  const popup = document.getElementById('language-popup');
  if (toggleBtn && popup) {
    // Відкриття / закриття попапу при кліку на кнопку
    toggleBtn.addEventListener('click', e => {
      e.stopPropagation(); // Зупиняємо спливання події, щоб document її одразу не закрив
      popup.classList.toggle('disable');
    });

    // Закриття попапу при кліку в будь-яку іншу точку сторінки
    document.addEventListener('click', e => {
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
},{"../i18n/en.json":"src/i18n/en.json","../i18n/de.json":"src/i18n/de.json","../i18n/uk.json":"src/i18n/uk.json"}],"src/js/index.js":[function(require,module,exports) {
"use strict";

var _i18n = require("./i18n");
console.log("Hi, I am here!");

// src/js/index.js

// Додаємо подію, яка викликає ініціалізацію після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
  // 1. Прив'язуємо події кліку на кнопку та поп-ап вибору мови
  (0, _i18n.initLanguagePicker)();
  console.log('LingoIQ: i18n успішно ініціалізовано!');
});
},{"./i18n":"src/js/i18n.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52314" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/js/index.js"], null)
//# sourceMappingURL=/js.d818e0ef.js.map
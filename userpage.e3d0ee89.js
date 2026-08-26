// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
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

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      if (res === false) {
        return {};
      }
      // Synthesize a module to follow re-exports.
      if (Array.isArray(res)) {
        var m = {__esModule: true};
        res.forEach(function (v) {
          var key = v[0];
          var id = v[1];
          var exp = v[2] || v[0];
          var x = newRequire(id);
          if (key === '*') {
            Object.keys(x).forEach(function (key) {
              if (
                key === 'default' ||
                key === '__esModule' ||
                Object.prototype.hasOwnProperty.call(m, key)
              ) {
                return;
              }

              Object.defineProperty(m, key, {
                enumerable: true,
                get: function () {
                  return x[key];
                },
              });
            });
          } else if (exp === '*') {
            Object.defineProperty(m, key, {
              enumerable: true,
              value: x,
            });
          } else {
            Object.defineProperty(m, key, {
              enumerable: true,
              get: function () {
                if (exp === 'default') {
                  return x.__esModule ? x.default : x;
                }
                return x[exp];
              },
            });
          }
        });
        return m;
      }
      return newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"cSsrq":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "19bb2d36e3d0ee89";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"lQCzu":[function(require,module,exports,__globalThis) {
// src/js/i18n.js
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// 2. Зміна активної мови та оновлення UI
parcelHelpers.export(exports, "setLanguage", ()=>setLanguage);
// 3. Ініціалізація подій відкриття/закриття попапу та вибору мови
parcelHelpers.export(exports, "initLanguagePicker", ()=>initLanguagePicker);
var _enJson = require("../i18n/en.json");
var _enJsonDefault = parcelHelpers.interopDefault(_enJson);
var _deJson = require("../i18n/de.json");
var _deJsonDefault = parcelHelpers.interopDefault(_deJson);
var _ukJson = require("../i18n/uk.json");
var _ukJsonDefault = parcelHelpers.interopDefault(_ukJson);
const translations = {
    en: (0, _enJsonDefault.default),
    de: (0, _deJsonDefault.default),
    uk: (0, _ukJsonDefault.default)
};
let currentLang = localStorage.getItem('lingoiq_lang') || 'en';
// Робдимо функцію доступною глобально
window.initLanguagePicker = initLanguagePicker;
// 1. Підстановка тексту на сторінці
function applyTranslations(lang) {
    const currentTranslation = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach((el)=>{
        const keyPath = el.getAttribute('data-i18n').split('.');
        let text = currentTranslation;
        keyPath.forEach((key)=>{
            if (text) text = text[key];
        });
        if (text) {
            if (el.tagName === 'INPUT' && el.placeholder) el.placeholder = text;
            else el.innerHTML = text;
        }
    });
}
function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('lingoiq_lang', lang);
    // Оновлюємо стилі активної кнопки в попапі
    document.querySelectorAll('.header-language-popup__button').forEach((btn)=>{
        if (btn.getAttribute('data-lang') === lang) btn.classList.add('header-language-popup__button--active');
        else btn.classList.remove('header-language-popup__button--active');
    });
    applyTranslations(lang);
}
function initLanguagePicker() {
    const toggleBtn = document.getElementById('language-toggle-btn');
    const popup = document.getElementById('language-popup');
    if (toggleBtn && popup) {
        // Відкриття / закриття попапу при кліку на кнопку
        toggleBtn.addEventListener('click', (e)=>{
            e.stopPropagation(); // Зупиняємо спливання події, щоб document її одразу не закрив
            popup.classList.toggle('disable');
        });
        // Закриття попапу при кліку в будь-яку іншу точку сторінки
        document.addEventListener('click', (e)=>{
            if (!popup.contains(e.target) && !toggleBtn.contains(e.target)) popup.classList.add('disable');
        });
    }
    // Обробка кліку на варіанти мов у списках попапу
    document.querySelectorAll('.header-language-popup__button').forEach((btn)=>{
        btn.addEventListener('click', ()=>{
            const selectedLang = btn.getAttribute('data-lang');
            setLanguage(selectedLang);
            if (popup) popup.classList.add('disable'); // Автоматично закриваємо попап після вибору
        });
    });
    // Первинне встановлення мови при завантаженні
    setLanguage(currentLang);
}

},{"../i18n/en.json":"2pzcp","../i18n/de.json":"eqN3J","../i18n/uk.json":"dyQ7v","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"2pzcp":[function(require,module,exports,__globalThis) {
module.exports = JSON.parse('{"header":{"features":"Features","howItWorks":"How it works","signIn":"Sign In","startLearning":"Start Learning","hello":"Hello!","craeteYourAccount":"Create your Account","username":"Username","email":"Email","password":"Password","signUp":"Sign Up","alreadyHaveAnAccount":"Already have an account?","dontHaveAnAccount":"Don\'t have an account?"},"hero":{"learnLanguages":"Learn languages","rememberForever":"Remember forever","untertitle":"A platform that turns words into knowledge \u2014 powered by the science of memory","startNow":"Start Now"},"main":{"quote":"Less memorizing More understanding"},"features":{"features":"Features","basedOn":"Based on the Ebbinghaus method","onePlace":"All in one place","madeBy":"Made by a learner, for learners"},"how-it-works":{"howItWorks":"How it works","add":"Add","learn":"Learn","repeat":"Repeat","remember":"Remember"},"vwa":{"creator":"(Creator of LingoIQ)","pharagrph":"Hi! I\u2019m Yehor, and LingoIQ is my VWA project.<br><br>I created this site to make language learning <b>simpler and more structured.</b><br>Here, you can find words, grammar rules, and learning tools <b>all in one place.</b><br><br>The site includes a program I developed using <b>Hermann Ebbinghaus\u2019 spaced repetition method</b> to help you remember words efficiently. It\u2019s designed for students, migrants, and anyone eager to learn languages, offering <b>clear structures and easy navigation.</b><br><br>With LingoIQ, I want to give everyone the same opportunity I had: a clear path to mastering a new language."},"footer":{"privacy":"Privacy","terms":"Terms","cookies":"Cookies"}}');

},{}],"eqN3J":[function(require,module,exports,__globalThis) {
module.exports = JSON.parse('{"header":{"features":"Funktionen","howItWorks":"Wie es funktioniert","signIn":"Anmelden","startLearning":"Lernen starten","hello":"Hallo!","craeteYourAccount":"Erstelle dein Konto","username":"Benutzername","email":"E-Mail","password":"Passwort","signUp":"Registrieren","alreadyHaveAnAccount":"Hast du bereits ein Konto?","dontHaveAnAccount":"Noch kein Konto?"},"hero":{"learnLanguages":"Sprachen lernen","rememberForever":"F\xfcr immer erinnern","untertitle":"Eine Plattform, die W\xf6rter in Wissen verwandelt \u2014 angetrieben von der Ged\xe4chtniswissenschaft","startNow":"Jetzt starten"},"main":{"quote":"Weniger Auswendiglernen Mehr Verstehen"},"features":{"features":"Funktionen","basedOn":"Basiert auf der Ebbinghaus-Methode","onePlace":"Alles an einem Ort","madeBy":"Von einem Lernenden f\xfcr Lernende gemacht"},"how-it-works":{"howItWorks":"Wie es funktioniert","add":"Hinzuf\xfcgen","learn":"Lernen","repeat":"Wiederholen","remember":"Behalten"},"vwa":{"creator":"(Ersteller von LingoIQ)","pharagrph":"Hallo! Ich bin Yehor und LingoIQ ist mein VWA-Projekt.<br><br>Ich habe diese Website erstellt, um das Sprachenlernen <b>einfacher und strukturierter</b> zu machen.<br>Hier findest du W\xf6rter, Grammatikregeln und Lernwerkzeuge <b>alles an einem Ort.</b><br><br>Die Website enth\xe4lt ein von mir entwickeltes Programm, das die <b>Spaced-Repetition-Methode von Hermann Ebbinghaus</b> nutzt, um dir zu helfen, W\xf6rter effizient zu behalten. Es wurde f\xfcr Sch\xfcler, Migranten und alle entwickelt, die motiviert sind, Sprachen zu lernen, und bietet <b>klare Strukturen und einfache Navigation.</b><br><br>Mit LingoIQ m\xf6chte ich jedem dieselbe M\xf6glichkeit geben, die ich hatte: einen klaren Weg zur Erlernung einer neuen Sprache."},"footer":{"privacy":"Datenschutz","terms":"Nutzungsbedingungen","cookies":"Cookies"}}');

},{}],"dyQ7v":[function(require,module,exports,__globalThis) {
module.exports = JSON.parse('{"header":{"features":"\u041C\u043E\u0436\u043B\u0438\u0432\u043E\u0441\u0442\u0456","howItWorks":"\u042F\u043A \u0446\u0435 \u043F\u0440\u0430\u0446\u044E\u0454","signIn":"\u0423\u0432\u0456\u0439\u0442\u0438","startLearning":"\u0420\u043E\u0437\u043F\u043E\u0447\u0430\u0442\u0438 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F","hello":"\u041F\u0440\u0438\u0432\u0456\u0442!","craeteYourAccount":"\u0421\u0442\u0432\u043E\u0440\u0438 \u0441\u0432\u0456\u0439 \u0430\u043A\u0430\u0443\u043D\u0442","username":"\u0406\u043C\'\u044F \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430","email":"\u0415\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0430 \u043F\u043E\u0448\u0442\u0430","password":"\u041F\u0430\u0440\u043E\u043B\u044C","signUp":"\u0417\u0430\u0440\u0435\u0454\u0441\u0442\u0440\u0443\u0432\u0430\u0442\u0438\u0441\u044F","alreadyHaveAnAccount":"\u0412\u0436\u0435 \u0454 \u0430\u043A\u0430\u0443\u043D\u0442?","dontHaveAnAccount":"\u041D\u0435\u043C\u0430\u0454 \u0430\u043A\u0430\u0443\u043D\u0442\u0443?"},"hero":{"learnLanguages":"\u0412\u0438\u0432\u0447\u0430\u0439\u0442\u0435 \u043C\u043E\u0432\u0438","rememberForever":"\u041F\u0430\u043C\'\u044F\u0442\u0430\u0439\u0442\u0435 \u043D\u0430\u0437\u0430\u0432\u0436\u0434\u0438","untertitle":"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430, \u044F\u043A\u0430 \u043F\u0435\u0440\u0435\u0442\u0432\u043E\u0440\u044E\u0454 \u0441\u043B\u043E\u0432\u0430 \u043D\u0430 \u0437\u043D\u0430\u043D\u043D\u044F \u2014 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0456 \u043D\u0430\u0443\u043A\u0438 \u043F\u0440\u043E \u043F\u0430\u043C\'\u044F\u0442\u044C","startNow":"\u041F\u043E\u0447\u0430\u0442\u0438 \u0437\u0430\u0440\u0430\u0437"},"main":{"quote":"\u041C\u0435\u043D\u0448\u0435 \u0437\u0430\u0443\u0447\u0443\u0432\u0430\u043D\u043D\u044F \u0411\u0456\u043B\u044C\u0448\u0435 \u0440\u043E\u0437\u0443\u043C\u0456\u043D\u043D\u044F"},"features":{"features":"\u041C\u043E\u0436\u043B\u0438\u0432\u043E\u0441\u0442\u0456","basedOn":"\u041D\u0430 \u043E\u0441\u043D\u043E\u0432\u0456 \u043C\u0435\u0442\u043E\u0434\u0443 \u0415\u0431\u0431\u0456\u043D\u0433\u0430\u0443\u0437\u0430","onePlace":"\u0412\u0441\u0435 \u0432 \u043E\u0434\u043D\u043E\u043C\u0443 \u043C\u0456\u0441\u0446\u0456","madeBy":"\u0421\u0442\u0432\u043E\u0440\u0435\u043D\u043E \u0437\u0434\u043E\u0431\u0443\u0432\u0430\u0447\u0435\u043C \u0437\u043D\u0430\u043D\u044C \u0434\u043B\u044F \u0437\u0434\u043E\u0431\u0443\u0432\u0430\u0447\u0456\u0432 \u0437\u043D\u0430\u043D\u044C"},"how-it-works":{"howItWorks":"\u042F\u043A \u0446\u0435 \u043F\u0440\u0430\u0446\u044E\u0454","add":"\u0414\u043E\u0434\u0430\u0439","learn":"\u0412\u0438\u0432\u0447\u0438","repeat":"\u041F\u043E\u0432\u0442\u043E\u0440\u0438","remember":"\u0417\u0430\u043F\u0430\u043C\'\u044F\u0442\u0430\u0439"},"vwa":{"creator":"(\u0422\u0432\u043E\u0440\u0435\u0446\u044C LingoIQ)","pharagrph":"\u041F\u0440\u0438\u0432\u0456\u0442! \u042F \u0404\u0433\u043E\u0440, \u0456 LingoIQ \u2014 \u0446\u0435 \u043C\u0456\u0439 VWA-\u043F\u0440\u043E\u0454\u043A\u0442.<br><br>\u042F \u0441\u0442\u0432\u043E\u0440\u0438\u0432 \u0446\u0435\u0439 \u0441\u0430\u0439\u0442, \u0449\u043E\u0431 \u0437\u0440\u043E\u0431\u0438\u0442\u0438 \u0432\u0438\u0432\u0447\u0435\u043D\u043D\u044F \u043C\u043E\u0432 <b>\u043F\u0440\u043E\u0441\u0442\u0456\u0448\u0438\u043C \u0442\u0430 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u043E\u0432\u0430\u043D\u0456\u0448\u0438\u043C.</b><br>\u0422\u0443\u0442 \u0432\u0438 \u043C\u043E\u0436\u0435\u0442\u0435 \u0437\u043D\u0430\u0439\u0442\u0438 \u0441\u043B\u043E\u0432\u0430, \u0433\u0440\u0430\u043C\u0430\u0442\u0438\u0447\u043D\u0456 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0442\u0430 \u0456\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0438 \u0434\u043B\u044F \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F <b>\u0432\u0441\u0435 \u0432 \u043E\u0434\u043D\u043E\u043C\u0443 \u043C\u0456\u0441\u0446\u0456.</b><br><br>\u0421\u0430\u0439\u0442 \u043C\u0456\u0441\u0442\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0443, \u044F\u043A\u0443 \u044F \u0440\u043E\u0437\u0440\u043E\u0431\u0438\u0432 \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E <b>\u043C\u0435\u0442\u043E\u0434\u0443 \u0456\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u044C\u043D\u0438\u0445 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u044C \u0413\u0435\u0440\u043C\u0430\u043D\u043D\u0430 \u0415\u0431\u0431\u0456\u043D\u0433\u0430\u0443\u0437\u0430</b>, \u0449\u043E\u0431 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438 \u0432\u0430\u043C \u0435\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E \u0437\u0430\u043F\u0430\u043C\'\u044F\u0442\u043E\u0432\u0443\u0432\u0430\u0442\u0438 \u0441\u043B\u043E\u0432\u0430. \u0412\u043E\u043D\u0430 \u0440\u043E\u0437\u0440\u043E\u0431\u043B\u0435\u043D\u0430 \u0434\u043B\u044F \u0448\u043A\u043E\u043B\u044F\u0440\u0456\u0432, \u043C\u0456\u0433\u0440\u0430\u043D\u0442\u0456\u0432 \u0442\u0430 \u0432\u0441\u0456\u0445, \u0445\u0442\u043E \u043F\u0440\u0430\u0433\u043D\u0435 \u0432\u0438\u0432\u0447\u0430\u0442\u0438 \u043C\u043E\u0432\u0438, \u043F\u0440\u043E\u043F\u043E\u043D\u0443\u044E\u0447\u0438 <b>\u0447\u0456\u0442\u043A\u0443 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u0442\u0430 \u043B\u0435\u0433\u043A\u0443 \u043D\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u044E.</b><br><br>\u0417\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E LingoIQ \u044F \u0445\u043E\u0447\u0443 \u0434\u0430\u0442\u0438 \u043A\u043E\u0436\u043D\u043E\u043C\u0443 \u0442\u0430\u043A\u0443 \u0436 \u043C\u043E\u0436\u043B\u0438\u0432\u0456\u0441\u0442\u044C, \u044F\u043A\u0430 \u0431\u0443\u043B\u0430 \u0432 \u043C\u0435\u043D\u0435: \u0447\u0456\u0442\u043A\u0438\u0439 \u0448\u043B\u044F\u0445 \u0434\u043E \u043E\u043F\u0430\u043D\u0443\u0432\u0430\u043D\u043D\u044F \u043D\u043E\u0432\u043E\u0457 \u043C\u043E\u0432\u0438."},"footer":{"privacy":"\u041A\u043E\u043D\u0444\u0456\u0434\u0435\u043D\u0446\u0456\u0439\u043D\u0456\u0441\u0442\u044C","terms":"\u0423\u043C\u043E\u0432\u0438 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F","cookies":"\u0424\u0430\u0439\u043B\u0438 cookie"}}');

},{}]},["cSsrq","lQCzu"], "lQCzu", "parcelRequiree231", {})

//# sourceMappingURL=userpage.e3d0ee89.js.map

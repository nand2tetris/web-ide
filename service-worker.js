(()=>{"use strict";var e={42:()=>{try{self["workbox:core:6.5.4"]&&_()}catch(e){}},940:()=>{try{self["workbox:expiration:6.5.4"]&&_()}catch(e){}},881:()=>{try{self["workbox:precaching:6.5.4"]&&_()}catch(e){}},661:()=>{try{self["workbox:routing:6.5.4"]&&_()}catch(e){}},772:()=>{try{self["workbox:strategies:6.5.4"]&&_()}catch(e){}}},t={};function s(n){var r=t[n];if(void 0!==r)return r.exports;var a=t[n]={exports:{}};return e[n](a,a.exports,s),a.exports}(()=>{s(42);const e=(e,...t)=>{let s=e;return t.length>0&&(s+=` :: ${JSON.stringify(t)}`),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}const n=new Set;const r={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!==typeof registration?registration.scope:""},a=e=>[r.prefix,e,r.suffix].filter((e=>e&&e.length>0)).join("-"),i=e=>e||a(r.precache),o=e=>e||a(r.runtime);function c(e,t){const s=new URL(e);for(const n of t)s.searchParams.delete(n);return s.href}let h;function l(e){e.then((()=>{}))}class u{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}const d=e=>new URL(String(e),location.href).href.replace(new RegExp(`^${location.origin}`),"");function p(e){return new Promise((t=>setTimeout(t,e)))}function f(e,t){const s=t();return e.waitUntil(s),s}async function g(e,s){let n=null;if(e.url){n=new URL(e.url).origin}if(n!==self.location.origin)throw new t("cross-origin-copy-response",{origin:n});const r=e.clone(),a={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},i=s?s(a):a,o=function(){if(void 0===h){const t=new Response("");if("body"in t)try{new Response(t.body),h=!0}catch(e){h=!1}h=!1}return h}()?r.body:await r.blob();return new Response(o,i)}const m=(e,t)=>t.some((t=>e instanceof t));let w,y;const _=new WeakMap,v=new WeakMap,b=new WeakMap,R=new WeakMap,x=new WeakMap;let C={get(e,t,s){if(e instanceof IDBTransaction){if("done"===t)return v.get(e);if("objectStoreNames"===t)return e.objectStoreNames||b.get(e);if("store"===t)return s.objectStoreNames[1]?void 0:s.objectStore(s.objectStoreNames[0])}return q(e[t])},set:(e,t,s)=>(e[t]=s,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function L(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(y||(y=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(U(this),t),q(_.get(this))}:function(...t){return q(e.apply(U(this),t))}:function(t,...s){const n=e.call(U(this),t,...s);return b.set(n,t.sort?t.sort():[t]),q(n)}}function E(e){return"function"===typeof e?L(e):(e instanceof IDBTransaction&&function(e){if(v.has(e))return;const t=new Promise(((t,s)=>{const n=()=>{e.removeEventListener("complete",r),e.removeEventListener("error",a),e.removeEventListener("abort",a)},r=()=>{t(),n()},a=()=>{s(e.error||new DOMException("AbortError","AbortError")),n()};e.addEventListener("complete",r),e.addEventListener("error",a),e.addEventListener("abort",a)}));v.set(e,t)}(e),m(e,w||(w=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction]))?new Proxy(e,C):e)}function q(e){if(e instanceof IDBRequest)return function(e){const t=new Promise(((t,s)=>{const n=()=>{e.removeEventListener("success",r),e.removeEventListener("error",a)},r=()=>{t(q(e.result)),n()},a=()=>{s(e.error),n()};e.addEventListener("success",r),e.addEventListener("error",a)}));return t.then((t=>{t instanceof IDBCursor&&_.set(t,e)})).catch((()=>{})),x.set(t,e),t}(e);if(R.has(e))return R.get(e);const t=E(e);return t!==e&&(R.set(e,t),x.set(t,e)),t}const U=e=>x.get(e);const D=["get","getKey","getAll","getAllKeys","count"],k=["put","add","delete","clear"],T=new Map;function N(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!==typeof t)return;if(T.get(t))return T.get(t);const s=t.replace(/FromIndex$/,""),n=t!==s,r=k.includes(s);if(!(s in(n?IDBIndex:IDBObjectStore).prototype)||!r&&!D.includes(s))return;const a=async function(e,...t){const a=this.transaction(e,r?"readwrite":"readonly");let i=a.store;return n&&(i=i.index(t.shift())),(await Promise.all([i[s](...t),r&&a.done]))[0]};return T.set(t,a),a}C=(e=>({...e,get:(t,s,n)=>N(t,s)||e.get(t,s,n),has:(t,s)=>!!N(t,s)||e.has(t,s)}))(C);s(940);const I="cache-entries",K=e=>{const t=new URL(e,location.href);return t.hash="",t.href};class M{constructor(e){this._db=null,this._cacheName=e}_upgradeDb(e){const t=e.createObjectStore(I,{keyPath:"id"});t.createIndex("cacheName","cacheName",{unique:!1}),t.createIndex("timestamp","timestamp",{unique:!1})}_upgradeDbAndDeleteOldDbs(e){this._upgradeDb(e),this._cacheName&&function(e,{blocked:t}={}){const s=indexedDB.deleteDatabase(e);t&&s.addEventListener("blocked",(e=>t(e.oldVersion,e))),q(s).then((()=>{}))}(this._cacheName)}async setTimestamp(e,t){const s={url:e=K(e),timestamp:t,cacheName:this._cacheName,id:this._getId(e)},n=(await this.getDb()).transaction(I,"readwrite",{durability:"relaxed"});await n.store.put(s),await n.done}async getTimestamp(e){const t=await this.getDb(),s=await t.get(I,this._getId(e));return null===s||void 0===s?void 0:s.timestamp}async expireEntries(e,t){const s=await this.getDb();let n=await s.transaction(I).store.index("timestamp").openCursor(null,"prev");const r=[];let a=0;for(;n;){const s=n.value;s.cacheName===this._cacheName&&(e&&s.timestamp<e||t&&a>=t?r.push(n.value):a++),n=await n.continue()}const i=[];for(const o of r)await s.delete(I,o.id),i.push(o.url);return i}_getId(e){return this._cacheName+"|"+K(e)}async getDb(){return this._db||(this._db=await function(e,t,{blocked:s,upgrade:n,blocking:r,terminated:a}={}){const i=indexedDB.open(e,t),o=q(i);return n&&i.addEventListener("upgradeneeded",(e=>{n(q(i.result),e.oldVersion,e.newVersion,q(i.transaction),e)})),s&&i.addEventListener("blocked",(e=>s(e.oldVersion,e.newVersion,e))),o.then((e=>{a&&e.addEventListener("close",(()=>a())),r&&e.addEventListener("versionchange",(e=>r(e.oldVersion,e.newVersion,e)))})).catch((()=>{})),o}("workbox-expiration",1,{upgrade:this._upgradeDbAndDeleteOldDbs.bind(this)})),this._db}}class P{constructor(e,t={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=t.maxEntries,this._maxAgeSeconds=t.maxAgeSeconds,this._matchOptions=t.matchOptions,this._cacheName=e,this._timestampModel=new M(e)}async expireEntries(){if(this._isRunning)return void(this._rerunRequested=!0);this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-1e3*this._maxAgeSeconds:0,t=await this._timestampModel.expireEntries(e,this._maxEntries),s=await self.caches.open(this._cacheName);for(const n of t)await s.delete(n,this._matchOptions);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,l(this.expireEntries()))}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._maxAgeSeconds){const t=await this._timestampModel.getTimestamp(e),s=Date.now()-1e3*this._maxAgeSeconds;return void 0===t||t<s}return!1}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(1/0)}}s(881);function S(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"===typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:n}=e;if(!n)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(n,location.href);return{cacheKey:e.href,url:e.href}}const r=new URL(n,location.href),a=new URL(n,location.href);return r.searchParams.set("__WB_REVISION__",s),{cacheKey:r.href,url:a.href}}class O{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:s})=>{if("install"===e.type&&t&&t.originalRequest&&t.originalRequest instanceof Request){const e=t.originalRequest.url;s?this.notUpdatedURLs.push(e):this.updatedURLs.push(e)}return s}}}class A{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:e,params:t})=>{const s=(null===t||void 0===t?void 0:t.cacheKey)||this._precacheController.getCacheKeyForURL(e.url);return s?new Request(s,{headers:e.headers}):e},this._precacheController=e}}s(772);function j(e){return"string"===typeof e?new Request(e):e}class B{constructor(e,t){this._cacheKeys={},Object.assign(this,t),this.event=t.event,this._strategy=e,this._handlerDeferred=new u,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const s of this._plugins)this._pluginStateMap.set(s,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){const{event:s}=this;let n=j(e);if("navigate"===n.mode&&s instanceof FetchEvent&&s.preloadResponse){const e=await s.preloadResponse;if(e)return e}const r=this.hasCallback("fetchDidFail")?n.clone():null;try{for(const e of this.iterateCallbacks("requestWillFetch"))n=await e({request:n.clone(),event:s})}catch(i){if(i instanceof Error)throw new t("plugin-error-request-will-fetch",{thrownErrorMessage:i.message})}const a=n.clone();try{let e;e=await fetch(n,"navigate"===n.mode?void 0:this._strategy.fetchOptions);for(const t of this.iterateCallbacks("fetchDidSucceed"))e=await t({event:s,request:a,response:e});return e}catch(o){throw r&&await this.runCallbacks("fetchDidFail",{error:o,event:s,originalRequest:r.clone(),request:a.clone()}),o}}async fetchAndCachePut(e){const t=await this.fetch(e),s=t.clone();return this.waitUntil(this.cachePut(e,s)),t}async cacheMatch(e){const t=j(e);let s;const{cacheName:n,matchOptions:r}=this._strategy,a=await this.getCacheKey(t,"read"),i=Object.assign(Object.assign({},r),{cacheName:n});s=await caches.match(a,i);for(const o of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await o({cacheName:n,matchOptions:r,cachedResponse:s,request:a,event:this.event})||void 0;return s}async cachePut(e,s){const r=j(e);await p(0);const a=await this.getCacheKey(r,"write");if(!s)throw new t("cache-put-with-no-response",{url:d(a.url)});const i=await this._ensureResponseSafeToCache(s);if(!i)return!1;const{cacheName:o,matchOptions:h}=this._strategy,l=await self.caches.open(o),u=this.hasCallback("cacheDidUpdate"),f=u?await async function(e,t,s,n){const r=c(t.url,s);if(t.url===r)return e.match(t,n);const a=Object.assign(Object.assign({},n),{ignoreSearch:!0}),i=await e.keys(t,a);for(const o of i)if(r===c(o.url,s))return e.match(o,n)}(l,a.clone(),["__WB_REVISION__"],h):null;try{await l.put(a,u?i.clone():i)}catch(g){if(g instanceof Error)throw"QuotaExceededError"===g.name&&await async function(){for(const e of n)await e()}(),g}for(const t of this.iterateCallbacks("cacheDidUpdate"))await t({cacheName:o,oldResponse:f,newResponse:i.clone(),request:a,event:this.event});return!0}async getCacheKey(e,t){const s=`${e.url} | ${t}`;if(!this._cacheKeys[s]){let n=e;for(const e of this.iterateCallbacks("cacheKeyWillBeUsed"))n=j(await e({mode:t,request:n,event:this.event,params:this.params}));this._cacheKeys[s]=n}return this._cacheKeys[s]}hasCallback(e){for(const t of this._strategy.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(const s of this.iterateCallbacks(e))await s(t)}*iterateCallbacks(e){for(const t of this._strategy.plugins)if("function"===typeof t[e]){const s=this._pluginStateMap.get(t),n=n=>{const r=Object.assign(Object.assign({},n),{state:s});return t[e](r)};yield n}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){let e;for(;e=this._extendLifetimePromises.shift();)await e}destroy(){this._handlerDeferred.resolve(null)}async _ensureResponseSafeToCache(e){let t=e,s=!1;for(const n of this.iterateCallbacks("cacheWillUpdate"))if(t=await n({request:this.request,response:t,event:this.event})||void 0,s=!0,!t)break;return s||t&&200!==t.status&&(t=void 0),t}}class W{constructor(e={}){this.cacheName=o(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const t=e.event,s="string"===typeof e.request?new Request(e.request):e.request,n="params"in e?e.params:void 0,r=new B(this,{event:t,request:s,params:n}),a=this._getResponse(r,s,t);return[a,this._awaitComplete(a,r,s,t)]}async _getResponse(e,s,n){let r;await e.runCallbacks("handlerWillStart",{event:n,request:s});try{if(r=await this._handle(s,e),!r||"error"===r.type)throw new t("no-response",{url:s.url})}catch(a){if(a instanceof Error)for(const t of e.iterateCallbacks("handlerDidError"))if(r=await t({error:a,event:n,request:s}),r)break;if(!r)throw a}for(const t of e.iterateCallbacks("handlerWillRespond"))r=await t({event:n,request:s,response:r});return r}async _awaitComplete(e,t,s,n){let r,a;try{r=await e}catch(a){}try{await t.runCallbacks("handlerDidRespond",{event:n,request:s,response:r}),await t.doneWaiting()}catch(i){i instanceof Error&&(a=i)}if(await t.runCallbacks("handlerDidComplete",{event:n,request:s,response:r,error:a}),t.destroy(),a)throw a}}class F extends W{constructor(e={}){e.cacheName=i(e.cacheName),super(e),this._fallbackToNetwork=!1!==e.fallbackToNetwork,this.plugins.push(F.copyRedirectedCacheableResponsesPlugin)}async _handle(e,t){const s=await t.cacheMatch(e);return s||(t.event&&"install"===t.event.type?await this._handleInstall(e,t):await this._handleFetch(e,t))}async _handleFetch(e,s){let n;const r=s.params||{};if(!this._fallbackToNetwork)throw new t("missing-precache-entry",{cacheName:this.cacheName,url:e.url});{0;const t=r.integrity,a=e.integrity,i=!a||a===t;if(n=await s.fetch(new Request(e,{integrity:"no-cors"!==e.mode?a||t:void 0})),t&&i&&"no-cors"!==e.mode){this._useDefaultCacheabilityPluginIfNeeded();await s.cachePut(e,n.clone());0}}return n}async _handleInstall(e,s){this._useDefaultCacheabilityPluginIfNeeded();const n=await s.fetch(e);if(!await s.cachePut(e,n.clone()))throw new t("bad-precaching-response",{url:e.url,status:n.status});return n}_useDefaultCacheabilityPluginIfNeeded(){let e=null,t=0;for(const[s,n]of this.plugins.entries())n!==F.copyRedirectedCacheableResponsesPlugin&&(n===F.defaultPrecacheCacheabilityPlugin&&(e=s),n.cacheWillUpdate&&t++);0===t?this.plugins.push(F.defaultPrecacheCacheabilityPlugin):t>1&&null!==e&&this.plugins.splice(e,1)}}F.defaultPrecacheCacheabilityPlugin={cacheWillUpdate:async({response:e})=>!e||e.status>=400?null:e},F.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:async({response:e})=>e.redirected?await g(e):e};class H{constructor({cacheName:e,plugins:t=[],fallbackToNetwork:s=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new F({cacheName:i(e),plugins:[...t,new A({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const s=[];for(const n of e){"string"===typeof n?s.push(n):n&&void 0===n.revision&&s.push(n.url);const{cacheKey:e,url:r}=S(n),a="string"!==typeof n&&n.revision?"reload":"default";if(this._urlsToCacheKeys.has(r)&&this._urlsToCacheKeys.get(r)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(r),secondEntry:e});if("string"!==typeof n&&n.integrity){if(this._cacheKeysToIntegrities.has(e)&&this._cacheKeysToIntegrities.get(e)!==n.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:r});this._cacheKeysToIntegrities.set(e,n.integrity)}if(this._urlsToCacheKeys.set(r,e),this._urlsToCacheModes.set(r,a),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}install(e){return f(e,(async()=>{const t=new O;this.strategy.plugins.push(t);for(const[r,a]of this._urlsToCacheKeys){const t=this._cacheKeysToIntegrities.get(a),s=this._urlsToCacheModes.get(r),n=new Request(r,{integrity:t,cache:s,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:a},request:n,event:e}))}const{updatedURLs:s,notUpdatedURLs:n}=t;return{updatedURLs:s,notUpdatedURLs:n}}))}activate(e){return f(e,(async()=>{const e=await self.caches.open(this.strategy.cacheName),t=await e.keys(),s=new Set(this._urlsToCacheKeys.values()),n=[];for(const r of t)s.has(r.url)||(await e.delete(r),n.push(r.url));return{deletedURLs:n}}))}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this.strategy.cacheName)).match(s)}}createHandlerBoundToURL(e){const s=this.getCacheKeyForURL(e);if(!s)throw new t("non-precached-url",{url:e});return t=>(t.request=new Request(e),t.params=Object.assign({cacheKey:s},t.params),this.strategy.handle(t))}}let V;const $=()=>(V||(V=new H),V);s(661);const G=e=>e&&"object"===typeof e?e:{handle:e};class Q{constructor(e,t,s="GET"){this.handler=G(t),this.match=e,this.method=s}setCatchHandler(e){this.catchHandler=G(e)}}class J extends Q{constructor(e,t,s){super((({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)}),t,s)}}class Y{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",(e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data;0;const s=Promise.all(t.urlsToCache.map((t=>{"string"===typeof t&&(t=[t]);const s=new Request(...t);return this.handleRequest({request:s,event:e})})));e.waitUntil(s),e.ports&&e.ports[0]&&s.then((()=>e.ports[0].postMessage(!0)))}}))}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return void 0;const n=s.origin===location.origin,{params:r,route:a}=this.findMatchingRoute({event:t,request:e,sameOrigin:n,url:s});let i=a&&a.handler;const o=e.method;if(!i&&this._defaultHandlerMap.has(o)&&(i=this._defaultHandlerMap.get(o)),!i)return void 0;let c;try{c=i.handle({url:s,request:e,event:t,params:r})}catch(l){c=Promise.reject(l)}const h=a&&a.catchHandler;return c instanceof Promise&&(this._catchHandler||h)&&(c=c.catch((async n=>{if(h){0;try{return await h.handle({url:s,request:e,event:t,params:r})}catch(a){a instanceof Error&&(n=a)}}if(this._catchHandler)return this._catchHandler.handle({url:s,request:e,event:t});throw n}))),c}findMatchingRoute({url:e,sameOrigin:t,request:s,event:n}){const r=this._routes.get(s.method)||[];for(const a of r){let r;const i=a.match({url:e,sameOrigin:t,request:s,event:n});if(i)return r=i,(Array.isArray(r)&&0===r.length||i.constructor===Object&&0===Object.keys(i).length||"boolean"===typeof i)&&(r=void 0),{route:a,params:r}}return{}}setDefaultHandler(e,t="GET"){this._defaultHandlerMap.set(t,G(e))}setCatchHandler(e){this._catchHandler=G(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this._routes.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this._routes.get(e.method).splice(s,1)}}let X;const z=()=>(X||(X=new Y,X.addFetchListener(),X.addCacheListener()),X);function Z(e,s,n){let r;if("string"===typeof e){const t=new URL(e,location.href);0;r=new Q((({url:e})=>e.href===t.href),s,n)}else if(e instanceof RegExp)r=new J(e,s,n);else if("function"===typeof e)r=new Q(e,s,n);else{if(!(e instanceof Q))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});r=e}return z().registerRoute(r),r}class ee extends Q{constructor(e,t){super((({request:s})=>{const n=e.getURLsToCacheKeys();for(const r of function*(e,{ignoreURLParametersMatching:t=[/^utm_/,/^fbclid$/],directoryIndex:s="index.html",cleanURLs:n=!0,urlManipulation:r}={}){const a=new URL(e,location.href);a.hash="",yield a.href;const i=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some((e=>e.test(s)))&&e.searchParams.delete(s);return e}(a,t);if(yield i.href,s&&i.pathname.endsWith("/")){const e=new URL(i.href);e.pathname+=s,yield e.href}if(n){const e=new URL(i.href);e.pathname+=".html",yield e.href}if(r){const e=r({url:a});for(const t of e)yield t.href}}(s.url,t)){const t=n.get(r);if(t){return{cacheKey:t,integrity:e.getIntegrityForCacheKey(t)}}}}),e.strategy)}}const te={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};var se;self.addEventListener("activate",(()=>self.clients.claim())),function(e){$().precache(e)}([...[{'revision':'48fc0974ec91e7ad74ec5ccb48d37e3e','url':'/web-ide/index.html'},{'revision':null,'url':'/web-ide/static/css/34.2a1f584b.chunk.css'},{'revision':null,'url':'/web-ide/static/css/408.4548b55f.chunk.css'},{'revision':null,'url':'/web-ide/static/css/519.829f2cf9.chunk.css'},{'revision':null,'url':'/web-ide/static/css/535.a8c1f171.chunk.css'},{'revision':null,'url':'/web-ide/static/css/598.4a56c158.chunk.css'},{'revision':null,'url':'/web-ide/static/css/744.3fc532fa.chunk.css'},{'revision':null,'url':'/web-ide/static/css/787.968be482.chunk.css'},{'revision':null,'url':'/web-ide/static/css/main.9d762a7f.css'},{'revision':null,'url':'/web-ide/static/js/269.1e46835e.chunk.js'},{'revision':null,'url':'/web-ide/static/js/288.3bdeec9c.chunk.js'},{'revision':null,'url':'/web-ide/static/js/297.2c45dab0.chunk.js'},{'revision':null,'url':'/web-ide/static/js/323.14a08baf.chunk.js'},{'revision':null,'url':'/web-ide/static/js/34.9f280457.chunk.js'},{'revision':null,'url':'/web-ide/static/js/408.e6e0ca78.chunk.js'},{'revision':null,'url':'/web-ide/static/js/519.0a360ef5.chunk.js'},{'revision':null,'url':'/web-ide/static/js/535.74ad7816.chunk.js'},{'revision':null,'url':'/web-ide/static/js/537.c02a5bfa.chunk.js'},{'revision':null,'url':'/web-ide/static/js/578.b9f22ec3.chunk.js'},{'revision':null,'url':'/web-ide/static/js/598.183c6bb5.chunk.js'},{'revision':null,'url':'/web-ide/static/js/608.6d63ee31.chunk.js'},{'revision':null,'url':'/web-ide/static/js/614.12dbb7c0.chunk.js'},{'revision':null,'url':'/web-ide/static/js/656.c1a30912.chunk.js'},{'revision':null,'url':'/web-ide/static/js/744.e7730500.chunk.js'},{'revision':null,'url':'/web-ide/static/js/787.781c176c.chunk.js'},{'revision':null,'url':'/web-ide/static/js/828.e00c10f6.chunk.js'},{'revision':null,'url':'/web-ide/static/js/965.0e3f3e65.chunk.js'},{'revision':null,'url':'/web-ide/static/js/983.681012c4.chunk.js'},{'revision':null,'url':'/web-ide/static/js/main.9984f23c.js'}],{url:"/web-ide/root.css",revision:null},{url:"/web-ide/pico.min.css",revision:null},{url:"/web-ide/poppins_400.ttf",revision:null},{url:"/web-ide/poppins_700.ttf",revision:null},{url:"/web-ide/jet_brains_mono.ttf",revision:null},{url:"/web-ide/manifest.json",revision:null},{url:"/web-ide/favicon.svg",revision:null},{url:"/web-ide/logo_192.png",revision:null},{url:"/web-ide/logo_512.png",revision:null},{url:"https://fonts.gstatic.com/s/materialsymbolsoutlined/v179/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsLjBuVY.woff2",revision:null},{url:"https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/loader.js",revision:null},{url:"https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/editor/editor.main.js",revision:null},{url:"https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/editor/editor.main.css",revision:null},{url:"https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/editor/editor.main.nls.js",revision:null},{url:"user_guide/chip.pdf",revision:null},{url:"user_guide/cpu.pdf",revision:null},{url:"user_guide/asm.pdf",revision:null},{url:"user_guide/vm.pdf",revision:null},{url:"user_guide/compiler.pdf",revision:null},{url:"/web-ide/bitmap_editor.html",revision:null}]),function(e){const t=$();Z(new ee(t,e))}(se);const ne=new RegExp("/[^/?]+\\.[^/]+$");var re;Z((({request:e,url:t})=>"navigate"===e.mode&&(!t.pathname.startsWith("/_")&&!t.pathname.match(ne))),(re="/web-ide/index.html",$().createHandlerBoundToURL(re))),Z((({url:e})=>e.origin===self.location.origin&&e.pathname.endsWith(".png")),new class extends W{constructor(e={}){super(e),this.plugins.some((e=>"cacheWillUpdate"in e))||this.plugins.unshift(te)}async _handle(e,s){const n=s.fetchAndCachePut(e).catch((()=>{}));s.waitUntil(n);let r,a=await s.cacheMatch(e);if(a)0;else{0;try{a=await n}catch(i){i instanceof Error&&(r=i)}}if(!a)throw new t("no-response",{url:e.url,error:r});return a}}({cacheName:"images",plugins:[new class{constructor(e={}){this.cachedResponseWillBeUsed=async({event:e,request:t,cacheName:s,cachedResponse:n})=>{if(!n)return null;const r=this._isResponseDateFresh(n),a=this._getCacheExpiration(s);l(a.expireEntries());const i=a.updateTimestamp(t.url);if(e)try{e.waitUntil(i)}catch(o){0}return r?n:null},this.cacheDidUpdate=async({cacheName:e,request:t})=>{const s=this._getCacheExpiration(e);await s.updateTimestamp(t.url),await s.expireEntries()},this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&function(e){n.add(e)}((()=>this.deleteCacheAndMetadata()))}_getCacheExpiration(e){if(e===o())throw new t("expire-custom-caches-only");let s=this._cacheExpirations.get(e);return s||(s=new P(e,this._config),this._cacheExpirations.set(e,s)),s}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const t=this._getDateHeaderTimestamp(e);if(null===t)return!0;return t>=Date.now()-1e3*this._maxAgeSeconds}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const t=e.headers.get("date"),s=new Date(t).getTime();return isNaN(s)?null:s}async deleteCacheAndMetadata(){for(const[e,t]of this._cacheExpirations)await self.caches.delete(e),await t.delete();this._cacheExpirations=new Map}}({maxEntries:50})]})),self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}))})()})();
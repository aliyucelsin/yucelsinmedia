/* Aliviralolsun service worker — çevrimdışı destek + kurulabilirlik.
 * Network-first: her zaman güncel içerik, internet yoksa cache'ten döner.
 * Sadece kendi origin (github.io) GET'leri cache'lenir; backend/AI çağrıları es geçilir.
 */
const CACHE = 'aliviralolsun-v1';
const ASSETS = ['./aliviralolsun.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && req.url.indexOf(self.location.origin) === 0) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('./aliviralolsun.html'); });
    })
  );
});

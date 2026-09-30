/* آفلاین‌ساز نسخه‌ی نصبی: فایل‌های خود برنامه رو کش می‌کنه؛ فونت گوگل اگه آفلاین بود، فونت سیستم جایگزین می‌شه. */
var CACHE = 'recomp-v1';
var CORE = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === self.location.origin;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok && sameOrigin) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
        return res;
      }).catch(function () { return hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined); });
      // فایل‌های خود برنامه: اول کش (سریع و آفلاین)، بعد به‌روزرسانی در پس‌زمینه
      return sameOrigin && hit ? hit : net;
    })
  );
});

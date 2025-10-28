const CACHE_NAME = "mesalink-cache-v2";
const urlsToCache = [
'./', './index.html', './mesa.html', './restaurant.html', './styles.css', './app.js', './users.json', './restaurant.json'
];
self.addEventListener('install', event => {
event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
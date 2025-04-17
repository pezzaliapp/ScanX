self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('scanx-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js'
      ]);
    })
  );
});

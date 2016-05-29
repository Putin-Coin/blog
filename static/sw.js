self.addEventListener('install', function(event) {
  console.log('install', event);

  event.waitUntil(
    caches.open('philipwalton.com:cache:v1').then((cache) => {
      return cache.addAll([
        '/favicon.ico',
        '/assets/css/main.css',
        '/assets/javascript/main.js'
      ])
    })
    .then(function() {
      console.log(arguments);
    })
  );
});

// self.addEventListener('activate', function(event) {
//   console.log('activate', event);
// });

self.addEventListener('fetch', function(event) {
  // console.log('fetch', event.request);
  event.respondWith(caches.match(event.request).then((res) => {
    if (res) {
      console.log('Found in cache', res);
      return res;
    } else {
      return fetch(event.request);
    }
  }));
});

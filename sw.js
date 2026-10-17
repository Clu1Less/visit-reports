var CACHE = "visit-reports-v2";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Open from the saved copy first. Refresh the saved copy in the background when online.
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(function(hit){
      var net = fetch(e.request).then(function(r){
        if(r && r.ok && new URL(e.request.url).origin === location.origin){
          var copy = r.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return r;
      }).catch(function(){ return hit || caches.match("index.html"); });
      return hit || net;
    })
  );
});

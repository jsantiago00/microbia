// Service worker de Guerra Microbiana.
// Estrategia "stale-while-revalidate": sirve del caché al toque (rápido y
// funciona offline) y en paralelo pide la versión de red para dejarla
// pronta la próxima vez. Si cambiás el juego y lo volvés a subir, subí
// también el número de CACHE de acá abajo para que se descarte lo viejo.
const CACHE = 'guerra-microbiana-v1';

self.addEventListener('install', (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./']).catch(() => {}))
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    caches.match(evento.request).then((cacheado) => {
      const deRed = fetch(evento.request)
        .then((respuesta) => {
          if (respuesta && respuesta.status === 200) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(evento.request, copia));
          }
          return respuesta;
        })
        .catch(() => cacheado);
      return cacheado || deRed;
    })
  );
});

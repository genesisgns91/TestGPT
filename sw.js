const CACHE_NAME = 'mapa-astral-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network First com Fallback em Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET (ex: requisições POST para a IA no Cloudflare)
  if (event.request.method !== 'GET') {
    return; // Deixa o navegador realizar a requisição POST diretamente para a rede
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clona e salva em cache apenas chamadas GET válidas
        if (response && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

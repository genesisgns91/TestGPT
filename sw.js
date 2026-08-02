// Service Worker do Astro — cuida do cache do "app shell" (HTML, manifest, ícones)
// para permitir instalação como PWA e um funcionamento básico offline.
// Não faz cache das chamadas de API (IA e busca de coordenadas), que sempre
// precisam ir para a rede.

const CACHE_NAME = 'astro-cache-v1';
const ARQUIVOS_APP_SHELL = [
  './index.html',
  './revolucao_solar.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS_APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(
        chaves.filter((chave) => chave !== CACHE_NAME)
              .map((chave) => caches.delete(chave))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Só cuidamos de requisições GET de mesma origem (o app shell).
  // Tudo o mais (fetch para a IA, para o Nominatim, para o astronomy-engine
  // via CDN etc.) passa direto para a rede, sem interceptação.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(request).then((respostaRede) => {
        const copia = respostaRede.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
        return respostaRede;
      }).catch(() => respostaCache);
    })
  );
});

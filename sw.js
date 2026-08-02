// Service Worker do Astro
// ==========================================
// v2 — Estratégia corrigida para nunca mais "travar" numa versão antiga:
//
// - Páginas HTML (index.html, revolucao_solar.html): SEMPRE tenta buscar da
//   rede primeiro. Só usa o cache como último recurso, se o aparelho estiver
//   offline. Isso garante que qualquer atualização feita no GitHub apareça
//   assim que o usuário abrir o app com internet.
// - Arquivos estáticos (ícones, manifest): usa "stale-while-revalidate" —
//   mostra a versão em cache instantaneamente (rápido), mas já dispara uma
//   atualização em segundo plano para a próxima vez.
//
// O nome do cache muda a cada versão (CACHE_VERSION) para forçar a limpeza
// de caches antigos no evento "activate".

const CACHE_VERSION = 'v3';
const CACHE_NAME = `astro-cache-${CACHE_VERSION}`;

const ARQUIVOS_ESTATICOS = [
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png',
    './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
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

    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    const ehPaginaHtml = request.mode === 'navigate' ||
        (request.headers.get('accept') || '').includes('text/html');

    if (ehPaginaHtml) {
        event.respondWith(
            fetch(request)
                .then((respostaRede) => {
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, respostaRede.clone()));
                    return respostaRede;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((respostaCache) => {
            const buscaRede = fetch(request).then((respostaRede) => {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, respostaRede.clone()));
                return respostaRede;
            }).catch(() => respostaCache);
            return respostaCache || buscaRede;
        })
    );
});

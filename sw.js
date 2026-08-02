// Service Worker do Astro
// ==========================================
// v4 — Estratégia Network First para HTML e scripts locais:
//
// - Páginas HTML e scripts locais: busca SEMPRE primeiro na rede para
//   garantir que alterações entrem no ar imediatamente.
//   Usa o cache apenas quando estiver totalmente offline.
// - Arquivos estáticos (ícones, manifest): usa "stale-while-revalidate".
// - auto-claim & skipWaiting: força a assunção imediata da nova versão.

const CACHE_VERSION = 'v4';
const CACHE_NAME = `astro-cache-${CACHE_VERSION}`;

// Todos os arquivos na raiz do projeto
const ARQUIVOS_ESTATICOS = [
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png',
    './apple-touch-icon.png'
];

// Instalação: baixa os arquivos estáticos e pula a fila de espera
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
            .then(() => self.skipWaiting())
    );
});

// Ativação: limpa caches antigos e assume o controle dos clientes imediatamente
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

// Interceptação de Requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignora chamadas que não usam GET ou que apontam para origens externas (Cloudflare Worker, APIs, CDNs)
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    const ehPaginaOuScript = request.mode === 'navigate' ||
        (request.headers.get('accept') || '').includes('text/html') ||
        request.destination === 'script' ||
        request.url.endsWith('.js') ||
        request.url.endsWith('.html');

    // NETWORK FIRST: Busca primeiro no servidor (HTML e JS)
    if (ehPaginaOuScript) {
        event.respondWith(
            fetch(request)
                .then((respostaRede) => {
                    if (respostaRede && respostaRede.status === 200) {
                        const respostaParaCache = respostaRede.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, respostaParaCache));
                    }
                    return respostaRede;
                })
                .catch(async () => {
                    // Fallback para o cache se estiver sem internet
                    const respostaCache = await caches.match(request);
                    if (respostaCache) {
                        return respostaCache;
                    }
                    return new Response('Sem conexão com a internet.', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
                    });
                })
        );
        return;
    }

    // STALE-WHILE-REVALIDATE: Imagens e Manifest
    event.respondWith(
        caches.match(request).then((respostaCache) => {
            const buscaRede = fetch(request).then((respostaRede) => {
                if (respostaRede && respostaRede.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, respostaRede.clone()));
                }
                return respostaRede;
            }).catch(() => respostaCache);

            return respostaCache || buscaRede;
        })
    );
});

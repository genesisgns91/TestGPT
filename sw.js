// Service Worker do Astro
// ==========================================
// v4 — Estratégia Network First para HTML e scripts locais:
//
// - Páginas HTML e scripts locais: busca SEMPRE primeiro na rede para
//   garantir que alterações no GitHub Pages entrem no ar imediatamente.
//   Usa o cache apenas quando estiver totalmente offline.
// - Arquivos estáticos (ícones, manifest): usa "stale-while-revalidate"
//   para carregamento instantâneo.
// - auto-claim & skipWaiting: força a assunção imediata da nova versão
//   sem prender o usuário na versão antiga de background.

const CACHE_VERSION = 'v4';
const CACHE_NAME = `astro-cache-${CACHE_VERSION}`;

const ARQUIVOS_ESTATICOS = [
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png',
    './apple-touch-icon.png'
];

// Instalação: baixa ícones essenciais e pula a fila de espera
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
            .then(() => self.skipWaiting())
    );
});

// Ativação: apaga todas as versões antigas do cache e assume o controle dos clientes
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

    // Ignora chamadas que não usam GET ou que apontam para origens externas (APIs do Worker/OpenStreetMap)
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    const ehPaginaOuScript = request.mode === 'navigate' ||
        (request.headers.get('accept') || '').includes('text/html') ||
        request.destination === 'script' ||
        request.url.endsWith('.js') ||
        request.url.endsWith('.html');

    // Estratégia: NETWORK FIRST (Páginas, HTML e JS locais)
    if (ehPaginaOuScript) {
        event.respondWith(
            fetch(request)
                .then((respostaRede) => {
                    // Atualiza a cópia do cache silenciosamente em segundo plano
                    if (respostaRede.status === 200) {
                        const respostaParaCache = respostaRede.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, respostaParaCache));
                    }
                    return respostaRede;
                })
                .catch(() => {
                    // Se não houver conexão, entrega a última versão salva
                    return caches.match(request);
                })
        );
        return;
    }

    // Estratégia: STALE-WHILE-REVALIDATE (Ícones, imagens estáticas e manifest)
    event.respondWith(
        caches.match(request).then((respostaCache) => {
            const buscaRede = fetch(request).then((respostaRede) => {
                if (respostaRede.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, respostaRede.clone()));
                }
                return respostaRede;
            }).catch(() => respostaCache);

            return respostaCache || buscaRede;
        })
    );
});

// Cambia este número de versión cada vez que actualices tu index.html
const CACHE_NAME = 'gasofa-cache-v3'; 

const urlsToCache = [
    '/',
    '/index.html'
    // Si tienes iconos locales, podrías añadirlos aquí, ej: '/favicon.ico'
];

// 1. INSTALACIÓN: Guarda los archivos básicos en la caja fuerte
self.addEventListener('install', event => {
    self.skipWaiting(); // Fuerza a que la nueva versión se instale de golpe
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 2. ACTIVACIÓN: Limpia la basura vieja cuando cambias la versión
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Toma el control de la app inmediatamente
});

// 3. INTERCEPTOR (FETCH): "Network First" (Siempre busca lo más nuevo)
self.addEventListener('fetch', event => {
    // Si es una petición a la API de Google, no la cacheamos aquí
    if (event.request.url.includes('script.google.com')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si hay internet y responde bien, guardamos una copia fresca en caché
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si no hay internet, sacamos la última versión guardada de la caja fuerte
                return caches.match(event.request);
            })
    );
});

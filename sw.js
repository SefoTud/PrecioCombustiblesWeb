// Cambiamos a v2 para que el móvil reconozca que hay cambios nuevos y actualice
const CACHE_NAME = 'gasofa-cache-v2'; 

const urlsToCache = [
    '/',
    '/index.html'
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
                // Si no hay internet, sacamos la última versión guardada
                return caches.match(event.request);
            })
    );
});

// ==========================================
// 4. SECCIÓN WIDGETS (El molde para el futuro)
// ==========================================

// Avisa cuando el usuario coloca el widget en su pantalla
self.addEventListener('widgetinstall', event => {
    console.log('Widget instalado en la pantalla:', event.widget.tag);
});

// Avisa cuando el usuario mira el widget (momento para pedir datos nuevos)
self.addEventListener('widgetresume', event => {
    console.log('El widget se está mostrando. Pidiendo datos actualizados...', event.widget.tag);
    // Aquí es donde, en el futuro, conectaríamos con Google Scripts para pintar el precio en el widget.
});

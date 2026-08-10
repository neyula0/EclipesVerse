/* ============================================
   ECLIPESVERSE - SERVICE WORKER
   Offline support & caching
   ============================================ */

const CACHE_NAME = 'eclipesverse-v2';
const OFFLINE_URL = '/404.html';

// ===== ASSETS TO CACHE =====
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/list.html',
    '/ongoing.html',
    '/genre-list.html',
    '/genre-detail.html',
    '/schedule.html',
    '/mylist.html',
    '/detail.html',
    '/play.html',
    '/search.html',
    '/404.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json'
];

// ===== INSTALL =====
self.addEventListener('install', (event) => {
    console.log('⚡ SW: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('⚡ SW: Caching assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('⚡ SW: Install complete!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('⚡ SW: Install failed:', error);
            })
    );
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
    console.log('⚡ SW: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('⚡ SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('⚡ SW: Activation complete!');
            return self.clients.claim();
        })
    );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }

    // Skip API requests
    if (url.pathname.startsWith('/api/') || url.hostname.includes('api.')) {
        event.respondWith(fetch(request));
        return;
    }

    // Skip external resources (CDN)
    if (url.hostname.includes('cdnjs.cloudflare.com') || 
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(fetch(request));
        return;
    }

    // ===== STRATEGY: Cache First, Network Fallback =====
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response
                    return cachedResponse;
                }

                // Try network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, show offline page for HTML
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                        // For other resources, return a simple error response
                        return new Response('Offline - Please check your connection', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// ===== PUSH NOTIFICATION =====
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'EclipesVerse';
    const options = {
        body: data.body || 'Ada update anime terbaru!',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"%3E%3Crect width="512" height="512" rx="64" fill="%237c3aed"/%3E%3Ctext x="256" y="340" font-size="280" text-anchor="middle" fill="white" font-family="Arial"%3E🌌%3C/text%3E%3C/svg%3E',
        badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"%3E%3Crect width="512" height="512" rx="64" fill="%237c3aed"/%3E%3Ctext x="256" y="340" font-size="280" text-anchor="middle" fill="white" font-family="Arial"%3E🌌%3C/text%3E%3C/svg%3E',
        data: data.url || '/',
        actions: [
            {
                action: 'open',
                title: 'Lihat'
            },
            {
                action: 'close',
                title: 'Tutup'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const url = event.notification.data || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

console.log('⚡ EclipesVerse Service Worker loaded!');

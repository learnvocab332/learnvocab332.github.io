const CACHE_NAME = 'vocab-learning-pwa-v1.0.2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/statistics.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/app.js',
    '/img/icons/icon-192x192.png',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('Cache installation error:', error);
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: Network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
    // Ignore non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If the request is successful, cache and return the response
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // If fetch fails, try to match request in cache
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // If no cache match, return offline fallback
                        return caches.match('/offline.html');
                    });
            })
    );
});

// Background sync for statistics (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-statistics') {
        event.waitUntil(syncStatistics());
    }
});

// Notification handling
self.addEventListener('push', (event) => {
    const title = 'Vocabulary Learning';
    const options = {
        body: event.data.text() || 'Time to learn some new words!',
        icon: '/img/icons/icon-192x192.png',
        badge: '/img/icons/icon-72x72.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.openWindow('/')
    );
});

// Helper function for background sync (mock implementation)
async function syncStatistics() {
    try {
        // In a real-world scenario, you would sync local storage data with a backend
        const statistics = localStorage.getItem('quizStatistics');
        if (statistics) {
            // Simulate sending statistics to a server
            console.log('Syncing statistics in background');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}
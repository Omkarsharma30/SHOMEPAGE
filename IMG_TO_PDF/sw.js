// Service Worker for IMG_TO_PDF PWA
const CACHE_NAME = 'img-to-pdf-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Caching failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then(response => {
                    // Don't cache if not a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response for caching
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(error => {
                console.error('Service Worker: Fetch failed', error);
                
                // Return offline page for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Handle background sync for pending conversions
self.addEventListener('sync', event => {
    if (event.tag === 'background-conversion') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundConversion());
    }
});

// Handle push notifications (future feature)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        console.log('Service Worker: Push received', data);
        
        const options = {
            body: data.body || 'Your PDF conversion is complete!',
            icon: '/icon-192x192.png',
            badge: '/icon-96x96.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View PDF',
                    icon: '/icon-96x96.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icon-96x96.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'IMG to PDF', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        event.notification.close();
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background conversion function
async function doBackgroundConversion() {
    try {
        // Get pending conversions from IndexedDB
        const pendingConversions = await getPendingConversions();
        
        for (const conversion of pendingConversions) {
            try {
                // Process the conversion
                await processConversion(conversion);
                
                // Remove from pending list
                await removePendingConversion(conversion.id);
                
                // Show notification
                await self.registration.showNotification('Conversion Complete', {
                    body: `PDF "${conversion.filename}" has been generated`,
                    icon: '/icon-192x192.png',
                    tag: 'conversion-complete'
                });
            } catch (error) {
                console.error('Service Worker: Background conversion failed', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Helper functions for IndexedDB operations
async function getPendingConversions() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('img-to-pdf-db', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pending-conversions'], 'readonly');
            const store = transaction.objectStore('pending-conversions');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-conversions')) {
                db.createObjectStore('pending-conversions', { keyPath: 'id' });
            }
        };
    });
}

async function removePendingConversion(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('img-to-pdf-db', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pending-conversions'], 'readwrite');
            const store = transaction.objectStore('pending-conversions');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

async function processConversion(conversion) {
    // Implement the actual conversion logic here
    // This would involve loading the images and generating the PDF
    console.log('Service Worker: Processing conversion', conversion);
    
    // For now, just simulate the process
    return new Promise(resolve => {
        setTimeout(resolve, 1000);
    });
}

// Debug logging
console.log('Service Worker: Script loaded');
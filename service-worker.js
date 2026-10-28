// ============================================================
// Service Worker - مواقيت الصلاة عامرية الصمود
// الإصدار: 2.0.0 (يدعم الملفات المتعددة)
// ============================================================

const CACHE_VERSION = 'v2.1.0';
const STATIC_CACHE = `prayer-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `prayer-runtime-${CACHE_VERSION}`;

// الملفات المحلية (كل ملفات المشروع الجديدة)
const PRECACHE_LOCAL = [
    './',
    './index.html',
    './about.html',
    './contact.html',
    './privacy.html',
    './terms.html',
    './manifest.json',
    // CSS
    './css/main.css',
    './css/themes.css',
    './css/components.css',
    './css/animations.css',
    './css/pages.css',
    // JS
    './js/app.js',
    './js/data.js',
    './js/utils.js',
    './js/theme.js',
    './js/fonts.js',
    './js/hijri.js',
    './js/clock.js',
    './js/table.js',
    './js/upcoming.js',
    './js/tracker.js',
    './js/notifications.js',
    './js/share.js',
    './js/search.js',
    './js/pwa.js',
    './js/pages-nav.js',
    // Icons
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

// الموارد الخارجية
const PRECACHE_EXTERNAL = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap'
];

// ============ INSTALL ============
self.addEventListener('install', (event) => {
    console.log('[SW] 🚀 Installing', CACHE_VERSION);
    event.waitUntil((async () => {
        const cache = await caches.open(STATIC_CACHE);

        await Promise.allSettled(
            PRECACHE_LOCAL.map(url =>
                cache.add(url).catch(err => console.warn('[SW] Local cache failed:', url, err.message))
            )
        );

        await Promise.allSettled(
            PRECACHE_EXTERNAL.map(url =>
                cache.add(url).catch(err => console.warn('[SW] External cache failed:', url, err.message))
            )
        );

        console.log('[SW] ✅ Precaching done');
        await self.skipWaiting();
    })());
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
    console.log('[SW] ⚡ Activating');
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        const validCaches = [STATIC_CACHE, RUNTIME_CACHE];
        await Promise.all(
            cacheNames
                .filter(name => !validCaches.includes(name))
                .map(name => {
                    console.log('[SW] 🗑️ Deleting:', name);
                    return caches.delete(name);
                })
        );
        await self.clients.claim();
        console.log('[SW] ✅ Activated');
    })());
});

// ============ FETCH ============
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') return;
    if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager')) return;

    // 1. طلبات التنقل
    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(request);
                if (networkResponse && networkResponse.status === 200) {
                    const cache = await caches.open(RUNTIME_CACHE);
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            } catch (err) {
                const cached = await caches.match(request);
                if (cached) return cached;
                const cachedIndex = await caches.match('./index.html');
                if (cachedIndex) return cachedIndex;
                return new Response('غير متصل', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        })());
        return;
    }

    // 2. الموارد الخارجية
    if (url.origin !== self.location.origin) {
        event.respondWith((async () => {
            const cached = await caches.match(request);
            if (cached) {
                fetch(request).then(response => {
                    if (response && response.status === 200) {
                        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, response));
                    }
                }).catch(() => {});
                return cached;
            }
            try {
                const response = await fetch(request);
                if (response && response.status === 200) {
                    const cache = await caches.open(RUNTIME_CACHE);
                    cache.put(request, response.clone());
                }
                return response;
            } catch (err) {
                if (request.destination === 'image') {
                    return caches.match('./icons/icon-192.png');
                }
                return new Response('', { status: 504 });
            }
        })());
        return;
    }

    // 3. الموارد المحلية
    event.respondWith((async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
            const response = await fetch(request);
            if (response && response.status === 200) {
                const cache = await caches.open(RUNTIME_CACHE);
                cache.put(request, response.clone());
            }
            return response;
        } catch (err) {
            if (request.destination === 'image') {
                return caches.match('./icons/icon-192.png');
            }
            return new Response('', { status: 504 });
        }
    })());
});

// ============ MESSAGE ============
self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'SKIP_WAITING') self.skipWaiting();
    if (data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
                .then(() => {
                    if (event.ports && event.ports[0]) event.ports[0].postMessage({ success: true });
                })
        );
    }
});

// ============ PUSH ============
self.addEventListener('push', (event) => {
    let data = { title: 'مواقيت الصلاة', body: 'حان وقت الصلاة' };
    try {
        if (event.data) data = event.data.json();
    } catch (e) {}

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: './icons/icon-192.png',
            badge: './icons/icon-96.png',
            vibrate: [200, 100, 200],
            dir: 'rtl',
            lang: 'ar',
            data: { url: data.url || './' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || './';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});

console.log('[SW] 📄 Loaded', CACHE_VERSION);
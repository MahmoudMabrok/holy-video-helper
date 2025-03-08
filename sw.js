
// Service Worker for Holy Video Helper PWA
const CACHE_NAME = 'holy-video-helper-v1';

// Assets that will be cached on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Install completed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // Clean up old cache versions
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
    .then(() => {
      console.log('[Service Worker] Activate completed');
    })
  );
});

// Network-first with cache fallback strategy for API requests
async function networkFirstWithCacheFallback(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Only cache successful responses from the network
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Nothing in cache
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstWithNetworkFallback(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Nothing in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Both cache and network failed
    console.error('[Service Worker] Both cache and network failed for:', request.url);
    throw error;
  }
}

// Fetch event - serve from cache or network based on resource type
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (
    // API calls (JSON files) use network-first strategy
    url.pathname.includes('.json') ||
    url.hostname.includes('github') ||
    url.hostname.includes('githubusercontent') ||
    url.pathname.includes('/api/')
  ) {
    event.respondWith(networkFirstWithCacheFallback(event.request));
  } else {
    // For other resources (HTML, CSS, JS, images), use cache-first strategy
    event.respondWith(cacheFirstWithNetworkFallback(event.request));
  }
});

// Handle service worker updates
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

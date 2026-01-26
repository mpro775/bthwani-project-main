// Service Worker for Bithawani PWA
const CACHE_NAME = "bithawani-v1.0.0";
const STATIC_CACHE = "bithawani-static-v1";
const DYNAMIC_CACHE = "bithawani-dynamic-v1";

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/favicon.ico",
];

// المسارات الشائعة للـ prefetch لتحسين الأداء
const COMMON_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/overview",
  "/admin/orders",
  "/admin/users",
  "/admin/drivers",
  "/admin/finance",
  "/admin/reports"
];

// موارد إضافية للتخزين المؤقت الذكي
const CRITICAL_RESOURCES = [
  "/css/index-*.css",
  "/js/index-*.js",
  "/js/vendor-*.js",
  "/js/mui-*.js",
  "/fonts/*"
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.bithawani\.com\/.*$/,
  /^https:\/\/fonts\.googleapis\.com\/.*$/,
  /^https:\/\/fonts\.gstatic\.com\/.*$/,
];

// Install event - cache static files and prefetch common routes
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      console.log("Service Worker: Caching static files");

      // تخزين الملفات الثابتة الأساسية
      await cache.addAll(STATIC_FILES);

      // تخزين المسارات الشائعة للـ prefetch (تحسين الأداء)
      console.log("Service Worker: Prefetching common routes");
      for (const route of COMMON_ROUTES) {
        try {
          // جلب المسار وتخزينه مؤقتاً لتحسين سرعة التحميل
          const response = await fetch(route, {
            cache: 'no-cache' // تجنب التخزين المؤقت للـ fetch هذا
          });
          if (response.ok) {
            await cache.put(route, response);
          }
        } catch (error) {
          console.log(`Service Worker: Failed to prefetch ${route}`);
        }
      }

      // تخزين الموارد الحرجة إذا كانت متوفرة
      for (const pattern of CRITICAL_RESOURCES) {
        try {
          const responses = await Promise.allSettled([
            fetch(pattern.replace('*', 'index')).catch(() => null),
            fetch(pattern.replace('*', 'vendor')).catch(() => null),
            fetch(pattern.replace('*', 'mui')).catch(() => null)
          ]);

          for (const response of responses) {
            if (response.status === 'fulfilled' && response.value?.ok) {
              await cache.put(response.value.url, response.value);
            }
          }
        } catch (error) {
          console.log(`Service Worker: Failed to cache critical resources: ${pattern}`);
        }
      }

      // الانتقال إلى حالة التنشيط فوراً
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content with intelligent caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (except API and fonts)
  if (
    url.origin !== location.origin &&
    !API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))
  ) {
    return;
  }

  // استراتيجية التخزين المؤقت الذكية حسب نوع المورد
  if (request.method === "GET") {
    event.respondWith(handleRequestWithStrategy(request));
  }
});

// معالجة الطلبات باستراتيجيات مختلفة حسب نوع المورد
async function handleRequestWithStrategy(request) {
  const url = new URL(request.url);

  try {
    // استراتيجية Cache First للملفات الثابتة
    if (isStaticAsset(request.url)) {
      return await cacheFirst(request);
    }

    // استراتيجية Stale While Revalidate للصور
    if (isImage(request.url)) {
      return await staleWhileRevalidate(request);
    }

    // استراتيجية Network First للصفحات والمسارات الديناميكية
    if (isNavigationRequest(request)) {
      return await networkFirst(request);
    }

    // استراتيجية افتراضية للطلبات الأخرى
    return await networkFirstWithFallback(request);

  } catch (error) {
    console.error('[SW] خطأ في معالجة الطلب:', error);

    // إرجاع استجابة احتياطية للصفحات
    if (request.mode === "navigate") {
      return await caches.match("/");
    }

    return new Response('خطأ في الخدمة', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// استراتيجية Cache First للملفات الثابتة
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] خطأ في جلب المورد الثابت:', error);
    throw error;
  }
}

// استراتيجية Network First للصفحات والمسارات الديناميكية
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] خطأ في الشبكة، البحث في الكاش');

    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

// استراتيجية Network First مع إمكانية الكاش للطلبات الأخرى
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] خطأ في الشبكة، البحث في الكاش');

    // البحث في الكاش الثابت أولاً
    const staticCache = await caches.open(STATIC_CACHE);
    const cached = await staticCache.match(request);

    if (cached) {
      return cached;
    }

    // ثم البحث في الكاش الديناميكي
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const dynamicCached = await dynamicCache.match(request);

    if (dynamicCached) {
      return dynamicCached;
    }

    throw error;
  }
}

// استراتيجية Stale While Revalidate للصور
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  // إرجاع الكاش فوراً إذا كان متوفراً
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// دوال مساعدة لتحديد نوع المورد
function isStaticAsset(url) {
  return url.includes('.js') || url.includes('.css') ||
         url.includes('.png') || url.includes('.jpg') ||
         url.includes('.jpeg') || url.includes('.gif') ||
         url.includes('.svg') || url.includes('.ico') ||
         url.includes('.woff') || url.includes('.woff2') ||
         url.includes('.ttf') || url.includes('.eot');
}

function isImage(url) {
  return url.includes('.png') || url.includes('.jpg') ||
         url.includes('.jpeg') || url.includes('.gif') ||
         url.includes('.svg') || url.includes('.webp') ||
         url.includes('.avif') || url.includes('.ico');
}

function isNavigationRequest(request) {
  return request.mode === "navigate" ||
         (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

// Background sync for offline orders
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-orders") {
    event.waitUntil(syncOfflineOrders());
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "لديك إشعار جديد من بثواني",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "اذهب للتطبيق",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "إغلاق",
        icon: "/icons/xmark.png",
      },
    ],
    tag: "bithawani-notification",
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification("بثواني", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("https://bithawani.com"));
  }
});

// Sync offline orders when connection is restored
async function syncOfflineOrders() {
  try {
    const cache = await caches.open("offline-orders");
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log("Failed to sync order:", error);
      }
    }
  } catch (error) {
    console.log("Sync failed:", error);
  }
}

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-sync") {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    const response = await fetch("/api/content/latest");
    const data = await response.json();

    // Update cache with latest content
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put("/api/content/latest", new Response(JSON.stringify(data)));

    console.log("Content updated in background");
  } catch (error) {
    console.log("Background content update failed:", error);
  }
}

// Handle cache quota exceeded
self.addEventListener("quotaexceeded", (event) => {
  console.log("Storage quota exceeded, cleaning up...");

  // Clean up old cache entries
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (cacheName.includes("dynamic")) {
        caches.open(cacheName).then((cache) => {
          cache.keys().then((requests) => {
            // Delete oldest entries (simple FIFO)
            if (requests.length > 50) {
              const toDelete = requests.slice(0, 10);
              toDelete.forEach((request) => {
                cache.delete(request);
              });
            }
          });
        });
      }
    });
  });
});

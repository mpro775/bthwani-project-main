// Service Worker محسّن للأداء مع استراتيجيات ذكية للتخزين المؤقت
const CACHE_NAME = "bthwani-cache-v1.0.0";
const STATIC_CACHE = "bthwani-static-v1";
const DYNAMIC_CACHE = "bthwani-dynamic-v1";

// الملفات الأساسية للتخزين المؤقت الفوري
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico"
];

// المسارات الشائعة للـ prefetch لتحسين الأداء
const COMMON_ROUTES = [
  "/",
  "/dashboard",
  "/orders",
  "/profile",
  "/categories"
];

// موارد حرجة للتخزين المؤقت الذكي
const CRITICAL_RESOURCES = [
  "/assets/index-*.css",
  "/assets/index-*.js",
  "/assets/vendor-*.js"
];

self.addEventListener("install", (event) => {
  console.log("[SW] تثبيت Service Worker");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      console.log("[SW] تخزين الملفات الأساسية مؤقتاً");

      // تخزين الملفات الأساسية
      await cache.addAll(ASSETS);

      // تخزين المسارات الشائعة للـ prefetch (تحسين الأداء)
      console.log("[SW] تخزين المسارات الشائعة مؤقتاً");
      for (const route of COMMON_ROUTES) {
        try {
          const response = await fetch(route, { cache: 'no-cache' });
          if (response.ok) {
            await cache.put(route, response);
          }
        } catch (error) {
          console.log(`[SW] تعذر تخزين المسار مؤقتاً: ${route}`);
        }
      }

      // تخزين الموارد الحرجة إذا كانت متوفرة
      for (const pattern of CRITICAL_RESOURCES) {
        try {
          const responses = await Promise.allSettled([
            fetch(pattern.replace('*', 'index')).catch(() => null),
            fetch(pattern.replace('*', 'vendor')).catch(() => null)
          ]);

          for (const response of responses) {
            if (response.status === 'fulfilled' && response.value?.ok) {
              await cache.put(response.value.url, response.value);
            }
          }
        } catch (error) {
          console.log(`[SW] تعذر تخزين الموارد الحرجة: ${pattern}`);
        }
      }

      // الانتقال إلى حالة التنشيط فوراً
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] تنشيط Service Worker");
  event.waitUntil(
    (async () => {
      // حذف الكاش القديم
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );

      // الاستيلاء على جميع العملاء
      await clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // تخطي طلبات خارج النطاق
  if (url.origin !== location.origin) {
    return;
  }

  // استراتيجية التخزين المؤقت الذكية حسب نوع المورد
  if (req.method === "GET") {
    event.respondWith(handleRequestWithStrategy(req));
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

// Optional: handle skip waiting from app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Basic push handler (for custom Web Push, not FCM-managed)
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch(e) {}
  const title = data.title || "إشعار جديد";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: data.data || {}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

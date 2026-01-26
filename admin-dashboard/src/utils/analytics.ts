// =============================
// Analytics & Tracking Configuration
// =============================

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
  }
}

// Google Analytics 4
export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // استبدل بالمعرف الخاص بك
export const GTM_ID = 'GTM-XXXXXXX'; // Google Tag Manager ID

// تهيئة Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {'custom_parameter': 'bithawani_event'}
    });
  `;
  document.head.appendChild(script2);
};

// تهيئة Google Tag Manager
export const initGTM = () => {
  if (typeof window === 'undefined') return;

  // GTM Script
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);

  // GTM NoScript
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
  document.body.insertBefore(noscript, document.body.firstChild);
};

// تتبع الأحداث
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_parameter: 'bithawani_tracking'
    });
  }
};

// تتبع مشاهدة الصفحة
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title,
      page_location: url,
    });
  }
};

// تتبع التحويلات (الطلبات)
export const trackOrder = (orderId: string, value: number, currency = 'YER') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: currency,
      event_category: 'ecommerce',
      custom_parameter: 'order_completed'
    });
  }
};

// تتبع المنتجات المعروضة
export const trackProductView = (productId: string, productName: string, category: string, price: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'YER',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        quantity: 1
      }]
    });
  }
};

// تتبع إضافة المنتجات للسلة
export const trackAddToCart = (productId: string, productName: string, category: string, price: number, quantity = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'YER',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        quantity: quantity
      }]
    });
  }
};

// تتبع تسجيل المستخدمين
export const trackSignUp = (method: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
      event_category: 'user_engagement'
    });
  }
};

// تتبع تسجيل الدخول
export const trackLogin = (method: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method,
      event_category: 'user_engagement'
    });
  }
};

// تتبع البحث
export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      event_category: 'user_interaction'
    });
  }
};

// تتبع مشاركة المحتوى
export const trackShare = (contentType: string, itemId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', {
      method: 'social_media',
      content_type: contentType,
      item_id: itemId
    });
  }
};

// Facebook Pixel
export const initFacebookPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

// تتبع النقرات على الروابط الخارجية
export const trackExternalLink = (url: string, linkText: string) => {
  trackEvent('click', 'external_link', `${linkText} - ${url}`);
};

// تتبع تحميل التطبيق
export const trackAppDownload = (platform: 'android' | 'ios') => {
  trackEvent('app_download', 'engagement', platform);
};

// تتبع الأخطاء
export const trackError = (error: string, page: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error,
      fatal: false,
      custom_parameter: `error_on_${page}`
    });
  }
};

export default {
  initGA,
  initGTM,
  initFacebookPixel,
  trackEvent,
  trackPageView,
  trackOrder,
  trackProductView,
  trackAddToCart,
  trackSignUp,
  trackLogin,
  trackSearch,
  trackShare,
  trackExternalLink,
  trackAppDownload,
  trackError
};

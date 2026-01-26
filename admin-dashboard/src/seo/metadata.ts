// =============================
// SEO Metadata Configuration
// =============================

import { BRAND } from "../landing/brand";

export interface SEOPage {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

// الصفحة الرئيسية
export const HOME_SEO: SEOPage = {
  title: `${BRAND.nameAr} - ${BRAND.tagline}`,
  description: `${BRAND.description}. اطلب الآن من السوبرماركت والمطاعم والصيدليات مع توصيل سريع في أقل من 30 دقيقة.`,
  keywords: [
    ...BRAND.keywords,
    "تطبيق توصيل يمني",
    "أفضل تطبيق توصيل",
    "توصيل 24 ساعة",
    "توصيل مجاني الآن",
  ],
  canonical: "https://bithawani.com",
  ogImage: "https://bithawani.com/images/og-home.jpg",
};

// صفحات الخدمات
export const SERVICES_SEO = {
  grocery: {
    title: `توصيل سوبرماركت - ${BRAND.nameAr}`,
    description:
      "اطلب جميع احتياجاتك من السوبرماركت والبقالة مع توصيل سريع وآمن إلى بابك في اليمن.",
    keywords: [
      "توصيل سوبرماركت",
      "بقالة اونلاين",
      "سوبرماركت يمني",
      "مواد غذائية",
    ],
    canonical: "https://bithawani.com/grocery",
  },
  restaurants: {
    title: `توصيل مطاعم - ${BRAND.nameAr}`,
    description:
      "أشهى الأطباق من أفضل المطاعم اليمنية والعربية والعالمية مع توصيل ساخن وسريع.",
    keywords: ["توصيل مطاعم", "طلب طعام", "مطاعم يمنية", "وجبات سريعة"],
    canonical: "https://bithawani.com/restaurants",
  },
  pharmacy: {
    title: `توصيل صيدليات - ${BRAND.nameAr}`,
    description:
      "اطلب أدويتك ومستلزماتك الطبية من الصيدليات المعتمدة مع توصيل آمن وسري.",
    keywords: [
      "توصيل صيدلية",
      "أدوية اونلاين",
      "صيدلية يمنية",
      "مستلزمات طبية",
    ],
    canonical: "https://bithawani.com/pharmacy",
  },
};

// بيانات منظمة للموقع
export const STRUCTURED_DATA = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.nameAr,
    alternateName: BRAND.name,
    url: "https://bithawani.com",
    logo: "https://bithawani.com/images/logo.png",
    description: BRAND.description,
    foundingDate: BRAND.foundedYear,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND.contact.phone,
        contactType: "customer service",
        areaServed: "YE",
        availableLanguage: ["ar", "en"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.contact.address,
      addressCountry: "YE",
    },
    sameAs: [
      BRAND.social.facebook,
      BRAND.social.instagram,
      BRAND.social.twitter,
      BRAND.social.linkedin,
    ],
  },

  mobileApp: {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: BRAND.app.name,
    operatingSystem: ["Android", "iOS"],
    applicationCategory: "BusinessApplication",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "2547",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "YER",
    },
  },

  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "خدمة توصيل بثواني",
    description: "خدمة توصيل سريعة وموثوقة في اليمن",
    provider: {
      "@type": "Organization",
      name: BRAND.nameAr,
    },
    areaServed: BRAND.serviceAreas.map((area) => ({
      "@type": "City",
      name: area,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "خدمات التوصيل",
      itemListElement: BRAND.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
        },
      })),
    },
  },

  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "كم تستغرق مدة التوصيل؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "نحن نضمن التوصيل في أقل من 30 دقيقة داخل نطاق الخدمة. للمناطق البعيدة قد تصل إلى 60 دقيقة.",
        },
      },
      {
        "@type": "Question",
        name: "ما هي مناطق الخدمة المتاحة؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: `نخدم حالياً في ${BRAND.serviceAreas.join(
            "، "
          )} مع توسع مستمر لمناطق جديدة.`,
        },
      },
      {
        "@type": "Question",
        name: "هل يمكن الدفع نقداً؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "نعم، نقبل الدفع نقداً عند الاستلام، وأيضاً الدفع الإلكتروني عبر المحافظ الرقمية.",
        },
      },
    ],
  },
};

// إعدادات الميتا العامة
export const DEFAULT_META = {
  viewport: "width=device-width, initial-scale=1",
  charset: "utf-8",
  language: "ar",
  direction: "rtl",
  themeColor: BRAND.colors.primary,
  appleTouchIcon: "/icons/apple-touch-icon.png",
  manifest: "/manifest.json",
};

export default {
  HOME_SEO,
  SERVICES_SEO,
  STRUCTURED_DATA,
  DEFAULT_META,
};

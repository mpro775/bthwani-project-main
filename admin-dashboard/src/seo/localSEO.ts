// =============================
// Local SEO Configuration for Bithawani
// =============================

export interface CityPage {
  name: string;
  nameEn: string;
  description: string;
  keywords: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  population: string;
  mainDistricts: string[];
  workingHours: string;
  serviceRadius: number; // in kilometers
}

// صفحات المدن للـ Local SEO
export const CITIES: Record<string, CityPage> = {
  sanaa: {
    name: "صنعاء",
    nameEn: "Sanaa",
    description:
      "خدمة توصيل بثواني في صنعاء - اطلب من أفضل المطاعم والسوبرماركت والصيدليات في العاصمة اليمنية مع توصيل سريع وآمن في جميع أحياء صنعاء.",
    keywords: [
      "توصيل صنعاء",
      "مطاعم صنعاء",
      "سوبرماركت صنعاء",
      "توصيل طعام صنعاء",
      "صيدليات صنعاء",
      "بقالة صنعاء",
      "توصيل العاصمة",
      "طلب طعام صنعاء",
    ],
    coordinates: { lat: 15.3694, lng: 44.191 },
    population: "2.9 مليون",
    mainDistricts: [
      "صنعاء القديمة",
      "شارع هائل",
      "الثورة",
      "شارع الزبيري",
      "حدة",
      "شعوب",
      "الحصبة",
      "كرة النهدين",
    ],
    workingHours: "24 ساعة",
    serviceRadius: 25,
  },

  aden: {
    name: "عدن",
    nameEn: "Aden",
    description:
      "خدمة توصيل بثواني في عدن - أسرع توصيل للمطاعم والسوبرماركت في المدينة الاقتصادية. خدمة توصيل موثوقة في كريتر والمعلا وخور مكسر وجميع مديريات عدن.",
    keywords: [
      "توصيل عدن",
      "مطاعم عدن",
      "سوبرماركت عدن",
      "توصيل كريتر",
      "توصيل المعلا",
      "طعام عدن",
      "صيدليات عدن",
      "خور مكسر توصيل",
    ],
    coordinates: { lat: 12.7797, lng: 45.0365 },
    population: "1.8 مليون",
    mainDistricts: [
      "كريتر",
      "المعلا",
      "خور مكسر",
      "الشيخ عثمان",
      "دار سعد",
      "البريقة",
      "صيرة",
      "التواهي",
    ],
    workingHours: "24 ساعة",
    serviceRadius: 20,
  },

  taiz: {
    name: "تعز",
    nameEn: "Taiz",
    description:
      "توصيل بثواني في تعز - خدمة توصيل سريعة للمطاعم والسوبرماركت في مدينة تعز الثقافية. اطلب الآن من جميع أحياء تعز مع ضمان الجودة والسرعة.",
    keywords: [
      "توصيل تعز",
      "مطاعم تعز",
      "سوبرماركت تعز",
      "طعام تعز",
      "صيدليات تعز",
      "بقالة تعز",
      "توصيل المدينة الثقافية",
    ],
    coordinates: { lat: 13.5796, lng: 44.0196 },
    population: "1.2 مليون",
    mainDistricts: [
      "وسط المدينة",
      "صبر",
      "الدحي",
      "الشمايتين",
      "الروضة",
      "ذو باب",
      "الجنادرية",
    ],
    workingHours: "24 ساعة",
    serviceRadius: 15,
  },

  hodeidah: {
    name: "الحديدة",
    nameEn: "Hodeidah",
    description:
      "خدمة توصيل بثواني في الحديدة - توصيل سريع للمطاعم والسوبرماركت في المدينة الساحلية. خدمة موثوقة في جميع أحياء الحديدة مع أطباق المأكولات البحرية المميزة.",
    keywords: [
      "توصيل الحديدة",
      "مطاعم الحديدة",
      "مأكولات بحرية الحديدة",
      "سوبرماركت الحديدة",
      "طعام الحديدة",
      "ميناء الحديدة",
    ],
    coordinates: { lat: 14.7978, lng: 42.9545 },
    population: "800 ألف",
    mainDistricts: ["وسط المدينة", "الميناء", "الحالي", "حيس", "الخوخة"],
    workingHours: "24 ساعة",
    serviceRadius: 18,
  },
};

// الأحياء الفرعية لكل مدينة (للـ Local SEO المفصل)
export const NEIGHBORHOODS = {
  sanaa: [
    "صنعاء القديمة",
    "شارع هائل",
    "السبعين",
    "شارع الزبيري",
    "حدة",
    "شعوب",
    "الحصبة",
    "كرة النهدين",
    "الثورة",
    "معين",
    "بيت بوس",
    "سعوان",
  ],
  aden: [
    "كريتر",
    "المعلا",
    "خور مكسر",
    "الشيخ عثمان",
    "دار سعد",
    "البريقة",
    "صيرة",
    "التواهي",
    "لحج",
    "العريش",
  ],
  taiz: [
    "وسط المدينة",
    "صبر",
    "الدحي",
    "الشمايتين",
    "الروضة",
    "ذو باب",
    "الجنادرية",
    "الضباب",
  ],
};

// قوالب المحتوى للصفحات المحلية
export const generateCityPageContent = (cityKey: string) => {
  const city = CITIES[cityKey];
  if (!city) return null;

  return {
    title: `توصيل ${city.name} - بثواني | أسرع خدمة توصيل في ${city.name}`,
    description: city.description,
    keywords: city.keywords,

    hero: {
      title: `توصيل سريع في ${city.name}`,
      subtitle: "اطلب من أفضل المطاعم والمتاجر",
      description: `خدمة توصيل بثواني متاحة في جميع أحياء ${city.name}. اطلب الآن واستمتع بتوصيل سريع وآمن.`,
    },

    districts: city.mainDistricts,

    localInfo: {
      population: city.population,
      workingHours: city.workingHours,
      serviceRadius: `${city.serviceRadius} كم`,
      coordinates: city.coordinates,
    },

    faq: [
      {
        question: `كم تستغرق مدة التوصيل في ${city.name}؟`,
        answer: `نضمن التوصيل في أقل من 30 دقيقة داخل نطاق الخدمة في ${city.name}. للمناطق البعيدة قد تصل إلى 45 دقيقة.`,
      },
      {
        question: `ما هي الأحياء المتاحة للتوصيل في ${city.name}؟`,
        answer: `نخدم جميع الأحياء الرئيسية في ${
          city.name
        } بما في ذلك: ${city.mainDistricts.join("، ")}.`,
      },
      {
        question: `هل التوصيل متاح 24 ساعة في ${city.name}؟`,
        answer: `نعم، خدمة التوصيل متاحة ${city.workingHours} في ${city.name} لراحتك وسهولة الطلب في أي وقت.`,
      },
    ],
  };
};

// Structured Data للمواقع المحلية
export const generateLocalBusinessSchema = (cityKey: string) => {
  const city = CITIES[cityKey];
  if (!city) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `بثواني - خدمة التوصيل في ${city.name}`,
    description: city.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressCountry: "YE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.coordinates.lat,
      longitude: city.coordinates.lng,
    },
    areaServed: {
      "@type": "City",
      name: city.name,
    },
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: city.coordinates.lat,
        longitude: city.coordinates.lng,
      },
      geoRadius: `${city.serviceRadius} km`,
    },
    openingHours: "Mo-Su 00:00-23:59",
    telephone: "+967 1 234 5678",
    priceRange: "$$",
    acceptsReservations: false,
    servesCuisine: ["Middle Eastern", "International", "Local"],
    hasMenu: true,
    takeaway: true,
    delivery: true,
  };
};

export default {
  CITIES,
  NEIGHBORHOODS,
  generateCityPageContent,
  generateLocalBusinessSchema,
};

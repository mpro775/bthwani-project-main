// الخدمات - مطابق لـ app-user
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  enabled?: boolean;
}

export const SERVICES: Service[] = [
  {
    id: "delivery",
    name: "الديلفري",
    description: "توصيل الطلبات والمنتجات",
    icon: "bicycle",
    color: "#FF500D",
    path: "/delivery",
    enabled: true,
  },
  {
    id: "akhdimni",
    name: "اخدمني",
    description: "أغراض خاصة، غاز، وايت ماء",
    icon: "hand-left-outline",
    color: "#1976D2",
    path: "/akhdimni",
    enabled: true,
  },
  {
    id: "sanad",
    name: "سند",
    description: "خدمات عامة وطوارئ وخيرية",
    icon: "briefcase-outline",
    color: "#0A2F5C",
    path: "/sanad",
    enabled: true,
  },
  {
    id: "amani",
    name: "أماني",
    description: "نقل النساء والعائلات",
    icon: "car-outline",
    color: "#27976A",
    path: "/amani",
    enabled: true,
  },
  {
    id: "maarouf",
    name: "المعروف",
    description: "المفقودات والموجودات",
    icon: "search-outline",
    color: "#F57C00",
    path: "/maarouf",
    enabled: true,
  },
  {
    id: "arabon",
    name: "العربون",
    description: "العروض والحجوزات بعربون",
    icon: "wallet-outline",
    color: "#8B4B47",
    path: "/arabon",
    enabled: true,
  },
  {
    id: "kawader",
    name: "الكوادر",
    description: "الخدمات المهنية",
    icon: "people-outline",
    color: "#1A3052",
    path: "/kawader",
    enabled: true,
  },
  {
    id: "kenz",
    name: "كنز",
    description: "السوق المفتوح",
    icon: "storefront-outline",
    color: "#D32F2F",
    path: "/kenz",
    enabled: true,
  },
  {
    id: "es3afni",
    name: "اسعفني",
    description: "تبرع بالدم عاجل",
    icon: "heart-outline",
    color: "#D32F2F",
    path: "/es3afni",
    enabled: true,
  },
];

// =============================
// /src/landing/content.ts
// =============================
import { BRAND } from "./brand";
import {
  DeliveryDining,
  LocalGroceryStore,
  SupportAgent,
  Security,
  Bolt,
  TwoWheeler,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";

export type Feature = {
  icon: SvgIconComponent;
  title: string;
  description: string;
};

export const HERO = {
  badge: " الأسرع في التوصيل",
  titleLine1: `${BRAND.nameAr}`,
  titleLine2: BRAND.tagline,
  description:
    "اطلب سوبرماركت، خضار وفواكه، مخابز، صيدليات أو أي شيء تحتاجه من متاجر صنعاء وعدن وتعز. توصيل سريع وآمن في أقل من 30 دقيقة.",
  ctaPrimary: "ابدأ الطلب الآن",
  ctaSecondary: "شاهد كيف يعمل",
};

export const FEATURES: Feature[] = [
  {
    icon: DeliveryDining,
    title: "توصيل سريع وموثوق",
    description: "كباتن محترفون وتتبّع مباشر للطلب حتى باب بيتك.",
  },
  {
    icon: LocalGroceryStore,
    title: "متاجر محليّة قريبة",
    description: "سوبرماركت، خضار وفواكه، مخابز، بهارات والمزيد في أحيائك.",
  },
  {
    icon: Bolt,
    title: "فزعة لأي شيء",
    description: "اطلب أي غرض من أي مكان داخل مدينتك – ننجزها بسرعة.",
  },
  {
    icon: Security,
    title: "دفع آمن ومرن",
    description: "نقدًا عند الاستلام أو محافظ إلكترونية مدعومة محليًا.",
  },
  {
    icon: SupportAgent,
    title: "دعم محلي فعّال",
    description: "نخدمك باللهجة والمعرفة المحلية وعلى مدار اليوم.",
  },
  {
    icon: TwoWheeler,
    title: "عمليات محسّنة",
    description: "خوارزميات ذكية للمسارات والسرعة والاعتمادية.",
  },
];

export const STATS = [
  { number: 0, label: "مدن مفعّلة", suffix: "+" },
  { number: 0, label: "متاجر شريكة", suffix: "+" },
  { number: 0, label: "طلبات مُكتملة", suffix: "+" },
  { number: 99, label: "رضا تقديري", suffix: "%" },
];

export const TESTIMONIALS = [
  {
    name: "عميل في صنعاء",
    role: "تجربة تجريبية",
    comment: "سهولة الطلب وسرعة التوصيل – تجربة مريحة جدًا.",
    rating: 5,
    avatar: "https://picsum.photos/seed/1/60/60",
  },
  {
    name: "شريك محلي",
    role: "متجر بقالة",
    comment: "المنصّة ساعدتنا نوصل لزبائن الحي بشكل أسرع.",
    rating: 5,
    avatar: "https://picsum.photos/seed/2/60/60",
  },
  {
    name: "مستخدم خدمة فزعة",
    role: "عميل خدمه سند ",
    comment: "طلبت حاجة ضرورية ووصلتني بسرعة – شكراً بثواني!",
    rating: 5,
    avatar: "https://picsum.photos/seed/3/60/60",
  },
];

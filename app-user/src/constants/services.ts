import type { RootStackParamList } from '../types/navigation';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: keyof RootStackParamList;
  enabled?: boolean;
}

export const SERVICES: Service[] = [
  {
    id: 'delivery',
    name: 'الديلفري',
    description: 'توصيل الطلبات والمنتجات',
    icon: 'bicycle',
    color: '#FF500D',
    route: 'DeliveryHome',
    enabled: true,
  },
  {
    id: 'akhdimni',
    name: 'اخدمني',
    description: 'أغراض خاصة، غاز، وايت ماء',
    icon: 'hand-left-outline',
    color: '#1976D2',
    route: 'AkhdimniOptionsScreen',
    enabled: true,
  },
  {
    id: 'sanad',
    name: 'سند',
    description: 'خدمات عامة وطوارئ وخيرية',
    icon: 'briefcase-outline',
    color: '#0A2F5C',
    route: 'SanadList',
    enabled: true,
  },
  {
    id: 'amani',
    name: 'أماني',
    description: 'نقل النساء والعائلات',
    icon: 'car-outline',
    color: '#27976A',
    route: 'AmaniList',
    enabled: true,
  },
  {
    id: 'maarouf',
    name: 'المعروف',
    description: 'المفقودات والموجودات',
    icon: 'search-outline',
    color: '#F57C00',
    route: 'MaaroufList',
    enabled: true,
  },
  {
    id: 'arabon',
    name: 'العربون',
    description: 'العروض والحجوزات بعربون',
    icon: 'wallet-outline',
    color: '#8B4B47',
    route: 'ArabonList',
    enabled: true,
  },
  {
    id: 'kawader',
    name: 'الكوادر',
    description: 'الخدمات المهنية',
    icon: 'people-outline',
    color: '#1A3052',
    route: 'KawaderList',
    enabled: true,
  },
  {
    id: 'kenz',
    name: 'كنز',
    description: 'السوق المفتوح',
    icon: 'storefront-outline',
    color: '#D32F2F',
    route: 'KenzList',
    enabled: true,
  },
  {
    id: 'es3afni',
    name: 'اسعفني',
    description: 'تبرع بالدم عاجل',
    icon: 'heart-outline',
    color: '#D32F2F',
    route: 'Es3afniList',
    enabled: true,
  },
];

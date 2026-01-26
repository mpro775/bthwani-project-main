/**
 * Admin Navigation - قائمة تنقل محدثة بجميع الـ endpoints
 */

import {
  Dashboard,
  DirectionsCar,
  Store,
  People,
  Assessment,
  AccountBalance,
  PersonAdd,
  Settings,
  AttachMoney,
  WorkOutline,
  Star,
  Payments,
  Bloodtype,
  Work,
  ShoppingCart,
  Search,
  Help,
  Payment,
} from '@mui/icons-material';
import { ADMIN_ENDPOINTS_BY_MODULE, ENDPOINTS_STATS } from '@/config/admin-endpoints';

export interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

/**
 * قائمة التنقل الرئيسية - مبنية من admin-endpoints.ts
 */
export const adminNavigation: NavItem[] = [
  {
    title: 'لوحة التحكم',
    path: '/admin',
    icon: <Dashboard />,
  },
  {
    title: 'التحليلات',
    path: '/admin/analytics',
    icon: <Assessment />,
    children: [
      { title: 'نظرة عامة', path: '/admin/analytics', icon: <Dashboard /> },
      { title: 'السائقين', path: '/admin/analytics/drivers', icon: <DirectionsCar /> },
      { title: 'المتاجر', path: '/admin/analytics/stores', icon: <Store /> },
      { title: 'الإيرادات', path: '/admin/analytics/revenue', icon: <AttachMoney /> },
    ],
  },
  {
    title: 'السائقين',
    path: '/admin/drivers',
    icon: <DirectionsCar />,
    children: [
      { title: 'جميع السائقين', path: '/admin/drivers', icon: <DirectionsCar /> },
      { title: 'الحضور', path: '/admin/drivers/attendance', icon: <WorkOutline /> },
      { title: 'المناوبات', path: '/admin/drivers/shifts', icon: <WorkOutline /> },
      { title: 'التقييمات', path: '/admin/drivers/ratings', icon: <Assessment /> },
    ],
  },
  {
    title: 'المتاجر',
    path: '/admin/stores',
    icon: <Store />,
  },
  {
    title: 'طلبات السحب',
    path: '/admin/withdrawals',
    icon: <AttachMoney />,
  },
  {
    title: 'المسوقين',
    path: '/admin/marketers',
    icon: <People />,
    badge: ADMIN_ENDPOINTS_BY_MODULE.marketers?.endpoints.length || 0,
  },
  {
    title: 'طلبات الانضمام',
    path: '/admin/onboarding',
    icon: <PersonAdd />,
    badge: ADMIN_ENDPOINTS_BY_MODULE.onboarding?.endpoints.length || 0,
  },
  {
    title: 'النظام المالي',
    path: '/admin/finance',
    icon: <AccountBalance />,
    children: [
      { title: 'نظرة عامة', path: '/admin/finance', icon: <Dashboard /> },
      { title: 'العمولات', path: '/admin/finance/commissions', icon: <AttachMoney /> },
      { title: 'خطط العمولات', path: '/admin/finance/plans', icon: <Settings /> },
      { title: 'التقارير', path: '/admin/finance/reports', icon: <Assessment /> },
    ],
  },
  {
    title: 'خدمة أخدمني',
    path: '/admin/akhdimni',
    icon: <WorkOutline />,
  },
  {
    title: 'الأماني',
    path: '/admin/amani',
    icon: <Star />,
  },
  {
    title: 'العربون',
    path: '/admin/arabon',
    icon: <Payments />,
  },
  {
    title: 'إسعفني',
    path: '/admin/es3afni',
    icon: <Bloodtype />,
  },
  {
    title: 'الكوادر',
    path: '/admin/kawader',
    icon: <Work />,
  },
  {
    title: 'الكنز',
    path: '/admin/kenz',
    icon: <ShoppingCart />,
  },
  {
    title: 'معروف',
    path: '/admin/maarouf',
    icon: <Search />,
  },
  {
    title: 'الصناد',
    path: '/admin/sanad',
    icon: <Help />,
  },
  {
    title: 'المدفوعات',
    path: '/admin/payments',
    icon: <Payment />,
  },
  {
    title: 'الإعدادات',
    path: '/admin/settings',
    icon: <Settings />,
    children: [
      { title: 'النظام', path: '/admin/settings/system', icon: <Settings /> },
      { title: 'المستخدمين', path: '/admin/settings/users', icon: <People /> },
      { title: 'الصلاحيات', path: '/admin/settings/permissions', icon: <Settings /> },
    ],
  },
];

/**
 * معلومات إحصائية عن الـ Endpoints
 */
export const navigationStats = {
  totalEndpoints: ENDPOINTS_STATS.total,
  totalModules: ENDPOINTS_STATS.modules,
  byMethod: ENDPOINTS_STATS.byMethod,
};

/**
 * Helper لإيجاد nav item حسب المسار
 */
export function findNavItem(path: string, items: NavItem[] = adminNavigation): NavItem | null {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findNavItem(path, item.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Helper للحصول على breadcrumbs
 */
export function getBreadcrumbs(path: string): NavItem[] {
  const breadcrumbs: NavItem[] = [];
  const parts = path.split('/').filter(Boolean);
  
  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    const item = findNavItem(currentPath);
    if (item) breadcrumbs.push(item);
  }
  
  return breadcrumbs;
}


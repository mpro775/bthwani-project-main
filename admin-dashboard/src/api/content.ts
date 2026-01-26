/**
 * Content Management API
 * جميع الوظائف الخاصة بإدارة المحتوى
 */

import { useAdminAPI, useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/content';

// ==================== Helper Function ====================

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) {
    throw new Error(`Endpoint with id "${id}" not found`);
  }
  return endpoint;
};

// ==================== Banner Hooks ====================

export function useBanners(query?: Types.BannerQuery) {
  const queryParams: Record<string, string> | undefined = query ? {
    ...(query.placement && { placement: query.placement }),
    ...(query.isActive !== undefined && { isActive: query.isActive.toString() }),
  } : undefined;
  return useAdminQuery<Types.ContentResponse<Types.Banner[]>>(
    getEndpoint('content-admin-banners-all'),
    { query: queryParams },
    { enabled: true }
  );
}

export function useActiveBanners(placement?: string) {
  return useAdminQuery<Types.ContentResponse<Types.Banner[]>>(
    getEndpoint('content-banners-get'),
    { query: placement ? { placement } : undefined },
    { enabled: true }
  );
}

// ==================== CMS Pages Hooks ====================

export function useCMSPages(query?: Types.CMSPageQuery) {
  const queryParams: Record<string, string> | undefined = query ? {
    ...(query.type && { type: query.type }),
    ...(query.isPublished !== undefined && { isPublished: query.isPublished.toString() }),
  } : undefined;
  return useAdminQuery<Types.ContentResponse<Types.CMSPage[]>>(
    getEndpoint('content-pages-get'),
    { query: queryParams },
    { enabled: true }
  );
}

// ==================== App Settings Hooks ====================

export function useAppSettings() {
  return useAdminQuery<Types.ContentResponse<Types.AppSettings>>(
    getEndpoint('content-app-settings-get'),
    {},
    { enabled: true }
  );
}

// ==================== FAQs Hooks ====================

export function useFAQs(query?: Types.FAQQuery) {
  const queryParams: Record<string, string> | undefined = query ? {
    ...(query.category && { category: query.category }),
    ...(query.isActive !== undefined && { isActive: query.isActive.toString() }),
  } : undefined;
  return useAdminQuery<Types.ContentResponse<Types.FAQ[]>>(
    getEndpoint('content-faqs-get'),
    { query: queryParams },
    { enabled: true }
  );
}

// ==================== Subscription Plans Hooks ====================

export function useSubscriptionPlans() {
  return useAdminQuery<Types.ContentResponse<Types.SubscriptionPlan[]>>(
    getEndpoint('content-subscription-plans-get'),
    {},
    { enabled: true }
  );
}

// ==================== Mutations API ====================

export function useContentAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    // ==================== Banners ====================
    createBanner: async (data: Types.CreateBannerDto) => {
      return callEndpoint<Types.ContentResponse<Types.Banner>>(
        getEndpoint('content-banner-create'),
        { body: data }
      );
    },

    updateBanner: async (id: string, data: Types.UpdateBannerDto) => {
      return callEndpoint<Types.ContentResponse<Types.Banner>>(
        getEndpoint('content-banner-update'),
        { params: { id }, body: data }
      );
    },

    deleteBanner: async (id: string) => {
      return callEndpoint<Types.ContentResponse<void>>(
        getEndpoint('content-banner-delete'),
        { params: { id } }
      );
    },

    // ==================== CMS Pages ====================
    createCMSPage: async (data: Types.CreateCMSPageDto) => {
      return callEndpoint<Types.ContentResponse<Types.CMSPage>>(
        getEndpoint('content-admin-pages-create'),
        { body: data }
      );
    },

    updateCMSPage: async (id: string, data: Types.UpdateCMSPageDto) => {
      return callEndpoint<Types.ContentResponse<Types.CMSPage>>(
        getEndpoint('content-admin-pages-update'),
        { params: { id }, body: data }
      );
    },

    // ==================== App Settings ====================
    updateAppSettings: async (data: Types.UpdateAppSettingsDto) => {
      return callEndpoint<Types.ContentResponse<Types.AppSettings>>(
        getEndpoint('content-admin-settings-update'),
        { body: data }
      );
    },

    // ==================== FAQs ====================
    createFAQ: async (data: Types.CreateFAQDto) => {
      return callEndpoint<Types.ContentResponse<Types.FAQ>>(
        getEndpoint('content-admin-faqs-create'),
        { body: data }
      );
    },

    updateFAQ: async (id: string, data: Types.UpdateFAQDto) => {
      return callEndpoint<Types.ContentResponse<Types.FAQ>>(
        getEndpoint('content-admin-faqs-update'),
        { params: { id }, body: data }
      );
    },

    deleteFAQ: async (id: string) => {
      return callEndpoint<Types.ContentResponse<void>>(
        getEndpoint('content-admin-faqs-delete'),
        { params: { id } }
      );
    },

    // ==================== Subscription Plans ====================
    createSubscriptionPlan: async (data: Types.CreateSubscriptionPlanDto) => {
      return callEndpoint<Types.ContentResponse<Types.SubscriptionPlan>>(
        getEndpoint('content-subscription-plans-create'),
        { body: data }
      );
    },
  };
}


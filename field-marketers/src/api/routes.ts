export const ENDPOINTS = {
  // ==================== Auth ====================
  AUTH_MARKETER_LOGIN: "/auth/marketer-login", // { token, user }
  PUSH_TOKEN: "/auth/push-token",

  // ==================== Profile ====================
  PROFILE_GET: "/marketer/profile",
  PROFILE_UPDATE: "/marketer/profile",

  // ==================== Onboarding ====================
  ONB_CREATE: "/marketer/onboarding",
  ONB_LIST_MY: "/marketer/onboarding/my",
  ONB_GET_ONE: (id: string) => `/marketer/onboarding/${id}`,
  QUICK_ONBOARD: "/marketer/quick-onboard",

  // ==================== Referrals ====================
  REFERRALS_GENERATE_CODE: "/marketer/referrals/generate-code",
  REFERRALS_MY: "/marketer/referrals/my",
  REFERRALS_STATISTICS: "/marketer/referrals/statistics",

  // ==================== Stores ====================
  STORES_MY: "/marketer/stores/my",
  STORES_GET_ONE: (id: string) => `/marketer/stores/${id}`,
  STORES_PERFORMANCE: (id: string) => `/marketer/stores/${id}/performance`,

  // ==================== Vendors ====================
  VENDORS_MY: "/marketer/vendors/my",
  VENDORS_GET_ONE: (id: string) => `/marketer/vendors/${id}`,

  // ==================== Commissions ====================
  COMMISSIONS_MY: "/marketer/commissions/my",
  COMMISSIONS_STATISTICS: "/marketer/commissions/statistics",
  COMMISSIONS_PENDING: "/marketer/commissions/pending",

  // ==================== Statistics & Overview ====================
  OVERVIEW: "/marketer/overview",
  STATISTICS_TODAY: "/marketer/statistics/today",
  STATISTICS_MONTH: "/marketer/statistics/month",

  // ==================== Earnings ====================
  EARNINGS: "/marketer/earnings",
  EARNINGS_BREAKDOWN: "/marketer/earnings/breakdown",

  // ==================== Files ====================
  FILES_UPLOAD: "/marketer/files/upload",
  FILES_MY: "/marketer/files",

  // ==================== Notifications ====================
  NOTIFICATIONS: "/marketer/notifications",
  NOTIFICATIONS_MARK_READ: (id: string) => `/marketer/notifications/${id}/read`,

  // ==================== Territory ====================
  TERRITORY_STATS: "/marketer/territory/stats",

  // ==================== Legacy/Other ====================
  FILE_SIGN: "/files/sign",
  FILE_COMPLETE: "/files/complete",
  LOOKUP_CATEGORIES: "/delivery/categories",
  MARKETERS_SEARCH: "/marketers/search",
};

# Frontend Orphans Fix Report - BTW-FE-005

**Generated:** 2025-10-18T15:07:25.576Z
**Total Orphans:** 79

## Summary by Strategy

| Strategy | Count | Description |
|----------|-------|-------------|
| Implement | 78 | Create new backend endpoint |
| Redirect | 0 | Point to existing endpoint |
| Deprecate | 0 | Remove from frontend |
| Mock | 1 | Use mock data |

## Summary by Surface

| Surface | Count |
|---------|-------|
| ADMIN-DASH | 63 |
| RIDER-APP | 8 |
| VENDOR-APP | 1 |
| WEB-APP | 7 |

## 🔴 High Priority (40)

### 1. GET /admin/dashboard/alerts

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/api/adminOverview.ts`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/alerts')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardAlerts() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 2. GET /admin/dashboard/summary

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/api/adminOverview.ts`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/summary')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardSummary() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 3. GET /admin/dashboard/timeseries

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/api/adminOverview.ts`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/timeseries')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardTimeseries() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 4. GET /admin/dashboard/top

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/api/adminOverview.ts`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/top')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardTop() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 5. GET /admin/me

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/hook/useAdminUser.ts`

**Suggested Implementation:** `src/modules/admin/me`

**Code Template:**

```typescript
@Get('me')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async me() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 6. GET /features

**Strategy:** IMPLEMENT
**Reason:** Feature flags - critical for feature toggles
**File:** `bthwani-project-main/admin-dashboard/src/hook/useFeatures.ts`

**Suggested Implementation:** `src/modules/features/features.controller.ts`

**Code Template:**

```typescript
@Get('/features')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Features() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 7. POST /admin/drivers

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/AdminDriversPage.tsx`

**Suggested Implementation:** `src/modules/admin/drivers`

**Code Template:**

```typescript
@Post('drivers')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async drivers() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 8. GET /admin/vendors

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/AdminVendorCreatePage.tsx`

**Suggested Implementation:** `src/modules/admin/vendors`

**Code Template:**

```typescript
@Get('vendors')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async vendors() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 9. GET /admin/settings/appearance

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/AppearanceSettingsPage.tsx`

**Suggested Implementation:** `src/modules/admin/settings`

**Code Template:**

```typescript
@Get('settings/appearance')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async settingsAppearance() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 10. PUT /admin/settings/appearance

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/AppearanceSettingsPage.tsx`

**Suggested Implementation:** `src/modules/admin/settings`

**Code Template:**

```typescript
@Put('settings/appearance')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async settingsAppearance() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 11. GET /admin/dashboard/alerts

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/OverviewPage.tsx`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/alerts')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardAlerts() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 12. GET /admin/dashboard/summary

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/OverviewPage.tsx`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/summary')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardSummary() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 13. GET /admin/dashboard/timeseries

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/OverviewPage.tsx`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/timeseries')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardTimeseries() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 14. GET /admin/dashboard/top

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/OverviewPage.tsx`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/top')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardTop() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 15. GET /admin/users/list

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/UserManagement.tsx`

**Suggested Implementation:** `src/modules/admin/users`

**Code Template:**

```typescript
@Get('users/list')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async usersList() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 16. POST /admin/users

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/UserManagement.tsx`

**Suggested Implementation:** `src/modules/admin/users`

**Code Template:**

```typescript
@Post('users')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async users() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 17. GET /admin/users/list

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/UsersListPage.tsx`

**Suggested Implementation:** `src/modules/admin/users`

**Code Template:**

```typescript
@Get('users/list')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async usersList() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 18. GET /admin/list

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/admins/api.ts`

**Suggested Implementation:** `src/modules/admin/list`

**Code Template:**

```typescript
@Get('list')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async list() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 19. GET /admin/modules

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/admins/api.ts`

**Suggested Implementation:** `src/modules/admin/modules`

**Code Template:**

```typescript
@Get('modules')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async modules() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 20. POST /admin/create

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/admins/api.ts`

**Suggested Implementation:** `src/modules/admin/create`

**Code Template:**

```typescript
@Post('create')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async create() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 21. GET /finance/commissions/audit-log

**Strategy:** IMPLEMENT
**Reason:** Financial data - critical
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/finance/CommissionSettingsPage.tsx`

**Suggested Implementation:** `src/modules/finance/finance.controller.ts`

**Code Template:**

```typescript
@Get('/finance/commissions/audit-log')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async FinanceCommissionsAuditlog() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 22. GET /finance/commissions/settings

**Strategy:** IMPLEMENT
**Reason:** Financial data - critical
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/finance/CommissionSettingsPage.tsx`

**Suggested Implementation:** `src/modules/finance/finance.controller.ts`

**Code Template:**

```typescript
@Get('/finance/commissions/settings')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async FinanceCommissionsSettings() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 23. POST /finance/commissions/settings

**Strategy:** IMPLEMENT
**Reason:** Financial data - critical
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/finance/CommissionSettingsPage.tsx`

**Suggested Implementation:** `src/modules/finance/finance.controller.ts`

**Code Template:**

```typescript
@Post('/finance/commissions/settings')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async FinanceCommissionsSettings() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 24. GET /admin/ops/drivers/realtime

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/ops/OpsDriversDashboard.tsx`

**Suggested Implementation:** `src/modules/admin/ops`

**Code Template:**

```typescript
@Get('ops/drivers/realtime')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async opsDriversRealtime() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 25. GET /admin/ops/heatmap

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/ops/OpsDriversDashboard.tsx`

**Suggested Implementation:** `src/modules/admin/ops`

**Code Template:**

```typescript
@Get('ops/heatmap')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async opsHeatmap() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 26. GET /pricing-strategies

**Strategy:** IMPLEMENT
**Reason:** Pricing logic - critical for business
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/pricing/PricingStrategiesPage.tsx`

**Suggested Implementation:** `src/modules/pricing/pricing.controller.ts`

**Code Template:**

```typescript
@Get('/pricing-strategies')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Pricingstrategies() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 27. POST /pricing-strategies

**Strategy:** IMPLEMENT
**Reason:** Pricing logic - critical for business
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/pricing/PricingStrategiesPage.tsx`

**Suggested Implementation:** `src/modules/pricing/pricing.controller.ts`

**Code Template:**

```typescript
@Post('/pricing-strategies')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Pricingstrategies() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 28. GET /admin/support/stats

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/support/SupportTicketsPage.tsx`

**Suggested Implementation:** `src/modules/admin/support`

**Code Template:**

```typescript
@Get('support/stats')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async supportStats() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 29. POST /admin/support/tickets

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/support/SupportTicketsPage.tsx`

**Suggested Implementation:** `src/modules/admin/support`

**Code Template:**

```typescript
@Post('support/tickets')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async supportTickets() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 30. GET /admin/audit-logs/my-actions?limit=3

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/system/AuditLogPage.tsx`

**Suggested Implementation:** `src/modules/admin/audit-logs`

**Code Template:**

```typescript
@Get('audit-logs/my-actions?limit=3')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async auditlogsMyactionslimit3() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 31. GET /admin/audit-logs/stats

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/system/AuditLogPage.tsx`

**Suggested Implementation:** `src/modules/admin/audit-logs`

**Code Template:**

```typescript
@Get('audit-logs/stats')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async auditlogsStats() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 32. GET /admin/vendors

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/vendors/VendorsManagement.tsx`

**Suggested Implementation:** `src/modules/admin/vendors`

**Code Template:**

```typescript
@Get('vendors')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async vendors() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 33. POST /admin/vendors

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/vendors/VendorsManagement.tsx`

**Suggested Implementation:** `src/modules/admin/vendors`

**Code Template:**

```typescript
@Post('vendors')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async vendors() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 34. GET /admin/drivers/attendance

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/drivers/DriversList.tsx`

**Suggested Implementation:** `src/modules/admin/drivers`

**Code Template:**

```typescript
@Get('drivers/attendance')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async driversAttendance() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 35. GET /admin/driver-assets

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/drivers/tabs/Assets.tsx`

**Suggested Implementation:** `src/modules/admin/driver-assets`

**Code Template:**

```typescript
@Get('driver-assets')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async driverassets() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 36. GET /admin/drivers/docs

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/drivers/tabs/Documents.tsx`

**Suggested Implementation:** `src/modules/admin/drivers`

**Code Template:**

```typescript
@Get('drivers/docs')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async driversDocs() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 37. GET /admin/driver-payouts

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/drivers/tabs/Finance.tsx`

**Suggested Implementation:** `src/modules/admin/driver-payouts`

**Code Template:**

```typescript
@Get('driver-payouts')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async driverpayouts() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 38. GET /admin/driver-shifts

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/drivers/tabs/Shifts.tsx`

**Suggested Implementation:** `src/modules/admin/driver-shifts`

**Code Template:**

```typescript
@Get('driver-shifts')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async drivershifts() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 39. GET /admin/dashboard/support-tickets

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/support/Inbox.tsx`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/support-tickets')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardSupporttickets() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 40. GET /admin/dashboard/support-tickets

**Strategy:** IMPLEMENT
**Reason:** Admin dashboard endpoint - core functionality
**File:** `bthwani-project-main/admin-dashboard/src/pages/support/TicketView.tsx`

**Suggested Implementation:** `src/modules/admin/dashboard`

**Code Template:**

```typescript
@Get('dashboard/support-tickets')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async dashboardSupporttickets() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

## 🟡 Medium Priority (38)

### 1. POST /api/leads/captain

**Strategy:** IMPLEMENT
**Reason:** Lead generation - important for business
**File:** `bthwani-project-main/admin-dashboard/src/landing/pages/BecomeCaptainPage.tsx`

**Suggested Implementation:** `src/modules/leads/leads.controller.ts`

**Code Template:**

```typescript
@Post('leads/captain')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async leadsCaptain() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 2. POST /api/support/contact

**Strategy:** IMPLEMENT
**Reason:** Customer support endpoint
**File:** `bthwani-project-main/admin-dashboard/src/landing/pages/ContactPage.tsx`

**Suggested Implementation:** `src/modules/support/support.controller.ts`

**Code Template:**

```typescript
@Post('support/contact')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async supportContact() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 3. POST /api/leads/merchant

**Strategy:** IMPLEMENT
**Reason:** Lead generation - important for business
**File:** `bthwani-project-main/admin-dashboard/src/landing/pages/ForMerchantsPage.tsx`

**Suggested Implementation:** `src/modules/leads/leads.controller.ts`

**Code Template:**

```typescript
@Post('leads/merchant')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async leadsMerchant() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 4. POST /vendor

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/admin/AdminVendorCreatePage.tsx`

**Suggested Implementation:** `src/modules/vendor`

**Code Template:**

```typescript
@Post('/vendor')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Vendor() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 5. GET /delivery/banners/admin

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/delivery/DeliveryBannersPage.tsx`

**Suggested Implementation:** `src/modules/delivery`

**Code Template:**

```typescript
@Get('/delivery/banners/admin')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DeliveryBannersAdmin() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 6. GET /delivery/categories

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/delivery/DeliveryBannersPage.tsx`

**Suggested Implementation:** `src/modules/delivery`

**Code Template:**

```typescript
@Get('/delivery/categories')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DeliveryCategories() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 7. POST /delivery/categories/bulk-reorder

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/delivery/DeliveryCategoriesPage.tsx`

**Suggested Implementation:** `src/modules/delivery`

**Code Template:**

```typescript
@Post('/delivery/categories/bulk-reorder')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DeliveryCategoriesBulkreorder() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 8. POST /marketing/adspend/upload

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/marketing/AdSpendUpload.tsx`

**Suggested Implementation:** `src/modules/marketing`

**Code Template:**

```typescript
@Post('/marketing/adspend/upload')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async MarketingAdspendUpload() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 9. POST /segments/preview

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/marketing/Segments.tsx`

**Suggested Implementation:** `src/modules/segments`

**Code Template:**

```typescript
@Post('/segments/preview')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async SegmentsPreview() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 10. POST /segments/sync

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/marketing/Segments.tsx`

**Suggested Implementation:** `src/modules/segments`

**Code Template:**

```typescript
@Post('/segments/sync')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async SegmentsSync() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 11. GET /accounts/chart?onlyleaf=1

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/money/JournalEntries.tsx`

**Suggested Implementation:** `src/modules/accounts`

**Code Template:**

```typescript
@Get('/accounts/chart?onlyleaf=1')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AccountsChartonlyleaf1() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 12. GET /journal-entries

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/money/JournalEntries.tsx`

**Suggested Implementation:** `src/modules/journal-entries`

**Code Template:**

```typescript
@Get('/journal-entries')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Journalentries() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 13. GET /journal-entries

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/money/JournalEntries.tsx`

**Suggested Implementation:** `src/modules/journal-entries`

**Code Template:**

```typescript
@Get('/journal-entries')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Journalentries() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 14. POST /journal-entries

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/money/JournalEntries.tsx`

**Suggested Implementation:** `src/modules/journal-entries`

**Code Template:**

```typescript
@Post('/journal-entries')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Journalentries() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 15. GET /partners

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/parteners/PartnerDetails.tsx`

**Suggested Implementation:** `src/modules/partners`

**Code Template:**

```typescript
@Get('/partners')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Partners() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 16. POST /partners/upsert

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/parteners/PartnerDetails.tsx`

**Suggested Implementation:** `src/modules/partners`

**Code Template:**

```typescript
@Post('/partners/upsert')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async PartnersUpsert() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 17. GET /partners

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/parteners/PartnersList.tsx`

**Suggested Implementation:** `src/modules/partners`

**Code Template:**

```typescript
@Get('/partners')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async Partners() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 18. GET /support/reports/summary

**Strategy:** IMPLEMENT
**Reason:** Customer support endpoint
**File:** `bthwani-project-main/admin-dashboard/src/pages/support/Reports.tsx`

**Suggested Implementation:** `src/modules/support/support.controller.ts`

**Code Template:**

```typescript
@Get('/support/reports/summary')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async SupportReportsSummary() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 19. GET /accounts/chart

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/services/chartAccount.api.ts`

**Suggested Implementation:** `src/modules/accounts`

**Code Template:**

```typescript
@Get('/accounts/chart')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AccountsChart() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 20. GET /accounts/chart/tree

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/services/chartAccount.api.ts`

**Suggested Implementation:** `src/modules/accounts`

**Code Template:**

```typescript
@Get('/accounts/chart/tree')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AccountsChartTree() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 21. POST /accounts/chart

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/services/chartAccount.api.ts`

**Suggested Implementation:** `src/modules/accounts`

**Code Template:**

```typescript
@Post('/accounts/chart')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AccountsChart() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 22. POST /media/sign-upload

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/admin-dashboard/src/services/uploadService.ts`

**Suggested Implementation:** `src/modules/media`

**Code Template:**

```typescript
@Post('/media/sign-upload')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async MediaSignupload() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 23. GET /drivers/me

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/app/(driver)/locations.tsx`

**Suggested Implementation:** `src/modules/drivers`

**Code Template:**

```typescript
@Get('/drivers/me')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriversMe() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 24. POST /drivers/locations

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/app/(driver)/locations.tsx`

**Suggested Implementation:** `src/modules/drivers`

**Code Template:**

```typescript
@Post('/drivers/locations')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriversLocations() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 25. POST /driver/login

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/src/api/auth.ts`

**Suggested Implementation:** `src/modules/driver`

**Code Template:**

```typescript
@Post('/driver/login')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriverLogin() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 26. GET /drivers/withdrawals/my

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/src/api/driver.ts`

**Suggested Implementation:** `src/modules/drivers`

**Code Template:**

```typescript
@Get('/drivers/withdrawals/my')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriversWithdrawalsMy() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 27. GET /drivers/withdrawals/my

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/src/api/driver.ts`

**Suggested Implementation:** `src/modules/drivers`

**Code Template:**

```typescript
@Get('/drivers/withdrawals/my')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriversWithdrawalsMy() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 28. POST /drivers/withdrawals/request

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/src/api/driver.ts`

**Suggested Implementation:** `src/modules/drivers`

**Code Template:**

```typescript
@Post('/drivers/withdrawals/request')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriversWithdrawalsRequest() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 29. POST /drivers/withdrawals/request

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/src/api/driver.ts`

**Suggested Implementation:** `src/modules/drivers`

**Code Template:**

```typescript
@Post('/drivers/withdrawals/request')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async DriversWithdrawalsRequest() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 30. POST /rides/sos

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/rider-app/src/componant/triggerSOS.tsx`

**Suggested Implementation:** `src/modules/rides`

**Code Template:**

```typescript
@Post('/rides/sos')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async RidesSos() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 31. POST /vendor/auth/vendor-login

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/vendor-app/src/screens/LoginScreen.tsx`

**Suggested Implementation:** `src/modules/vendor`

**Code Template:**

```typescript
@Post('/vendor/auth/vendor-login')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async VendorAuthVendorlogin() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 32. POST /auth/forgot

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/auth.ts`

**Suggested Implementation:** `src/modules/auth`

**Code Template:**

```typescript
@Post('/auth/forgot')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AuthForgot() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 33. POST /auth/reset

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/auth.ts`

**Suggested Implementation:** `src/modules/auth`

**Code Template:**

```typescript
@Post('/auth/reset')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AuthReset() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 34. POST /auth/reset/verify

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/auth.ts`

**Suggested Implementation:** `src/modules/auth`

**Code Template:**

```typescript
@Post('/auth/reset/verify')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AuthResetVerify() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 35. POST /auth/verify-otp

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/auth.ts`

**Suggested Implementation:** `src/modules/auth`

**Code Template:**

```typescript
@Post('/auth/verify-otp')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async AuthVerifyotp() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 36. POST /notifications/register

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/notifications.ts`

**Suggested Implementation:** `src/modules/notifications`

**Code Template:**

```typescript
@Post('/notifications/register')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async NotificationsRegister() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 37. POST /payments/confirm

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/payments.ts`

**Suggested Implementation:** `src/modules/payments`

**Code Template:**

```typescript
@Post('/payments/confirm')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async PaymentsConfirm() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

### 38. POST /payments/create-session

**Strategy:** IMPLEMENT
**Reason:** Standard endpoint
**File:** `bthwani-project-main/bthwani-web/src/api/payments.ts`

**Suggested Implementation:** `src/modules/payments`

**Code Template:**

```typescript
@Post('/payments/create-session')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async PaymentsCreatesession() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}
```

---

## 🟢 Low Priority (1)

### 1. GET /api/content/latest

**Strategy:** MOCK
**Reason:** Service worker endpoint - can use mock data
**File:** `bthwani-project-main/admin-dashboard/public/sw.js`

---


## Action Plan

1. **High Priority** (40 items) - Implement first
2. **Medium Priority** (38 items) - Implement after high
3. **Low Priority** (1 items) - Mock or defer

Total implementation needed: 78

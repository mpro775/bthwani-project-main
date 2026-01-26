# Backend Endpoints Documentation Report - BTW-BE-006

**Generated:** 2025-10-18T15:08:24.689Z
**Total Undocumented:** 475

## Summary by Module

| Module | Count |
|--------|-------|
| admin | 72 |
| order | 32 |
| finance | 32 |
| analytics | 30 |
| cart | 27 |
| store | 25 |
| content | 25 |
| merchant | 23 |
| marketer | 23 |
| utility | 21 |
| er | 20 |
| wallet | 20 |
| driver | 15 |
| user | 14 |
| notification | 13 |
| vendor | 13 |
| legal | 12 |
| akhdimni | 9 |
| support | 9 |
| promotion | 8 |
| health | 8 |
| onboarding | 8 |
| auth | 7 |
| shift | 6 |
| metrics | 2 |
| unknown | 1 |

## Summary by HTTP Method

| Method | Count |
|--------|-------|
| DELETE | 24 |
| GET | 242 |
| PATCH | 76 |
| POST | 133 |

## Fixes by Module

### Module: admin (72 endpoints)

#### 1. GET /admin/audit-logs

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get audit-logs' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: Audit-logsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Audit-logsDto`

---

#### 2. GET /admin/audit-logs/:id

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get audit-logs' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Audit-logsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Audit-logsDto`

---

#### 3. GET /admin/backup/list

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get list' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: ListDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ListDto`

---

#### 4. GET /admin/backup/:id/download

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get download' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DownloadDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DownloadDto`

---

#### 5. GET /admin/cache/stats

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stats' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: StatsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatsDto`

---

#### 6. GET /admin/dashboard

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get dashboard' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: DashboardDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DashboardDto`

---

#### 7. GET /admin/dashboard/live-metrics

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get live-metrics' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: Live-metricsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Live-metricsDto`

---

#### 8. GET /admin/dashboard/orders-by-status

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders-by-status' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: Orders-by-statusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Orders-by-statusDto`

---

#### 9. GET /admin/dashboard/revenue

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get revenue' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: RevenueDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `RevenueDto`

---

#### 10. GET /admin/data-deletion/requests

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get requests' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: RequestsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `RequestsDto`

---

#### 11. GET /admin/database/stats

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stats' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: StatsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatsDto`

---

#### 12. GET /admin/drivers/attendance/summary

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get summary' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: SummaryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SummaryDto`

---

#### 13. GET /admin/drivers/leave-requests

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get leave-requests' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: Leave-requestsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Leave-requestsDto`

---

#### 14. GET /admin/drivers/stats/by-status

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get by-status' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: By-statusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `By-statusDto`

---

#### 15. GET /admin/drivers/:id

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get drivers' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DriversDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DriversDto`

---

#### 16. GET /admin/drivers/:id/attendance

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get attendance' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: AttendanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AttendanceDto`

---

#### 17. GET /admin/drivers/:id/financials

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get financials' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: FinancialsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `FinancialsDto`

---

#### 18. GET /admin/drivers/:id/leave-balance

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get leave-balance' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Leave-balanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Leave-balanceDto`

---

#### 19. GET /admin/drivers/:id/performance

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get performance' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PerformanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PerformanceDto`

---

#### 20. GET /admin/marketers

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get marketers' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: MarketersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MarketersDto`

---

#### 21. GET /admin/marketers/export

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get export' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: ExportDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ExportDto`

---

#### 22. GET /admin/marketers/statistics

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statistics' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: StatisticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatisticsDto`

---

#### 23. GET /admin/marketers/:id

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get marketers' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: MarketersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MarketersDto`

---

#### 24. GET /admin/marketers/:id/performance

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get performance' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PerformanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PerformanceDto`

---

#### 25. GET /admin/marketers/:id/stores

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stores' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: StoresDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StoresDto`

---

#### 26. GET /admin/orders/stats/by-city

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get by-city' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: By-cityDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `By-cityDto`

---

#### 27. GET /admin/orders/stats/by-payment-method

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get by-payment-method' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: By-payment-methodDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `By-payment-methodDto`

---

#### 28. GET /admin/quality/metrics

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get metrics' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: MetricsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MetricsDto`

---

#### 29. GET /admin/reports/daily

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get daily' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: DailyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 30. GET /admin/roles

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get roles' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: RolesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `RolesDto`

---

#### 31. GET /admin/security/password-attempts

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get password-attempts' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: Password-attemptsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Password-attemptsDto`

---

#### 32. GET /admin/settings

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get settings' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: SettingsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SettingsDto`

---

#### 33. GET /admin/settings/feature-flags

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get feature-flags' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: Feature-flagsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Feature-flagsDto`

---

#### 34. GET /admin/stats/financial

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get financial' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: FinancialDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `FinancialDto`

---

#### 35. GET /admin/stats/today

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get today' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: TodayDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TodayDto`

---

#### 36. GET /admin/system/health

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get health' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: HealthDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `HealthDto`

---

#### 37. GET /admin/system/metrics

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get metrics' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: MetricsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MetricsDto`

---

#### 38. GET /admin/users

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get users' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: UsersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UsersDto`

---

#### 39. GET /admin/users/:id

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get users' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: UsersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UsersDto`

---

#### 40. GET /admin/users/:id/orders-history

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders-history' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Orders-historyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Orders-historyDto`

---

#### 41. GET /admin/vendors/pending

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pending' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: PendingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PendingDto`

---

#### 42. GET /admin/withdrawals

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get withdrawals' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: WithdrawalsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `WithdrawalsDto`

---

#### 43. GET /admin/withdrawals/pending

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pending' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Success', type: PendingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PendingDto`

---

#### 44. PATCH /admin/data-deletion/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 45. PATCH /admin/data-deletion/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update reject' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRejectDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRejectDto`
- `RejectDto`

---

#### 46. PATCH /admin/drivers/leave-requests/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 47. PATCH /admin/drivers/leave-requests/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update reject' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRejectDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRejectDto`
- `RejectDto`

---

#### 48. PATCH /admin/drivers/:id/adjust-balance

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update adjust-balance' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateAdjust-balanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateAdjust-balanceDto`
- `Adjust-balanceDto`

---

#### 49. PATCH /admin/drivers/:id/leave-balance/adjust

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update adjust' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateAdjustDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateAdjustDto`
- `AdjustDto`

---

#### 50. PATCH /admin/marketers/:id

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update marketers' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateMarketersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateMarketersDto`
- `MarketersDto`

---

#### 51. PATCH /admin/roles/:id

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update roles' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRolesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRolesDto`
- `RolesDto`

---

#### 52. PATCH /admin/settings

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update settings' })
@ApiTags('admin')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateSettingsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateSettingsDto`
- `SettingsDto`

---

#### 53. PATCH /admin/settings/feature-flags/:flag

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update feature-flags' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateFeature-flagsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateFeature-flagsDto`
- `Feature-flagsDto`

---

#### 54. PATCH /admin/withdrawals/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 55. PATCH /admin/withdrawals/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update reject' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRejectDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRejectDto`
- `RejectDto`

---

#### 56. POST /admin/backup/create

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create create' })
@ApiTags('admin')
@ApiResponse({ status: 201, description: 'Created', type: CreateCreateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCreateDto`
- `CreateDto`

---

#### 57. POST /admin/backup/:id/restore

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create restore' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRestoreDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRestoreDto`
- `RestoreDto`

---

#### 58. POST /admin/cache/clear

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create clear' })
@ApiTags('admin')
@ApiResponse({ status: 201, description: 'Created', type: CreateClearDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateClearDto`
- `ClearDto`

---

#### 59. POST /admin/drivers/:id/attendance/adjust

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create adjust' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAdjustDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAdjustDto`
- `AdjustDto`

---

#### 60. POST /admin/drivers/:id/ban

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create ban' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateBanDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateBanDto`
- `BanDto`

---

#### 61. POST /admin/drivers/:id/unban

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create unban' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateUnbanDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateUnbanDto`
- `UnbanDto`

---

#### 62. POST /admin/marketers

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create marketers' })
@ApiTags('admin')
@ApiResponse({ status: 201, description: 'Created', type: CreateMarketersDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateMarketersDto`
- `MarketersDto`

---

#### 63. POST /admin/marketers/:id/activate

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create activate' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateActivateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateActivateDto`
- `ActivateDto`

---

#### 64. POST /admin/marketers/:id/deactivate

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create deactivate' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateDeactivateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateDeactivateDto`
- `DeactivateDto`

---

#### 65. POST /admin/roles

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create roles' })
@ApiTags('admin')
@ApiResponse({ status: 201, description: 'Created', type: CreateRolesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRolesDto`
- `RolesDto`

---

#### 66. POST /admin/security/reset-password/:userId

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create reset-password' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateReset-passwordDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateReset-passwordDto`
- `Reset-passwordDto`

---

#### 67. POST /admin/security/unlock-account/:userId

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create unlock-account' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateUnlock-accountDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateUnlock-accountDto`
- `Unlock-accountDto`

---

#### 68. POST /admin/users/:id/ban

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create ban' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateBanDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateBanDto`
- `BanDto`

---

#### 69. POST /admin/users/:id/unban

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create unban' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateUnbanDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateUnbanDto`
- `UnbanDto`

---

#### 70. POST /admin/vendors/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create approve' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateApproveDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateApproveDto`
- `ApproveDto`

---

#### 71. POST /admin/vendors/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create reject' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRejectDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRejectDto`
- `RejectDto`

---

#### 72. POST /admin/vendors/:id/suspend

**File:** `bthwani-project-main/backend-nest/src/modules/admin/admin.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create suspend' })
@ApiTags('admin')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateSuspendDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSuspendDto`
- `SuspendDto`

---

### Module: order (32 endpoints)

#### 1. GET /delivery/order/export

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get export' })
@ApiTags('order')
@ApiResponse({ status: 200, description: 'Success', type: ExportDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ExportDto`

---

#### 2. GET /delivery/order/my-orders

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my-orders' })
@ApiTags('order')
@ApiResponse({ status: 200, description: 'Success', type: My-ordersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `My-ordersDto`

---

#### 3. GET /delivery/order/public/:id/status

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get status' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: StatusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatusDto`

---

#### 4. GET /delivery/order/user/:userId

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get user' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: UserDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UserDto`

---

#### 5. GET /delivery/order/vendor/orders

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders' })
@ApiTags('order')
@ApiResponse({ status: 200, description: 'Success', type: OrdersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OrdersDto`

---

#### 6. GET /delivery/order/:id

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get order' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: OrderDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OrderDto`

---

#### 7. GET /delivery/order/:id/delivery-timeline

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get delivery-timeline' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Delivery-timelineDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Delivery-timelineDto`

---

#### 8. GET /delivery/order/:id/driver-eta

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get driver-eta' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Driver-etaDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Driver-etaDto`

---

#### 9. GET /delivery/order/:id/live-tracking

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get live-tracking' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Live-trackingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Live-trackingDto`

---

#### 10. GET /delivery/order/:id/notes

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get notes' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: NotesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `NotesDto`

---

#### 11. GET /delivery/order/:id/pod

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pod' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PodDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PodDto`

---

#### 12. GET /delivery/order/:id/route-history

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get route-history' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Route-historyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Route-historyDto`

---

#### 13. GET /delivery/order/:id/tracking

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get tracking' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: TrackingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TrackingDto`

---

#### 14. GET /orders-cqrs

**File:** `bthwani-project-main/backend-nest/src/modules/order/order-cqrs.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders-cqrs' })
@ApiTags('order')
@ApiResponse({ status: 200, description: 'Success', type: Orders-cqrsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Orders-cqrsDto`

---

#### 15. GET /orders-cqrs/:id

**File:** `bthwani-project-main/backend-nest/src/modules/order/order-cqrs.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders-cqrs' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: Orders-cqrsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Orders-cqrsDto`

---

#### 16. PATCH /delivery/order/:id/admin-status

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update admin-status' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateAdmin-statusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateAdmin-statusDto`
- `Admin-statusDto`

---

#### 17. PATCH /orders-cqrs/:id/status

**File:** `bthwani-project-main/backend-nest/src/modules/order/order-cqrs.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update status' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateStatusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateStatusDto`
- `StatusDto`

---

#### 18. POST /delivery/order

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create order' })
@ApiTags('order')
@ApiResponse({ status: 201, description: 'Created', type: CreateOrderDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateOrderDto`
- `OrderDto`

---

#### 19. POST /delivery/order/:id/assign-driver

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create assign-driver' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAssign-driverDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAssign-driverDto`
- `Assign-driverDto`

---

#### 20. POST /delivery/order/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create cancel' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateCancelDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCancelDto`
- `CancelDto`

---

#### 21. POST /delivery/order/:id/notes

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create notes' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateNotesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateNotesDto`
- `NotesDto`

---

#### 22. POST /delivery/order/:id/pod

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create pod' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreatePodDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreatePodDto`
- `PodDto`

---

#### 23. POST /delivery/order/:id/rate

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create rate' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRateDto`
- `RateDto`

---

#### 24. POST /delivery/order/:id/repeat

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create repeat' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRepeatDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRepeatDto`
- `RepeatDto`

---

#### 25. POST /delivery/order/:id/return

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create return' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateReturnDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateReturnDto`
- `ReturnDto`

---

#### 26. POST /delivery/order/:id/schedule

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create schedule' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateScheduleDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateScheduleDto`
- `ScheduleDto`

---

#### 27. POST /delivery/order/:id/update-location

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create update-location' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateUpdate-locationDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateUpdate-locationDto`
- `Update-locationDto`

---

#### 28. POST /delivery/order/:id/vendor-accept

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create vendor-accept' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateVendor-acceptDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVendor-acceptDto`
- `Vendor-acceptDto`

---

#### 29. POST /delivery/order/:id/vendor-cancel

**File:** `bthwani-project-main/backend-nest/src/modules/order/order.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create vendor-cancel' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateVendor-cancelDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVendor-cancelDto`
- `Vendor-cancelDto`

---

#### 30. POST /orders-cqrs

**File:** `bthwani-project-main/backend-nest/src/modules/order/order-cqrs.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create orders-cqrs' })
@ApiTags('order')
@ApiResponse({ status: 201, description: 'Created', type: CreateOrders-cqrsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateOrders-cqrsDto`
- `Orders-cqrsDto`

---

#### 31. POST /orders-cqrs/:id/assign-driver

**File:** `bthwani-project-main/backend-nest/src/modules/order/order-cqrs.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create assign-driver' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAssign-driverDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAssign-driverDto`
- `Assign-driverDto`

---

#### 32. POST /orders-cqrs/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/order/order-cqrs.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create cancel' })
@ApiTags('order')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateCancelDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCancelDto`
- `CancelDto`

---

### Module: finance (32 endpoints)

#### 1. GET /finance/commission-plans

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get commission-plans' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: Commission-plansDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Commission-plansDto`

---

#### 2. GET /finance/commissions/my

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 3. GET /finance/commissions/stats/my

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 4. GET /finance/coupons

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get coupons' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: CouponsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CouponsDto`

---

#### 5. GET /finance/payouts/batches

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get batches' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: BatchesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BatchesDto`

---

#### 6. GET /finance/payouts/batches/:id

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get batches' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: BatchesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BatchesDto`

---

#### 7. GET /finance/payouts/batches/:id/items

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get items' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ItemsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ItemsDto`

---

#### 8. GET /finance/reconciliations

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get reconciliations' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: ReconciliationsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ReconciliationsDto`

---

#### 9. GET /finance/reconciliations/:id

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get reconciliations' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ReconciliationsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ReconciliationsDto`

---

#### 10. GET /finance/reports

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get reports' })
@ApiTags('finance')
@ApiResponse({ status: 200, description: 'Success', type: ReportsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ReportsDto`

---

#### 11. GET /finance/reports/daily/:date

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get daily' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DailyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 12. GET /finance/settlements/entity/:entityId

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get entity' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: EntityDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `EntityDto`

---

#### 13. GET /finance/settlements/:id

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get settlements' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: SettlementsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SettlementsDto`

---

#### 14. PATCH /finance/commission-plans/:id

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update commission-plans' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCommission-plansDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCommission-plansDto`
- `Commission-plansDto`

---

#### 15. PATCH /finance/commissions/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 16. PATCH /finance/commissions/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cancel' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCancelDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCancelDto`
- `CancelDto`

---

#### 17. PATCH /finance/coupons/:id

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update coupons' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCouponsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCouponsDto`
- `CouponsDto`

---

#### 18. PATCH /finance/payouts/batches/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 19. PATCH /finance/payouts/batches/:id/complete

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update complete' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCompleteDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCompleteDto`
- `CompleteDto`

---

#### 20. PATCH /finance/reconciliations/:id/actual-totals

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update actual-totals' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateActual-totalsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateActual-totalsDto`
- `Actual-totalsDto`

---

#### 21. PATCH /finance/reconciliations/:id/issues/:issueIndex/resolve

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update resolve' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateResolveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateResolveDto`
- `ResolveDto`

---

#### 22. PATCH /finance/reports/:id/finalize

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update finalize' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateFinalizeDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateFinalizeDto`
- `FinalizeDto`

---

#### 23. PATCH /finance/settlements/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 24. POST /finance/commission-plans

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create commission-plans' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateCommission-plansDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCommission-plansDto`
- `Commission-plansDto`

---

#### 25. POST /finance/commissions

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create commissions' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateCommissionsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCommissionsDto`
- `CommissionsDto`

---

#### 26. POST /finance/coupons

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create coupons' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateCouponsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCouponsDto`
- `CouponsDto`

---

#### 27. POST /finance/coupons/validate

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create validate' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateValidateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateValidateDto`
- `ValidateDto`

---

#### 28. POST /finance/payouts/batches

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create batches' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateBatchesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateBatchesDto`
- `BatchesDto`

---

#### 29. POST /finance/reconciliations

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create reconciliations' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateReconciliationsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateReconciliationsDto`
- `ReconciliationsDto`

---

#### 30. POST /finance/reconciliations/:id/issues

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create issues' })
@ApiTags('finance')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateIssuesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateIssuesDto`
- `IssuesDto`

---

#### 31. POST /finance/reports/daily

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create daily' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateDailyDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateDailyDto`
- `DailyDto`

---

#### 32. POST /finance/settlements

**File:** `bthwani-project-main/backend-nest/src/modules/finance/finance.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create settlements' })
@ApiTags('finance')
@ApiResponse({ status: 201, description: 'Created', type: CreateSettlementsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSettlementsDto`
- `SettlementsDto`

---

### Module: analytics (30 endpoints)

#### 1. GET /analytics/adspend

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get adspend' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: AdspendDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AdspendDto`

---

#### 2. GET /analytics/adspend/summary

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get summary' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: SummaryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SummaryDto`

---

#### 3. GET /analytics/advanced/churn-rate

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get churn-rate' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Churn-rateDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Churn-rateDto`

---

#### 4. GET /analytics/advanced/cohort-analysis-advanced

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get cohort-analysis-advanced' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Cohort-analysis-advancedDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Cohort-analysis-advancedDto`

---

#### 5. GET /analytics/advanced/dashboard-overview

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get dashboard-overview' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Dashboard-overviewDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Dashboard-overviewDto`

---

#### 6. GET /analytics/advanced/driver-performance

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get driver-performance' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Driver-performanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Driver-performanceDto`

---

#### 7. GET /analytics/advanced/funnel-analysis

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get funnel-analysis' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Funnel-analysisDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Funnel-analysisDto`

---

#### 8. GET /analytics/advanced/geographic-distribution

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get geographic-distribution' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Geographic-distributionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Geographic-distributionDto`

---

#### 9. GET /analytics/advanced/ltv

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get ltv' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: LtvDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `LtvDto`

---

#### 10. GET /analytics/advanced/peak-hours

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get peak-hours' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Peak-hoursDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Peak-hoursDto`

---

#### 11. GET /analytics/advanced/product-performance

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get product-performance' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Product-performanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Product-performanceDto`

---

#### 12. GET /analytics/advanced/retention

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get retention' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: RetentionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `RetentionDto`

---

#### 13. GET /analytics/events

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get events' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: EventsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `EventsDto`

---

#### 14. GET /analytics/events/summary

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get summary' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: SummaryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SummaryDto`

---

#### 15. GET /analytics/funnel/conversion

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get conversion' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: ConversionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ConversionDto`

---

#### 16. GET /analytics/funnel/drop-off

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get drop-off' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Drop-offDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Drop-offDto`

---

#### 17. GET /analytics/kpis

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get kpis' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: KpisDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `KpisDto`

---

#### 18. GET /analytics/kpis/real-time

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get real-time' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: Real-timeDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Real-timeDto`

---

#### 19. GET /analytics/kpis/trends

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get trends' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: TrendsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TrendsDto`

---

#### 20. GET /analytics/revenue/breakdown

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get breakdown' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: BreakdownDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BreakdownDto`

---

#### 21. GET /analytics/revenue/forecast

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get forecast' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: ForecastDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ForecastDto`

---

#### 22. GET /analytics/roas/by-platform

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get by-platform' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: By-platformDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `By-platformDto`

---

#### 23. GET /analytics/roas/daily

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get daily' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: DailyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 24. GET /analytics/roas/summary

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get summary' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: SummaryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SummaryDto`

---

#### 25. GET /analytics/users/cohort

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get cohort' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: CohortDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CohortDto`

---

#### 26. GET /analytics/users/growth

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get growth' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: GrowthDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `GrowthDto`

---

#### 27. GET /analytics/users/retention

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get retention' })
@ApiTags('analytics')
@ApiResponse({ status: 200, description: 'Success', type: RetentionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `RetentionDto`

---

#### 28. POST /analytics/adspend

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create adspend' })
@ApiTags('analytics')
@ApiResponse({ status: 201, description: 'Created', type: CreateAdspendDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAdspendDto`
- `AdspendDto`

---

#### 29. POST /analytics/events/track

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create track' })
@ApiTags('analytics')
@ApiResponse({ status: 201, description: 'Created', type: CreateTrackDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateTrackDto`
- `TrackDto`

---

#### 30. POST /analytics/roas/calculate

**File:** `bthwani-project-main/backend-nest/src/modules/analytics/analytics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create calculate' })
@ApiTags('analytics')
@ApiResponse({ status: 201, description: 'Created', type: CreateCalculateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCalculateDto`
- `CalculateDto`

---

### Module: cart (27 endpoints)

#### 1. DELETE /delivery/cart

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete cart' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CartDto`

---

#### 2. DELETE /delivery/cart/combined/clear-all

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete clear-all' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Clear-allDto`

---

#### 3. DELETE /delivery/cart/items/:productId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete items' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ItemsDto`

---

#### 4. DELETE /delivery/cart/shein

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete shein' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SheinDto`

---

#### 5. DELETE /delivery/cart/shein/items/:sheinProductId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete items' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ItemsDto`

---

#### 6. DELETE /delivery/cart/:productId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete cart' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CartDto`

---

#### 7. DELETE /delivery/cart/:cartId/items/:productId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete items' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ItemsDto`

---

#### 8. GET /delivery/cart

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get cart' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Success', type: CartDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CartDto`

---

#### 9. GET /delivery/cart/abandoned

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get abandoned' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Success', type: AbandonedDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AbandonedDto`

---

#### 10. GET /delivery/cart/combined

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get combined' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Success', type: CombinedDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CombinedDto`

---

#### 11. GET /delivery/cart/count

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get count' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Success', type: CountDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CountDto`

---

#### 12. GET /delivery/cart/fee

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get fee' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Success', type: FeeDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `FeeDto`

---

#### 13. GET /delivery/cart/shein

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get shein' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Success', type: SheinDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SheinDto`

---

#### 14. GET /delivery/cart/user/:userId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get user' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: UserDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UserDto`

---

#### 15. GET /delivery/cart/:cartId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get cart' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: CartDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CartDto`

---

#### 16. PATCH /delivery/cart/delivery-address

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update delivery-address' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateDelivery-addressDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateDelivery-addressDto`
- `Delivery-addressDto`

---

#### 17. PATCH /delivery/cart/items/:productId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update items' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateItemsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateItemsDto`
- `ItemsDto`

---

#### 18. PATCH /delivery/cart/note

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update note' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateNoteDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateNoteDto`
- `NoteDto`

---

#### 19. PATCH /delivery/cart/shein/items/:sheinProductId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update items' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateItemsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateItemsDto`
- `ItemsDto`

---

#### 20. PATCH /delivery/cart/shein/note

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update note' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateNoteDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateNoteDto`
- `NoteDto`

---

#### 21. PATCH /delivery/cart/shein/shipping

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update shipping' })
@ApiTags('cart')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateShippingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateShippingDto`
- `ShippingDto`

---

#### 22. PATCH /delivery/cart/:productId

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cart' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCartDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCartDto`
- `CartDto`

---

#### 23. POST /delivery/cart/add

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create add' })
@ApiTags('cart')
@ApiResponse({ status: 201, description: 'Created', type: CreateAddDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAddDto`
- `AddDto`

---

#### 24. POST /delivery/cart/items

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create items' })
@ApiTags('cart')
@ApiResponse({ status: 201, description: 'Created', type: CreateItemsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateItemsDto`
- `ItemsDto`

---

#### 25. POST /delivery/cart/merge

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create merge' })
@ApiTags('cart')
@ApiResponse({ status: 201, description: 'Created', type: CreateMergeDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateMergeDto`
- `MergeDto`

---

#### 26. POST /delivery/cart/shein/items

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create items' })
@ApiTags('cart')
@ApiResponse({ status: 201, description: 'Created', type: CreateItemsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateItemsDto`
- `ItemsDto`

---

#### 27. POST /delivery/cart/:cartId/retarget/push

**File:** `bthwani-project-main/backend-nest/src/modules/cart/cart.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create push' })
@ApiTags('cart')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreatePushDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreatePushDto`
- `PushDto`

---

### Module: store (25 endpoints)

#### 1. DELETE /admin/stores/:id

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete stores' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StoresDto`

---

#### 2. GET /admin/stores

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stores' })
@ApiTags('store')
@ApiResponse({ status: 200, description: 'Success', type: StoresDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StoresDto`

---

#### 3. GET /admin/stores/pending

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pending' })
@ApiTags('store')
@ApiResponse({ status: 200, description: 'Success', type: PendingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PendingDto`

---

#### 4. GET /admin/stores/products/:id/variants

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get variants' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: VariantsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `VariantsDto`

---

#### 5. GET /admin/stores/:id

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stores' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: StoresDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StoresDto`

---

#### 6. GET /admin/stores/:id/analytics

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get analytics' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: AnalyticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AnalyticsDto`

---

#### 7. GET /admin/stores/:id/inventory

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get inventory' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: InventoryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `InventoryDto`

---

#### 8. GET /admin/stores/:id/products

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 9. GET /delivery/stores/search

**File:** `bthwani-project-main/backend-nest/src/modules/store/delivery-store.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get search' })
@ApiTags('store')
@ApiResponse({ status: 200, description: 'Success', type: SearchDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SearchDto`

---

#### 10. GET /delivery/stores/:id

**File:** `bthwani-project-main/backend-nest/src/modules/store/delivery-store.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stores' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: StoresDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StoresDto`

---

#### 11. GET /delivery/stores/:id/products

**File:** `bthwani-project-main/backend-nest/src/modules/store/delivery-store.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 12. GET /delivery/stores/:id/reviews

**File:** `bthwani-project-main/backend-nest/src/modules/store/delivery-store.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get reviews' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ReviewsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ReviewsDto`

---

#### 13. GET /delivery/stores/:id/statistics

**File:** `bthwani-project-main/backend-nest/src/modules/store/delivery-store.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statistics' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: StatisticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatisticsDto`

---

#### 14. PATCH /admin/stores/products/:id

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update products' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateProductsDto`
- `ProductsDto`

---

#### 15. PATCH /admin/stores/:id

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update stores' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateStoresDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateStoresDto`
- `StoresDto`

---

#### 16. POST /admin/stores

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create stores' })
@ApiTags('store')
@ApiResponse({ status: 201, description: 'Created', type: CreateStoresDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateStoresDto`
- `StoresDto`

---

#### 17. POST /admin/stores/products

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create products' })
@ApiTags('store')
@ApiResponse({ status: 201, description: 'Created', type: CreateProductsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateProductsDto`
- `ProductsDto`

---

#### 18. POST /admin/stores/products/:id/variants

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create variants' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateVariantsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVariantsDto`
- `VariantsDto`

---

#### 19. POST /admin/stores/:id/activate

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create activate' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateActivateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateActivateDto`
- `ActivateDto`

---

#### 20. POST /admin/stores/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create approve' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateApproveDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateApproveDto`
- `ApproveDto`

---

#### 21. POST /admin/stores/:id/deactivate

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create deactivate' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateDeactivateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateDeactivateDto`
- `DeactivateDto`

---

#### 22. POST /admin/stores/:id/force-close

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create force-close' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateForce-closeDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateForce-closeDto`
- `Force-closeDto`

---

#### 23. POST /admin/stores/:id/force-open

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create force-open' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateForce-openDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateForce-openDto`
- `Force-openDto`

---

#### 24. POST /admin/stores/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create reject' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRejectDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRejectDto`
- `RejectDto`

---

#### 25. POST /admin/stores/:id/suspend

**File:** `bthwani-project-main/backend-nest/src/modules/store/store.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create suspend' })
@ApiTags('store')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateSuspendDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSuspendDto`
- `SuspendDto`

---

### Module: content (25 endpoints)

#### 1. DELETE /content/admin/faqs/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete faqs' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `FaqsDto`

---

#### 2. DELETE /content/banners/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete banners' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BannersDto`

---

#### 3. DELETE /content/sections/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete sections' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SectionsDto`

---

#### 4. GET /content/admin/banners

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get banners' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: BannersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BannersDto`

---

#### 5. GET /content/app-settings

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get app-settings' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: App-settingsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `App-settingsDto`

---

#### 6. GET /content/banners

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get banners' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: BannersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BannersDto`

---

#### 7. GET /content/faqs

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get faqs' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: FaqsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `FaqsDto`

---

#### 8. GET /content/my-subscription

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my-subscription' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: My-subscriptionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `My-subscriptionDto`

---

#### 9. GET /content/pages

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pages' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: PagesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PagesDto`

---

#### 10. GET /content/pages/:slug

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pages' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PagesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PagesDto`

---

#### 11. GET /content/stores/:storeId/sections

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get sections' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: SectionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SectionsDto`

---

#### 12. GET /content/subscription-plans

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get subscription-plans' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Success', type: Subscription-plansDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Subscription-plansDto`

---

#### 13. PATCH /content/admin/app-settings

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update app-settings' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApp-settingsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApp-settingsDto`
- `App-settingsDto`

---

#### 14. PATCH /content/admin/faqs/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update faqs' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateFaqsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateFaqsDto`
- `FaqsDto`

---

#### 15. PATCH /content/admin/pages/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update pages' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdatePagesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdatePagesDto`
- `PagesDto`

---

#### 16. PATCH /content/banners/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update banners' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateBannersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateBannersDto`
- `BannersDto`

---

#### 17. PATCH /content/my-subscription/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cancel' })
@ApiTags('content')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCancelDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCancelDto`
- `CancelDto`

---

#### 18. PATCH /content/sections/:id

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update sections' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateSectionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateSectionsDto`
- `SectionsDto`

---

#### 19. POST /content/admin/faqs

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create faqs' })
@ApiTags('content')
@ApiResponse({ status: 201, description: 'Created', type: CreateFaqsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateFaqsDto`
- `FaqsDto`

---

#### 20. POST /content/admin/pages

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create pages' })
@ApiTags('content')
@ApiResponse({ status: 201, description: 'Created', type: CreatePagesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreatePagesDto`
- `PagesDto`

---

#### 21. POST /content/banners

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create banners' })
@ApiTags('content')
@ApiResponse({ status: 201, description: 'Created', type: CreateBannersDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateBannersDto`
- `BannersDto`

---

#### 22. POST /content/banners/:id/click

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create click' })
@ApiTags('content')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateClickDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateClickDto`
- `ClickDto`

---

#### 23. POST /content/sections

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create sections' })
@ApiTags('content')
@ApiResponse({ status: 201, description: 'Created', type: CreateSectionsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSectionsDto`
- `SectionsDto`

---

#### 24. POST /content/subscribe

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create subscribe' })
@ApiTags('content')
@ApiResponse({ status: 201, description: 'Created', type: CreateSubscribeDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSubscribeDto`
- `SubscribeDto`

---

#### 25. POST /content/subscription-plans

**File:** `bthwani-project-main/backend-nest/src/modules/content/content.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create subscription-plans' })
@ApiTags('content')
@ApiResponse({ status: 201, description: 'Created', type: CreateSubscription-plansDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSubscription-plansDto`
- `Subscription-plansDto`

---

### Module: merchant (23 endpoints)

#### 1. DELETE /merchant/products/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 2. DELETE /merchant/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete merchant' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MerchantDto`

---

#### 3. GET /merchant

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get merchant' })
@ApiTags('merchant')
@ApiResponse({ status: 200, description: 'Success', type: MerchantDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MerchantDto`

---

#### 4. GET /merchant/attributes

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get attributes' })
@ApiTags('merchant')
@ApiResponse({ status: 200, description: 'Success', type: AttributesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AttributesDto`

---

#### 5. GET /merchant/catalog/products

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('merchant')
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 6. GET /merchant/catalog/products/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 7. GET /merchant/categories

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get categories' })
@ApiTags('merchant')
@ApiResponse({ status: 200, description: 'Success', type: CategoriesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CategoriesDto`

---

#### 8. GET /merchant/products

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('merchant')
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 9. GET /merchant/products/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 10. GET /merchant/stores/:storeId/products

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 11. GET /merchant/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get merchant' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: MerchantDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MerchantDto`

---

#### 12. GET /merchant/:merchantId/products

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProductsDto`

---

#### 13. PATCH /merchant/attributes/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update attributes' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateAttributesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateAttributesDto`
- `AttributesDto`

---

#### 14. PATCH /merchant/catalog/products/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateProductsDto`
- `ProductsDto`

---

#### 15. PATCH /merchant/categories/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update categories' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCategoriesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCategoriesDto`
- `CategoriesDto`

---

#### 16. PATCH /merchant/products/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update products' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateProductsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateProductsDto`
- `ProductsDto`

---

#### 17. PATCH /merchant/products/:id/stock

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update stock' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateStockDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateStockDto`
- `StockDto`

---

#### 18. PATCH /merchant/:id

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update merchant' })
@ApiTags('merchant')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateMerchantDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateMerchantDto`
- `MerchantDto`

---

#### 19. POST /merchant

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create merchant' })
@ApiTags('merchant')
@ApiResponse({ status: 201, description: 'Created', type: CreateMerchantDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateMerchantDto`
- `MerchantDto`

---

#### 20. POST /merchant/attributes

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create attributes' })
@ApiTags('merchant')
@ApiResponse({ status: 201, description: 'Created', type: CreateAttributesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAttributesDto`
- `AttributesDto`

---

#### 21. POST /merchant/catalog/products

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create products' })
@ApiTags('merchant')
@ApiResponse({ status: 201, description: 'Created', type: CreateProductsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateProductsDto`
- `ProductsDto`

---

#### 22. POST /merchant/categories

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create categories' })
@ApiTags('merchant')
@ApiResponse({ status: 201, description: 'Created', type: CreateCategoriesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCategoriesDto`
- `CategoriesDto`

---

#### 23. POST /merchant/products

**File:** `bthwani-project-main/backend-nest/src/modules/merchant/merchant.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create products' })
@ApiTags('merchant')
@ApiResponse({ status: 201, description: 'Created', type: CreateProductsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateProductsDto`
- `ProductsDto`

---

### Module: marketer (23 endpoints)

#### 1. GET /marketer/commissions/my

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 2. GET /marketer/commissions/pending

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pending' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: PendingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PendingDto`

---

#### 3. GET /marketer/commissions/statistics

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statistics' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: StatisticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatisticsDto`

---

#### 4. GET /marketer/earnings

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get earnings' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: EarningsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `EarningsDto`

---

#### 5. GET /marketer/earnings/breakdown

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get breakdown' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: BreakdownDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BreakdownDto`

---

#### 6. GET /marketer/files

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get files' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: FilesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `FilesDto`

---

#### 7. GET /marketer/notifications

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get notifications' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: NotificationsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `NotificationsDto`

---

#### 8. GET /marketer/overview

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get overview' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: OverviewDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OverviewDto`

---

#### 9. GET /marketer/profile

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get profile' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: ProfileDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ProfileDto`

---

#### 10. GET /marketer/referrals/my

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 11. GET /marketer/referrals/statistics

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statistics' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: StatisticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatisticsDto`

---

#### 12. GET /marketer/statistics/month

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get month' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: MonthDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MonthDto`

---

#### 13. GET /marketer/statistics/today

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get today' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: TodayDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TodayDto`

---

#### 14. GET /marketer/stores/my

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 15. GET /marketer/stores/:id

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stores' })
@ApiTags('marketer')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: StoresDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StoresDto`

---

#### 16. GET /marketer/stores/:id/performance

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get performance' })
@ApiTags('marketer')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PerformanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PerformanceDto`

---

#### 17. GET /marketer/territory/stats

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stats' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: StatsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatsDto`

---

#### 18. GET /marketer/vendors/my

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 19. GET /marketer/vendors/:id

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get vendors' })
@ApiTags('marketer')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: VendorsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `VendorsDto`

---

#### 20. PATCH /marketer/notifications/:id/read

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update read' })
@ApiTags('marketer')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateReadDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateReadDto`
- `ReadDto`

---

#### 21. PATCH /marketer/profile

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update profile' })
@ApiTags('marketer')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateProfileDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateProfileDto`
- `ProfileDto`

---

#### 22. POST /marketer/files/upload

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create upload' })
@ApiTags('marketer')
@ApiResponse({ status: 201, description: 'Created', type: CreateUploadDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateUploadDto`
- `UploadDto`

---

#### 23. POST /marketer/referrals/generate-code

**File:** `bthwani-project-main/backend-nest/src/modules/marketer/marketer.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create generate-code' })
@ApiTags('marketer')
@ApiResponse({ status: 201, description: 'Created', type: CreateGenerate-codeDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateGenerate-codeDto`
- `Generate-codeDto`

---

### Module: utility (21 endpoints)

#### 1. DELETE /utility/daily

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete daily' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 2. DELETE /utility/daily/:id

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete daily' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 3. DELETE /utility/pricing/:city

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete pricing' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PricingDto`

---

#### 4. GET /utility/admin/orders

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Success', type: OrdersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OrdersDto`

---

#### 5. GET /utility/daily

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get daily' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Success', type: DailyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 6. GET /utility/options

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get options' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Success', type: OptionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OptionsDto`

---

#### 7. GET /utility/order/:id

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get order' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: OrderDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OrderDto`

---

#### 8. GET /utility/orders

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get orders' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Success', type: OrdersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OrdersDto`

---

#### 9. GET /utility/pricing

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pricing' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Success', type: PricingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PricingDto`

---

#### 10. GET /utility/pricing/:city

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get pricing' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PricingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PricingDto`

---

#### 11. PATCH /utility/options/gas

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update gas' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateGasDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateGasDto`
- `GasDto`

---

#### 12. PATCH /utility/options/water

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update water' })
@ApiTags('utility')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateWaterDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateWaterDto`
- `WaterDto`

---

#### 13. PATCH /utility/order/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cancel' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCancelDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCancelDto`
- `CancelDto`

---

#### 14. PATCH /utility/order/:id/status

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update status' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateStatusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateStatusDto`
- `StatusDto`

---

#### 15. PATCH /utility/pricing/:city

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update pricing' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdatePricingDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdatePricingDto`
- `PricingDto`

---

#### 16. POST /utility/calculate-price

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create calculate-price' })
@ApiTags('utility')
@ApiResponse({ status: 201, description: 'Created', type: CreateCalculate-priceDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCalculate-priceDto`
- `Calculate-priceDto`

---

#### 17. POST /utility/daily

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create daily' })
@ApiTags('utility')
@ApiResponse({ status: 201, description: 'Created', type: CreateDailyDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateDailyDto`
- `DailyDto`

---

#### 18. POST /utility/order

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create order' })
@ApiTags('utility')
@ApiResponse({ status: 201, description: 'Created', type: CreateOrderDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateOrderDto`
- `OrderDto`

---

#### 19. POST /utility/order/:id/assign-driver

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create assign-driver' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAssign-driverDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAssign-driverDto`
- `Assign-driverDto`

---

#### 20. POST /utility/order/:id/rate

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create rate' })
@ApiTags('utility')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRateDto`
- `RateDto`

---

#### 21. POST /utility/pricing

**File:** `bthwani-project-main/backend-nest/src/modules/utility/utility.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create pricing' })
@ApiTags('utility')
@ApiResponse({ status: 201, description: 'Created', type: CreatePricingDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreatePricingDto`
- `PricingDto`

---

### Module: er (20 endpoints)

#### 1. GET /er/accounts

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get accounts' })
@ApiTags('er')
@ApiResponse({ status: 200, description: 'Success', type: AccountsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AccountsDto`

---

#### 2. GET /er/accounts/:id

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get accounts' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: AccountsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AccountsDto`

---

#### 3. GET /er/attendance/:employeeId

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get attendance' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: AttendanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AttendanceDto`

---

#### 4. GET /er/employees

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get employees' })
@ApiTags('er')
@ApiResponse({ status: 200, description: 'Success', type: EmployeesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `EmployeesDto`

---

#### 5. GET /er/employees/:id

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get employees' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: EmployeesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `EmployeesDto`

---

#### 6. GET /er/journal-entries

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get journal-entries' })
@ApiTags('er')
@ApiResponse({ status: 200, description: 'Success', type: Journal-entriesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Journal-entriesDto`

---

#### 7. GET /er/reports/trial-balance

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get trial-balance' })
@ApiTags('er')
@ApiResponse({ status: 200, description: 'Success', type: Trial-balanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Trial-balanceDto`

---

#### 8. PATCH /er/employees/:id

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update employees' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateEmployeesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateEmployeesDto`
- `EmployeesDto`

---

#### 9. PATCH /er/journal-entries/:id/post

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update post' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdatePostDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdatePostDto`
- `PostDto`

---

#### 10. PATCH /er/leave-requests/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 11. PATCH /er/leave-requests/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update reject' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRejectDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRejectDto`
- `RejectDto`

---

#### 12. PATCH /er/payroll/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 13. PATCH /er/payroll/:id/mark-paid

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update mark-paid' })
@ApiTags('er')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateMark-paidDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateMark-paidDto`
- `Mark-paidDto`

---

#### 14. POST /er/accounts

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create accounts' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateAccountsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAccountsDto`
- `AccountsDto`

---

#### 15. POST /er/attendance/check-in

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create check-in' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateCheck-inDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCheck-inDto`
- `Check-inDto`

---

#### 16. POST /er/attendance/check-out

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create check-out' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateCheck-outDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCheck-outDto`
- `Check-outDto`

---

#### 17. POST /er/employees

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create employees' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateEmployeesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateEmployeesDto`
- `EmployeesDto`

---

#### 18. POST /er/journal-entries

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create journal-entries' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateJournal-entriesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateJournal-entriesDto`
- `Journal-entriesDto`

---

#### 19. POST /er/leave-requests

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create leave-requests' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateLeave-requestsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateLeave-requestsDto`
- `Leave-requestsDto`

---

#### 20. POST /er/payroll/generate

**File:** `bthwani-project-main/backend-nest/src/modules/er/er.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create generate' })
@ApiTags('er')
@ApiResponse({ status: 201, description: 'Created', type: CreateGenerateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateGenerateDto`
- `GenerateDto`

---

### Module: wallet (20 endpoints)

#### 1. GET /wallet/balance

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get balance' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: BalanceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BalanceDto`

---

#### 2. GET /wallet/bills

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get bills' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: BillsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `BillsDto`

---

#### 3. GET /wallet/topup/history

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get history' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: HistoryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `HistoryDto`

---

#### 4. GET /wallet/topup/methods

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get methods' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: MethodsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MethodsDto`

---

#### 5. GET /wallet/transaction/:id

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get transaction' })
@ApiTags('wallet')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: TransactionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TransactionDto`

---

#### 6. GET /wallet/transactions

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get transactions' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: TransactionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TransactionsDto`

---

#### 7. GET /wallet/transfers

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get transfers' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: TransfersDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TransfersDto`

---

#### 8. GET /wallet/withdraw/methods

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get methods' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: MethodsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MethodsDto`

---

#### 9. GET /wallet/withdraw/my

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('wallet')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 10. PATCH /wallet/withdraw/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cancel' })
@ApiTags('wallet')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCancelDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCancelDto`
- `CancelDto`

---

#### 11. POST /wallet/hold

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create hold' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateHoldDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateHoldDto`
- `HoldDto`

---

#### 12. POST /wallet/pay-bill

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create pay-bill' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreatePay-billDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreatePay-billDto`
- `Pay-billDto`

---

#### 13. POST /wallet/refund

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create refund' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateRefundDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRefundDto`
- `RefundDto`

---

#### 14. POST /wallet/refund/request

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create request' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateRequestDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRequestDto`
- `RequestDto`

---

#### 15. POST /wallet/release

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create release' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateReleaseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateReleaseDto`
- `ReleaseDto`

---

#### 16. POST /wallet/topup/kuraimi

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create kuraimi' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateKuraimiDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateKuraimiDto`
- `KuraimiDto`

---

#### 17. POST /wallet/topup/verify

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create verify' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateVerifyDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVerifyDto`
- `VerifyDto`

---

#### 18. POST /wallet/transaction

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create transaction' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateTransactionDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateTransactionDto`
- `TransactionDto`

---

#### 19. POST /wallet/transfer

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create transfer' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateTransferDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateTransferDto`
- `TransferDto`

---

#### 20. POST /wallet/withdraw/request

**File:** `bthwani-project-main/backend-nest/src/modules/wallet/wallet.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create request' })
@ApiTags('wallet')
@ApiResponse({ status: 201, description: 'Created', type: CreateRequestDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRequestDto`
- `RequestDto`

---

### Module: driver (15 endpoints)

#### 1. GET /drivers/available

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get available' })
@ApiTags('driver')
@ApiResponse({ status: 200, description: 'Success', type: AvailableDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AvailableDto`

---

#### 2. GET /drivers/earnings/daily

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get daily' })
@ApiTags('driver')
@ApiResponse({ status: 200, description: 'Success', type: DailyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DailyDto`

---

#### 3. GET /drivers/earnings/weekly

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get weekly' })
@ApiTags('driver')
@ApiResponse({ status: 200, description: 'Success', type: WeeklyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `WeeklyDto`

---

#### 4. GET /drivers/orders/history

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get history' })
@ApiTags('driver')
@ApiResponse({ status: 200, description: 'Success', type: HistoryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `HistoryDto`

---

#### 5. GET /drivers/vacations/my

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('driver')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 6. GET /drivers/vacations/policy

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get policy' })
@ApiTags('driver')
@ApiResponse({ status: 200, description: 'Success', type: PolicyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PolicyDto`

---

#### 7. GET /drivers/:id

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get drivers' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DriversDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DriversDto`

---

#### 8. GET /drivers/:driverId/documents

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get documents' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DocumentsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DocumentsDto`

---

#### 9. PATCH /drivers/vacations/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cancel' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCancelDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCancelDto`
- `CancelDto`

---

#### 10. POST /drivers

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create drivers' })
@ApiTags('driver')
@ApiResponse({ status: 201, description: 'Created', type: CreateDriversDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateDriversDto`
- `DriversDto`

---

#### 11. POST /drivers/orders/:id/accept

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create accept' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAcceptDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAcceptDto`
- `AcceptDto`

---

#### 12. POST /drivers/orders/:id/complete

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create complete' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateCompleteDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCompleteDto`
- `CompleteDto`

---

#### 13. POST /drivers/orders/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create reject' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRejectDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRejectDto`
- `RejectDto`

---

#### 14. POST /drivers/orders/:id/start-delivery

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create start-delivery' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateStart-deliveryDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateStart-deliveryDto`
- `Start-deliveryDto`

---

#### 15. POST /drivers/:driverId/documents/:docId/verify

**File:** `bthwani-project-main/backend-nest/src/modules/driver/driver.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create verify' })
@ApiTags('driver')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateVerifyDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVerifyDto`
- `VerifyDto`

---

### Module: user (14 endpoints)

#### 1. DELETE /users/addresses/:addressId

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete addresses' })
@ApiTags('user')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AddressesDto`

---

#### 2. DELETE /users/deactivate

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete deactivate' })
@ApiTags('user')
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DeactivateDto`

---

#### 3. DELETE /users/pin/reset/:userId

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete reset' })
@ApiTags('user')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ResetDto`

---

#### 4. GET /users/addresses

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get addresses' })
@ApiTags('user')
@ApiResponse({ status: 200, description: 'Success', type: AddressesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AddressesDto`

---

#### 5. GET /users/me

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get me' })
@ApiTags('user')
@ApiResponse({ status: 200, description: 'Success', type: MeDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MeDto`

---

#### 6. GET /users/pin/status

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get status' })
@ApiTags('user')
@ApiResponse({ status: 200, description: 'Success', type: StatusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatusDto`

---

#### 7. GET /users/search

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get search' })
@ApiTags('user')
@ApiResponse({ status: 200, description: 'Success', type: SearchDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SearchDto`

---

#### 8. PATCH /users/addresses/:addressId

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update addresses' })
@ApiTags('user')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateAddressesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateAddressesDto`
- `AddressesDto`

---

#### 9. PATCH /users/me

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update me' })
@ApiTags('user')
@ApiResponse({ status: 200, description: 'Updated', type: UpdateMeDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateMeDto`
- `MeDto`

---

#### 10. POST /users/addresses

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create addresses' })
@ApiTags('user')
@ApiResponse({ status: 201, description: 'Created', type: CreateAddressesDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAddressesDto`
- `AddressesDto`

---

#### 11. POST /users/addresses/:addressId/set-default

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create set-default' })
@ApiTags('user')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateSet-defaultDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSet-defaultDto`
- `Set-defaultDto`

---

#### 12. POST /users/pin/change

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create change' })
@ApiTags('user')
@ApiResponse({ status: 201, description: 'Created', type: CreateChangeDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateChangeDto`
- `ChangeDto`

---

#### 13. POST /users/pin/set

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create set' })
@ApiTags('user')
@ApiResponse({ status: 201, description: 'Created', type: CreateSetDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSetDto`
- `SetDto`

---

#### 14. POST /users/pin/verify

**File:** `bthwani-project-main/backend-nest/src/modules/user/user.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create verify' })
@ApiTags('user')
@ApiResponse({ status: 201, description: 'Created', type: CreateVerifyDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVerifyDto`
- `VerifyDto`

---

### Module: notification (13 endpoints)

#### 1. DELETE /notifications/suppression/channel/:channel

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete channel' })
@ApiTags('notification')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ChannelDto`

---

#### 2. DELETE /notifications/suppression/:id

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete suppression' })
@ApiTags('notification')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SuppressionDto`

---

#### 3. DELETE /notifications/:id

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete notifications' })
@ApiTags('notification')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `NotificationsDto`

---

#### 4. GET /notifications/my

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('notification')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 5. GET /notifications/suppression

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get suppression' })
@ApiTags('notification')
@ApiResponse({ status: 200, description: 'Success', type: SuppressionDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SuppressionDto`

---

#### 6. GET /notifications/suppression/channels

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get channels' })
@ApiTags('notification')
@ApiResponse({ status: 200, description: 'Success', type: ChannelsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ChannelsDto`

---

#### 7. GET /notifications/suppression/stats

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stats' })
@ApiTags('notification')
@ApiResponse({ status: 200, description: 'Success', type: StatsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatsDto`

---

#### 8. GET /notifications/unread/count

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get count' })
@ApiTags('notification')
@ApiResponse({ status: 200, description: 'Success', type: CountDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CountDto`

---

#### 9. POST /notifications

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create notifications' })
@ApiTags('notification')
@ApiResponse({ status: 201, description: 'Created', type: CreateNotificationsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateNotificationsDto`
- `NotificationsDto`

---

#### 10. POST /notifications/read-all

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create read-all' })
@ApiTags('notification')
@ApiResponse({ status: 201, description: 'Created', type: CreateRead-allDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRead-allDto`
- `Read-allDto`

---

#### 11. POST /notifications/send-bulk

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create send-bulk' })
@ApiTags('notification')
@ApiResponse({ status: 201, description: 'Created', type: CreateSend-bulkDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSend-bulkDto`
- `Send-bulkDto`

---

#### 12. POST /notifications/suppression

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create suppression' })
@ApiTags('notification')
@ApiResponse({ status: 201, description: 'Created', type: CreateSuppressionDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSuppressionDto`
- `SuppressionDto`

---

#### 13. POST /notifications/:id/read

**File:** `bthwani-project-main/backend-nest/src/modules/notification/notification.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create read' })
@ApiTags('notification')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateReadDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateReadDto`
- `ReadDto`

---

### Module: vendor (13 endpoints)

#### 1. GET /vendors

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get vendors' })
@ApiTags('vendor')
@ApiResponse({ status: 200, description: 'Success', type: VendorsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `VendorsDto`

---

#### 2. GET /vendors/account/statement

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statement' })
@ApiTags('vendor')
@ApiResponse({ status: 200, description: 'Success', type: StatementDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatementDto`

---

#### 3. GET /vendors/dashboard/overview

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get overview' })
@ApiTags('vendor')
@ApiResponse({ status: 200, description: 'Success', type: OverviewDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OverviewDto`

---

#### 4. GET /vendors/me

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get me' })
@ApiTags('vendor')
@ApiResponse({ status: 200, description: 'Success', type: MeDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MeDto`

---

#### 5. GET /vendors/sales

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get sales' })
@ApiTags('vendor')
@ApiResponse({ status: 200, description: 'Success', type: SalesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SalesDto`

---

#### 6. GET /vendors/settlements

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get settlements' })
@ApiTags('vendor')
@ApiResponse({ status: 200, description: 'Success', type: SettlementsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SettlementsDto`

---

#### 7. GET /vendors/:id

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get vendors' })
@ApiTags('vendor')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: VendorsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `VendorsDto`

---

#### 8. PATCH /vendors/:id

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update vendors' })
@ApiTags('vendor')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateVendorsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateVendorsDto`
- `VendorsDto`

---

#### 9. PATCH /vendors/:id/status

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update status' })
@ApiTags('vendor')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateStatusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateStatusDto`
- `StatusDto`

---

#### 10. POST /vendors

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create vendors' })
@ApiTags('vendor')
@ApiResponse({ status: 201, description: 'Created', type: CreateVendorsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateVendorsDto`
- `VendorsDto`

---

#### 11. POST /vendors/account/delete-request

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create delete-request' })
@ApiTags('vendor')
@ApiResponse({ status: 201, description: 'Created', type: CreateDelete-requestDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateDelete-requestDto`
- `Delete-requestDto`

---

#### 12. POST /vendors/settlements

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create settlements' })
@ApiTags('vendor')
@ApiResponse({ status: 201, description: 'Created', type: CreateSettlementsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateSettlementsDto`
- `SettlementsDto`

---

#### 13. POST /vendors/:id/reset-password

**File:** `bthwani-project-main/backend-nest/src/modules/vendor/vendor.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create reset-password' })
@ApiTags('vendor')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateReset-passwordDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateReset-passwordDto`
- `Reset-passwordDto`

---

### Module: legal (12 endpoints)

#### 1. GET /legal/admin/consent/statistics

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statistics' })
@ApiTags('legal')
@ApiResponse({ status: 200, description: 'Success', type: StatisticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatisticsDto`

---

#### 2. GET /legal/admin/privacy-policies

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get privacy-policies' })
@ApiTags('legal')
@ApiResponse({ status: 200, description: 'Success', type: Privacy-policiesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Privacy-policiesDto`

---

#### 3. GET /legal/admin/terms-of-service

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get terms-of-service' })
@ApiTags('legal')
@ApiResponse({ status: 200, description: 'Success', type: Terms-of-serviceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Terms-of-serviceDto`

---

#### 4. GET /legal/consent/check/:type

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get check' })
@ApiTags('legal')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: CheckDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CheckDto`

---

#### 5. GET /legal/consent/my

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('legal')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 6. GET /legal/privacy-policy

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get privacy-policy' })
@ApiTags('legal')
@ApiResponse({ status: 200, description: 'Success', type: Privacy-policyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Privacy-policyDto`

---

#### 7. GET /legal/terms-of-service

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get terms-of-service' })
@ApiTags('legal')
@ApiResponse({ status: 200, description: 'Success', type: Terms-of-serviceDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Terms-of-serviceDto`

---

#### 8. PATCH /legal/admin/privacy-policy/:id/activate

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update activate' })
@ApiTags('legal')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateActivateDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateActivateDto`
- `ActivateDto`

---

#### 9. PATCH /legal/admin/terms-of-service/:id/activate

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update activate' })
@ApiTags('legal')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateActivateDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateActivateDto`
- `ActivateDto`

---

#### 10. POST /legal/admin/privacy-policy

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create privacy-policy' })
@ApiTags('legal')
@ApiResponse({ status: 201, description: 'Created', type: CreatePrivacy-policyDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreatePrivacy-policyDto`
- `Privacy-policyDto`

---

#### 11. POST /legal/admin/terms-of-service

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create terms-of-service' })
@ApiTags('legal')
@ApiResponse({ status: 201, description: 'Created', type: CreateTerms-of-serviceDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateTerms-of-serviceDto`
- `Terms-of-serviceDto`

---

#### 12. POST /legal/consent

**File:** `bthwani-project-main/backend-nest/src/modules/legal/legal.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create consent' })
@ApiTags('legal')
@ApiResponse({ status: 201, description: 'Created', type: CreateConsentDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateConsentDto`
- `ConsentDto`

---

### Module: akhdimni (9 endpoints)

#### 1. GET /akhdimni/admin/errands

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get errands' })
@ApiTags('akhdimni')
@ApiResponse({ status: 200, description: 'Success', type: ErrandsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ErrandsDto`

---

#### 2. GET /akhdimni/errands/:id

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get errands' })
@ApiTags('akhdimni')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: ErrandsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ErrandsDto`

---

#### 3. GET /akhdimni/my-errands

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my-errands' })
@ApiTags('akhdimni')
@ApiResponse({ status: 200, description: 'Success', type: My-errandsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `My-errandsDto`

---

#### 4. PATCH /akhdimni/errands/:id/cancel

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update cancel' })
@ApiTags('akhdimni')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateCancelDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateCancelDto`
- `CancelDto`

---

#### 5. PATCH /akhdimni/errands/:id/status

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update status' })
@ApiTags('akhdimni')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateStatusDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateStatusDto`
- `StatusDto`

---

#### 6. POST /akhdimni/admin/errands/:id/assign-driver

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create assign-driver' })
@ApiTags('akhdimni')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAssign-driverDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAssign-driverDto`
- `Assign-driverDto`

---

#### 7. POST /akhdimni/errands

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create errands' })
@ApiTags('akhdimni')
@ApiResponse({ status: 201, description: 'Created', type: CreateErrandsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateErrandsDto`
- `ErrandsDto`

---

#### 8. POST /akhdimni/errands/calculate-fee

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create calculate-fee' })
@ApiTags('akhdimni')
@ApiResponse({ status: 201, description: 'Created', type: CreateCalculate-feeDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateCalculate-feeDto`
- `Calculate-feeDto`

---

#### 9. POST /akhdimni/errands/:id/rate

**File:** `bthwani-project-main/backend-nest/src/modules/akhdimni/akhdimni.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create rate' })
@ApiTags('akhdimni')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateRateDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateRateDto`
- `RateDto`

---

### Module: support (9 endpoints)

#### 1. GET /support/admin/sla-metrics

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get sla-metrics' })
@ApiTags('support')
@ApiResponse({ status: 200, description: 'Success', type: Sla-metricsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `Sla-metricsDto`

---

#### 2. GET /support/stats

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get stats' })
@ApiTags('support')
@ApiResponse({ status: 200, description: 'Success', type: StatsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatsDto`

---

#### 3. GET /support/tickets

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get tickets' })
@ApiTags('support')
@ApiResponse({ status: 200, description: 'Success', type: TicketsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TicketsDto`

---

#### 4. GET /support/tickets/:id

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get tickets' })
@ApiTags('support')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: TicketsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `TicketsDto`

---

#### 5. PATCH /support/admin/tickets/:id/assign

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update assign' })
@ApiTags('support')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateAssignDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateAssignDto`
- `AssignDto`

---

#### 6. PATCH /support/admin/tickets/:id/resolve

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update resolve' })
@ApiTags('support')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateResolveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateResolveDto`
- `ResolveDto`

---

#### 7. PATCH /support/tickets/:id/messages

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update messages' })
@ApiTags('support')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateMessagesDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateMessagesDto`
- `MessagesDto`

---

#### 8. PATCH /support/tickets/:id/rate

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update rate' })
@ApiTags('support')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRateDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRateDto`
- `RateDto`

---

#### 9. POST /support/tickets

**File:** `bthwani-project-main/backend-nest/src/modules/support/support.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create tickets' })
@ApiTags('support')
@ApiResponse({ status: 201, description: 'Created', type: CreateTicketsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateTicketsDto`
- `TicketsDto`

---

### Module: promotion (8 endpoints)

#### 1. DELETE /promotions/:id

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete promotions' })
@ApiTags('promotion')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PromotionsDto`

---

#### 2. GET /promotions

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get promotions' })
@ApiTags('promotion')
@ApiResponse({ status: 200, description: 'Success', type: PromotionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PromotionsDto`

---

#### 3. GET /promotions/by-placement

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get by-placement' })
@ApiTags('promotion')
@ApiResponse({ status: 200, description: 'Success', type: By-placementDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `By-placementDto`

---

#### 4. GET /promotions/stats/overview

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get overview' })
@ApiTags('promotion')
@ApiResponse({ status: 200, description: 'Success', type: OverviewDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `OverviewDto`

---

#### 5. GET /promotions/:id

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get promotions' })
@ApiTags('promotion')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: PromotionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `PromotionsDto`

---

#### 6. PATCH /promotions/:id

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update promotions' })
@ApiTags('promotion')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdatePromotionsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdatePromotionsDto`
- `PromotionsDto`

---

#### 7. POST /promotions/:id/click

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create click' })
@ApiTags('promotion')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateClickDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateClickDto`
- `ClickDto`

---

#### 8. POST /promotions/:id/conversion

**File:** `bthwani-project-main/backend-nest/src/modules/promotion/promotion.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create conversion' })
@ApiTags('promotion')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateConversionDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateConversionDto`
- `ConversionDto`

---

### Module: health (8 endpoints)

#### 1. GET /health

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get health' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: HealthDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `HealthDto`

---

#### 2. GET /health/advanced

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get advanced' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: AdvancedDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `AdvancedDto`

---

#### 3. GET /health/detailed

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get detailed' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: DetailedDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DetailedDto`

---

#### 4. GET /health/info

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get info' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: InfoDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `InfoDto`

---

#### 5. GET /health/liveness

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get liveness' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: LivenessDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `LivenessDto`

---

#### 6. GET /health/metrics

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get metrics' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: MetricsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MetricsDto`

---

#### 7. GET /health/readiness

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get readiness' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: ReadinessDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ReadinessDto`

---

#### 8. GET /health/startup

**File:** `bthwani-project-main/backend-nest/src/modules/health/health.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get startup' })
@ApiTags('health')
@ApiResponse({ status: 200, description: 'Success', type: StartupDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StartupDto`

---

### Module: onboarding (8 endpoints)

#### 1. GET /onboarding/applications

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get applications' })
@ApiTags('onboarding')
@ApiResponse({ status: 200, description: 'Success', type: ApplicationsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ApplicationsDto`

---

#### 2. GET /onboarding/my

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my' })
@ApiTags('onboarding')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MyDto`

---

#### 3. GET /onboarding/statistics

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get statistics' })
@ApiTags('onboarding')
@ApiResponse({ status: 200, description: 'Success', type: StatisticsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `StatisticsDto`

---

#### 4. GET /onboarding/:id/details

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get details' })
@ApiTags('onboarding')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DetailsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DetailsDto`

---

#### 5. PATCH /onboarding/:id/approve

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update approve' })
@ApiTags('onboarding')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateApproveDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateApproveDto`
- `ApproveDto`

---

#### 6. PATCH /onboarding/:id/reject

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update reject' })
@ApiTags('onboarding')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateRejectDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateRejectDto`
- `RejectDto`

---

#### 7. POST /onboarding

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create onboarding' })
@ApiTags('onboarding')
@ApiResponse({ status: 201, description: 'Created', type: CreateOnboardingDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateOnboardingDto`
- `OnboardingDto`

---

#### 8. POST /onboarding/quick-onboard

**File:** `bthwani-project-main/backend-nest/src/modules/onboarding/onboarding.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create quick-onboard' })
@ApiTags('onboarding')
@ApiResponse({ status: 201, description: 'Created', type: CreateQuick-onboardDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateQuick-onboardDto`
- `Quick-onboardDto`

---

### Module: auth (7 endpoints)

#### 1. DELETE /auth/consent/:type

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Delete consent' })
@ApiTags('auth')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Deleted' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ConsentDto`

---

#### 2. GET /auth/consent/check/:type

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get check' })
@ApiTags('auth')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: CheckDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CheckDto`

---

#### 3. GET /auth/consent/history

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get history' })
@ApiTags('auth')
@ApiResponse({ status: 200, description: 'Success', type: HistoryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `HistoryDto`

---

#### 4. GET /auth/consent/summary

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get summary' })
@ApiTags('auth')
@ApiResponse({ status: 200, description: 'Success', type: SummaryDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `SummaryDto`

---

#### 5. POST /auth/consent

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create consent' })
@ApiTags('auth')
@ApiResponse({ status: 201, description: 'Created', type: CreateConsentDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateConsentDto`
- `ConsentDto`

---

#### 6. POST /auth/consent/bulk

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create bulk' })
@ApiTags('auth')
@ApiResponse({ status: 201, description: 'Created', type: CreateBulkDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateBulkDto`
- `BulkDto`

---

#### 7. POST /auth/firebase/login

**File:** `bthwani-project-main/backend-nest/src/modules/auth/auth.controller.ts`
**Priority:** HIGH

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create login' })
@ApiTags('auth')
@ApiResponse({ status: 201, description: 'Created', type: CreateLoginDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateLoginDto`
- `LoginDto`

---

### Module: shift (6 endpoints)

#### 1. GET /shifts

**File:** `bthwani-project-main/backend-nest/src/modules/shift/shift.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get shifts' })
@ApiTags('shift')
@ApiResponse({ status: 200, description: 'Success', type: ShiftsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ShiftsDto`

---

#### 2. GET /shifts/driver/:driverId

**File:** `bthwani-project-main/backend-nest/src/modules/shift/shift.controller.ts`
**Priority:** MEDIUM

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get driver' })
@ApiTags('shift')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Success', type: DriverDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `DriverDto`

---

#### 3. GET /shifts/my-shifts

**File:** `bthwani-project-main/backend-nest/src/modules/shift/shift.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get my-shifts' })
@ApiTags('shift')
@ApiResponse({ status: 200, description: 'Success', type: My-shiftsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `My-shiftsDto`

---

#### 4. PATCH /shifts/:id

**File:** `bthwani-project-main/backend-nest/src/modules/shift/shift.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Update shifts' })
@ApiTags('shift')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 200, description: 'Updated', type: UpdateShiftsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `UpdateShiftsDto`
- `ShiftsDto`

---

#### 5. POST /shifts

**File:** `bthwani-project-main/backend-nest/src/modules/shift/shift.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create shifts' })
@ApiTags('shift')
@ApiResponse({ status: 201, description: 'Created', type: CreateShiftsDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateShiftsDto`
- `ShiftsDto`

---

#### 6. POST /shifts/:shiftId/assign/:driverId

**File:** `bthwani-project-main/backend-nest/src/modules/shift/shift.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Create assign' })
@ApiTags('shift')
@ApiParam({ name: 'param', description: 'param ID' })
@ApiParam({ name: 'param', description: 'param ID' })
@ApiResponse({ status: 201, description: 'Created', type: CreateAssignDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `CreateAssignDto`
- `AssignDto`

---

### Module: metrics (2 endpoints)

#### 1. GET /metrics

**File:** `bthwani-project-main/backend-nest/src/modules/metrics/metrics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get metrics' })
@ApiTags('metrics')
@ApiResponse({ status: 200, description: 'Success', type: MetricsDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `MetricsDto`

---

#### 2. GET /metrics/json

**File:** `bthwani-project-main/backend-nest/src/modules/metrics/metrics.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get json' })
@ApiTags('metrics')
@ApiResponse({ status: 200, description: 'Success', type: JsonDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `JsonDto`

---

### Module: unknown (1 endpoints)

#### 1. GET /

**File:** `bthwani-project-main/backend-nest/src/app.controller.ts`
**Priority:** LOW

**Add these decorators:**

```typescript
@ApiOperation({ summary: 'Get resource' })
@ApiTags('unknown')
@ApiResponse({ status: 200, description: 'Success', type: ResponseDto })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**DTOs needed:**
- `ResponseDto`

---

## Action Plan

1. Add OpenAPI decorators to all endpoints
2. Create missing DTO classes
3. Run `npm run audit:openapi` to regenerate spec
4. Verify in Swagger UI: http://localhost:3000/api/docs
5. Run contract tests: `npm run test:contract`
6. Regenerate typed clients

## Quick Commands

```bash
# Check current status
npm run audit:parity

# After adding decorators, regenerate OpenAPI
npm run audit:openapi

# Verify with contract tests
npm run test:contract

# Update typed clients for frontends
./scripts/generate-typed-clients.sh
```

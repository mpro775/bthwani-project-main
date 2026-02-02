# مراجعة السايدبار والراوتر - لوحة التحكم

## 1. أخطاء في السايدبار (رابط خاطئ)

| الرابط في السايدبار | الرابط الصحيح في الراوتر | الملاحظة |
|---------------------|---------------------------|----------|
| `/admin/cms/pages`   | `/admin/content/cms-pages` | "إدارة الصفحات" في نظام إدارة المحتوى — الرابط الحالي يعطي 404 |

**الإجراء:** تصحيح رابط "إدارة الصفحات" في السايدبار إلى `/admin/content/cms-pages`.

---

## 2. صفحات في الراوتر لكنها غير مضافة في السايدبار

### نظام التوصيل
- `/admin/banners` — البانرات
- `/admin/stores/moderation` — مراجعة المتاجر
- `/admin/orders/details/:id` — تفاصيل الطلب (ديناميكي)
- `/admin/delivery/stores/:id` — تفاصيل المتجر (ديناميكي)

### المستخدمون والكباتن والعمليات
- `/admin/users/list` — قائمة المستخدمين
- `/admin/users/:id` — تفاصيل المستخدم
- `/admin/drivers/:id` — تفاصيل الكابتن
- `/admin/drivers/shifts` — الورديات
- `/admin/drivers/assets` — أصول الكباتن
- `/admin/ops/drivers/list` — قائمة الكباتن (العمليات)
- `/admin/ops/drivers/:id` — تفاصيل كابتن
- `/admin/admins/new` — إضافة مشرف جديد
- `/admin/admins/:id` — تفاصيل المشرف

### الشركاء والتسويق
- `/admin/vendors/:id` — تفاصيل الشريك
- `/admin/field/onboarding` — طلبات التسجيل (معلق في السايدبار)

### المالية والتحليلات
- `/admin/finance/new` — لوحة مالية (نسخة جديدة)
- `/admin/finance/payouts` — دفعات
- `/admin/finance/reconciliations` — تسويات
- `/admin/analytics/roas` — ROAS
- `/admin/analytics/kpis` — KPIs
- `/admin/analytics/advanced` — تحليلات متقدمة
- `/admin/analytics/funnel` — مسار التحويل
- `/admin/analytics/users` — تحليلات المستخدمين
- `/admin/analytics/revenue` — الإيرادات

### المحتوى والنظام القانوني والصحة
- `/admin/content` — لوحة المحتوى
- `/admin/content/banners` — بانرات المحتوى
- `/admin/content/app-settings` — إعدادات التطبيق
- `/admin/content/faqs` — الأسئلة الشائعة
- `/admin/er` — لوحة الموارد البشرية (ER)
- `/admin/system/health` — صحة النظام
- `/admin/system/metrics` — مقاييس النظام
- `/admin/legal` — النظام القانوني
- `/admin/support/dashboard` — لوحة الدعم
- `/admin/test/api` — اختبار API
- `/admin/hr/assets` — أصول الموظفين

### أخرى
- `/admin/partners` — الشركاء
- `/admin/partners/:store` — تفاصيل الشريك
- `/admin/commission/plans` — خطط العمولات
- `/admin/reports/marketers/:uid` — تقرير مسوق (ديناميكي)
- `/admin/assets` — إدارة الأصول
- `/admin/documents` — إدارة المستندات
- `/admin/reports` — التقارير
- `/admin/reports/dashboard` — لوحة التقارير
- `/admin/test-otp` — اختبار OTP

### خدمات الإرسال (أخضمني، أماني، أربون، إلخ)
- `/admin/akhdimni` — أخضمني
- `/admin/amani` — أماني
- `/admin/arabon` — أربون
- `/admin/es3afni` — اسعفني
- `/admin/kawader` — كوادر
- `/admin/kenz` — كينز
- `/admin/maarouf` — معروف
- `/admin/sanad` — سند
- `/admin/payments` — المدفوعات
- `/admin/payments/:id` — تفاصيل دفعة

---

## 3. صفحات موجودة في المشروع لكنها غير معرّفة في الراوتر

| الملف | الوصف المقترح |
|-------|----------------|
| `AppearanceSettingsPage.tsx` | إعدادات المظهر |
| `AuditLogPage.tsx` | سجل التدقيق |
| `MerchantReportsPage.tsx` | تقارير الشركاء |
| `SupportTicketsPage.tsx` | تذاكر الدعم (الراوتر يستخدم `support/Inbox`, `TicketView`, `Reports`) |
| `OnboardingListPage.tsx` | قائمة طلبات التسجيل |
| `UnifiedReportsPage.tsx` | التقارير الموحدة |
| `TransactionTrackingPage.tsx` | تتبع المعاملات |
| `PayoutsManagementPage.tsx` | إدارة الدفعات (الراوتر يستخدم `PayoutBatchesPage` لـ finance/payouts) |
| `CommissionSettingsPage.tsx` | إعدادات العمولات |
| `AdminCampaignsPanel.tsx` | لوحة الحملات |

هذه الصفحات إما تحتاج إلى إضافة Route لها في `App.tsx` ثم ربطها في السايدبار إن لزم، أو توحيدها مع صفحات موجودة (مثل دمج Payouts مع finance/payouts).

---

## 4. ملخص التوصيات

1. **تصحيح السايدبار:** تغيير `/admin/cms/pages` إلى `/admin/content/cms-pages` لرابط "إدارة الصفحات".
2. **إضافة روابط السايدبار للصفحات المهمة:** مثل البانرات، مراجعة المتاجر، التقارير، لوحة المحتوى، النظام القانوني، صحة النظام، المدفوعات، وخدمات الإرسال (أخضمني، أماني، …) إذا كانت مطلوبة في القائمة.
3. **الصفحات الموجودة بدون Route:** إما إضافة مسارات لها في `App.tsx` وربطها من السايدبار، أو إزالة/دمج الملفات غير المستخدمة لتجنب الالتباس.

إذا رغبت، يمكن تنفيذ التصحيح الأول (رابط إدارة الصفحات) وتحديد قائمة محددة من الصفحات لإضافتها إلى السايدبار خطوة بخطوة.

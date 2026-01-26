# Legal Module - نظام سياسة الخصوصية والشروط القانونية

## نظرة عامة

وحدة قانونية شاملة لإدارة سياسات الخصوصية، شروط الخدمة، وموافقات المستخدمين مع دعم كامل للغتين العربية والإنجليزية.

## المميزات

### 1. إدارة سياسة الخصوصية (Privacy Policy)
- ✅ إنشاء وإدارة إصدارات متعددة من سياسة الخصوصية
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ تفعيل/تعطيل السياسات
- ✅ تتبع تاريخ سريان كل إصدار
- ✅ نقاط وصول عامة للمستخدمين

### 2. إدارة شروط الخدمة (Terms of Service)
- ✅ إنشاء وإدارة إصدارات متعددة من شروط الخدمة
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ تفعيل/تعطيل الشروط
- ✅ تتبع تاريخ سريان كل إصدار
- ✅ نقاط وصول عامة للمستخدمين

### 3. نظام الموافقات (User Consent)
- ✅ تسجيل موافقة المستخدم على السياسات
- ✅ تتبع إصدارات الموافقات
- ✅ حفظ معلومات الموافقة (IP، User Agent، التاريخ)
- ✅ التحقق من موافقة المستخدم على الإصدار الحالي
- ✅ إحصائيات شاملة للموافقات

## البنية

```
legal/
├── entities/
│   ├── privacy-policy.entity.ts    # كيان سياسة الخصوصية
│   ├── terms-of-service.entity.ts  # كيان شروط الخدمة
│   └── user-consent.entity.ts      # كيان موافقات المستخدمين
├── dto/
│   ├── create-privacy-policy.dto.ts
│   ├── create-terms-of-service.dto.ts
│   └── record-consent.dto.ts
├── legal.controller.ts             # نقاط النهاية (Endpoints)
├── legal.service.ts                # منطق العمليات
├── legal.module.ts                 # تكوين الوحدة
└── README.md                       # هذا الملف
```

## نقاط النهاية (API Endpoints)

### نقاط عامة (Public Endpoints)

#### 1. الحصول على سياسة الخصوصية
```http
GET /legal/privacy-policy?lang=ar
```

**Query Parameters:**
- `lang` (optional): اللغة - `ar` (افتراضي) أو `en`

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "version": "1.0.0",
  "content": "محتوى سياسة الخصوصية...",
  "effectiveDate": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### 2. الحصول على شروط الخدمة
```http
GET /legal/terms-of-service?lang=ar
```

**Query Parameters:**
- `lang` (optional): اللغة - `ar` (افتراضي) أو `en`

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "version": "1.0.0",
  "content": "محتوى شروط الخدمة...",
  "effectiveDate": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### نقاط موافقات المستخدم (User Consent Endpoints)

#### 3. تسجيل موافقة المستخدم
```http
POST /legal/consent
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "consentType": "privacy_policy",
  "version": "1.0.0",
  "accepted": true,
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "consentType": "privacy_policy",
  "version": "1.0.0",
  "accepted": true,
  "ipAddress": "192.168.1.1",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### 4. الحصول على موافقات المستخدم
```http
GET /legal/consent/my
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "consentType": "privacy_policy",
    "version": "1.0.0",
    "accepted": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### 5. التحقق من موافقة المستخدم
```http
GET /legal/consent/check/{type}
Authorization: Bearer {token}
```

**Parameters:**
- `type`: نوع الموافقة - `privacy_policy` أو `terms_of_service`

**Response:**
```json
{
  "hasConsent": true,
  "requiresUpdate": false,
  "currentVersion": "1.0.0",
  "consentedVersion": "1.0.0"
}
```

### نقاط الإدارة (Admin Endpoints)

#### 6. الحصول على جميع سياسات الخصوصية
```http
GET /legal/admin/privacy-policies
Authorization: Bearer {admin_token}
```

#### 7. إنشاء سياسة خصوصية جديدة
```http
POST /legal/admin/privacy-policy
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "version": "1.1.0",
  "content": "محتوى السياسة بالعربية...",
  "contentEn": "Privacy policy content in English...",
  "effectiveDate": "2025-02-01T00:00:00.000Z",
  "isActive": true
}
```

#### 8. تفعيل سياسة خصوصية
```http
PATCH /legal/admin/privacy-policy/{id}/activate
Authorization: Bearer {admin_token}
```

#### 9. الحصول على جميع شروط الخدمة
```http
GET /legal/admin/terms-of-service
Authorization: Bearer {admin_token}
```

#### 10. إنشاء شروط خدمة جديدة
```http
POST /legal/admin/terms-of-service
Authorization: Bearer {admin_token}
```

#### 11. تفعيل شروط خدمة
```http
PATCH /legal/admin/terms-of-service/{id}/activate
Authorization: Bearer {admin_token}
```

#### 12. إحصائيات الموافقات
```http
GET /legal/admin/consent/statistics
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "privacyPolicyConsents": 1500,
  "termsOfServiceConsents": 1450,
  "uniqueUsers": 1200
}
```

## الاستخدام

### 1. إنشاء سياسة خصوصية (للمطورين/الإدارة)

```typescript
import { LegalService } from './modules/legal/legal.service';

// في الـ Controller أو Service
async createPolicy() {
  return await this.legalService.createPrivacyPolicy({
    version: '1.0.0',
    content: `
      # سياسة الخصوصية
      
      ## 1. البيانات المجمّعة
      - معلومات الحساب (الاسم، البريد الإلكتروني، رقم الهاتف)
      - معلومات الموقع الجغرافي
      - بيانات الاستخدام والتفاعل
      
      ## 2. استخدام البيانات
      - تحسين خدماتنا
      - التواصل مع المستخدمين
      - الامتثال للمتطلبات القانونية
      
      ## 3. مشاركة البيانات
      لا نشارك بياناتك مع أطراف ثالثة إلا بموافقتك
      
      ## 4. حقوق المستخدم
      - الحق في الوصول إلى بياناتك
      - الحق في حذف بياناتك
      - الحق في تصحيح بياناتك
    `,
    contentEn: `
      # Privacy Policy
      
      ## 1. Data Collection
      - Account information (name, email, phone)
      - Location data
      - Usage and interaction data
      
      ## 2. Data Usage
      - Service improvement
      - User communication
      - Legal compliance
      
      ## 3. Data Sharing
      We don't share your data with third parties without consent
      
      ## 4. User Rights
      - Right to access your data
      - Right to delete your data
      - Right to correct your data
    `,
    isActive: true,
  });
}
```

### 2. تسجيل موافقة المستخدم (في التطبيق)

```typescript
// في مكون التسجيل أو الصفحة الرئيسية
async acceptPrivacyPolicy() {
  const activePolicy = await this.http.get('/legal/privacy-policy').toPromise();
  
  await this.http.post('/legal/consent', {
    consentType: 'privacy_policy',
    version: activePolicy.version,
    accepted: true,
  }).toPromise();
  
  console.log('تم قبول سياسة الخصوصية');
}
```

### 3. التحقق من الموافقة قبل العمليات الحساسة

```typescript
// في Guard أو Middleware
async checkUserConsent(userId: string) {
  const privacyCheck = await this.legalService.checkUserConsent(
    userId,
    'privacy_policy'
  );
  
  if (privacyCheck.requiresUpdate) {
    throw new UnauthorizedException(
      'يجب الموافقة على سياسة الخصوصية الجديدة'
    );
  }
  
  return true;
}
```

## محتويات مقترحة لسياسة الخصوصية

### يجب تضمين:

- ✅ **أنواع البيانات المجمّعة**: معلومات شخصية، بيانات موقع، معلومات جهاز
- ✅ **طرق استخدام البيانات**: تحسين الخدمة، التسويق، الدعم الفني
- ✅ **مشاركة البيانات مع أطراف ثالثة**: موفري الدفع، خدمات التحليلات
- ✅ **حقوق المستخدم**: الوصول، الحذف، التصحيح، النقل
- ✅ **أمن البيانات**: التشفير، التخزين الآمن، إجراءات الحماية
- ✅ **ملفات الارتباط (Cookies)**: الأنواع المستخدمة، الغرض منها
- ✅ **حقوق الأطفال**: سياسة حماية بيانات الأطفال دون 13 عام
- ✅ **التعديلات على السياسة**: كيفية إعلام المستخدمين بالتغييرات
- ✅ **معلومات الاتصال**: كيفية التواصل لشؤون الخصوصية

## محتويات مقترحة لشروط الخدمة

### يجب تضمين:

- ✅ **قبول الشروط**: شرح الموافقة على الشروط باستخدام الخدمة
- ✅ **وصف الخدمة**: ما تقدمه المنصة من خدمات
- ✅ **حسابات المستخدمين**: التسجيل، المسؤوليات، الأمان
- ✅ **الاستخدام المقبول**: السلوك المسموح والممنوع
- ✅ **الملكية الفكرية**: حقوق المحتوى والعلامات التجارية
- ✅ **المدفوعات والرسوم**: أسعار، سياسة الاسترداد، طرق الدفع
- ✅ **المسؤولية**: حدود مسؤولية المنصة
- ✅ **الإنهاء**: حالات إنهاء الحساب
- ✅ **القانون الحاكم**: القوانين المطبقة والاختصاص القضائي

## الأمان والامتثال

### GDPR Compliance
- ✅ الموافقة الصريحة للمستخدمين
- ✅ حق الوصول إلى البيانات
- ✅ حق الحذف (Right to be Forgotten)
- ✅ حفظ سجل الموافقات مع التواريخ والـ IP

### CCPA Compliance
- ✅ الشفافية في جمع البيانات
- ✅ حق المستخدم في معرفة البيانات المجمّعة
- ✅ حق المستخدم في حذف بياناته

## أفضل الممارسات

1. **تحديث دوري**: راجع وحدّث السياسات كل 6-12 شهر
2. **الوضوح**: استخدم لغة بسيطة وواضحة
3. **إشعار المستخدمين**: أعلم المستخدمين بالتحديثات الهامة
4. **السجلات**: احتفظ بسجل كامل للموافقات
5. **المراجعة القانونية**: اطلب مراجعة من مستشار قانوني

## مثال على التكامل مع التطبيق

```typescript
// في Guard للتحقق من الموافقة
@Injectable()
export class ConsentGuard implements CanActivate {
  constructor(private legalService: LegalService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;

    // التحقق من موافقة سياسة الخصوصية
    const privacyCheck = await this.legalService.checkUserConsent(
      userId,
      'privacy_policy',
    );

    // التحقق من موافقة شروط الخدمة
    const termsCheck = await this.legalService.checkUserConsent(
      userId,
      'terms_of_service',
    );

    if (privacyCheck.requiresUpdate || termsCheck.requiresUpdate) {
      throw new ForbiddenException({
        message: 'يتطلب الموافقة على السياسات الجديدة',
        requiresPrivacyConsent: privacyCheck.requiresUpdate,
        requiresTermsConsent: termsCheck.requiresUpdate,
        privacyVersion: privacyCheck.currentVersion,
        termsVersion: termsCheck.currentVersion,
      });
    }

    return true;
  }
}
```

## Database Indexes

تم إضافة الـ indexes التالية لتحسين الأداء:

```typescript
// على UserConsent
- { userId: 1, consentType: 1, version: 1 }  // للبحث السريع عن موافقات معينة
- { consentType: 1, accepted: 1 }            // للإحصائيات
```

## الاختبار

### اختبار سياسة الخصوصية
```bash
# الحصول على السياسة النشطة
curl http://localhost:3000/legal/privacy-policy?lang=ar
```

### اختبار تسجيل الموافقة
```bash
# تسجيل موافقة
curl -X POST http://localhost:3000/legal/consent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consentType": "privacy_policy",
    "version": "1.0.0",
    "accepted": true
  }'
```

### اختبار التحقق من الموافقة
```bash
# التحقق من موافقة المستخدم
curl http://localhost:3000/legal/consent/check/privacy_policy \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Swagger Documentation

تم توثيق جميع نقاط النهاية في Swagger. للوصول:
```
http://localhost:3000/api
```

## الخطوات التالية

1. ✅ **إنشاء محتوى السياسات**: اكتب سياسة الخصوصية وشروط الخدمة
2. ⏳ **المراجعة القانونية**: راجع المحتوى مع مستشار قانوني
3. ⏳ **إضافة في التطبيق**: أضف شاشات القبول في التطبيق
4. ⏳ **الاختبار**: اختبر جميع السيناريوهات
5. ⏳ **النشر**: انشر في البيئة الإنتاجية

## الدعم

للأسئلة أو المشاكل، يرجى التواصل مع فريق التطوير.


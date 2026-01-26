# 🔐 Auth Module - نظام المصادقة والموافقات

## 📁 هيكل المجلد

```
auth/
├── auth.controller.ts              # Controller للمصادقة والموافقات
├── auth.service.ts                 # Service للمصادقة
├── auth.module.ts                  # Module Configuration
│
├── dto/                            # Data Transfer Objects
│   ├── consent.dto.ts             # DTOs الموافقات
│   ├── register-with-consent.dto.ts
│   ├── firebase-auth.dto.ts
│   ├── register.dto.ts
│   └── index.ts                   # Barrel export
│
├── entities/                       # Database Schemas
│   ├── user.entity.ts             # User Schema
│   ├── user-consent.entity.ts     # Consent Schema ✨ جديد
│   └── index.ts                   # Barrel export
│
├── services/                       # Business Logic
│   ├── consent.service.ts         # ✨ جديد
│   └── index.ts                   # Barrel export
│
├── strategies/                     # Passport Strategies
│   ├── jwt.strategy.ts
│   └── firebase.strategy.ts
│
├── examples/                       # ✨ جديد
│   └── consent-integration.example.ts
│
└── docs/                          # ✨ جديد
    ├── CONSENT_USAGE_GUIDE.md     # دليل استخدام شامل
    ├── CONSENT_QUICK_REFERENCE.md # مرجع سريع
    ├── TESTING_GUIDE.md           # دليل الاختبار
    └── CONSENT_IMPLEMENTATION_SUMMARY.md
```

---

## 🚀 الميزات

### ✅ المصادقة (Authentication)
- تسجيل الدخول عبر Firebase
- JWT Authentication
- Unified Auth Guard

### ✅ نظام الموافقات (Consents) - جديد!
- **4 أنواع موافقات**:
  - سياسة الخصوصية
  - شروط الخدمة
  - التسويق
  - معالجة البيانات

- **Features**:
  - تسجيل موافقات (فردي ودفعي)
  - سحب الموافقات
  - سجل كامل (Audit Trail)
  - تتبع نسخ السياسات
  - GDPR Compliant
  - Guards محمية

---

## 📖 التوثيق

| الملف | الوصف |
|------|-------|
| [CONSENT_USAGE_GUIDE.md](./CONSENT_USAGE_GUIDE.md) | دليل استخدام مفصّل مع أمثلة |
| [CONSENT_QUICK_REFERENCE.md](./CONSENT_QUICK_REFERENCE.md) | مرجع سريع للمطورين |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | دليل الاختبار الشامل |
| [CONSENT_IMPLEMENTATION_SUMMARY.md](./CONSENT_IMPLEMENTATION_SUMMARY.md) | ملخص التنفيذ |
| [examples/consent-integration.example.ts](./examples/consent-integration.example.ts) | أمثلة عملية |

---

## 🔧 Quick Start

### 1. Import في Module آخر

```typescript
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class YourModule {}
```

### 2. استخدام ConsentService

```typescript
import { ConsentService } from '@/modules/auth/services/consent.service';
import { ConsentType } from '@/modules/auth/dto/consent.dto';

@Injectable()
export class YourService {
  constructor(private consentService: ConsentService) {}
  
  async checkUserConsent(userId: string) {
    return await this.consentService.checkConsent(
      userId,
      ConsentType.PRIVACY_POLICY
    );
  }
}
```

### 3. استخدام Guards

```typescript
import { RequireConsents, ConsentGuard } from '@/common/guards/consent.guard';
import { ConsentType } from '@/modules/auth/dto/consent.dto';

@Controller('orders')
export class OrderController {
  @Post()
  @UseGuards(ConsentGuard)
  @RequireConsents(ConsentType.PRIVACY_POLICY, ConsentType.TERMS_OF_SERVICE)
  async createOrder() {
    // محمي بموافقات
  }
}
```

---

## 🔗 API Endpoints

### Authentication
- `POST /auth/firebase/login` - تسجيل دخول Firebase
- `GET /auth/me` - بيانات المستخدم
- `PATCH /auth/profile` - تحديث الملف الشخصي

### Consents (جديد!)
- `POST /auth/consent` - تسجيل موافقة
- `POST /auth/consent/bulk` - موافقات متعددة
- `DELETE /auth/consent/:type` - سحب موافقة
- `GET /auth/consent/history` - سجل الموافقات
- `GET /auth/consent/summary` - ملخص الموافقات
- `GET /auth/consent/check/:type` - التحقق من موافقة

---

## 🛡️ Guards المتاحة

```typescript
// Guard عام
ConsentGuard + @RequireConsents()

// Guards محددة
PrivacyPolicyConsentGuard
TermsOfServiceConsentGuard

// Guards أخرى
UnifiedAuthGuard
RolesGuard
```

---

## 📊 Database Collections

### `users`
المستخدمين الأساسيين

### `user_consents` (جديد!)
```typescript
{
  userId: ObjectId,
  consentType: string,
  granted: boolean,
  version: string,
  consentDate: Date,
  ipAddress: string,
  userAgent: string,
  withdrawnAt?: Date,
  notes?: string
}
```

**Indexes**:
- `{ userId: 1, consentType: 1 }`
- `{ userId: 1, consentDate: -1 }`
- `{ userId: 1, consentType: 1, granted: 1, withdrawnAt: 1 }`
- `{ createdAt: -1 }`

---

## 🧪 الاختبار

### Swagger UI
```
http://localhost:3000/api
```

### Postman Collection
```
docs/CONSENT_POSTMAN_COLLECTION.json
```

### Manual Testing
راجع [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 💡 أمثلة الاستخدام

### Registration مع موافقات
```typescript
async register(userData, req) {
  const user = await this.createUser(userData);
  
  await this.consentService.recordBulkConsents(
    user._id,
    [
      { consentType: 'privacy_policy', granted: true, version: '1.0.0' },
      { consentType: 'terms_of_service', granted: true, version: '1.0.0' }
    ],
    req.ip,
    req.headers['user-agent']
  );
  
  return user;
}
```

### Marketing Check
```typescript
const hasConsent = await consentService.checkConsent(
  userId,
  ConsentType.MARKETING
);

if (hasConsent) {
  await sendMarketingEmail(userId);
}
```

للمزيد من الأمثلة: [examples/consent-integration.example.ts](./examples/consent-integration.example.ts)

---

## 🔒 Security & Compliance

- ✅ GDPR Compliant
- ✅ Audit Trail كامل
- ✅ IP و User Agent Tracking
- ✅ Version Control للسياسات
- ✅ حق النسيان (Right to be Forgotten)
- ✅ حق الوصول للبيانات (Data Portability)

---

## 🆘 الدعم

للأسئلة أو المشاكل:
1. راجع [CONSENT_USAGE_GUIDE.md](./CONSENT_USAGE_GUIDE.md)
2. راجع [CONSENT_QUICK_REFERENCE.md](./CONSENT_QUICK_REFERENCE.md)
3. راجع الأمثلة في `examples/`
4. استخدم Postman Collection للاختبار

---

## 📝 Notes

- جميع endpoints محمية بـ `UnifiedAuthGuard`
- الموافقات مسجّلة مع IP و User Agent
- Guards متاحة للاستخدام في أي module
- ConsentService exported للاستخدام الخارجي

---

**Last Updated**: 2025-10-14  
**Status**: ✅ Production Ready


# 🛡️ Rate Limiting Guide - دليل تحديد معدل الطلبات

## نظرة عامة
تم تطبيق Rate Limiting شامل باستخدام `@nestjs/throttler` لحماية الـ API من الإساءة والهجمات.

---

## 🎯 الإعدادات الافتراضية

### في `app.module.ts`:

```typescript
ThrottlerModule.forRoot([
  {
    name: 'default',
    ttl: 60000,   // 60 ثانية
    limit: 100,   // 100 طلب في الدقيقة
  },
  {
    name: 'strict',
    ttl: 60000,   // 60 ثانية
    limit: 10,    // 10 طلبات في الدقيقة (للعمليات الحساسة)
  },
  {
    name: 'auth',
    ttl: 60000,   // 60 ثانية
    limit: 5,     // 5 محاولات في الدقيقة (للمصادقة)
  },
])
```

---

## 📦 أنواع Rate Limiting

### 1. Default (افتراضي)
- **الحد**: 100 طلب / دقيقة
- **الاستخدام**: جميع endpoints غير المحددة
- **مناسب لـ**: عمليات القراءة العامة

### 2. Strict (صارم)
- **الحد**: 10 طلبات / دقيقة
- **الاستخدام**: العمليات المالية الحساسة
- **مناسب لـ**: تحويلات، سحوبات، معاملات

### 3. Auth (مصادقة)
- **الحد**: 5 محاولات / دقيقة
- **الاستخدام**: تسجيل الدخول والمصادقة
- **مناسب لـ**: حماية من brute force attacks

---

## 💻 كيفية الاستخدام

### 1. استخدام معدل محدد مسبقاً

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('wallet')
export class WalletController {
  
  // معدل صارم: 10 طلبات / دقيقة
  @Throttle({ strict: { ttl: 60000, limit: 10 } })
  @Post('transfer')
  async transfer() {
    // منطق التحويل
  }
  
  // معدل مصادقة: 5 محاولات / دقيقة
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login() {
    // منطق تسجيل الدخول
  }
}
```

### 2. تعطيل Rate Limiting

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
  
  // لا rate limiting على هذا endpoint
  @SkipThrottle()
  @Get('health')
  async healthCheck() {
    return { status: 'ok' };
  }
}
```

### 3. معدل مخصص

```typescript
@Throttle({ default: { ttl: 30000, limit: 50 } })  // 50 طلب في 30 ثانية
@Post('custom')
async customEndpoint() {
  // ...
}
```

---

## 🎨 Endpoints المطبقة

### Wallet (محفظة)
```typescript
✅ POST /wallet/transfer         → 5 طلبات / دقيقة
✅ POST /wallet/withdraw/request → 10 طلبات / دقيقة
✅ POST /wallet/transaction      → 10 طلبات / دقيقة (admin)
✅ GET  /wallet/balance          → بدون تحديد (SkipThrottle)
```

### Auth (مصادقة)
```typescript
✅ POST /auth/firebase/login     → 5 محاولات / دقيقة
✅ POST /auth/consent            → 10 طلبات / دقيقة
✅ GET  /auth/me                 → بدون تحديد (SkipThrottle)
```

---

## 📊 Response عند تجاوز الحد

عند تجاوز الحد المسموح:

**Status Code**: `429 Too Many Requests`

**Response**:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

**Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1697280000
Retry-After: 30
```

---

## 🔧 Configuration المتقدمة

### 1. تخصيص حسب المستخدم

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

export class UserBasedThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // استخدام user ID بدلاً من IP
    return req.user?.id || req.ip;
  }
}
```

### 2. Rate Limiting حسب الوقت

```typescript
// زيادة الحد في ساعات الذروة
const isPeakHours = () => {
  const hour = new Date().getHours();
  return hour >= 9 && hour <= 21;  // 9 صباحاً - 9 مساءً
};

const limit = isPeakHours() ? 50 : 100;
```

### 3. Whitelist لـ IPs

```typescript
export class WhitelistThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const whitelistedIPs = ['127.0.0.1', '::1'];
    
    return whitelistedIPs.includes(request.ip);
  }
}
```

---

## 🎯 Best Practices

### 1. استخدام الإعدادات المناسبة
```typescript
// ❌ سيء: Rate limiting صارم جداً على القراءة
@Throttle({ strict: { ttl: 60000, limit: 5 } })
@Get('products')
async getProducts() {}

// ✅ جيد: بدون تحديد أو معدل مخفف
@SkipThrottle()
@Get('products')
async getProducts() {}
```

### 2. حماية العمليات المالية
```typescript
// ✅ دائماً استخدم strict على التحويلات
@Throttle({ strict: { ttl: 60000, limit: 5 } })
@Post('wallet/transfer')
async transfer() {}
```

### 3. حماية المصادقة
```typescript
// ✅ حماية من brute force
@Throttle({ auth: { ttl: 60000, limit: 5 } })
@Post('auth/login')
async login() {}
```

### 4. Monitor والإحصائيات
```typescript
// إضافة logging عند تجاوز الحد
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    
    logger.warn('Rate limit exceeded', {
      ip: request.ip,
      path: request.url,
      user: request.user?.id,
    });
    
    // إرسال response
  }
}
```

---

## 📈 Monitoring & Analytics

### 1. تتبع التجاوزات
```typescript
// في ThrottlerExceptionFilter
async logRateLimitExceeded(req: Request) {
  await this.analyticsService.track({
    event: 'rate_limit_exceeded',
    userId: req.user?.id,
    ip: req.ip,
    endpoint: req.url,
    timestamp: new Date(),
  });
}
```

### 2. Dashboard للإحصائيات
```
- عدد الطلبات الكلي
- عدد التجاوزات
- أكثر IPs تجاوزاً
- أكثر endpoints تجاوزاً
- توزيع التجاوزات حسب الوقت
```

---

## 🔒 Security Considerations

### 1. لا تعتمد على IP فقط
- استخدم user ID عند المصادقة
- استخدم device fingerprinting
- استخدم session tokens

### 2. Bypass للـ Admin
```typescript
@UseGuards(AdminBypassThrottlerGuard)
@Post('admin/bulk-operation')
async bulkOperation() {
  // عمليات الإدارة بدون rate limiting
}
```

### 3. Progressive Rate Limiting
```typescript
// زيادة التقييد مع التجاوزات المتكررة
const getLimit = (violations: number) => {
  if (violations > 5) return 5;   // شديد جداً
  if (violations > 3) return 10;  // شديد
  return 20;                      // عادي
};
```

---

## 🧪 الاختبار

### Manual Testing
```bash
# اختبار rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:3000/wallet/transfer \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount": 100, "recipientPhone": "777123456"}'
  echo "Request $i"
  sleep 0.5
done
```

### Unit Testing
```typescript
describe('Rate Limiting', () => {
  it('should block after 5 requests', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .expect(200);
    }
    
    // الطلب السادس يجب أن يفشل
    await request(app.getHttpServer())
      .post('/auth/login')
      .expect(429);
  });
});
```

---

## 📝 Configuration File

`src/common/config/throttler.config.ts`:

```typescript
export const ThrottlerConfig = {
  default: { ttl: 60000, limit: 100 },
  strict: { ttl: 60000, limit: 10 },
  auth: { ttl: 60000, limit: 5 },
  read: { ttl: 60000, limit: 500 },
  public: { ttl: 60000, limit: 50 },
};
```

---

## 🎉 Summary

### تم تطبيقه:
✅ Global Rate Limiting (100 طلب / دقيقة)  
✅ Strict للعمليات المالية (10 طلبات / دقيقة)  
✅ Auth للمصادقة (5 محاولات / دقيقة)  
✅ SkipThrottle للقراءة  
✅ Configuration مخصصة  
✅ توثيق شامل  

### الحماية:
✅ من brute force attacks  
✅ من DDoS attacks  
✅ من API abuse  
✅ من الاستخدام المفرط  

---

**🛡️ نظام Rate Limiting جاهز ومحمي بالكامل! 🛡️**


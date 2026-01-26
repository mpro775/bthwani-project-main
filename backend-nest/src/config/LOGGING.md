# 📊 Logging System Documentation

## نظام الـ Logging في التطبيق

تم إعداد نظام logging احترافي باستخدام Winston للحصول على logs منظمة ومفيدة.

## 🔧 التكوين

### مستويات الـ Logs
- **error** - للأخطاء الحرجة
- **warn** - للتحذيرات المهمة
- **info** - للمعلومات العامة
- **debug** - للمعلومات التفصيلية (التطوير فقط)

### الملفات المُنشأة

في بيئة الإنتاج (`NODE_ENV=production`):

```
logs/
├── error.log          # أخطاء فقط (max 5MB × 5 files)
├── combined.log       # جميع المستويات (max 5MB × 10 files)
├── warn.log          # تحذيرات فقط (max 5MB × 3 files)
├── exceptions.log    # الأخطاء غير المتوقعة
└── rejections.log    # Promise rejections
```

في بيئة التطوير:

```
logs/
└── debug.log         # جميع المستويات للتطوير
```

## 📝 متغيرات البيئة

```env
# مستوى الـ Logging
LOG_LEVEL=debug              # للتطوير: debug
LOG_LEVEL=info               # للإنتاج: info أو warn

# البيئة
NODE_ENV=development         # development | production
```

## 🎯 كيفية الاستخدام

### في Service أو Controller

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  // إنشاء logger خاص بالـ class
  private readonly logger = new Logger(UserService.name);

  async createUser(data: CreateUserDto) {
    try {
      this.logger.log(`Creating user: ${data.email}`);
      
      const user = await this.userModel.create(data);
      
      this.logger.log(`User created successfully: ${user._id}`);
      return user;
      
    } catch (error) {
      this.logger.error(
        `Failed to create user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async suspiciousActivity(userId: string, reason: string) {
    this.logger.warn(`⚠️ Suspicious activity detected for user ${userId}: ${reason}`);
  }

  async debugInfo(message: string, data?: any) {
    this.logger.debug(`Debug: ${message}`, JSON.stringify(data));
  }
}
```

### مثال عملي - Wallet Service

```typescript
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  async createTransaction(dto: CreateTransactionDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      this.logger.log(`Starting transaction for user ${dto.userId}, amount: ${dto.amount}`);
      
      // العملية المالية...
      
      await session.commitTransaction();
      this.logger.log(`✅ Transaction completed successfully: ${transaction._id}`);
      
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `❌ Transaction failed for user ${dto.userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

### في Exception Filters

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    
    if (exception instanceof HttpException) {
      this.logger.warn(
        `HTTP Exception: ${exception.message} - ${request.method} ${request.url}`,
      );
    } else {
      this.logger.error(
        `Unhandled Exception: ${exception} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : '',
      );
    }
    
    // ... rest of filter logic
  }
}
```

## 🔍 فحص الـ Logs

### في التطوير
الـ Logs تظهر في الـ console مع ألوان:
```bash
npm run start:dev
```

### في الإنتاج
```bash
# عرض آخر 100 سطر من error log
tail -n 100 logs/error.log

# متابعة الـ logs مباشرة
tail -f logs/combined.log

# البحث عن كلمة معينة
grep "transaction" logs/combined.log

# عرض الأخطاء فقط
cat logs/error.log | jq .
```

## 📊 تنسيق الـ Logs

### في Console (Development)
```
2025-10-14 15:30:45 [INFO] [UserService] Creating user: user@example.com
```

### في Files (Production - JSON)
```json
{
  "timestamp": "2025-10-14T15:30:45.123Z",
  "level": "info",
  "context": "UserService",
  "message": "Creating user: user@example.com"
}
```

## ⚙️ Log Rotation

- **الحد الأقصى لحجم الملف**: 5MB
- **عدد الملفات المحفوظة**:
  - error.log: 5 ملفات
  - combined.log: 10 ملفات
  - warn.log: 3 ملفات
- عند الوصول للحد الأقصى، يتم إنشاء ملف جديد تلقائياً

## 🎯 Best Practices

### ✅ افعل:
```typescript
// استخدم context واضح
this.logger.log('User login successful', 'AuthService');

// أضف معلومات مفيدة
this.logger.error(`Payment failed for order ${orderId}: ${error.message}`, error.stack);

// استخدم emojis للملاحظات المهمة
this.logger.warn('⚠️ High memory usage detected');
```

### ❌ لا تفعل:
```typescript
// لا تستخدم console.log
console.log('Something happened'); // ❌

// لا تُسجل معلومات حساسة
this.logger.log(`User password: ${password}`); // ❌

// لا تُسجل كل شيء في production
if (process.env.NODE_ENV !== 'production') {
  this.logger.debug(hugeObject); // ✅
}
```

## 🔐 الأمان

**لا تُسجل أبداً:**
- كلمات المرور
- أرقام البطاقات الائتمانية
- API Keys أو Tokens
- PIN Codes
- أي معلومات شخصية حساسة (PII)

**بدلاً من ذلك:**
```typescript
// ❌ خطأ
this.logger.log(`User login: ${email} with password ${password}`);

// ✅ صحيح
this.logger.log(`User login attempt: ${email.substring(0, 3)}***`);
```

## 📈 Monitoring في الإنتاج

يمكن دمج الـ logs مع:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **CloudWatch** (AWS)
- **Application Insights** (Azure)

مثال لإرسال الـ logs إلى خدمة خارجية:
```typescript
// في logger.config.ts
import { WinstonCloudWatch } from 'winston-cloudwatch';

transports.push(
  new WinstonCloudWatch({
    logGroupName: 'bthwani-backend',
    logStreamName: 'production',
    awsRegion: process.env.AWS_REGION,
  })
);
```

---

**تم التوثيق بتاريخ**: 2025-10-14  
**النسخة**: 1.0


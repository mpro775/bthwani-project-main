# 📊 Tracing Middleware - OpenTelemetry Integration

## نظرة عامة

تم تحديث `TracingMiddleware` ليتكامل بشكل كامل مع OpenTelemetry لتتبع جميع HTTP requests وإرسال البيانات إلى OTEL Collector.

## ✨ المميزات

### 1. **Automatic Span Creation**
يتم إنشاء span تلقائياً لكل HTTP request يحتوي على:

- **Span Name**: `HTTP {METHOD} {PATH}`
- **HTTP Attributes**:
  - `http.method` - HTTP method (GET, POST, etc.)
  - `http.url` - Full URL
  - `http.target` - Request path
  - `http.host` - Hostname
  - `http.scheme` - Protocol (http/https)
  - `http.user_agent` - User agent
  - `http.client_ip` - Client IP address
  - `http.route` - Matched route pattern

### 2. **Response Tracking**
بعد انتهاء الـ request، يتم إضافة:

- `http.status_code` - HTTP status code
- `http.response_content_length` - Response size
- `http.duration_ms` - Request duration in milliseconds

### 3. **Status Codes**
- ✅ **2xx-3xx**: `SpanStatusCode.OK`
- ⚠️ **4xx**: `SpanStatusCode.ERROR` - Client error
- ❌ **5xx**: `SpanStatusCode.ERROR` - Server error

### 4. **Performance Monitoring**
- تسجيل event `slow_request` للطلبات التي تستغرق أكثر من 2 ثانية
- يتضمن `threshold_ms` و `actual_ms`

## 📋 Configuration

### Environment Variables

```bash
# Enable OpenTelemetry
ENABLE_TELEMETRY=true

# OTEL Collector endpoint
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Service information
SERVICE_NAME=bthwani-backend
APP_VERSION=1.0.0
NODE_ENV=production
```

### Setup in main.ts

تأكد من استدعاء `setupTelemetry()` في بداية التطبيق:

```typescript
import { setupTelemetry } from './config/telemetry.config';

async function bootstrap() {
  // Setup telemetry first
  setupTelemetry();
  
  const app = await NestFactory.create(AppModule);
  // ... rest of setup
}
```

## 🔍 Example Traces

### Successful Request

```json
{
  "name": "HTTP GET /api/users/123",
  "attributes": {
    "http.method": "GET",
    "http.url": "/api/users/123",
    "http.target": "/api/users/123",
    "http.host": "api.bthwani.com",
    "http.scheme": "https",
    "http.user_agent": "Mozilla/5.0...",
    "http.client_ip": "192.168.1.100",
    "http.route": "/api/users/:id",
    "http.status_code": 200,
    "http.response_content_length": 1024,
    "http.duration_ms": 45
  },
  "status": {
    "code": "OK"
  }
}
```

### Slow Request

```json
{
  "name": "HTTP POST /api/orders",
  "attributes": {
    "http.method": "POST",
    "http.status_code": 200,
    "http.duration_ms": 2500
  },
  "events": [
    {
      "name": "slow_request",
      "attributes": {
        "threshold_ms": 2000,
        "actual_ms": 2500
      }
    }
  ],
  "status": {
    "code": "OK"
  }
}
```

### Error Request

```json
{
  "name": "HTTP GET /api/users/999",
  "attributes": {
    "http.method": "GET",
    "http.status_code": 404,
    "http.duration_ms": 15
  },
  "status": {
    "code": "ERROR",
    "message": "Client error: 404"
  }
}
```

## 🎯 Benefits

### 1. **Distributed Tracing**
- تتبع الطلبات عبر الخدمات المختلفة
- ربط الـ spans معاً باستخدام trace context

### 2. **Performance Analysis**
- تحديد الـ endpoints البطيئة
- قياس زمن الاستجابة الفعلي
- اكتشاف bottlenecks

### 3. **Error Tracking**
- تتبع جميع الأخطاء مع السياق الكامل
- ربط الأخطاء بالـ traces

### 4. **User Experience Monitoring**
- قياس تجربة المستخدم الفعلية
- تحديد المشاكل قبل أن يبلغ عنها المستخدمون

## 📊 Integration with Observability Stack

### Grafana / Jaeger
```
HTTP Request → TracingMiddleware → Span Created → OTEL Collector → Backend (Jaeger/Tempo) → Grafana
```

### Query Examples

**Find slow requests:**
```
{http.duration_ms > 1000}
```

**Find errors:**
```
{http.status_code >= 500}
```

**Find specific endpoint:**
```
{http.route = "/api/orders"}
```

## 🔧 Troubleshooting

### Spans not appearing?

1. ✅ Check `ENABLE_TELEMETRY=true`
2. ✅ Verify OTEL Collector is running
3. ✅ Check `OTEL_EXPORTER_OTLP_ENDPOINT` is correct
4. ✅ Review console logs for telemetry initialization

### Missing attributes?

Ensure the request object has all required fields. Some attributes may be undefined in certain environments.

## 🚀 Future Enhancements

- [ ] Add trace context propagation headers
- [ ] Support for custom attributes via middleware options
- [ ] Sampling configuration
- [ ] Integration with business metrics

## 📚 Related Files

- `src/config/telemetry.config.ts` - OpenTelemetry configuration
- `ops/otel-collector-config.yml` - OTEL Collector configuration
- `docs/OBSERVABILITY_GUIDE.md` - Full observability guide

---

**Last Updated**: 2025-10-18  
**Status**: ✅ Production Ready  
**Integration**: OpenTelemetry API v1.9.0


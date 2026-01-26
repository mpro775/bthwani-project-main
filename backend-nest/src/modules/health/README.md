# Health Module - نظام الفحص الصحي للتطبيق

## نظرة عامة

وحدة شاملة لمراقبة صحة التطبيق باستخدام `@nestjs/terminus` مع فحوصات متقدمة لجميع الخدمات الأساسية.

## المميزات

### ✅ فحوصات أساسية
- **Database (MongoDB)**: فحص اتصال قاعدة البيانات
- **Memory**: مراقبة استخدام الذاكرة (Heap & RSS)
- **Disk**: مراقبة مساحة القرص
- **Cache/Redis**: فحص اتصال وأداء الكاش
- **Queues (Bull)**: فحص قوائم الانتظار والمهام

### ✅ فحوصات Kubernetes
- **Liveness Probe**: التحقق من أن التطبيق يعمل
- **Readiness Probe**: التحقق من جاهزية التطبيق
- **Startup Probe**: التحقق من اكتمال بدء التشغيل

### ✅ فحوصات متقدمة
- **Cache Performance**: قياس زمن استجابة الكاش
- **Queue Backlog**: مراقبة تراكم المهام
- **Failed Jobs**: تتبع المهام الفاشلة

## البنية

```
health/
├── indicators/
│   ├── redis.health.ts         # مؤشر صحة Redis/Cache
│   └── queue.health.ts         # مؤشر صحة Queues
├── health.controller.ts        # نقاط النهاية
├── health.module.ts            # تكوين الوحدة
└── README.md                   # هذا الملف
```

## التثبيت

```bash
# تثبيت المكتبات المطلوبة
npm install @nestjs/terminus @nestjs/axios
```

## نقاط النهاية (Endpoints)

### 1. الفحص الصحي الشامل

```http
GET /health
```

**الوصف:** فحص شامل لجميع المكونات الأساسية

**الفحوصات:**
- ✅ Database connection
- ✅ Memory heap (max 150 MB)
- ✅ Memory RSS (max 300 MB)
- ✅ Disk storage (90% threshold)
- ✅ Cache/Redis connection
- ✅ Queues status

**Response (Success - 200):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk_storage": {
      "status": "up"
    },
    "cache": {
      "status": "up"
    },
    "queues": {
      "status": "up",
      "queues": [...]
    }
  },
  "error": {},
  "details": {...}
}
```

**Response (Error - 503):**
```json
{
  "status": "error",
  "info": {...},
  "error": {
    "database": {
      "status": "down",
      "message": "..."
    }
  },
  "details": {...}
}
```

---

### 2. Liveness Probe

```http
GET /health/liveness
```

**الوصف:** فحص بسيط - هل التطبيق حي (alive)؟

**الاستخدام:** Kubernetes liveness probe

**الفحوصات:**
- ✅ Memory heap (max 500 MB)

**Response (200):**
```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    }
  }
}
```

**Kubernetes Configuration:**
```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

---

### 3. Readiness Probe

```http
GET /health/readiness
```

**الوصف:** هل التطبيق جاهز لاستقبال الطلبات؟

**الاستخدام:** Kubernetes readiness probe

**الفحوصات:**
- ✅ Database connection (2s timeout)
- ✅ Memory heap (max 200 MB)
- ✅ Cache/Redis connection

**Response (200):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "cache": {
      "status": "up"
    }
  }
}
```

**Kubernetes Configuration:**
```yaml
readinessProbe:
  httpGet:
    path: /health/readiness
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

---

### 4. Startup Probe

```http
GET /health/startup
```

**الوصف:** هل التطبيق أنهى عملية البدء؟

**الاستخدام:** Kubernetes startup probe

**Response (200):**
```json
{
  "started": true,
  "timestamp": "2025-10-14T10:00:00.000Z",
  "uptime": 120.5,
  "database": {
    "status": "connected",
    "readyState": 1
  }
}
```

**Kubernetes Configuration:**
```yaml
startupProbe:
  httpGet:
    path: /health/startup
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 30
```

---

### 5. Advanced Health Check

```http
GET /health/advanced
```

**الوصف:** فحص متقدم شامل مع جميع المؤشرات

**الفحوصات:**
- ✅ جميع الفحوصات الأساسية
- ✅ Cache performance (max 100ms latency)
- ✅ Queue backlog (max 1000 waiting jobs)
- ✅ Queue failed jobs (max 100 failures)

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {...},
    "memory_heap": {...},
    "memory_rss": {...},
    "disk_storage": {...},
    "cache": {...},
    "cache_performance": {
      "status": "up",
      "latencyMs": 45,
      "threshold": 100,
      "status": "optimal"
    },
    "queues": {...},
    "queue_backlog": {
      "status": "up",
      "queues": [
        {
          "name": "email",
          "waiting": 10,
          "active": 2,
          "failed": 0,
          "hasBacklog": false
        }
      ]
    },
    "queue_failures": {...}
  }
}
```

---

### 6. Detailed Health Check

```http
GET /health/detailed
```

**الوصف:** معلومات تفصيلية عن النظام

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "environment": {
    "nodeEnv": "production",
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "arch": "x64",
    "pid": 12345
  },
  "database": {
    "status": "connected",
    "readyState": 1,
    "name": "bthwani",
    "host": "localhost",
    "collections": 25
  },
  "memory": {
    "rss": 120,
    "heapTotal": 80,
    "heapUsed": 60,
    "heapUsedPercent": 75,
    "external": 5,
    "arrayBuffers": 2,
    "unit": "MB"
  },
  "cpu": {
    "user": 1234.56,
    "system": 567.89,
    "total": 1802.45,
    "unit": "ms"
  },
  "process": {
    "pid": 12345,
    "ppid": 1,
    "title": "node",
    "version": "v18.17.0",
    "versions": {...}
  }
}
```

---

### 7. Health Metrics

```http
GET /health/metrics
```

**الوصف:** مقاييس بسيطة للمراقبة

**Response:**
```json
{
  "timestamp": "2025-10-14T10:00:00.000Z",
  "uptime": 3600,
  "database": {
    "connected": true,
    "status": "connected"
  },
  "memory": {
    "heapUsedMB": 60,
    "heapTotalMB": 80,
    "rssMB": 120,
    "heapUsedPercent": 75
  },
  "status": "healthy"
}
```

---

### 8. Application Info

```http
GET /health/info
```

**الوصف:** معلومات التطبيق

**Response:**
```json
{
  "name": "Bthwani Backend",
  "version": "1.0.0",
  "description": "منصة بثواني للتوصيل والخدمات",
  "environment": "production",
  "nodeVersion": "v18.17.0",
  "startTime": "2025-10-14T09:00:00.000Z",
  "uptime": "1h 0m 0s",
  "timezone": "Asia/Riyadh"
}
```

---

## Health Indicators المخصصة

### RedisHealthIndicator

```typescript
import { RedisHealthIndicator } from './indicators/redis.health';

// في Controller أو Service
async checkRedis() {
  // فحص الاتصال
  await this.redis.isHealthy('cache');
  
  // فحص الأداء
  await this.redis.checkPerformance('cache_perf', 100); // 100ms max
}
```

**الميزات:**
- ✅ فحص القراءة والكتابة
- ✅ قياس زمن الاستجابة (latency)
- ✅ تنظيف تلقائي لمفاتيح الاختبار

### QueueHealthIndicator

```typescript
import { QueueHealthIndicator } from './indicators/queue.health';

// في Controller أو Service
async checkQueues() {
  // فحص حالة القوائم
  await this.queue.isHealthy('queues');
  
  // فحص التراكم
  await this.queue.checkBacklog('backlog', 1000); // 1000 jobs max
  
  // فحص الفشل
  await this.queue.checkFailedJobs('failures', 100); // 100 failures max
}
```

**الميزات:**
- ✅ فحص جميع القوائم (email, notification, order)
- ✅ عدد المهام (waiting, active, completed, failed)
- ✅ كشف التراكم (backlog detection)
- ✅ مراقبة المهام الفاشلة

---

## التكامل مع Kubernetes

### Complete Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bthwani-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: bthwani/backend:latest
        ports:
        - containerPort: 3000
        
        # Liveness: هل التطبيق حي؟
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Readiness: هل التطبيق جاهز؟
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Startup: هل التطبيق أنهى البدء؟
        startupProbe:
          httpGet:
            path: /health/startup
            port: 3000
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## المراقبة والتنبيهات

### Prometheus Integration

```typescript
// يمكن دمج metrics endpoint مع Prometheus
// GET /health/metrics يوفر البيانات بصيغة JSON
```

### مثال على Alert Rules

```yaml
groups:
  - name: bthwani_health
    interval: 30s
    rules:
      - alert: ApplicationDown
        expr: up{job="bthwani-backend"} == 0
        for: 1m
        annotations:
          summary: "Bthwani Backend is down"
      
      - alert: HighMemoryUsage
        expr: memory_heap_used_percent > 80
        for: 5m
        annotations:
          summary: "High memory usage detected"
      
      - alert: DatabaseDisconnected
        expr: database_connected == 0
        for: 1m
        annotations:
          summary: "Database connection lost"
      
      - alert: QueueBacklog
        expr: queue_waiting_jobs > 1000
        for: 10m
        annotations:
          summary: "High queue backlog detected"
```

---

## الاختبار

### اختبار محلي

```bash
# الفحص الأساسي
curl http://localhost:3000/health

# Liveness
curl http://localhost:3000/health/liveness

# Readiness
curl http://localhost:3000/health/readiness

# Detailed
curl http://localhost:3000/health/detailed

# Advanced
curl http://localhost:3000/health/advanced

# Metrics
curl http://localhost:3000/health/metrics

# Info
curl http://localhost:3000/health/info
```

### اختبار مع jq

```bash
# عرض حالة كل مكون
curl -s http://localhost:3000/health | jq '.info'

# عرض استخدام الذاكرة
curl -s http://localhost:3000/health/metrics | jq '.memory'

# عرض حالة قواعد البيانات
curl -s http://localhost:3000/health/detailed | jq '.database'
```

---

## أفضل الممارسات

### 1. تحديد Thresholds المناسبة

```typescript
// حسب موارد الخادم
memory.checkHeap('heap', 200 * 1024 * 1024) // 200 MB
memory.checkRSS('rss', 400 * 1024 * 1024)   // 400 MB

// حسب حجم الـ traffic
queue.checkBacklog('backlog', 5000)         // 5000 jobs
```

### 2. Timeout مناسب

```typescript
// Liveness: timeout قصير
db.pingCheck('db', { timeout: 1000 })

// Readiness: timeout متوسط
db.pingCheck('db', { timeout: 3000 })
```

### 3. فصل الفحوصات

- **Liveness**: فحوصات خفيفة فقط
- **Readiness**: فحوصات شاملة
- **Advanced**: للمراقبة والتشخيص

### 4. التسجيل والمراقبة

```typescript
// إضافة logging عند الفشل
try {
  await this.health.check([...]);
} catch (error) {
  this.logger.error('Health check failed', error);
  // إرسال تنبيه
}
```

---

## استكشاف الأخطاء

### Database Connection Failed

```bash
# التحقق من MongoDB
curl http://localhost:3000/health/detailed | jq '.database'

# الحل:
# - تحقق من MONGODB_URI في .env
# - تأكد من تشغيل MongoDB
# - تحقق من firewall rules
```

### Cache/Redis Connection Failed

```bash
# التحقق من Redis
curl http://localhost:3000/health/advanced

# الحل:
# - تحقق من Redis configuration
# - تأكد من تشغيل Redis server
# - تحقق من CACHE settings
```

### High Memory Usage

```bash
# مراقبة الذاكرة
curl http://localhost:3000/health/metrics | jq '.memory'

# الحل:
# - زيادة memory limits
# - تحسين الكود
# - إضافة garbage collection
```

### Queue Backlog

```bash
# التحقق من Queues
curl http://localhost:3000/health/advanced | jq '.info.queue_backlog'

# الحل:
# - زيادة عدد workers
# - تحسين معالجة المهام
# - تقليل rate limits
```

---

## الخطوات التالية

- ✅ **التثبيت**: `npm install @nestjs/terminus @nestjs/axios`
- ✅ **الاختبار**: اختبر جميع endpoints
- ⏳ **Kubernetes**: أضف probes في deployment
- ⏳ **Monitoring**: ادمج مع Prometheus/Grafana
- ⏳ **Alerts**: أعد alerting rules

---

## الدعم

للأسئلة أو المشاكل، يرجى التواصل مع فريق DevOps.


# ===================================
# Build Stage
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# تثبيت كل الاعتماديات (بما فيها dev) للبناء — legacy-peer-deps لتجاوز تعارضات المكتبات
RUN npm install --legacy-peer-deps && npm cache clean --force

# نسخ ملفات الإعدادات أولاً
COPY tsconfig*.json ./
COPY nest-cli.json ./

# نسخ باقي الملفات
COPY . .

# بناء التطبيق مع التحقق من النجاح
RUN echo "🔨 بدء عملية البناء..." && \
    npm run build && \
    echo "✅ البناء نجح!" || \
    (echo "❌ Build failed!" && exit 1)

# التحقق من وجود ملف dist/main.js
RUN echo "🔍 التحقق من ملفات البناء..." && \
    ls -la /app/dist/ && \
    (test -f /app/dist/main.js || test -f /app/dist/src/main.js) || \
    (echo "❌ dist/main.js or dist/src/main.js not found!" && ls -la /app/dist/ && exit 1)

# ===================================
# Production Stage
# ===================================
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

COPY package*.json ./

# هنا فقط نثبت حزم الإنتاج (npm install + legacy-peer-deps لتجاوز تعارضات المكتبات)
RUN npm install --production --legacy-peer-deps && npm cache clean --force

# نسخ ملفات البناء مع التحقق
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# التحقق من وجود ملفات البناء بعد النسخ
RUN (test -f /app/dist/main.js || test -f /app/dist/src/main.js) || \
    (echo "❌ dist/main.js or dist/src/main.js not found after copy!" && ls -la /app/dist/ && exit 1)
RUN ls -la /app/dist/ || (echo "❌ dist directory is empty!" && exit 1)

# إنشاء مجلد logs وإعطاء الصلاحيات للمستخدم nestjs
RUN mkdir -p /app/logs && \
    chown -R nestjs:nodejs /app/logs && \
    chmod -R 755 /app/logs

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# استخدام المسار الصحيح بناءً على مكان الملف (بعد إضافة rootDir في tsconfig.json يجب أن يكون dist/main.js)
CMD ["node", "dist/main.js"]
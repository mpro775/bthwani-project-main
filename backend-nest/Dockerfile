# ===================================
# Build Stage
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# تثبيت كل الاعتماديات (بما فيها dev) للبناء — legacy-peer-deps لتجاوز تعارضات المكتبات
RUN npm install --legacy-peer-deps && npm cache clean --force

COPY . .

RUN npm run build

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

# نسخ ملفات البناء
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main"]
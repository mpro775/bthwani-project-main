# ===================================
# Build Stage
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (legacy-peer-deps لتجاوز تعارضات المكتبات)
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy source code
COPY . .

# Clean any existing build artifacts and cache
RUN rm -rf dist node_modules/.vite

# Build the application with production mode (increase Node heap for Vite build)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build:prod

# ===================================
# Production Stage
# ===================================
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

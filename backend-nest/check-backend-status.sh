#!/bin/bash

echo "=========================================="
echo "🔍 فحص حالة Backend Container"
echo "=========================================="
echo ""

# التحقق من وجود الـ container
echo "1️⃣ التحقق من وجود الـ container..."
if docker ps -a | grep -q "bthwani-backend"; then
    echo "✅ Container موجود"
    docker ps -a | grep "bthwani-backend"
else
    echo "❌ Container غير موجود!"
    exit 1
fi

echo ""
echo "2️⃣ التحقق من حالة الـ container..."
CONTAINER_STATUS=$(docker inspect -f '{{.State.Status}}' bthwani-backend 2>/dev/null)
if [ "$CONTAINER_STATUS" = "running" ]; then
    echo "✅ Container قيد التشغيل"
else
    echo "❌ Container غير قيد التشغيل! الحالة: $CONTAINER_STATUS"
    echo "💡 حاول: docker start bthwani-backend"
    exit 1
fi

echo ""
echo "3️⃣ التحقق من الـ health check..."
HEALTH_STATUS=$(docker inspect -f '{{.State.Health.Status}}' bthwani-backend 2>/dev/null)
if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "✅ Container صحي (healthy)"
elif [ "$HEALTH_STATUS" = "starting" ]; then
    echo "⏳ Container قيد البدء..."
elif [ "$HEALTH_STATUS" = "unhealthy" ]; then
    echo "❌ Container غير صحي (unhealthy)"
else
    echo "⚠️  حالة Health غير معروفة: $HEALTH_STATUS"
fi

echo ""
echo "4️⃣ التحقق من الـ logs (آخر 20 سطر)..."
docker logs --tail 20 bthwani-backend

echo ""
echo "5️⃣ التحقق من الاتصال بالشبكة..."
if docker network inspect bthwani-network > /dev/null 2>&1; then
    echo "✅ الشبكة موجودة"
    echo "📡 Containers في الشبكة:"
    docker network inspect bthwani-network --format '{{range .Containers}}{{.Name}} {{end}}'
else
    echo "❌ الشبكة غير موجودة!"
fi

echo ""
echo "6️⃣ اختبار الاتصال من داخل الـ container..."
docker exec bthwani-backend node -e "require('http').get('http://localhost:3000/health/liveness', (r) => {console.log('Status:', r.statusCode); process.exit(r.statusCode === 200 ? 0 : 1)})" 2>&1

echo ""
echo "7️⃣ التحقق من المنفذ 3000..."
if docker exec bthwani-backend netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✅ المنفذ 3000 مفتوح"
else
    echo "❌ المنفذ 3000 غير مفتوح!"
fi

echo ""
echo "=========================================="
echo "✅ انتهى الفحص"
echo "=========================================="

#!/bin/bash

echo "=========================================="
echo "🔨 إعادة بناء Backend Container"
echo "=========================================="
echo ""

# إيقاف الـ container إذا كان يعمل
echo "1️⃣ إيقاف الـ container الحالي..."
docker stop bthwani-backend 2>/dev/null || echo "Container غير قيد التشغيل"
docker rm bthwani-backend 2>/dev/null || echo "Container غير موجود"

# حذف الـ image القديمة
echo ""
echo "2️⃣ حذف الـ image القديمة..."
docker rmi bthwani-project-main-backend 2>/dev/null || echo "Image غير موجودة"

# إعادة البناء بدون cache
echo ""
echo "3️⃣ إعادة بناء الـ image (بدون cache)..."
cd ..
docker-compose build --no-cache backend

# التحقق من نجاح البناء
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ البناء نجح!"
    echo ""
    echo "4️⃣ تشغيل الـ container..."
    docker-compose up -d backend
    
    echo ""
    echo "5️⃣ انتظار بدء الـ container (30 ثانية)..."
    sleep 30
    
    echo ""
    echo "6️⃣ فحص الـ logs..."
    docker logs --tail 50 bthwani-backend
    
    echo ""
    echo "=========================================="
    echo "✅ انتهى إعادة البناء"
    echo "=========================================="
    echo ""
    echo "💡 لمتابعة الـ logs:"
    echo "   docker logs -f bthwani-backend"
else
    echo ""
    echo "❌ فشل البناء! راجع الأخطاء أعلاه"
    exit 1
fi

# PowerShell script to rebuild backend container

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔨 إعادة بناء Backend Container" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# إيقاف الـ container إذا كان يعمل
Write-Host "1️⃣ إيقاف الـ container الحالي..." -ForegroundColor Yellow
docker stop bthwani-backend 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Container تم إيقافه" -ForegroundColor Green
} else {
    Write-Host "Container غير قيد التشغيل" -ForegroundColor Yellow
}

docker rm bthwani-backend 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Container تم حذفه" -ForegroundColor Green
} else {
    Write-Host "Container غير موجود" -ForegroundColor Yellow
}

# حذف الـ image القديمة
Write-Host ""
Write-Host "2️⃣ حذف الـ image القديمة..." -ForegroundColor Yellow
docker rmi bthwani-project-main-backend 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Image تم حذفها" -ForegroundColor Green
} else {
    Write-Host "Image غير موجودة" -ForegroundColor Yellow
}

# إعادة البناء بدون cache
Write-Host ""
Write-Host "3️⃣ إعادة بناء الـ image (بدون cache)..." -ForegroundColor Yellow
Set-Location ..
docker-compose build --no-cache backend

# التحقق من نجاح البناء
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ البناء نجح!" -ForegroundColor Green
    Write-Host ""
    Write-Host "4️⃣ تشغيل الـ container..." -ForegroundColor Yellow
    docker-compose up -d backend
    
    Write-Host ""
    Write-Host "5️⃣ انتظار بدء الـ container (30 ثانية)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host ""
    Write-Host "6️⃣ فحص الـ logs..." -ForegroundColor Yellow
    docker logs --tail 50 bthwani-backend
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "✅ انتهى إعادة البناء" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 لمتابعة الـ logs:" -ForegroundColor Cyan
    Write-Host "   docker logs -f bthwani-backend" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ فشل البناء! راجع الأخطاء أعلاه" -ForegroundColor Red
    exit 1
}

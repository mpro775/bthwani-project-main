# PowerShell script to check backend container status

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 فحص حالة Backend Container" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود الـ container
Write-Host "1️⃣ التحقق من وجود الـ container..." -ForegroundColor Yellow
$container = docker ps -a | Select-String "bthwani-backend"
if ($container) {
    Write-Host "✅ Container موجود" -ForegroundColor Green
    docker ps -a | Select-String "bthwani-backend"
} else {
    Write-Host "❌ Container غير موجود!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣ التحقق من حالة الـ container..." -ForegroundColor Yellow
$status = docker inspect -f '{{.State.Status}}' bthwani-backend 2>$null
if ($status -eq "running") {
    Write-Host "✅ Container قيد التشغيل" -ForegroundColor Green
} else {
    Write-Host "❌ Container غير قيد التشغيل! الحالة: $status" -ForegroundColor Red
    Write-Host "💡 حاول: docker start bthwani-backend" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "3️⃣ التحقق من الـ health check..." -ForegroundColor Yellow
$health = docker inspect -f '{{.State.Health.Status}}' bthwani-backend 2>$null
if ($health -eq "healthy") {
    Write-Host "✅ Container صحي (healthy)" -ForegroundColor Green
} elseif ($health -eq "starting") {
    Write-Host "⏳ Container قيد البدء..." -ForegroundColor Yellow
} elseif ($health -eq "unhealthy") {
    Write-Host "❌ Container غير صحي (unhealthy)" -ForegroundColor Red
} else {
    Write-Host "⚠️  حالة Health غير معروفة: $health" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4️⃣ التحقق من الـ logs (آخر 20 سطر)..." -ForegroundColor Yellow
docker logs --tail 20 bthwani-backend

Write-Host ""
Write-Host "5️⃣ التحقق من الاتصال بالشبكة..." -ForegroundColor Yellow
$network = docker network inspect bthwani-network 2>$null
if ($network) {
    Write-Host "✅ الشبكة موجودة" -ForegroundColor Green
    Write-Host "📡 Containers في الشبكة:" -ForegroundColor Cyan
    docker network inspect bthwani-network --format '{{range .Containers}}{{.Name}} {{end}}'
} else {
    Write-Host "❌ الشبكة غير موجودة!" -ForegroundColor Red
}

Write-Host ""
Write-Host "6️⃣ اختبار الاتصال من داخل الـ container..." -ForegroundColor Yellow
docker exec bthwani-backend node -e "require('http').get('http://localhost:3000/health/liveness', (r) => {console.log('Status:', r.statusCode); process.exit(r.statusCode === 200 ? 0 : 1)})" 2>&1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ انتهى الفحص" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

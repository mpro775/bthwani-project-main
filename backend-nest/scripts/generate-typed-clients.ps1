# BTW-AUD-001: Generate Typed API Clients from OpenAPI
# PowerShell version for Windows

Write-Host "🔧 BThwani Typed Client Generator - BTW-AUD-001" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Ensure OpenAPI spec exists
if (-not (Test-Path "reports/openapi.json")) {
    Write-Host "📝 Generating OpenAPI spec..." -ForegroundColor Yellow
    npm run audit:openapi
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate OpenAPI spec" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ OpenAPI spec found: reports/openapi.json" -ForegroundColor Green
Write-Host ""

# Install openapi-typescript-codegen if needed
Write-Host "📦 Checking openapi-typescript-codegen..." -ForegroundColor Yellow
$installed = npm list -g --depth=0 2>$null | Select-String "openapi-typescript-codegen"
if (-not $installed) {
    Write-Host "📥 Installing openapi-typescript-codegen globally..." -ForegroundColor Yellow
    npm install -g @openapitools/openapi-generator-cli
}

# Generate client for admin-dashboard
Write-Host "📦 Generating client for admin-dashboard..." -ForegroundColor Cyan
npx openapi-typescript-codegen `
    --input reports/openapi.json `
    --output ../admin-dashboard/src/api/generated `
    --client axios `
    --useOptions `
    --useUnionTypes `
    --exportCore true `
    --exportServices true `
    --exportModels true

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin dashboard client generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Admin dashboard client generation had warnings" -ForegroundColor Yellow
}
Write-Host ""

# Generate client for bthwani-web
Write-Host "📦 Generating client for bthwani-web..." -ForegroundColor Cyan
npx openapi-typescript-codegen `
    --input reports/openapi.json `
    --output ../bthwani-web/src/api/generated `
    --client axios `
    --useOptions `
    --useUnionTypes `
    --exportCore true `
    --exportServices true `
    --exportModels true

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web client generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Web client generation had warnings" -ForegroundColor Yellow
}
Write-Host ""

# Generate client for app-user
Write-Host "📦 Generating client for app-user..." -ForegroundColor Cyan
npx openapi-typescript-codegen `
    --input reports/openapi.json `
    --output ../app-user/src/api/generated `
    --client axios `
    --useOptions `
    --useUnionTypes `
    --exportCore true `
    --exportServices true `
    --exportModels true

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ App user client generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  App user client generation had warnings" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "✅ All typed clients generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review generated clients in src/api/generated/" -ForegroundColor White
Write-Host "   2. Replace raw axios calls with typed service calls" -ForegroundColor White
Write-Host "   3. Update imports to use generated types" -ForegroundColor White
Write-Host "   4. Run tests to verify integration" -ForegroundColor White
Write-Host ""
Write-Host "💡 Usage example:" -ForegroundColor Cyan
Write-Host "   import { UsersService } from '@/api/generated';" -ForegroundColor White
Write-Host "   const users = await UsersService.getUsers();" -ForegroundColor White
Write-Host ""


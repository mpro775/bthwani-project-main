# Remove TODO comments from Controllers

param(
    [string]$Scope = "controllers"
)

Write-Host "======================" -ForegroundColor Cyan
Write-Host "BThwani TODO Remover" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

$srcPath = Join-Path $PSScriptRoot "..\src"
$todoPattern = '^\s*//\s*TODO:.*$'
$filesModified = 0
$todosRemoved = 0

if ($Scope -eq "controllers") {
    Write-Host "Scope: Controllers only" -ForegroundColor Yellow
    $files = Get-ChildItem -Path $srcPath -Filter "*.controller.ts" -Recurse
} else {
    Write-Host "WARNING: Scope ALL TypeScript files" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Type YES to continue"
    
    if ($confirm -ne "YES") {
        Write-Host "Cancelled" -ForegroundColor Red
        exit 0
    }
    
    Write-Host ""
    $files = Get-ChildItem -Path $srcPath -Filter "*.ts" -Recurse | Where-Object { 
        $_.FullName -notmatch '\\node_modules\\' -and 
        $_.FullName -notmatch '\\dist\\' -and
        $_.Name -notmatch '\.spec\.ts$' -and
        $_.Name -notmatch '\.test\.ts$'
    }
}

Write-Host "Found $($files.Count) files" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if (-not $content) {
            continue
        }
        
        $matches = [regex]::Matches($content, $todoPattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
        $todoCount = $matches.Count
        
        if ($todoCount -gt 0) {
            Write-Host "$($file.Name): $todoCount TODOs" -ForegroundColor Green
            
            $lines = $content -split "`r?`n"
            $newLines = $lines | Where-Object { $_ -notmatch $todoPattern }
            $newContent = $newLines -join "`n"
            $newContent = $newContent -replace "(`n){3,}", "`n`n"
            
            Set-Content -Path $file.FullName -Value $newContent -NoNewline -ErrorAction SilentlyContinue
            
            $filesModified++
            $todosRemoved += $todoCount
        }
    } catch {
        Write-Host "Error: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================" -ForegroundColor Green
Write-Host "Complete!" -ForegroundColor Green
Write-Host "Files modified: $filesModified" -ForegroundColor Cyan
Write-Host "TODOs removed: $todosRemoved" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Green

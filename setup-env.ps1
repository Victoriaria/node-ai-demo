# Vercel 环境变量设置脚本

Write-Host "开始设置 Vercel 环境变量..." -ForegroundColor Green

# 设置 COZE_API_KEY
Write-Host "`n1. 设置 COZE_API_KEY..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR"
echo $env:VERCEL_ENV_VALUE | vercel env add COZE_API_KEY production

# 设置 COZE_BOT_ID
Write-Host "`n2. 设置 COZE_BOT_ID..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "7621043639807967270"
echo $env:VERCEL_ENV_VALUE | vercel env add COZE_BOT_ID production

# 设置 USE_MOCK_DATA
Write-Host "`n3. 设置 USE_MOCK_DATA..." -ForegroundColor Yellow
$env:VERCEL_ENV_VALUE = "true"
echo $env:VERCEL_ENV_VALUE | vercel env add USE_MOCK_DATA production

Write-Host "`n✅ 环境变量设置完成！" -ForegroundColor Green
Write-Host "`n现在重新部署..." -ForegroundColor Yellow

# 重新部署
vercel --prod

Write-Host "`n🎉 部署完成！" -ForegroundColor Green

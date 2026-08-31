$data = Get-Content coolify_app_logs.json -Raw | ConvertFrom-Json
Write-Host $data.logs

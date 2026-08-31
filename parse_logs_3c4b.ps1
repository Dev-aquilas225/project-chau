$data = Get-Content coolify_dep_log_3c4b.json -Raw | ConvertFrom-Json
Write-Host "Status: $($data.status)"
if ($data.logs) {
    $logs = $data.logs | ConvertFrom-Json
    $lastLogs = $logs | Select-Object -Last 100
    foreach ($line in $lastLogs) {
        Write-Host "$($line.timestamp) [$($line.type)] $($line.output)"
    }
}

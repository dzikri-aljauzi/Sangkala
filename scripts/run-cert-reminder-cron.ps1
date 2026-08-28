# Trigger endpoint cron reminder sertifikat -- bisa dipanggil manual (testing
# instan) atau lewat schedule-cert-reminder-test.ps1 (testing "natural", cron
# ke-trigger sendiri oleh jadwal, mirip crontab production). Baca CRON_SECRET
# dari .env project root supaya nilainya satu sumber, nggak dobel/bisa beda
# sendiri dari script ini.
#
# Pemakaian manual (testing instan, nggak perlu nunggu):
#   powershell -File scripts\run-cert-reminder-cron.ps1
#
# Hasil tiap run ditambahkan (append) ke scripts\cert-reminder-cron.log
# (gitignored) -- biar riwayat beberapa kali test kelihatan, bukan cuma
# yang terakhir.

$projectRoot = Split-Path $PSScriptRoot -Parent
$envPath = Join-Path $projectRoot ".env"
$logPath = Join-Path $PSScriptRoot "cert-reminder-cron.log"
$taskName = "CertReminderCronTest"
$url = "http://localhost:3000/api/cron/certification-reminders"

function Get-EnvValue($key) {
    if (-not (Test-Path $envPath)) { return $null }
    $line = Get-Content $envPath | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
    if (-not $line) { return $null }
    return ($line -split "=", 2)[1].Trim().Trim('"')
}

$secret = Get-EnvValue "CRON_SECRET"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

if (-not $secret) {
    $line = "$timestamp ERROR CRON_SECRET tidak ditemukan/kosong di .env -- endpoint bakal nolak semua request"
    Add-Content -Path $logPath -Value $line
    Write-Output $line
    exit 1
}

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{ "x-cron-secret" = $secret }
    $line = "$timestamp OK $($response | ConvertTo-Json -Compress)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $line = "$timestamp ERROR (status=$statusCode) $($_.Exception.Message)"
}

Add-Content -Path $logPath -Value $line
Write-Output $line

# Best-effort self-cleanup: kalau script ini dipanggil LEWAT scheduled task
# one-shot (schedule-cert-reminder-test.ps1), task-nya dihapus sendiri di sini
# begitu selesai fire -- jadi nggak pernah nyangkut jadi entry mati di Task
# Scheduler. Kalau dipanggil manual (nggak ada task terdaftar), baris ini
# no-op diam-diam (2>$null nutupin error "task not found").
schtasks /delete /tn $taskName /f 2>$null | Out-Null

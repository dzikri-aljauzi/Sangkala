# Jadwalin satu-kali test trigger cron reminder sertifikat N menit dari
# sekarang, lewat Windows Task Scheduler -- analog paling deket ke OS crontab
# production (lihat docs/09-deployment.md), buat verifikasi endpoint-nya
# beneran ke-trigger sendiri oleh waktu, bukan manual klik/curl. Task ini
# otomatis bersih sendiri sesudah fire (self-cleanup ada di
# run-cert-reminder-cron.ps1, bukan di sini), jadi aman dipanggil berkali-kali
# tanpa nyisain entry mati di Task Scheduler.
#
# Syarat: dev server (`npm run dev`) harus nyala di localhost:3000 pas
# jadwalnya fire, dan CRON_SECRET harus sudah ada di .env.
#
# Pemakaian:
#   powershell -File scripts\schedule-cert-reminder-test.ps1                  # default 3 menit
#   powershell -File scripts\schedule-cert-reminder-test.ps1 -MinutesFromNow 10

param(
    [int]$MinutesFromNow = 3
)

$taskName = "CertReminderCronTest"
$scriptPath = Join-Path $PSScriptRoot "run-cert-reminder-cron.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Error "Nggak ketemu $scriptPath -- pastikan run-cert-reminder-cron.ps1 ada di folder yang sama."
    exit 1
}

# Bersihin task lama kalau masih nyangkut dari run sebelumnya yang gagal cleanup.
schtasks /delete /tn $taskName /f 2>$null | Out-Null

$triggerTime = (Get-Date).AddMinutes($MinutesFromNow)
$st = $triggerTime.ToString("HH:mm")
# CATATAN locale: schtasks di mesin ini expect start-date format dd/MM/yyyy,
# BUKAN format .NET culture bawaan (M/d/yyyy) -- kalau dipindah ke mesin lain
# dan formatnya beda, schtasks bakal nolak dengan "Invalid Start Date" atau
# "Incorrect Start Date". Kalau itu kejadian, cek (Get-Culture).DateTimeFormat
# dan sesuaikan baris di bawah.
$sd = $triggerTime.ToString("dd/MM/yyyy")

$action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
$cmdLine = "schtasks /create /tn `"$taskName`" /tr `"$action`" /sc once /st $st /sd $sd /rl LIMITED /f"
cmd /c $cmdLine

Write-Output ""
Write-Output "Dijadwalkan fire jam $st ($sd), $MinutesFromNow menit dari sekarang."
Write-Output "Log hasil (nambah tiap run): $(Join-Path $PSScriptRoot 'cert-reminder-cron.log')"
Write-Output "Task otomatis hilang sendiri setelah fire -- nggak perlu cleanup manual."

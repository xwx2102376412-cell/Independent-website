param(
    [int]$StorefrontPort = 3000,
    [int]$AdminPort = 3001
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateDir = Join-Path $root ".public-demo"
$cloudflared = Join-Path $root "tools\cloudflared.exe"

if (-not (Test-Path -LiteralPath $cloudflared)) { throw "cloudflared.exe was not found at $cloudflared" }
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null

function Test-PortInUse([int]$Port) {
    return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-Tunnel([string]$Name, [int]$Port) {
    $stdout = Join-Path $stateDir "${Name}.out.log"
    $stderr = Join-Path $stateDir "${Name}.err.log"
    $pidFile = Join-Path $stateDir "${Name}.pid"
    $process = Start-Process -FilePath $cloudflared -ArgumentList @("tunnel", "--no-autoupdate", "--url", "http://localhost:$Port") -WorkingDirectory $root -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ascii
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 500
        $log = @()
        if (Test-Path -LiteralPath $stdout) { $log += Get-Content -LiteralPath $stdout -Raw -ErrorAction SilentlyContinue }
        if (Test-Path -LiteralPath $stderr) { $log += Get-Content -LiteralPath $stderr -Raw -ErrorAction SilentlyContinue }
        $match = [regex]::Match(($log -join "`n"), 'https://[a-z0-9-]+\.trycloudflare\.com')
        if ($match.Success) { return $match.Value }
        if ($process.HasExited) { break }
    }
    $details = if (Test-Path -LiteralPath $stderr) { Get-Content -LiteralPath $stderr -Raw } else { "no error log" }
    throw "Could not start the $Name tunnel. $details"
}

if (Test-PortInUse $StorefrontPort) { Write-Warning "Port $StorefrontPort is already in use. The existing storefront process will be reused." }

$storefrontUrl = Start-Tunnel -Name "storefront-tunnel" -Port $StorefrontPort

if (-not (Test-PortInUse $StorefrontPort)) {
    $storefrontArgs = '/d', '/c', "set NEXT_PUBLIC_APP_URL=${storefrontUrl}&& npm run dev:storefront"
    $storefront = Start-Process -FilePath "cmd.exe" -ArgumentList $storefrontArgs -WorkingDirectory $root -RedirectStandardOutput (Join-Path $stateDir "storefront.out.log") -RedirectStandardError (Join-Path $stateDir "storefront.err.log") -PassThru
    Set-Content -LiteralPath (Join-Path $stateDir "storefront.pid") -Value $storefront.Id -Encoding ascii
}

if (-not (Test-PortInUse $AdminPort)) {
    $adminArgs = '/d', '/c', "set NEXT_PUBLIC_APP_URL=${storefrontUrl}&& npm run dev:admin"
    $admin = Start-Process -FilePath "cmd.exe" -ArgumentList $adminArgs -WorkingDirectory $root -RedirectStandardOutput (Join-Path $stateDir "admin.out.log") -RedirectStandardError (Join-Path $stateDir "admin.err.log") -PassThru
    Set-Content -LiteralPath (Join-Path $stateDir "admin.pid") -Value $admin.Id -Encoding ascii
}

$urls = @(
    "Storefront public URL: $storefrontUrl",
    "Storefront local URL: http://localhost:$StorefrontPort",
    "Admin local URL: http://localhost:$AdminPort",
    "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
)
Set-Content -LiteralPath (Join-Path $stateDir "urls.txt") -Value $urls -Encoding ascii
$urls | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Stop: powershell -ExecutionPolicy Bypass -File .\stop-public-demo.ps1"
Write-Host "Admin is local-only. Uploaded images are served through the storefront public URL."
Write-Host "This URL is temporary and expires when the tunnel process stops."

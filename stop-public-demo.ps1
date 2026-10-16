$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateDir = Join-Path $root ".public-demo"

foreach ($name in @("storefront-tunnel", "admin-tunnel", "storefront", "admin")) {
    $pidFile = Join-Path $stateDir "$name.pid"
    if (Test-Path -LiteralPath $pidFile) {
        $processId = [int](Get-Content -LiteralPath $pidFile -Raw).Trim()
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($null -ne $process) {
            Stop-Process -Id $processId -Force
            Write-Host "已停止 $name 进程 PID=$processId"
        }
        Remove-Item -LiteralPath $pidFile
    }
}

Write-Host "公网隧道已关闭。项目文件、PostgreSQL 和 .env 未被修改。"

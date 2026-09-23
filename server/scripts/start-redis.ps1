param(
  [Parameter(Mandatory = $true)][string]$RedisServer,
  [ValidateRange(1024, 65535)][int]$Port = 6379
)
$ErrorActionPreference = 'Stop'
$serverRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$executable = (Resolve-Path -LiteralPath $RedisServer).Path
$runtimePath = Join-Path $serverRoot '.runtime\redis'
New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
$configPath = Join-Path $serverRoot 'redis.local.conf'
Copy-Item -LiteralPath $configPath -Destination (Join-Path $runtimePath 'redis.local.conf') -Force
$redisProcess = Start-Process -FilePath $executable -WindowStyle Hidden -WorkingDirectory $runtimePath `
  -ArgumentList @('redis.local.conf', '--port', $Port) `
  -RedirectStandardOutput (Join-Path $runtimePath 'stdout.log') `
  -RedirectStandardError (Join-Path $runtimePath 'stderr.log') -PassThru
$redisProcess.Id | Set-Content (Join-Path $runtimePath 'redis.pid')
Write-Output "Redis launch requested on 127.0.0.1:$Port (PID $($redisProcess.Id)). Logs: $runtimePath"

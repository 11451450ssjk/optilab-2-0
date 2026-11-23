param(
    [int]$Port = 8000
)

$appRoot = $PSScriptRoot
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $listener) {
    $python = (Get-Command python -ErrorAction Stop).Source
    Start-Process `
        -FilePath $python `
        -ArgumentList "-m", "http.server", $Port, "--bind", "127.0.0.1" `
        -WorkingDirectory $appRoot `
        -WindowStyle Hidden
    Start-Sleep -Milliseconds 900
}

$url = "http://127.0.0.1:$Port/"
$response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 5
if ($response.StatusCode -ne 200) {
    throw "光电实验小助手启动失败，HTTP 状态码为 $($response.StatusCode)"
}

Start-Process $url
Write-Host "光电实验小助手已启动：$url"

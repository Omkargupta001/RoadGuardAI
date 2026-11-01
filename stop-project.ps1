
$ports = @(5173, 5000, 5001)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

    foreach ($connection in $connections) {
        Stop-Process -Id $connection.OwningProcess -Force
    }

    Write-Host "Stopped port $port"
}

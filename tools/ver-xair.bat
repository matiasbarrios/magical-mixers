@echo off
rem Diagnostico para consolas X Air / M Air.
rem Envia /xinfo por UDP al puerto 10024 y muestra la respuesta cruda.
rem No instala nada: usa el PowerShell que ya trae Windows 10 y 11.
rem Uso: doble clic. La compu y la consola tienen que estar en la misma red.
title Ver respuesta X Air
echo.
echo Busca la consola en la red y muestra lo que responde.
echo No instala nada. Tarda unos 20 segundos.
echo Si Windows muestra un cartel del firewall, hace clic en Permitir.
echo.
set "SCRIPT=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((Get-Content -LiteralPath $env:SCRIPT -Raw) -split '###POWERSHELL###',2)[1]"
echo.
echo ============================================================
echo Copia TODO el texto de esta ventana, o saca una captura, y mandalo.
echo ============================================================
pause
goto :eof
###POWERSHELL###
$ErrorActionPreference = 'Continue'
$Port = 10024
$Seconds = 20

# /xinfo without arguments. Same bytes the library sends.
$xinfo = [byte[]](0x2F,0x78,0x69,0x6E,0x66,0x6F,0x00,0x00,0x2C,0x00,0x00,0x00)

function Get-BroadcastAddress([string]$ip, [string]$mask) {
    $ipB = [System.Net.IPAddress]::Parse($ip).GetAddressBytes()
    $maskB = [System.Net.IPAddress]::Parse($mask).GetAddressBytes()
    $octets = @()
    for ($i = 0; $i -lt 4; $i++) {
        $octets += (($ipB[$i] -bor (($maskB[$i] -bxor 255) -band 255)) -band 255)
    }
    return ($octets -join '.')
}

Write-Host "Equipo: $env:COMPUTERNAME"
Write-Host "Windows: $([Environment]::OSVersion.VersionString)"
Write-Host ""

$targets = @()
try {
    $cfgs = @(Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction Stop | Where-Object { $_.IPEnabled -and $_.IPAddress })
} catch {
    Write-Host "No pude leer las redes: $($_.Exception.Message)"
    $cfgs = @()
}

foreach ($cfg in $cfgs) {
    $addresses = @($cfg.IPAddress)
    $masks = @($cfg.IPSubnet)
    for ($i = 0; $i -lt $addresses.Count; $i++) {
        $ip = [string]$addresses[$i]
        if ($ip -notmatch '^\d+\.\d+\.\d+\.\d+$') { continue }
        if ($ip -like '127.*') { continue }
        if ($i -ge $masks.Count) { continue }
        $mask = [string]$masks[$i]
        if ($mask -notmatch '^\d+\.\d+\.\d+\.\d+$') { continue }
        try {
            $broadcast = Get-BroadcastAddress $ip $mask
        } catch {
            continue
        }
        $targets += [pscustomobject]@{
            Local = $ip
            Broadcast = $broadcast
            Desc = [string]$cfg.Description
        }
    }
}

if ($targets.Count -eq 0) {
    $targets = @([pscustomobject]@{
        Local = '0.0.0.0'
        Broadcast = '255.255.255.255'
        Desc = 'todas'
    })
}

Write-Host "Redes:"
foreach ($target in $targets) {
    Write-Host ("  {0}" -f $target.Desc)
    Write-Host ("    esta compu: {0}" -f $target.Local)
    Write-Host ("    broadcast:  {0}" -f $target.Broadcast)
}
Write-Host ""
Write-Host "Enviando /xinfo al puerto $Port durante $Seconds segundos..."
Write-Host ""

$sockets = @()
foreach ($target in $targets) {
    try {
        $udp = New-Object System.Net.Sockets.UdpClient
        $udp.EnableBroadcast = $true
        $udp.Client.SetSocketOption(
            [System.Net.Sockets.SocketOptionLevel]::Socket,
            [System.Net.Sockets.SocketOptionName]::ReuseAddress,
            $true
        )
        if ($target.Local -eq '0.0.0.0') {
            $localEndPoint = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Any, 0)
        } else {
            $localEndPoint = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Parse($target.Local), 0)
        }
        $udp.Client.Bind($localEndPoint)
        $udp.Client.ReceiveTimeout = 250
        $sockets += [pscustomobject]@{ Udp = $udp; Target = $target }
    } catch {
        Write-Host ("No pude abrir la red {0}: {1}" -f $target.Local, $_.Exception.Message)
    }
}

if ($sockets.Count -eq 0) {
    Write-Host "No se pudo abrir ninguna red. No hay nada que mostrar."
    return
}

function Show-Packet($remote, [byte[]]$buf) {
    Write-Host "----- respuesta -----"
    Write-Host ("de {0}:{1}   {2} bytes" -f $remote.Address, $remote.Port, $buf.Length)
    $current = New-Object System.Text.StringBuilder
    $strings = New-Object System.Collections.Generic.List[string]
    foreach ($byte in $buf) {
        if ($byte -eq 0) {
            if ($current.Length -gt 0) {
                $strings.Add($current.ToString())
                [void]$current.Clear()
            }
        } elseif ($byte -ge 32 -and $byte -le 126) {
            [void]$current.Append([char]$byte)
        } else {
            [void]$current.Append(('\x{0:X2}' -f $byte))
        }
    }
    if ($current.Length -gt 0) { $strings.Add($current.ToString()) }
    for ($i = 0; $i -lt $strings.Count; $i++) {
        $text = $strings[$i]
        Write-Host ("  [{0}] '{1}'  largo={2}" -f $i, $text, $text.Length)
    }
    $hex = ($buf | ForEach-Object { '{0:X2}' -f $_ }) -join ' '
    Write-Host "hex: $hex"
    Write-Host ""
}

$seen = @{}
$announced = @{}
$end = (Get-Date).AddSeconds($Seconds)
$nextSend = [datetime]::MinValue
$lastTick = [datetime]::MinValue

while ((Get-Date) -lt $end) {
    if ((Get-Date) -ge $nextSend) {
        foreach ($socket in $sockets) {
            $destinations = @($socket.Target.Broadcast, '255.255.255.255') | Select-Object -Unique
            foreach ($dest in $destinations) {
                $announceKey = '{0}|{1}' -f $socket.Target.Local, $dest
                try {
                    $destEndPoint = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Parse([string]$dest), $Port)
                    [void]$socket.Udp.Send($xinfo, $xinfo.Length, $destEndPoint)
                    if (-not $announced.ContainsKey($announceKey)) {
                        Write-Host ("enviado /xinfo a {0}:{1} desde {2}" -f $dest, $Port, $socket.Target.Local)
                        $announced[$announceKey] = $true
                    }
                } catch {
                    if (-not $announced.ContainsKey($announceKey)) {
                        Write-Host ("error enviando a {0} desde {1}: {2}" -f $dest, $socket.Target.Local, $_.Exception.Message)
                        $announced[$announceKey] = $true
                    }
                }
            }
        }
        $nextSend = (Get-Date).AddSeconds(2)
    }

    if (((Get-Date) - $lastTick).TotalSeconds -ge 5) {
        $left = [int]($end - (Get-Date)).TotalSeconds
        if ($left -lt 0) { $left = 0 }
        Write-Host ("sigo buscando... {0}s" -f $left)
        $lastTick = Get-Date
    }

    foreach ($socket in $sockets) {
        $remote = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Any, 0)
        try {
            $data = $socket.Udp.Receive([ref]$remote)
        } catch {
            continue
        }
        $hexKey = ($data | ForEach-Object { '{0:X2}' -f $_ }) -join ''
        $key = '{0}|{1}' -f $remote.Address, $hexKey
        if ($seen.ContainsKey($key)) { continue }
        $seen[$key] = $true
        Show-Packet $remote $data
    }
}

foreach ($socket in $sockets) {
    try { $socket.Udp.Close() } catch {}
}

Write-Host ""
if ($seen.Count -eq 0) {
    Write-Host "No llego ninguna respuesta."
    Write-Host "Revisa esto y volve a ejecutar el archivo:"
    Write-Host "  - la compu tiene que estar en la misma red que la consola"
    Write-Host "  - la consola tiene que estar encendida"
    Write-Host "  - si aparecio un cartel de firewall, elegi Permitir y ejecuta de nuevo"
} else {
    Write-Host ("Listo. Llegaron {0} respuesta(s)." -f $seen.Count)
    Write-Host "Copia todo el texto de esta ventana y mandalo."
}

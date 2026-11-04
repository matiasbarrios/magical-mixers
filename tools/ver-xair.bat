@echo off
rem Diagnostic for X Air / M Air consoles.
rem Sends /xinfo over UDP to port 10024 and prints the raw reply.
rem Installs nothing: uses the PowerShell that already ships with Windows 10 and 11.
rem Usage: double-click. The computer and the console have to be on the same network.
title View X Air reply
echo.
echo Looks for the console on the network and shows what it replies.
echo Installs nothing. Takes about 20 seconds.
echo If Windows shows a firewall prompt, click Allow.
echo.
set "SCRIPT=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-Content -LiteralPath $env:SCRIPT -Raw; $m = '###POWERSHELL###'; iex $t.Substring($t.LastIndexOf($m) + $m.Length)"
echo.
echo ============================================================
echo Copy ALL the text in this window, or take a screenshot, and send it.
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

Write-Host "Computer: $env:COMPUTERNAME"
Write-Host "Windows: $([Environment]::OSVersion.VersionString)"
Write-Host ""

$targets = @()
try {
    $cfgs = @(Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction Stop | Where-Object { $_.IPEnabled -and $_.IPAddress })
} catch {
    Write-Host "Could not read the networks: $($_.Exception.Message)"
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
        Desc = 'all'
    })
}

Write-Host "Networks:"
foreach ($target in $targets) {
    Write-Host ("  {0}" -f $target.Desc)
    Write-Host ("    this computer: {0}" -f $target.Local)
    Write-Host ("    broadcast:  {0}" -f $target.Broadcast)
}
Write-Host ""
Write-Host "Sending /xinfo to port $Port for $Seconds seconds..."
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
        Write-Host ("Could not open network {0}: {1}" -f $target.Local, $_.Exception.Message)
    }
}

if ($sockets.Count -eq 0) {
    Write-Host "Could not open any network. Nothing to show."
    return
}

function Show-Packet($remote, [byte[]]$buf) {
    Write-Host "----- reply -----"
    Write-Host ("from {0}:{1}   {2} bytes" -f $remote.Address, $remote.Port, $buf.Length)
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
        Write-Host ("  [{0}] '{1}'  length={2}" -f $i, $text, $text.Length)
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
                        Write-Host ("sent /xinfo to {0}:{1} from {2}" -f $dest, $Port, $socket.Target.Local)
                        $announced[$announceKey] = $true
                    }
                } catch {
                    if (-not $announced.ContainsKey($announceKey)) {
                        Write-Host ("error sending to {0} from {1}: {2}" -f $dest, $socket.Target.Local, $_.Exception.Message)
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
        Write-Host ("still looking... {0}s" -f $left)
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
    Write-Host "No reply arrived."
    Write-Host "Check this and run the file again:"
    Write-Host "  - the computer has to be on the same network as the console"
    Write-Host "  - the console has to be powered on"
    Write-Host "  - if a firewall prompt appeared, choose Allow and run it again"
} else {
    Write-Host ("Done. {0} reply(ies) arrived." -f $seen.Count)
    Write-Host "Copy all the text in this window and send it."
}

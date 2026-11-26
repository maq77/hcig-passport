# FTP helpers for the 24/7 Clinic go-live (dot-sourced by go_live.ps1 and go_rollback.ps1). Windows PowerShell 5.1.
# The FTP password never lives in a file of this repo: it is read from $HOME\.247clinic-ftp.xml, which
# "go_live.ps1 -SaveCredential" writes with Windows DPAPI (only this Windows user on this PC can read it).

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$script:FtpTls = $true
$script:FtpCred = $null

function Say([string]$msg, [string]$color = 'Gray') { Write-Host $msg -ForegroundColor $color }

function Import-FtpCredential([string]$file) {
    if (-not (Test-Path $file)) { throw "No saved FTP login. Run once:  .\go_live.ps1 -SaveCredential" }
    $script:FtpCred = (Import-Clixml $file).GetNetworkCredential()
}

function ConvertTo-FtpPath([string]$p) { (($p -split '/') | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/' }

function New-FtpRequest([string]$path, [string]$method) {
    $r = [Net.FtpWebRequest]::Create("ftp://$($script:FtpHost)" + (ConvertTo-FtpPath $path))
    $r.Method = $method
    $r.Credentials = $script:FtpCred
    $r.UsePassive = $true; $r.UseBinary = $true; $r.KeepAlive = $true
    $r.EnableSsl = $script:FtpTls
    $r.Timeout = 60000; $r.ReadWriteTimeout = 300000
    return $r
}

function Invoke-Ftp([string]$path, [string]$method) {
    $resp = (New-FtpRequest $path $method).GetResponse()
    $resp.Close()
}

# Lists one folder: objects with Name and IsDir. Understands IIS (MS-DOS) and UNIX style listings.
function Get-FtpList([string]$dir) {
    $resp = (New-FtpRequest ($dir.TrimEnd('/') + '/') ([Net.WebRequestMethods+Ftp]::ListDirectoryDetails)).GetResponse()
    $reader = New-Object IO.StreamReader($resp.GetResponseStream())
    $text = $reader.ReadToEnd(); $reader.Close(); $resp.Close()
    foreach ($line in ($text -split "`r?`n")) {
        if (-not $line.Trim()) { continue }
        if ($line -match '^\d{2}-\d{2}-\d{2,4}\s+\d{1,2}:\d{2}(AM|PM)?\s+(<DIR>|\d+)\s+(.+)$') {
            $name = $Matches[3]; $isDir = $Matches[2] -eq '<DIR>'
        } elseif ($line -match '^([dl\-])[rwxsStT\-]{9}\S*\s+\d+\s+\S+\s+\S+\s+\d+\s+\w{3}\s+\d{1,2}\s+[\d:]{4,5}\s+(.+)$') {
            $name = $Matches[2]; $isDir = $Matches[1] -eq 'd'
        } else { continue }
        if ($name -eq '.' -or $name -eq '..') { continue }
        [pscustomobject]@{ Name = $name; IsDir = $isDir }
    }
}

function Test-FtpLogin([string]$dir, [string]$mode) {
    $script:FtpTls = $mode -ne 'plain'
    if ($script:FtpTls) { [Net.ServicePointManager]::ServerCertificateValidationCallback = { $true } }
    try { $null = Get-FtpList $dir; return $true }
    catch {
        if ($mode -eq 'auto') {
            Say "  FTP over TLS failed ($($_.Exception.Message.Trim())). Trying plain FTP." 'Yellow'
            $script:FtpTls = $false
            $null = Get-FtpList $dir
            return $true
        }
        throw
    }
}

function New-FtpDir([string]$dir) {
    try { Invoke-Ftp $dir ([Net.WebRequestMethods+Ftp]::MakeDirectory) } catch { if ($_.Exception.Message -notmatch '550') { throw } }
}

function Send-FtpFile([string]$local, [string]$remote) {
    $r = New-FtpRequest $remote ([Net.WebRequestMethods+Ftp]::UploadFile)
    $bytes = [IO.File]::ReadAllBytes($local)
    $r.ContentLength = $bytes.Length
    $s = $r.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()
    $r.GetResponse().Close()
}

function Receive-FtpFile([string]$remote, [string]$local) {
    $resp = (New-FtpRequest $remote ([Net.WebRequestMethods+Ftp]::DownloadFile)).GetResponse()
    $in = $resp.GetResponseStream()
    $dir = Split-Path $local -Parent; if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
    $out = [IO.File]::Create($local); $in.CopyTo($out); $out.Close(); $in.Close(); $resp.Close()
}

function Move-FtpItem([string]$from, [string]$toAbsolute) {
    $r = New-FtpRequest $from ([Net.WebRequestMethods+Ftp]::Rename)
    $r.RenameTo = $toAbsolute
    $r.GetResponse().Close()
}

function Remove-FtpFile([string]$path) { Invoke-Ftp $path ([Net.WebRequestMethods+Ftp]::DeleteFile) }
function Remove-FtpDir([string]$path) { Invoke-Ftp $path ([Net.WebRequestMethods+Ftp]::RemoveDirectory) }

# Whole folder down (backup). Returns the number of files.
function Receive-FtpTree([string]$remoteDir, [string]$localDir) {
    $n = 0
    New-Item -ItemType Directory -Force $localDir | Out-Null
    foreach ($e in Get-FtpList $remoteDir) {
        $r = "$remoteDir/$($e.Name)"; $l = Join-Path $localDir $e.Name
        if ($e.IsDir) { $n += Receive-FtpTree $r $l } else { Receive-FtpFile $r $l; $n++ }
    }
    return $n
}

# Whole folder up (stage). Returns the number of files.
function Send-FtpTree([string]$localDir, [string]$remoteDir) {
    $n = 0
    New-FtpDir $remoteDir
    foreach ($e in Get-ChildItem -LiteralPath $localDir -Force) {
        $r = "$remoteDir/$($e.Name)"
        if ($e.PSIsContainer) { $n += Send-FtpTree $e.FullName $r }
        else {
            $tries = 0
            while ($true) {
                try { Send-FtpFile $e.FullName $r; break }
                catch { $tries++; if ($tries -ge 3) { throw "upload failed: $r ($($_.Exception.Message))" }; Start-Sleep 3 }
            }
            $n++
            if ($n % 50 -eq 0) { Say "    $n files..." }
        }
    }
    return $n
}

function Measure-FtpTree([string]$remoteDir) {
    $n = 0
    foreach ($e in Get-FtpList $remoteDir) { if ($e.IsDir) { $n += Measure-FtpTree "$remoteDir/$($e.Name)" } else { $n++ } }
    return $n
}

function Remove-FtpTree([string]$remoteDir) {
    foreach ($e in Get-FtpList $remoteDir) {
        $p = "$remoteDir/$($e.Name)"
        if ($e.IsDir) { Remove-FtpTree $p } else { Remove-FtpFile $p }
    }
    Remove-FtpDir $remoteDir
}

# One HTTP check with curl.exe (built into Windows 10/11): returns "status location".
function Get-Http([string]$url) {
    (& curl.exe -s -o NUL --max-time 30 -A "247clinic-golive-check" -w "%{http_code} %{redirect_url}" $url) -join ''
}

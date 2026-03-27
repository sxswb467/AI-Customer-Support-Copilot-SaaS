param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][string]$ProfileName,
  [int]$DelaySeconds = 5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$browserCandidates = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$browserPath = $browserCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browserPath) {
  throw "No supported browser found for screenshot capture."
}

$browserName = [System.IO.Path]::GetFileNameWithoutExtension($browserPath)
$screenshotHelper = "C:\Users\User\.codex\skills\screenshot\scripts\take_screenshot.ps1"
$profilePath = Join-Path $env:TEMP $ProfileName

Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class WinApi {
  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
}
"@

Add-Type -AssemblyName System.Windows.Forms

New-Item -ItemType Directory -Path $profilePath -Force | Out-Null

try {
  Start-Process -FilePath $browserPath -ArgumentList @(
    "--user-data-dir=$profilePath",
    "--no-first-run",
    "--no-default-browser-check",
    "--app=$Url",
    "--window-size=1480,1080"
  ) | Out-Null

  Start-Sleep -Seconds $DelaySeconds

  $pidSet = @(
    Get-CimInstance Win32_Process |
      Where-Object { $_.CommandLine -like "*$ProfileName*" } |
      ForEach-Object { [int]$_.ProcessId }
  )

  $target = Get-Process $browserName |
    Where-Object { $pidSet -contains $_.Id -and $_.MainWindowHandle -ne 0 } |
    Sort-Object StartTime |
    Select-Object -Last 1

  if (-not $target) {
    throw "Could not find the browser window for screenshot capture."
  }

  $wshell = New-Object -ComObject WScript.Shell
  [System.Windows.Forms.SendKeys]::SendWait("%")
  $wshell.AppActivate($target.Id) | Out-Null
  [WinApi]::ShowWindowAsync($target.MainWindowHandle, 9) | Out-Null
  [WinApi]::SetForegroundWindow($target.MainWindowHandle) | Out-Null
  Start-Sleep -Seconds 1

  & $screenshotHelper -Path $OutputPath -WindowHandle $target.MainWindowHandle | Out-Null
  Write-Output $OutputPath
} finally {
  Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -like "*$ProfileName*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

param(
    [string]$Title = "HCIG Hive",
    [string]$Body = "",
    [string]$Attribution = "HCIG Hive",
    [string]$Category = "Update",
    [string]$Sound = "Default"
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$null = [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]

$appId = 'electron.app.Antigravity'

# Sound mapping
$audioSrc = "ms-winsoundevent:Notification.Default"
if ($Category -eq "prompt" -or $Category -eq "alert") {
    $audioSrc = "ms-winsoundevent:Notification.Reminder"
}

$xmlEscapedTitle = [System.Security.SecurityElement]::Escape($Title)
$xmlEscapedBody = [System.Security.SecurityElement]::Escape($Body)
$xmlEscapedAttr = [System.Security.SecurityElement]::Escape($Attribution)

$toastXml = @"
<toast scenario="reminder">
    <visual>
        <binding template="ToastGeneric">
            <text>$xmlEscapedTitle</text>
            <text>$xmlEscapedBody</text>
            <text placement="attribution">$xmlEscapedAttr</text>
        </binding>
    </visual>
    <audio src="$audioSrc" />
</toast>
"@

try {
    $xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
    $xml.LoadXml($toastXml)
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    $toast.ExpirationTime = [DateTimeOffset]::Now.AddMinutes(30)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
    Write-Output "Native toast sent"
} catch {
    Write-Error $_.Exception.Message
}

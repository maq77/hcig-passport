param(
    [string]$Title = "Claude Code: Prompt Answers Needed",
    [string]$Body = "Prompt feedback requested on 24/7 Clinic landing page designs.",
    [string]$Category = "prompt",
    [string]$Url = "http://localhost:4400",
    [int]$DurationMs = 7000
)

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

# Play system chime
try {
    if ($Category -eq "prompt" -or $Category -eq "alert") {
        [System.Media.SystemSounds]::Exclamation.Play()
    } else {
        [System.Media.SystemSounds]::Asterisk.Play()
    }
} catch {}

$xamlString = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="HCIG Hive HUD"
        WindowStyle="None"
        AllowsTransparency="True"
        Background="Transparent"
        Topmost="True"
        ShowInTaskbar="False"
        SizeToContent="Height"
        Width="540"
        WindowStartupLocation="Manual">
    <Border Name="RootBorder"
            Margin="18"
            CornerRadius="24"
            Background="#F9FFFFFF"
            BorderBrush="#38000000"
            BorderThickness="1.2"
            Padding="22">
        <Border.Effect>
            <DropShadowEffect BlurRadius="36" ShadowDepth="12" Direction="270" Color="#000000" Opacity="0.22" />
        </Border.Effect>
        <Grid>
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>

            <!-- Top Row -->
            <Grid Grid.Row="0" Margin="0,0,0,14">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <Border Name="BadgeIcon" Grid.Column="0" Width="30" Height="30" CornerRadius="10" Background="#12C0C6" Margin="0,0,12,0">
                    <TextBlock Name="IconText" Text="H" Foreground="#FFFFFF" FontWeight="Bold" FontSize="13" HorizontalAlignment="Center" VerticalAlignment="Center" FontFamily="Segoe UI, -apple-system, Arial"/>
                </Border>

                <StackPanel Grid.Column="1" VerticalAlignment="Center">
                    <StackPanel Orientation="Horizontal" VerticalAlignment="Center">
                        <TextBlock Text="HCIG HIVE" Foreground="#0A7E83" FontWeight="Bold" FontSize="11.5" FontFamily="Segoe UI, -apple-system, Arial"/>
                        <TextBlock Text=" - " Foreground="#8A92A6" FontSize="11.5"/>
                        <TextBlock Name="LblCategory" Text="NOTIFICATION" Foreground="#5D6778" FontSize="11" FontWeight="Bold" FontFamily="Segoe UI, -apple-system, Arial"/>
                    </StackPanel>
                    <TextBlock Text="Autonomous Fleet Dispatch" Foreground="#8A92A6" FontSize="11" Margin="0,1,0,0" FontFamily="Segoe UI, -apple-system, Arial"/>
                </StackPanel>

                <TextBlock Grid.Column="2" Text="just now" Foreground="#8A92A6" FontSize="11.5" VerticalAlignment="Center" Margin="0,0,12,0" FontFamily="Segoe UI, -apple-system, Arial"/>

                <Border Name="BtnClose" Grid.Column="3" Width="26" Height="26" CornerRadius="13" Background="#F1F3F6" Cursor="Hand">
                    <TextBlock Text="x" Foreground="#5D6778" FontSize="13" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,-2,0,0"/>
                </Border>
            </Grid>

            <!-- Headline -->
            <TextBlock Name="LblTitle" Grid.Row="1" FontWeight="SemiBold" FontSize="17" Foreground="#1D2327" TextWrapping="Wrap" Margin="0,0,0,8" FontFamily="Segoe UI, -apple-system, Arial"/>

            <!-- Body -->
            <TextBlock Name="LblBody" Grid.Row="2" FontSize="13.5" Foreground="#475467" TextWrapping="Wrap" LineHeight="20" Margin="0,0,0,18" FontFamily="Segoe UI, -apple-system, Arial"/>

            <!-- Action Bar -->
            <Grid Grid.Row="3">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <TextBlock Text="Click to view details in dashboard" Foreground="#9AA3AF" FontSize="11.5" VerticalAlignment="Center" FontFamily="Segoe UI, -apple-system, Arial"/>

                <Border Name="BtnDismiss" Grid.Column="1" Background="#F1F3F6" CornerRadius="12" Padding="14,7" Margin="0,0,8,0" Cursor="Hand">
                    <TextBlock Text="Dismiss" Foreground="#475467" FontWeight="SemiBold" FontSize="12.5" FontFamily="Segoe UI, -apple-system, Arial"/>
                </Border>

                <Border Name="BtnOpen" Grid.Column="2" Background="#0A7E83" CornerRadius="12" Padding="16,7" Cursor="Hand">
                    <TextBlock Text="Open Dashboard" Foreground="#FFFFFF" FontWeight="SemiBold" FontSize="12.5" FontFamily="Segoe UI, -apple-system, Arial"/>
                </Border>
            </Grid>
        </Grid>
    </Border>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xamlString))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

# Element References
$rootBorder = $window.FindName("RootBorder")
$lblTitle = $window.FindName("LblTitle")
$lblBody = $window.FindName("LblBody")
$lblCategory = $window.FindName("LblCategory")
$badgeIcon = $window.FindName("BadgeIcon")
$iconText = $window.FindName("IconText")
$btnClose = $window.FindName("BtnClose")
$btnDismiss = $window.FindName("BtnDismiss")
$btnOpen = $window.FindName("BtnOpen")

$lblTitle.Text = $Title
$lblBody.Text = $Body

$bc = [System.Windows.Media.BrushConverter]::new()

switch ($Category.ToLower()) {
    "start" {
        $badgeIcon.Background = $bc.ConvertFromString("#08747A")
        $iconText.Text = ">"
        $lblCategory.Text = "WORKER STARTED"
    }
    "done" {
        $badgeIcon.Background = $bc.ConvertFromString("#16753F")
        $iconText.Text = "OK"
        $lblCategory.Text = "COMPLETED"
    }
    "prompt" {
        $badgeIcon.Background = $bc.ConvertFromString("#2B6CB0")
        $iconText.Text = "?"
        $lblCategory.Text = "PROMPT REQUIRED"
    }
    "plan" {
        $badgeIcon.Background = $bc.ConvertFromString("#7B341E")
        $iconText.Text = "#"
        $lblCategory.Text = "PLANNING & TRIAGE"
    }
    "alert" {
        $badgeIcon.Background = $bc.ConvertFromString("#C53030")
        $iconText.Text = "!"
        $lblCategory.Text = "ACTION ALERT"
    }
    default {
        $badgeIcon.Background = $bc.ConvertFromString("#12C0C6")
        $iconText.Text = "H"
        $lblCategory.Text = "HIVE NOTIFICATION"
    }
}

# Position in Upper-Center of primary display
$workArea = [System.Windows.SystemParameters]::WorkArea
$window.Left = ($workArea.Width - 540) / 2 + $workArea.Left
$window.Top = ($workArea.Height / 3) - 60 + $workArea.Top

# Smooth Spring-like Scale & Fade Animation
$scaleTransform = [System.Windows.Media.ScaleTransform]::new(0.92, 0.92, 270, 110)
$rootBorder.RenderTransform = $scaleTransform

$scaleAnim = [System.Windows.Media.Animation.DoubleAnimation]::new(0.92, 1.0, [TimeSpan]::FromMilliseconds(260))
$scaleAnim.EasingFunction = [System.Windows.Media.Animation.CubicEase]::new()
$scaleAnim.EasingFunction.EasingMode = [System.Windows.Media.Animation.EasingMode]::EaseOut

$fadeAnim = [System.Windows.Media.Animation.DoubleAnimation]::new(0.0, 1.0, [TimeSpan]::FromMilliseconds(220))

# Button Interactions
$btnClose.Add_MouseEnter({ $btnClose.Background = $bc.ConvertFromString("#E4E7EC") })
$btnClose.Add_MouseLeave({ $btnClose.Background = $bc.ConvertFromString("#F1F3F6") })
$btnClose.Add_MouseLeftButtonDown({ $window.Close() })

$btnDismiss.Add_MouseEnter({ $btnDismiss.Background = $bc.ConvertFromString("#E4E7EC") })
$btnDismiss.Add_MouseLeave({ $btnDismiss.Background = $bc.ConvertFromString("#F1F3F6") })
$btnDismiss.Add_MouseLeftButtonDown({ $window.Close() })

$btnOpen.Add_MouseEnter({ $btnOpen.Background = $bc.ConvertFromString("#086A6E") })
$btnOpen.Add_MouseLeave({ $btnOpen.Background = $bc.ConvertFromString("#0A7E83") })

$openAction = {
    if ($Url) {
        [System.Diagnostics.Process]::Start((New-Object System.Diagnostics.ProcessStartInfo($Url) -Property @{ UseShellExecute = $true })) | Out-Null
    }
    $window.Close()
}
$btnOpen.Add_MouseLeftButtonDown({ & $openAction })

# Auto dismiss timer
$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromMilliseconds($DurationMs)
$timer.Add_Tick({
    $timer.Stop()
    $window.Close()
})

# Hover pauses dismiss
$window.Add_MouseEnter({ $timer.Stop() })
$window.Add_MouseLeave({ $timer.Start() })

$window.Add_Loaded({
    $timer.Start()
    $scaleTransform.BeginAnimation([System.Windows.Media.ScaleTransform]::ScaleXProperty, $scaleAnim)
    $scaleTransform.BeginAnimation([System.Windows.Media.ScaleTransform]::ScaleYProperty, $scaleAnim)
    $window.BeginAnimation([System.Windows.Window]::OpacityProperty, $fadeAnim)
})

$window.ShowDialog() | Out-Null

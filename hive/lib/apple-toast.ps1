param(
    [string]$Title = "Hive Notification",
    [string]$Body = "",
    [string]$Category = "Update",
    [string]$Url = "http://localhost:4400",
    [int]$DurationMs = 5000
)

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

$xamlString = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="HCIG Hive"
        WindowStyle="None"
        AllowsTransparency="True"
        Background="Transparent"
        Topmost="True"
        ShowInTaskbar="False"
        SizeToContent="Height"
        Width="380"
        WindowStartupLocation="Manual">
    <Border Margin="12"
            CornerRadius="18"
            Background="#F7FFFFFF"
            BorderBrush="#2B000000"
            BorderThickness="1"
            Padding="14"
            Cursor="Hand">
        <Border.Effect>
            <DropShadowEffect BlurRadius="22" ShadowDepth="5" Direction="270" Color="#000000" Opacity="0.16" />
        </Border.Effect>
        <Grid>
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>

            <!-- Header Row -->
            <Grid Grid.Row="0" Margin="0,0,0,8">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <Border Name="BadgeIcon" Grid.Column="0" Width="22" Height="22" CornerRadius="7" Background="#12C0C6" Margin="0,0,8,0">
                    <TextBlock Name="IconText" Text="H" Foreground="#FFFFFF" FontWeight="Bold" FontSize="11" HorizontalAlignment="Center" VerticalAlignment="Center" FontFamily="Segoe UI, -apple-system, Arial"/>
                </Border>

                <StackPanel Grid.Column="1" Orientation="Horizontal" VerticalAlignment="Center">
                    <TextBlock Text="HCIG HIVE" Foreground="#0A7E83" FontWeight="Bold" FontSize="11" FontFamily="Segoe UI, -apple-system, Arial"/>
                    <TextBlock Text=" - " Foreground="#8A92A6" FontSize="11"/>
                    <TextBlock Name="LblCategory" Text="Notification" Foreground="#5D6778" FontSize="11" FontWeight="SemiBold" FontFamily="Segoe UI, -apple-system, Arial"/>
                </StackPanel>

                <TextBlock Grid.Column="2" Text="now" Foreground="#8A92A6" FontSize="11" VerticalAlignment="Center" Margin="0,0,8,0" FontFamily="Segoe UI, -apple-system, Arial"/>

                <Border Name="BtnClose" Grid.Column="3" Width="20" Height="20" CornerRadius="10" Background="Transparent" Cursor="Hand">
                    <TextBlock Text="x" Foreground="#8A92A6" FontSize="13" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,-1,0,0"/>
                </Border>
            </Grid>

            <!-- Title -->
            <TextBlock Name="LblTitle" Grid.Row="1" FontWeight="SemiBold" FontSize="13.5" Foreground="#1D2327" TextWrapping="Wrap" Margin="0,0,0,4" FontFamily="Segoe UI, -apple-system, Arial"/>

            <!-- Body -->
            <TextBlock Name="LblBody" Grid.Row="2" FontSize="12.5" Foreground="#475467" TextWrapping="Wrap" LineHeight="17" FontFamily="Segoe UI, -apple-system, Arial"/>
        </Grid>
    </Border>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xamlString))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

# Find Elements
$lblTitle = $window.FindName("LblTitle")
$lblBody = $window.FindName("LblBody")
$lblCategory = $window.FindName("LblCategory")
$badgeIcon = $window.FindName("BadgeIcon")
$iconText = $window.FindName("IconText")
$btnClose = $window.FindName("BtnClose")

$lblTitle.Text = $Title
$lblBody.Text = $Body
$lblCategory.Text = $Category

$bc = [System.Windows.Media.BrushConverter]::new()

switch ($Category.ToLower()) {
    "start" {
        $badgeIcon.Background = $bc.ConvertFromString("#08747A")
        $iconText.Text = ">"
    }
    "done" {
        $badgeIcon.Background = $bc.ConvertFromString("#16753F")
        $iconText.Text = "OK"
    }
    "prompt" {
        $badgeIcon.Background = $bc.ConvertFromString("#2B6CB0")
        $iconText.Text = "?"
    }
    "plan" {
        $badgeIcon.Background = $bc.ConvertFromString("#7B341E")
        $iconText.Text = "#"
    }
    "alert" {
        $badgeIcon.Background = $bc.ConvertFromString("#C53030")
        $iconText.Text = "!"
    }
    default {
        $badgeIcon.Background = $bc.ConvertFromString("#12C0C6")
        $iconText.Text = "H"
    }
}

# Position in Top-Right corner (macOS Sequoia notification anchor)
$workArea = [System.Windows.SystemParameters]::WorkArea
$window.Left = $workArea.Right - 395
$window.Top = $workArea.Top + 24

# Close Button Hover Effect
$btnClose.Add_MouseEnter({
    $btnClose.Background = $bc.ConvertFromString("#E4E7EC")
})
$btnClose.Add_MouseLeave({
    $btnClose.Background = [System.Windows.Media.Brushes]::Transparent
})
$btnClose.Add_MouseLeftButtonDown({
    $window.Close()
})

# Click to open URL
$window.Add_MouseLeftButtonDown({
    param($s, $e)
    if ($e.OriginalSource -ne $btnClose -and -not $e.Handled) {
        if ($Url) {
            [System.Diagnostics.Process]::Start((New-Object System.Diagnostics.ProcessStartInfo($Url) -Property @{ UseShellExecute = $true })) | Out-Null
        }
        $window.Close()
    }
})

# Auto-dismiss timer
$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromMilliseconds($DurationMs)
$timer.Add_Tick({
    $timer.Stop()
    $window.Close()
})

# Pause timer on hover
$window.Add_MouseEnter({
    $timer.Stop()
})
$window.Add_MouseLeave({
    $timer.Start()
})

$window.Add_Loaded({
    $timer.Start()
})

$window.ShowDialog() | Out-Null

# Regenerate the social card on Windows; no dependency on the application build.
Add-Type -AssemblyName System.Drawing
$bitmap = [Drawing.Bitmap]::new(1200, 630)
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([Drawing.ColorTranslator]::FromHtml('#fffefa'))
$ink = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#1d3339'))
$green = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#17685f'))
$muted = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#526970'))
$gold = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#d7aa60'))
$orbit = [Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml('#b7d1c5'), 3)
$brand = [Drawing.Font]::new('Segoe UI', 25, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$heading = [Drawing.Font]::new('Segoe UI', 56, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$body = [Drawing.Font]::new('Segoe UI', 26, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel)
try {
    $graphics.FillRectangle($green, 0, 0, 1200, 14)
    $graphics.DrawString('PRAXIS SCIENCE LAB', $brand, $green, 70, 72)
    $graphics.DrawString('Fizică interactivă', $heading, $ink, 65, 195)
    $graphics.DrawString('Interactive Physics', $heading, $green, 65, 275)
    $graphics.DrawString('Simulări pentru clasă și studiu individual', $body, $muted, 70, 388)
    $graphics.DrawString('Simulations for classroom and self-study', $body, $muted, 70, 431)
    $graphics.DrawString('RO / EN', $brand, $green, 70, 536)
    $graphics.TranslateTransform(955, 300)
    foreach ($angle in @(0, 60, 120)) {
        $state = $graphics.Save()
        $graphics.RotateTransform($angle)
        $graphics.DrawEllipse($orbit, -170, -65, 340, 130)
        $graphics.Restore($state)
    }
    $graphics.FillEllipse($green, -23, -23, 46, 46)
    $graphics.FillEllipse($gold, 150, -11, 22, 22)
    $graphics.ResetTransform()
    $bitmap.Save((Join-Path $PSScriptRoot '../public/assets/social-preview.png'), [Drawing.Imaging.ImageFormat]::Png)
} finally {
    foreach ($resource in @($brand, $heading, $body, $ink, $green, $muted, $gold, $orbit, $graphics, $bitmap)) { $resource.Dispose() }
}

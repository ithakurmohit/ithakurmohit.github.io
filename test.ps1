$response = Invoke-WebRequest -Uri 'https://api.codetabs.com/v1/proxy?quest=https://play.google.com/store/apps/details?id=com.whatsapp&hl=en'
$html = $response.Content

if ($html -match '<meta[^>]+property=["'']og:image["''][^>]+content=["'']([^"'']+)["'']') {
    Write-Output "OG1: $($matches[1])"
} elseif ($html -match '<meta[^>]+content=["'']([^"'']+)["''][^>]+property=["'']og:image["'']') {
    Write-Output "OG2: $($matches[1])"
} else {
    Write-Output "OG Image not found"
}

if ($html -match '<img[^>]+src=["''](https://play-lh\.googleusercontent\.com/[^"'']+)["'']') {
    Write-Output "IMG1: $($matches[1])"
} else {
    Write-Output "IMG not found"
}

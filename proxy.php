<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_GET['url'])) {
    $url = $_GET['url'];
    
    if (strpos($url, 'play.google.com') === false && strpos($url, 'itunes.apple.com') === false) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid URL domain."]);
        exit;
    }

    $html = "";
    $httpCode = 0;
    
    // Try cURL first
    if (function_exists('curl_version')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // CURLOPT_FOLLOWLOCATION can cause issues on some WAMP setups if open_basedir is set
        @curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($html === false) {
            echo json_encode(["error" => "cURL error: " . $curlError]);
            exit;
        }
    } else {
        // Fallback to file_get_contents
        $options = array(
          'http'=>array(
            'method'=>"GET",
            'header'=>"Accept-language: en\r\n" .
                      "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36\r\n"
          )
        );
        $context = stream_context_create($options);
        $html = @file_get_contents($url, false, $context);
        
        if ($html !== false) {
             $httpCode = 200;
        } else {
             $error = error_get_last();
             echo json_encode(["error" => "file_get_contents error: " . $error['message']]);
             exit;
        }
    }

    if ($httpCode == 200 && $html) {
        echo json_encode(["contents" => $html]);
    } else {
        http_response_code($httpCode == 0 ? 500 : $httpCode);
        echo json_encode(["error" => "Failed to fetch from store", "httpCode" => $httpCode]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No URL provided."]);
}
?>

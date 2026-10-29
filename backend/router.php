<?php
// backend/router.php
// Routeur de développement PHP pour éviter les plantages 404, gérer les fichiers statiques (uploads) et le CORS

// En-têtes CORS universels pour le développement local et la production
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Si le fichier existe physiquement dans backend/
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    $ext = strtolower(pathinfo(__DIR__ . $uri, PATHINFO_EXTENSION));
    
    // Si c'est un script PHP, l'exécuter normalement
    if ($ext === 'php') {
        require __DIR__ . $uri;
        exit;
    }

    // Si c'est un fichier statique (images, uploads, PDF, etc.)
    $mimes = [
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'pdf'  => 'application/pdf',
        'doc'  => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls'  => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt'  => 'text/plain; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
    ];
    if (isset($mimes[$ext])) {
        header("Content-Type: " . $mimes[$ext]);
    }
    readfile(__DIR__ . $uri);
    exit;
}

// Si la requête omet l'extension .php (ex: /api/appointments)
if (file_exists(__DIR__ . $uri . '.php')) {
    require __DIR__ . $uri . '.php';
    exit;
}

// Routeur pour index
if ($uri === '/' || $uri === '') {
    require __DIR__ . '/index.php';
    exit;
}

// Endpoint introuvable -> réponse JSON propre au lieu d'un crash serveur
http_response_code(404);
header("Content-Type: application/json; charset=UTF-8");
echo json_encode([
    "status" => "error",
    "message" => "Endpoint non trouvé : " . htmlspecialchars($uri)
]);
exit;

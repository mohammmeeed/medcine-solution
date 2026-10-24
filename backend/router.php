<?php
// backend/router.php
// Routeur de développement PHP pour éviter les plantages 404 et gérer les URLs avec ou sans extension .php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Si le fichier existe physiquement dans backend/, le servir directement
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
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

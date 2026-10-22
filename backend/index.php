<?php
// backend/index.php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$tablesCount = 0;
try {
    $tablesCount = $db->query("SHOW TABLES")->rowCount();
} catch (Exception $e) {
    $tablesCount = 0;
}

sendResponse("success", [
    "name" => "Cabinet Médical Dr N. BELBACHIR OULD HENNIA — API Backend PHP",
    "version" => "1.0.0",
    "status" => "online",
    "database" => "medcine_solution_db",
    "database_tables_count" => $tablesCount,
    "endpoints" => [
        "consultations" => [
            "GET /api/consultations.php" => "Liste toutes les consultations avec patients et ordonnances",
            "POST /api/consultations.php" => "Enregistre une nouvelle consultation, ordonnance et compte-rendu dans MySQL",
            "DELETE /api/consultations.php?id={id}" => "Supprime une consultation"
        ],
        "patients" => [
            "GET /api/patients.php" => "Liste tous les patients avec antécédents",
            "POST /api/patients.php" => "Crée un nouveau dossier patient",
            "PUT /api/patients.php?id={id}" => "Met à jour les coordonnées du patient"
        ],
        "prescriptions" => [
            "GET /api/prescriptions.php" => "Liste toutes les ordonnances avec posologies",
            "POST /api/prescriptions.php" => "Génère une ordonnance"
        ],
        "waiting_room" => [
            "GET /api/waiting_room.php" => "Liste les patients présents en salle d'attente",
            "POST /api/waiting_room.php" => "Enregistre une arrivée de patient",
            "PUT /api/waiting_room.php?id={id}" => "Met à jour le statut (Appelé, En consultation, etc.)"
        ],
        "appointments" => [
            "GET /api/appointments.php" => "Liste les rendez-vous",
            "POST /api/appointments.php" => "Crée un nouveau rendez-vous"
        ]
    ]
], "API Backend PHP active et connectée à MySQL");

<?php
// backend/api/waiting_room.php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetWaitingRoom($db);
        break;
    case 'POST':
        handleCreateArrival($db);
        break;
    case 'PUT':
        handleUpdateStatus($db);
        break;
    case 'DELETE':
        handleRemoveFromWaitingRoom($db);
        break;
    default:
        sendResponse("error", null, "Méthode non autorisée", 405);
}

function handleGetWaitingRoom($db) {
    try {
        $sql = "SELECT w.*, 
                       COALESCE(NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''), 'Patient') AS patient_name,
                       p.dob AS patient_dob,
                       p.file_number AS patient_file_number,
                       p.phone AS patient_phone
                FROM waiting_room w
                LEFT JOIN patients p ON w.patient_id = p.id
                WHERE w.status != 'Terminé'
                ORDER BY w.arrival_time DESC, w.id DESC";

        $stmt = $db->query($sql);
        $rows = $stmt->fetchAll();

        $list = [];
        foreach ($rows as $r) {
            $age = null;
            if (!empty($r['patient_dob'])) {
                $dob = new DateTime($r['patient_dob']);
                $age = (new DateTime())->diff($dob)->y;
            }

            $list[] = [
                "id" => intval($r['id']),
                "appointmentId" => !empty($r['appointment_id']) ? intval($r['appointment_id']) : null,
                "patientId" => intval($r['patient_id']),
                "patientName" => $r['patient_name'],
                "fileNumber" => $r['patient_file_number'],
                "age" => $age,
                "phone" => $r['patient_phone'],
                "appointmentTime" => substr($r['appointment_time'] ?: "10:00", 0, 5),
                "arrivalTime" => substr($r['arrival_time'], 0, 5),
                "waitTime" => intval($r['wait_time_minutes']),
                "reason" => $r['reason'] ?: "Consultation générale",
                "status" => $r['status']
            ];
        }

        sendResponse("success", $list, "Salle d'attente récupérée avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur salle d'attente : " . $e->getMessage(), 500);
    }
}

function handleCreateArrival($db) {
    $body = getRequestBody();

    if (empty($body['patientId'])) {
        sendResponse("error", null, "patientId est requis", 400);
    }

    try {
        $patientId = intval($body['patientId']);
        $appId = !empty($body['appointmentId']) ? intval($body['appointmentId']) : null;
        $appTime = $body['appointmentTime'] ?? date('H:i:s');
        $arrTime = $body['arrivalTime'] ?? date('H:i:s');
        $reason = $body['reason'] ?? "Consultation générale";

        if ($appId) {
            $chk = $db->prepare("SELECT id FROM waiting_room WHERE appointment_id = :aid AND status != 'Terminé' LIMIT 1");
            $chk->execute([':aid' => $appId]);
            $existing = $chk->fetchColumn();
            if ($existing) {
                sendResponse("success", ["id" => intval($existing)], "Patient déjà en salle d'attente");
                return;
            }
        }

        $sql = "INSERT INTO waiting_room (patient_id, appointment_id, appointment_time, arrival_time, reason, status) 
                VALUES (:pid, :aid, :atime, :artime, :reason, 'En attente')";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':pid' => $patientId,
            ':aid' => $appId,
            ':atime' => strlen($appTime) === 5 ? ($appTime . ":00") : $appTime,
            ':artime' => strlen($arrTime) === 5 ? ($arrTime . ":00") : $arrTime,
            ':reason' => $reason
        ]);

        sendResponse("success", ["id" => intval($db->lastInsertId())], "Arrivée enregistrée avec succès", 201);
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur enregistrement arrivée : " . $e->getMessage(), 500);
    }
}

function handleUpdateStatus($db) {
    $body = getRequestBody();
    $id = isset($_GET['id']) ? intval($_GET['id']) : ($body['id'] ?? null);
    $status = $body['status'] ?? null;

    if (!$id || !$status) {
        sendResponse("error", null, "ID et status requis", 400);
    }

    try {
        $stmt = $db->prepare("UPDATE waiting_room SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        sendResponse("success", null, "Statut mis à jour avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur mise à jour statut : " . $e->getMessage(), 500);
    }
}

function handleRemoveFromWaitingRoom($db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        $body = getRequestBody();
        $id = $body['id'] ?? null;
    }
    if (!$id) {
        sendResponse("error", null, "ID requis", 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM waiting_room WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        sendResponse("success", null, "Patient supprimé de la base de données");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur suppression : " . $e->getMessage(), 500);
    }
}

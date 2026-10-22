<?php
// backend/api/appointments.php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetAppointments($db);
        break;
    case 'POST':
        handleCreateAppointment($db);
        break;
    default:
        sendResponse("error", null, "Méthode non autorisée", 405);
}

function handleGetAppointments($db) {
    try {
        $sql = "SELECT a.*, 
                       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                       p.phone AS patient_phone,
                       p.email AS patient_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                ORDER BY a.appointment_date ASC, a.appointment_time ASC ";

        $stmt = $db->query($sql);
        $rows = $stmt->fetchAll();

        $appointments = [];
        foreach ($rows as $r) {
            $appointments[] = [
                "id" => intval($r['id']),
                "patientId" => intval($r['patient_id']),
                "patientName" => $r['patient_name'],
                "phone" => $r['patient_phone'],
                "email" => $r['patient_email'],
                "date" => $r['appointment_date'],
                "time" => substr($r['appointment_time'], 0, 5),
                "duration" => $r['duration'],
                "reason" => $r['reason'],
                "status" => $r['status'],
                "notes" => $r['notes']
            ];
        }

        sendResponse("success", $appointments, "Rendez-vous récupérés avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur rendez-vous : " . $e->getMessage(), 500);
    }
}

function handleCreateAppointment($db) {
    $body = getRequestBody();

    if (empty($body['patientId']) || empty($body['date']) || empty($body['time'])) {
        sendResponse("error", null, "patientId, date et time sont requis", 400);
    }

    try {
        $sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, duration, reason, status, notes)
                VALUES (:pid, 1, :adate, :atime, :dur, :reason, 'Confirmé', :notes)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':pid' => intval($body['patientId']),
            ':adate' => $body['date'],
            ':atime' => strlen($body['time']) === 5 ? ($body['time'] . ":00") : $body['time'],
            ':dur' => $body['duration'] ?? '20 min',
            ':reason' => $body['reason'] ?? 'Consultation générale',
            ':notes' => $body['notes'] ?? null
        ]);

        sendResponse("success", ["id" => intval($db->lastInsertId())], "Rendez-vous créé avec succès", 201);
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur création rendez-vous : " . $e->getMessage(), 500);
    }
}

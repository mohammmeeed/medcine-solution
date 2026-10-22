<?php
// backend/api/appointments.php
// Gestion des rendez-vous et de l'agenda médical synchronisé MySQL

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
    case 'PUT':
        handleUpdateAppointment($db);
        break;
    case 'DELETE':
        handleDeleteAppointment($db);
        break;
    default:
        sendResponse("error", null, "Méthode non autorisée", 405);
}

function handleGetAppointments($db) {
    try {
        $date = $_GET['date'] ?? null;
        $params = [];
        $where = "";

        if ($date) {
            $where = "WHERE a.appointment_date = :adate";
            $params[':adate'] = $date;
        }

        $sql = "SELECT a.*, 
                       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                       p.first_name,
                       p.last_name,
                       p.phone AS patient_phone,
                       p.email AS patient_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                $where
                ORDER BY a.appointment_date ASC, a.appointment_time ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $appointments = [];
        foreach ($rows as $r) {
            $appointments[] = [
                "id" => intval($r['id']),
                "patientId" => intval($r['patient_id']),
                "patientName" => $r['patient_name'],
                "firstName" => $r['first_name'],
                "lastName" => $r['last_name'],
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

    $date = $body['date'] ?? null;
    $time = $body['time'] ?? null;

    if (empty($date) || empty($time)) {
        sendResponse("error", null, "Date et heure sont requis", 400);
    }

    try {
        $patientId = !empty($body['patientId']) ? intval($body['patientId']) : null;

        // Si le patientId n'est pas fourni (ex: réservation en ligne depuis le client web)
        if (!$patientId && !empty($body['patientName'])) {
            $parts = explode(' ', trim($body['patientName']), 2);
            $firstName = $parts[0] ?? 'Patient';
            $lastName = $parts[1] ?? 'Anonyme';
            $phone = $body['patientPhone'] ?? ($body['phone'] ?? '');

            // Chercher si le patient existe par téléphone ou nom
            $find = $db->prepare("SELECT id FROM patients WHERE phone = :phone AND phone != '' LIMIT 1");
            $find->execute([':phone' => $phone]);
            $found = $find->fetchColumn();

            if ($found) {
                $patientId = (int)$found;
            } else {
                // Créer le patient automatiquement dans la base
                $count = $db->query("SELECT COUNT(*) FROM patients")->fetchColumn();
                $fileNumber = 'DOS-' . date('Y') . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
                $insPat = $db->prepare("
                    INSERT INTO patients (file_number, first_name, last_name, phone, status)
                    VALUES (:fn, :fnm, :lnm, :ph, 'Nouveau')
                ");
                $insPat->execute([
                    ':fn' => $fileNumber,
                    ':fnm' => $firstName,
                    ':lnm' => $lastName,
                    ':ph' => $phone
                ]);
                $patientId = (int)$db->lastInsertId();
            }
        }

        if (!$patientId) {
            $patientId = 1; // Fallback
        }

        $sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, duration, reason, status, notes)
                VALUES (:pid, 1, :adate, :atime, :dur, :reason, :status, :notes)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':pid' => $patientId,
            ':adate' => $date,
            ':atime' => strlen($time) === 5 ? ($time . ":00") : $time,
            ':dur' => $body['duration'] ?? '20 min',
            ':reason' => $body['reason'] ?? 'Consultation générale',
            ':status' => $body['status'] ?? 'Confirmé',
            ':notes' => $body['notes'] ?? null
        ]);

        $newId = intval($db->lastInsertId());
        sendResponse("success", ["id" => $newId], "Rendez-vous créé avec succès dans MySQL", 201);
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur création rendez-vous : " . $e->getMessage(), 500);
    }
}

function handleUpdateAppointment($db) {
    $body = getRequestBody();
    $id = $body['id'] ?? null;

    if (!$id) {
        sendResponse("error", null, "Identifiant rendez-vous manquant", 400);
    }

    try {
        $fields = [];
        $params = [':id' => (int)$id];

        if (isset($body['status'])) {
            $fields[] = "status = :status";
            $params[':status'] = $body['status'];
        }
        if (isset($body['date'])) {
            $fields[] = "appointment_date = :adate";
            $params[':adate'] = $body['date'];
        }
        if (isset($body['time'])) {
            $fields[] = "appointment_time = :atime";
            $params[':atime'] = strlen($body['time']) === 5 ? ($body['time'] . ":00") : $body['time'];
        }
        if (isset($body['duration'])) {
            $fields[] = "duration = :dur";
            $params[':dur'] = $body['duration'];
        }
        if (isset($body['reason'])) {
            $fields[] = "reason = :reason";
            $params[':reason'] = $body['reason'];
        }
        if (isset($body['notes'])) {
            $fields[] = "notes = :notes";
            $params[':notes'] = $body['notes'];
        }

        if (empty($fields)) {
            sendResponse("error", null, "Aucun champ à mettre à jour", 400);
        }

        $sql = "UPDATE appointments SET " . implode(", ", $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        sendResponse("success", ["id" => (int)$id], "Rendez-vous mis à jour avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur modification rendez-vous : " . $e->getMessage(), 500);
    }
}

function handleDeleteAppointment($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $body = getRequestBody();
        $id = $body['id'] ?? null;
    }

    if (!$id) {
        sendResponse("error", null, "Identifiant rendez-vous manquant", 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM appointments WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        sendResponse("success", null, "Rendez-vous annulé et supprimé de MySQL");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur suppression rendez-vous : " . $e->getMessage(), 500);
    }
}

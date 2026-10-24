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

function calculateTicketNumber($timeStr) {
    if (empty($timeStr)) return 1;
    $timeClean = substr(trim($timeStr), 0, 5);
    $allSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30"
    ];
    $idx = array_search($timeClean, $allSlots);
    if ($idx !== false) {
        return $idx + 1;
    }
    $parts = explode(':', $timeClean);
    $h = intval($parts[0] ?? 9);
    $m = intval($parts[1] ?? 0);
    $totalMinutes = $h * 60 + $m;
    $diff = $totalMinutes - (9 * 60);
    if ($diff >= 0) {
        return floor($diff / 30) + 1;
    }
    return 1;
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
                       COALESCE(NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''), 'Patient') AS patient_name,
                       COALESCE(p.first_name, '') AS first_name,
                       COALESCE(p.last_name, '') AS last_name,
                       COALESCE(p.phone, '') AS patient_phone,
                       COALESCE(p.email, '') AS patient_email
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                $where
                ORDER BY a.appointment_date ASC, a.appointment_time ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $appointments = [];
        foreach ($rows as $r) {
            $timeShort = substr($r['appointment_time'], 0, 5);
            $appointments[] = [
                "id" => intval($r['id']),
                "ticketNumber" => calculateTicketNumber($timeShort),
                "patientId" => intval($r['patient_id']),
                "patientName" => $r['patient_name'],
                "firstName" => $r['first_name'],
                "lastName" => $r['last_name'],
                "phone" => $r['patient_phone'],
                "email" => $r['patient_email'],
                "date" => $r['appointment_date'],
                "time" => $timeShort,
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

        // Si le patientId n'est pas fourni (ex: réservation en ligne depuis le site web public)
        if (!$patientId && !empty($body['patientName'])) {
            $rawName = trim($body['patientName']);
            $parts = preg_split('/\s+/', $rawName, 2);
            $firstName = !empty($parts[0]) ? $parts[0] : 'Patient';
            $lastName = !empty($parts[1]) ? $parts[1] : '';
            $phone = trim($body['patientPhone'] ?? ($body['phone'] ?? ''));

            // Chercher si le patient existe par téléphone
            $found = null;
            if (!empty($phone)) {
                $find = $db->prepare("SELECT id FROM patients WHERE phone = :phone AND phone != '' LIMIT 1");
                $find->execute([':phone' => $phone]);
                $found = $find->fetchColumn();
            }

            if ($found) {
                $patientId = (int)$found;
            } else {
                // Génération d'un file_number garanti unique
                $seq = (int)$db->query("SELECT COALESCE(MAX(id), 0) + 1 FROM patients")->fetchColumn();
                do {
                    $fileNumber = 'DOS-' . date('Y') . '-' . str_pad($seq, 3, '0', STR_PAD_LEFT);
                    $chk = $db->prepare("SELECT COUNT(*) FROM patients WHERE file_number = :fn");
                    $chk->execute([':fn' => $fileNumber]);
                    if ($chk->fetchColumn() == 0) {
                        break;
                    }
                    $seq++;
                } while (true);

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
            $firstPatient = $db->query("SELECT id FROM patients ORDER BY id ASC LIMIT 1")->fetchColumn();
            $patientId = $firstPatient ? (int)$firstPatient : null;
        }

        if (!$patientId) {
            $insPat = $db->prepare("INSERT INTO patients (file_number, first_name, last_name, phone, status) VALUES ('DOS-" . date('Y') . "-001', 'Patient', 'Public', '', 'Nouveau')");
            $insPat->execute();
            $patientId = (int)$db->lastInsertId();
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
        $ticketNo = calculateTicketNumber($time);

        // Si créé avec le statut Arrivé, ajouter dans la salle d'attente
        if (($body['status'] ?? '') === 'Arrivé') {
            $insWait = $db->prepare("
                INSERT INTO waiting_room (patient_id, appointment_id, appointment_time, arrival_time, reason, status)
                VALUES (:pid, :aid, :atime, CURTIME(), :reason, 'En attente')
            ");
            $insWait->execute([
                ':pid' => $patientId,
                ':aid' => $newId,
                ':atime' => strlen($time) === 5 ? ($time . ":00") : $time,
                ':reason' => $body['reason'] ?? 'Consultation générale'
            ]);
        }

        sendResponse("success", ["id" => $newId, "ticketNumber" => $ticketNo], "Rendez-vous créé avec succès dans MySQL", 201);
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

        // Si le statut passe à Arrivé, synchroniser automatiquement avec la salle d'attente MySQL
        if (isset($body['status']) && $body['status'] === 'Arrivé') {
            $chkWait = $db->prepare("SELECT id FROM waiting_room WHERE appointment_id = :aid AND status != 'Terminé' LIMIT 1");
            $chkWait->execute([':aid' => (int)$id]);
            if (!$chkWait->fetchColumn()) {
                $aptQ = $db->prepare("SELECT patient_id, appointment_time, reason FROM appointments WHERE id = :id");
                $aptQ->execute([':id' => (int)$id]);
                $aptRow = $aptQ->fetch(PDO::FETCH_ASSOC);
                if ($aptRow) {
                    $insWait = $db->prepare("
                        INSERT INTO waiting_room (patient_id, appointment_id, appointment_time, arrival_time, reason, status)
                        VALUES (:pid, :aid, :atime, CURTIME(), :reason, 'En attente')
                    ");
                    $insWait->execute([
                        ':pid' => $aptRow['patient_id'],
                        ':aid' => (int)$id,
                        ':atime' => $aptRow['appointment_time'] ?: date('H:i:s'),
                        ':reason' => $aptRow['reason'] ?: 'Consultation générale'
                    ]);
                }
            }
        } elseif (isset($body['status']) && $body['status'] === 'En consultation') {
            $db->prepare("UPDATE waiting_room SET status = 'En consultation' WHERE appointment_id = :aid AND status = 'En attente'")
               ->execute([':aid' => (int)$id]);
        } elseif (isset($body['status']) && in_array($body['status'], ['Terminé', 'Absent', 'Annulé'])) {
            $db->prepare("UPDATE waiting_room SET status = 'Terminé' WHERE appointment_id = :aid AND status != 'Terminé'")
               ->execute([':aid' => (int)$id]);
        }

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

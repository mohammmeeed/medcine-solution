<?php
// backend/api/prescriptions.php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetPrescriptions($db);
        break;
    case 'POST':
        handleCreatePrescription($db);
        break;
    default:
        sendResponse("error", null, "Méthode non autorisée", 405);
}

function handleGetPrescriptions($db) {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $patientId = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;

        $sql = "SELECT pr.*, 
                       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                       p.dob AS patient_dob,
                       p.file_number AS patient_file_number
                FROM prescriptions pr
                JOIN patients p ON pr.patient_id = p.id ";

        $params = [];
        if ($id) {
            $sql .= " WHERE pr.id = :id ";
            $params[':id'] = $id;
        } elseif ($patientId) {
            $sql .= " WHERE pr.patient_id = :pid ";
            $params[':pid'] = $patientId;
        }

        $sql .= " ORDER BY pr.prescription_date DESC, pr.id DESC ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $prescriptions = [];
        foreach ($rows as $r) {
            $itStmt = $db->prepare("SELECT medication, dosage, posology, duration, renewable FROM prescription_items WHERE prescription_id = :pid");
            $itStmt->execute([':pid' => $r['id']]);
            $items = $itStmt->fetchAll();

            $prescriptions[] = [
                "id" => intval($r['id']),
                "prescriptionNumber" => $r['prescription_number'],
                "patientId" => intval($r['patient_id']),
                "patientName" => $r['patient_name'],
                "date" => $r['prescription_date'],
                "validity" => $r['validity'] ?: "3 mois",
                "ald" => boolval($r['ald']),
                "doctorName" => $r['doctor_name'],
                "notes" => $r['notes'],
                "validated" => boolval($r['validated']),
                "items" => $items
            ];
        }

        sendResponse("success", $prescriptions, "Ordonnances récupérées avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur récupération ordonnances : " . $e->getMessage(), 500);
    }
}

function handleCreatePrescription($db) {
    $body = getRequestBody();

    if (empty($body['patientId'])) {
        sendResponse("error", null, "patientId est requis", 400);
    }

    try {
        $db->beginTransaction();

        $patientId = intval($body['patientId']);
        $date = !empty($body['date']) ? $body['date'] : date('Y-m-d');
        $year = date('Y', strtotime($date));
        $count = $db->query("SELECT COUNT(*) FROM prescriptions")->fetchColumn() + 1;
        $num = !empty($body['prescriptionNumber']) ? $body['prescriptionNumber'] : sprintf("ORD-%s-%04d", $year, $count);
        $doc = !empty($body['doctorName']) ? $body['doctorName'] : "Dr N. BELBACHIR OULD HENNIA";

        $sql = "INSERT INTO prescriptions 
                    (prescription_number, patient_id, doctor_name, prescription_date, validity, ald, notes, validated)
                VALUES 
                    (:num, :pid, :dname, :pdate, :val, :ald, :notes, 1)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':num' => $num,
            ':pid' => $patientId,
            ':dname' => $doc,
            ':pdate' => $date,
            ':val' => $body['validity'] ?? '3 mois',
            ':ald' => !empty($body['ald']) ? 1 : 0,
            ':notes' => $body['notes'] ?? 'Respecter la posologie.'
        ]);

        $prescId = intval($db->lastInsertId());

        $items = $body['items'] ?? [];
        if (is_array($items) && count($items) > 0) {
            $itStmt = $db->prepare("INSERT INTO prescription_items (prescription_id, medication, dosage, posology, duration, renewable) VALUES (:pid, :med, :dos, :pos, :dur, :ren)");
            foreach ($items as $it) {
                if (!empty(trim($it['medication'] ?? ''))) {
                    $itStmt->execute([
                        ':pid' => $prescId,
                        ':med' => trim($it['medication']),
                        ':dos' => $it['dosage'] ?? null,
                        ':pos' => $it['posology'] ?? '1 comprimé par jour',
                        ':dur' => $it['duration'] ?? '5 jours',
                        ':ren' => $it['renewable'] ?? 'Non renouvelable'
                    ]);
                }
            }
        }

        $db->commit();
        sendResponse("success", [
            "id" => $prescId,
            "prescriptionNumber" => $num,
            "patientId" => $patientId,
            "date" => $date
        ], "Ordonnance enregistrée avec succès", 201);
    } catch (Exception $e) {
        $db->rollBack();
        sendResponse("error", null, "Erreur création ordonnance : " . $e->getMessage(), 500);
    }
}

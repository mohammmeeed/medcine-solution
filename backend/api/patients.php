<?php
// backend/api/patients.php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetPatients($db);
        break;
    case 'POST':
        handleCreatePatient($db);
        break;
    case 'PUT':
        handleUpdatePatient($db);
        break;
    case 'DELETE':
        handleDeletePatient($db);
        break;
    default:
        sendResponse("error", null, "Méthode non autorisée", 405);
}

function handleGetPatients($db) {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $search = isset($_GET['search']) ? trim($_GET['search']) : null;

        $sql = "SELECT * FROM patients ";
        $params = [];

        if ($id) {
            $sql .= " WHERE id = :id ";
            $params[':id'] = $id;
        } elseif ($search) {
            $sql .= " WHERE first_name LIKE :s OR last_name LIKE :s OR file_number LIKE :s OR phone LIKE :s ";
            $params[':s'] = "%" . $search . "%";
        }

        $sql .= " ORDER BY id DESC ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $patients = [];
        foreach ($rows as $r) {
            // Récupérer allergies
            $aStmt = $db->prepare("SELECT allergy FROM patient_allergies WHERE patient_id = :pid");
            $aStmt->execute([':pid' => $r['id']]);
            $allergies = $aStmt->fetchAll(PDO::FETCH_COLUMN);

            // Récupérer maladies chroniques
            $dStmt = $db->prepare("SELECT disease FROM patient_chronic_diseases WHERE patient_id = :pid");
            $dStmt->execute([':pid' => $r['id']]);
            $diseases = $dStmt->fetchAll(PDO::FETCH_COLUMN);

            // Récupérer traitements habituels
            $tStmt = $db->prepare("SELECT treatment FROM patient_regular_treatments WHERE patient_id = :pid");
            $tStmt->execute([':pid' => $r['id']]);
            $treatments = $tStmt->fetchAll(PDO::FETCH_COLUMN);

            // Calculer l'âge exact
            $calculatedAge = $r['age'];
            if (!empty($r['dob'])) {
                $dob = new DateTime($r['dob']);
                $today = new DateTime();
                $calculatedAge = $today->diff($dob)->y;
            }

            $patients[] = [
                "id" => intval($r['id']),
                "fileNumber" => $r['file_number'],
                "firstName" => $r['first_name'],
                "lastName" => $r['last_name'],
                "dob" => $r['dob'],
                "age" => $calculatedAge,
                "gender" => $r['gender'],
                "phone" => $r['phone'],
                "email" => $r['email'],
                "address" => $r['address'],
                "secuNumber" => $r['secu_number'],
                "bloodGroup" => $r['blood_group'],
                "allergies" => $allergies ?: ["Aucune allergie connue"],
                "chronicDiseases" => $diseases ?: [],
                "regularTreatments" => $treatments ?: [],
                "gravida" => intval($r['gravida'] ?? 0),
                "para" => intval($r['para'] ?? 0),
                "cesarean" => intval($r['cesarean'] ?? 0),
                "livingChildren" => intval($r['living_children'] ?? 0),
                "lastVisit" => $r['last_visit'],
                "status" => $r['status']
            ];
        }

        sendResponse("success", $patients, "Patients récupérés avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur récupération patients : " . $e->getMessage(), 500);
    }
}

function handleCreatePatient($db) {
    $body = getRequestBody();

    if (empty($body['firstName']) || empty($body['lastName'])) {
        sendResponse("error", null, "Le prénom et le nom sont requis", 400);
    }

    try {
        $year = date('Y');
        $maxStmt = $db->query("SELECT COALESCE(MAX(id), 0) + 1 FROM patients");
        $nextNum = $maxStmt->fetchColumn();
        $fileNumber = !empty($body['fileNumber']) ? $body['fileNumber'] : sprintf("DOS-%s-%03d", $year, $nextNum);

        $dob = !empty($body['dob']) ? $body['dob'] : null;
        $age = null;
        if ($dob) {
            $dobDate = new DateTime($dob);
            $age = (new DateTime())->diff($dobDate)->y;
        } elseif (!empty($body['age'])) {
            $age = intval($body['age']);
        }

        $sql = "INSERT INTO patients 
                    (file_number, first_name, last_name, dob, age, gender, phone, email, address, secu_number, blood_group, status)
                VALUES 
                    (:fn, :fname, :lname, :dob, :age, :gender, :phone, :email, :addr, :secu, :bg, 'Actif')";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':fn' => $fileNumber,
            ':fname' => trim($body['firstName']),
            ':lname' => trim($body['lastName']),
            ':dob' => $dob,
            ':age' => $age,
            ':gender' => $body['gender'] ?? 'Féminin',
            ':phone' => $body['phone'] ?? null,
            ':email' => $body['email'] ?? null,
            ':addr' => $body['address'] ?? null,
            ':secu' => $body['secuNumber'] ?? null,
            ':bg' => $body['bloodGroup'] ?? 'O+'
        ]);

        $newId = intval($db->lastInsertId());

        // Sauvegarder allergies si spécifiées
        if (!empty($body['allergies']) && is_array($body['allergies'])) {
            $aStmt = $db->prepare("INSERT INTO patient_allergies (patient_id, allergy) VALUES (:pid, :allergy)");
            foreach ($body['allergies'] as $allergy) {
                if (trim($allergy) && trim($allergy) !== 'Aucune allergie connue') {
                    $aStmt->execute([':pid' => $newId, ':allergy' => trim($allergy)]);
                }
            }
        }

        // Sauvegarder antécédents / maladies chroniques
        if (!empty($body['chronicDiseases']) && is_array($body['chronicDiseases'])) {
            $dStmt = $db->prepare("INSERT INTO patient_chronic_diseases (patient_id, disease) VALUES (:pid, :disease)");
            foreach ($body['chronicDiseases'] as $disease) {
                if (trim($disease)) {
                    $dStmt->execute([':pid' => $newId, ':disease' => trim($disease)]);
                }
            }
        }

        sendResponse("success", [
            "id" => $newId,
            "fileNumber" => $fileNumber,
            "firstName" => trim($body['firstName']),
            "lastName" => trim($body['lastName']),
            "dob" => $dob,
            "age" => $age,
            "gender" => $body['gender'] ?? 'Féminin',
            "phone" => $body['phone'] ?? null,
            "email" => $body['email'] ?? null,
            "address" => $body['address'] ?? null,
            "secuNumber" => $body['secuNumber'] ?? null,
            "bloodGroup" => $body['bloodGroup'] ?? 'O+',
            "allergies" => $body['allergies'] ?? ["Aucune allergie connue"],
            "chronicDiseases" => $body['chronicDiseases'] ?? [],
            "regularTreatments" => [],
            "lastVisit" => null,
            "status" => "Actif"
        ], "Patient créé avec succès dans MySQL", 201);
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur création patient : " . $e->getMessage(), 500);
    }
}

function handleUpdatePatient($db) {
    $body = getRequestBody();
    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($body['id']) ? intval($body['id']) : null);

    if (!$id) {
        sendResponse("error", null, "ID patient requis pour la mise à jour", 400);
    }

    try {
        $dob = !empty($body['dob']) ? $body['dob'] : null;
        $age = null;
        if ($dob) {
            $dobDate = new DateTime($dob);
            $age = (new DateTime())->diff($dobDate)->y;
        } elseif (!empty($body['age'])) {
            $age = intval($body['age']);
        }

        $sql = "UPDATE patients SET 
                    first_name = :fname,
                    last_name = :lname,
                    dob = :dob,
                    age = :age,
                    gender = :gender,
                    phone = :phone,
                    email = :email,
                    address = :addr,
                    secu_number = :secu,
                    blood_group = :bg
                WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':fname' => trim($body['firstName']),
            ':lname' => trim($body['lastName']),
            ':dob' => $dob,
            ':age' => $age,
            ':gender' => $body['gender'] ?? 'Féminin',
            ':phone' => $body['phone'] ?? null,
            ':email' => $body['email'] ?? null,
            ':addr' => $body['address'] ?? null,
            ':secu' => $body['secuNumber'] ?? null,
            ':bg' => $body['bloodGroup'] ?? null,
            ':id' => $id
        ]);

        sendResponse("success", [
            "id" => $id,
            "firstName" => trim($body['firstName']),
            "lastName" => trim($body['lastName']),
            "dob" => $dob,
            "age" => $age,
            "gender" => $body['gender'] ?? 'Féminin',
            "phone" => $body['phone'] ?? null,
            "email" => $body['email'] ?? null,
            "address" => $body['address'] ?? null,
            "secuNumber" => $body['secuNumber'] ?? null,
            "bloodGroup" => $body['bloodGroup'] ?? null
        ], "Patient mis à jour avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur mise à jour patient : " . $e->getMessage(), 500);
    }
}

function handleDeletePatient($db) {
    $body = getRequestBody();
    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($body['id']) ? intval($body['id']) : null);

    if (!$id) {
        sendResponse("error", null, "ID patient requis pour la suppression", 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM patients WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() > 0) {
            sendResponse("success", ["id" => $id], "Patient supprimé de la base de données");
        } else {
            sendResponse("error", null, "Patient introuvable ou déjà supprimé", 404);
        }
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur suppression patient : " . $e->getMessage(), 500);
    }
}

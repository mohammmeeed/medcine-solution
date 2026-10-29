<?php
// backend/api/documents.php
// Documents médicaux, imageries et analyses des patients

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetDocuments($db);
        break;
    case 'POST':
        handleSaveDocument($db);
        break;
    case 'DELETE':
        handleDeleteDocument($db);
        break;
    default:
        sendResponse('error', null, 'Méthode non autorisée', 405);
        break;
}

function handleGetDocuments($db) {
    try {
        $patientId = $_GET['patient_id'] ?? null;
        $params = [];
        $where = "";

        if ($patientId) {
            $where = "WHERE d.patient_id = :pid";
            $params[':pid'] = (int)$patientId;
        }

        $stmt = $db->prepare("
            SELECT 
                d.*,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                p.file_number
            FROM medical_documents d
            LEFT JOIN patients p ON p.id = d.patient_id
            $where
            ORDER BY d.id DESC
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $data = array_map(function ($row) {
            return [
                'id' => (int)$row['id'],
                'patientId' => (int)$row['patient_id'],
                'consultationId' => !empty($row['consultation_id']) ? (int)$row['consultation_id'] : null,
                'patientName' => $row['patient_name'] ?? 'Patient',
                'title' => $row['title'],
                'category' => $row['category'],
                'date' => $row['doc_date'],
                'author' => $row['author'] ?? 'Dr N. BELBACHIR OULD HENNIA',
                'filePath' => $row['file_path'],
                'fileDataUrl' => (!empty($row['file_path']) && (str_starts_with($row['file_path'], 'data:') || str_starts_with($row['file_path'], 'http'))) ? $row['file_path'] : null,
                'fileSize' => $row['file_size'] ?? '250 Ko',
                'fileType' => $row['file_type'] ?? 'PDF',
                'status' => $row['status'] ?? 'Validé',
                'createdAt' => $row['created_at'],
            ];
        }, $rows);

        sendResponse('success', $data, 'Documents médicaux récupérés avec succès');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la récupération des documents : ' . $e->getMessage(), 500);
    }
}

function handleSaveDocument($db) {
    $input = getRequestBody();

    if (empty($input['title']) || empty($input['patientId'])) {
        sendResponse('error', null, 'Titre et patient obligatoires', 400);
    }

    try {
        $patientId = (int)$input['patientId'];
        $consultationId = !empty($input['consultationId']) ? (int)$input['consultationId'] : null;
        $title = trim($input['title']);
        $category = $input['category'] ?? 'Autre';
        $docDate = $input['date'] ?? date('Y-m-d');
        $author = $input['author'] ?? 'Dr N. BELBACHIR OULD HENNIA';
        $filePath = $input['filePath'] ?? ($input['previewUrl'] ?? ($input['fileDataUrl'] ?? null));
        $fileSize = $input['fileSize'] ?? '1.2 Mo';
        $fileType = $input['fileType'] ?? ($input['type'] ?? 'PDF');
        $status = $input['status'] ?? 'Validé';

        $stmt = $db->prepare("
            INSERT INTO medical_documents (
                patient_id, consultation_id, title, category,
                doc_date, author, file_path, file_size, file_type, status
            ) VALUES (
                :patientId, :consultationId, :title, :category,
                :docDate, :author, :filePath, :fileSize, :fileType, :status
            )
        ");

        $stmt->execute([
            ':patientId' => $patientId,
            ':consultationId' => $consultationId,
            ':title' => $title,
            ':category' => $category,
            ':docDate' => $docDate,
            ':author' => $author,
            ':filePath' => $filePath,
            ':fileSize' => $fileSize,
            ':fileType' => $fileType,
            ':status' => $status,
        ]);

        $newId = (int)$db->lastInsertId();
        sendResponse('success', ['id' => $newId, 'title' => $title], 'Document enregistré avec succès dans MySQL', 201);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur enregistrement document : ' . $e->getMessage(), 500);
    }
}

function handleDeleteDocument($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        sendResponse('error', null, 'Identifiant document manquant', 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM medical_documents WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        sendResponse('success', null, 'Document supprimé avec succès');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la suppression du document : ' . $e->getMessage(), 500);
    }
}

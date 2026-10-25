<?php
// backend/api/invoices.php
// Gestion des factures médicales et feuilles de soins

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetInvoices($db);
        break;
    case 'POST':
        handleSaveInvoice($db);
        break;
    case 'DELETE':
        handleDeleteInvoice($db);
        break;
    default:
        sendResponse('error', null, 'Méthode non autorisée', 405);
        break;
}

function handleGetInvoices($db) {
    try {
        $patientId = $_GET['patient_id'] ?? null;
        $params = [];
        $where = "";

        if ($patientId) {
            $where = "WHERE i.patient_id = :pid";
            $params[':pid'] = (int)$patientId;
        }

        $stmt = $db->prepare("
            SELECT 
                i.*,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                p.file_number,
                p.phone AS patient_phone
            FROM invoices i
            LEFT JOIN patients p ON p.id = i.patient_id
            $where
            ORDER BY i.id DESC
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $data = array_map(function ($row) {
            return [
                'id' => (int)$row['id'],
                'invoiceNumber' => $row['invoice_number'],
                'patientId' => (int)$row['patient_id'],
                'consultationId' => !empty($row['consultation_id']) ? (int)$row['consultation_id'] : null,
                'patientName' => $row['patient_name'] ?? 'Patient',
                'fileNumber' => $row['file_number'] ?? '',
                'date' => $row['invoice_date'],
                'actDescription' => $row['act_description'],
                'amount' => (float)$row['amount'],
                'coveredAmo' => (float)$row['covered_amo'],
                'coveredAmc' => (float)$row['covered_amc'],
                'patientRemaining' => (float)$row['patient_remaining'],
                'paymentMethod' => $row['payment_method'] ?? 'Espèces',
                'status' => $row['status'],
                'createdAt' => $row['created_at'],
            ];
        }, $rows);

        sendResponse('success', $data, 'Factures récupérées avec succès');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la récupération des factures : ' . $e->getMessage(), 500);
    }
}

function handleSaveInvoice($db) {
    $input = getRequestBody();

    if (empty($input['patientId']) || empty($input['amount'])) {
        sendResponse('error', null, 'Patient et montant obligatoires', 400);
    }

    try {
        // Générer un numéro de facture si non fourni
        $count = $db->query("SELECT COUNT(*) FROM invoices")->fetchColumn();
        $invoiceNumber = $input['invoiceNumber'] ?? ('FAC-' . date('Y') . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT));

        $patientId = (int)$input['patientId'];
        $consultationId = !empty($input['consultationId']) ? (int)$input['consultationId'] : null;
        $invoiceDate = $input['date'] ?? date('Y-m-d');
        $actDescription = $input['actDescription'] ?? 'Consultation médicale';
        $amount = (float)$input['amount'];
        $coveredAmo = (float)($input['coveredAmo'] ?? 0);
        $coveredAmc = (float)($input['coveredAmc'] ?? 0);
        $patientRemaining = (float)($input['patientRemaining'] ?? $amount);
        $paymentMethod = $input['paymentMethod'] ?? 'Espèces';
        $status = $input['status'] ?? 'Payée';

        $stmt = $db->prepare("
            INSERT INTO invoices (
                invoice_number, patient_id, consultation_id, invoice_date,
                act_description, amount, covered_amo, covered_amc,
                patient_remaining, payment_method, status
            ) VALUES (
                :invoiceNumber, :patientId, :consultationId, :invoiceDate,
                :actDescription, :amount, :coveredAmo, :coveredAmc,
                :patientRemaining, :paymentMethod, :status
            )
        ");

        $stmt->execute([
            ':invoiceNumber' => $invoiceNumber,
            ':patientId' => $patientId,
            ':consultationId' => $consultationId,
            ':invoiceDate' => $invoiceDate,
            ':actDescription' => $actDescription,
            ':amount' => $amount,
            ':coveredAmo' => $coveredAmo,
            ':coveredAmc' => $coveredAmc,
            ':patientRemaining' => $patientRemaining,
            ':paymentMethod' => $paymentMethod,
            ':status' => $status,
        ]);

        $newId = $db->lastInsertId();
        sendResponse('success', ['id' => (int)$newId, 'invoiceNumber' => $invoiceNumber], 'Facture enregistrée avec succès', 201);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur enregistrement facture : ' . $e->getMessage(), 500);
    }
}

function handleDeleteInvoice($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        sendResponse('error', null, 'Identifiant facture manquant', 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM invoices WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        sendResponse('success', null, 'Facture supprimée');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la suppression de la facture : ' . $e->getMessage(), 500);
    }
}

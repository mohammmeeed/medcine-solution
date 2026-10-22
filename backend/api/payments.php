<?php
// backend/api/payments.php
// Règlements, reçus de paiement et encaissements de la caisse

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetPayments($db);
        break;
    case 'POST':
        handleSavePayment($db);
        break;
    case 'DELETE':
        handleDeletePayment($db);
        break;
    default:
        sendResponse('error', null, 'Méthode non autorisée', 405);
        break;
}

function handleGetPayments($db) {
    try {
        $stmt = $db->query("SELECT * FROM payments ORDER BY id DESC");
        $rows = $stmt->fetchAll();

        $data = array_map(function ($row) {
            return [
                'id' => (int)$row['id'],
                'receiptNumber' => $row['receipt_number'],
                'invoiceId' => $row['invoice_id'] ? (int)$row['invoice_id'] : null,
                'invoiceNumber' => $row['invoice_number'] ?? '',
                'patientName' => $row['patient_name'],
                'date' => $row['payment_date'],
                'time' => substr($row['payment_time'], 0, 5),
                'amount' => (float)$row['amount'],
                'method' => $row['method'],
                'operator' => $row['operator'],
                'status' => $row['status'],
                'createdAt' => $row['created_at'],
            ];
        }, $rows);

        sendResponse('success', $data, 'Règlements récupérés avec succès');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la récupération des règlements : ' . $e->getMessage(), 500);
    }
}

function handleSavePayment($db) {
    $input = getRequestBody();

    if (empty($input['patientName']) || empty($input['amount'])) {
        sendResponse('error', null, 'Nom du patient et montant obligatoires', 400);
    }

    try {
        $count = $db->query("SELECT COUNT(*) FROM payments")->fetchColumn();
        $receiptNumber = $input['receiptNumber'] ?? ('REC-' . date('Y') . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT));

        $invoiceId = !empty($input['invoiceId']) ? (int)$input['invoiceId'] : null;
        $invoiceNumber = $input['invoiceNumber'] ?? null;
        $patientName = trim($input['patientName']);
        $paymentDate = $input['date'] ?? date('Y-m-d');
        $paymentTime = $input['time'] ?? date('H:i:s');
        $amount = (float)$input['amount'];
        $method = $input['method'] ?? 'Espèces';
        $operator = $input['operator'] ?? 'Dr N. BELBACHIR OULD HENNIA';
        $status = $input['status'] ?? 'Encaissé';

        $stmt = $db->prepare("
            INSERT INTO payments (
                receipt_number, invoice_id, invoice_number, patient_name,
                payment_date, payment_time, amount, method, operator, status
            ) VALUES (
                :receiptNumber, :invoiceId, :invoiceNumber, :patientName,
                :paymentDate, :paymentTime, :amount, :method, :operator, :status
            )
        ");

        $stmt->execute([
            ':receiptNumber' => $receiptNumber,
            ':invoiceId' => $invoiceId,
            ':invoiceNumber' => $invoiceNumber,
            ':patientName' => $patientName,
            ':paymentDate' => $paymentDate,
            ':paymentTime' => $paymentTime,
            ':amount' => $amount,
            ':method' => $method,
            ':operator' => $operator,
            ':status' => $status,
        ]);

        $newId = $db->lastInsertId();
        sendResponse('success', ['id' => (int)$newId, 'receiptNumber' => $receiptNumber], 'Règlement enregistré avec succès', 201);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur enregistrement règlement : ' . $e->getMessage(), 500);
    }
}

function handleDeletePayment($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        sendResponse('error', null, 'Identifiant règlement manquant', 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM payments WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        sendResponse('success', null, 'Règlement supprimé');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la suppression du règlement : ' . $e->getMessage(), 500);
    }
}

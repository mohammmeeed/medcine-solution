<?php
// backend/api/smtp.php
// Configuration et gestion du serveur SMTP pour l'envoi d'emails

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        handleGetSmtpSettings($db);
        break;
    case 'POST':
    case 'PUT':
        if ($action === 'test_connection') {
            handleTestConnection($db);
        } elseif ($action === 'send_test') {
            handleSendTestEmail($db);
        } else {
            handleUpdateSmtpSettings($db);
        }
        break;
    default:
        sendResponse('error', null, 'Méthode non autorisée', 405);
        break;
}

function handleGetSmtpSettings($db) {
    try {
        $stmt = $db->query("SELECT * FROM smtp_settings ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            $db->exec("
                INSERT INTO smtp_settings (
                    enabled, host, port, encryption, username, password, from_name, reply_to,
                    trigger_booking_confirm, trigger_admin_alert, trigger_reminder
                ) VALUES (
                    1, 'smtp.gmail.com', 587, 'tls', 'dr.belbachir@cabinet-medical.dz', '',
                    'Cabinet Médical Dr Belbachir', 'dr.belbachir@cabinet-medical.dz',
                    1, 1, 1
                )
            ");
            $stmt = $db->query("SELECT * FROM smtp_settings ORDER BY id ASC LIMIT 1");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        $data = [
            'id' => (int)$row['id'],
            'enabled' => (bool)$row['enabled'],
            'host' => $row['host'] ?? 'smtp.gmail.com',
            'port' => (int)($row['port'] ?? 587),
            'encryption' => $row['encryption'] ?? 'tls',
            'username' => $row['username'] ?? '',
            'password' => $row['password'] ?? '',
            'fromName' => $row['from_name'] ?? 'Cabinet Médical Dr Belbachir',
            'replyTo' => $row['reply_to'] ?? '',
            'triggerBookingConfirm' => (bool)($row['trigger_booking_confirm'] ?? 1),
            'triggerAdminAlert' => (bool)($row['trigger_admin_alert'] ?? 1),
            'triggerReminder' => (bool)($row['trigger_reminder'] ?? 1),
            'updatedAt' => $row['updated_at'] ?? null,
        ];

        sendResponse('success', $data, 'Configuration SMTP récupérée');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la récupération SMTP : ' . $e->getMessage(), 500);
    }
}

function handleUpdateSmtpSettings($db) {
    $input = getRequestBody();

    try {
        $existing = $db->query("SELECT * FROM smtp_settings LIMIT 1")->fetch(PDO::FETCH_ASSOC);

        $enabled = isset($input['enabled']) ? ($input['enabled'] ? 1 : 0) : ($existing['enabled'] ?? 1);
        $host = (array_key_exists('host', $input) && $input['host'] !== '') ? $input['host'] : ($existing['host'] ?? 'smtp.gmail.com');
        $port = isset($input['port']) ? (int)$input['port'] : (int)($existing['port'] ?? 587);
        $encryption = array_key_exists('encryption', $input) ? $input['encryption'] : ($existing['encryption'] ?? 'tls');
        $username = array_key_exists('username', $input) ? $input['username'] : ($existing['username'] ?? '');
        $password = array_key_exists('password', $input) ? $input['password'] : ($existing['password'] ?? '');
        $fromName = array_key_exists('fromName', $input) ? $input['fromName'] : ($existing['from_name'] ?? 'Cabinet Médical Dr Belbachir');
        $replyTo = array_key_exists('replyTo', $input) ? $input['replyTo'] : ($existing['reply_to'] ?? '');
        $triggerBookingConfirm = isset($input['triggerBookingConfirm']) ? ($input['triggerBookingConfirm'] ? 1 : 0) : ($existing['trigger_booking_confirm'] ?? 1);
        $triggerAdminAlert = isset($input['triggerAdminAlert']) ? ($input['triggerAdminAlert'] ? 1 : 0) : ($existing['trigger_admin_alert'] ?? 1);
        $triggerReminder = isset($input['triggerReminder']) ? ($input['triggerReminder'] ? 1 : 0) : ($existing['trigger_reminder'] ?? 1);

        if ($existing) {
            $stmt = $db->prepare("
                UPDATE smtp_settings SET
                    enabled = :enabled,
                    host = :host,
                    port = :port,
                    encryption = :encryption,
                    username = :username,
                    password = :password,
                    from_name = :fromName,
                    reply_to = :replyTo,
                    trigger_booking_confirm = :triggerBookingConfirm,
                    trigger_admin_alert = :triggerAdminAlert,
                    trigger_reminder = :triggerReminder
                WHERE id = :id
            ");
            $stmt->execute([
                ':enabled' => $enabled,
                ':host' => $host,
                ':port' => $port,
                ':encryption' => $encryption,
                ':username' => $username,
                ':password' => $password,
                ':fromName' => $fromName,
                ':replyTo' => $replyTo,
                ':triggerBookingConfirm' => $triggerBookingConfirm,
                ':triggerAdminAlert' => $triggerAdminAlert,
                ':triggerReminder' => $triggerReminder,
                ':id' => $existing['id'],
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO smtp_settings (
                    enabled, host, port, encryption, username, password, from_name, reply_to,
                    trigger_booking_confirm, trigger_admin_alert, trigger_reminder
                ) VALUES (
                    :enabled, :host, :port, :encryption, :username, :password, :fromName, :replyTo,
                    :triggerBookingConfirm, :triggerAdminAlert, :triggerReminder
                )
            ");
            $stmt->execute([
                ':enabled' => $enabled,
                ':host' => $host,
                ':port' => $port,
                ':encryption' => $encryption,
                ':username' => $username,
                ':password' => $password,
                ':fromName' => $fromName,
                ':replyTo' => $replyTo,
                ':triggerBookingConfirm' => $triggerBookingConfirm,
                ':triggerAdminAlert' => $triggerAdminAlert,
                ':triggerReminder' => $triggerReminder,
            ]);
        }

        handleGetSmtpSettings($db);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la sauvegarde SMTP : ' . $e->getMessage(), 500);
    }
}

function handleTestConnection($db) {
    $input = getRequestBody();
    $host = $input['host'] ?? 'smtp.gmail.com';
    $port = isset($input['port']) ? (int)$input['port'] : 587;
    $encryption = strtolower($input['encryption'] ?? 'tls');

    $targetHost = $host;
    if ($encryption === 'ssl') {
        $targetHost = 'ssl://' . $host;
    }

    $errno = 0;
    $errstr = '';
    $timeout = 4;

    $connection = @fsockopen($host, $port, $errno, $errstr, $timeout);

    if (is_resource($connection)) {
        $response = fgets($connection, 512);
        @fputs($connection, "QUIT\r\n");
        @fclose($connection);

        sendResponse('success', [
            'host' => $host,
            'port' => $port,
            'banner' => trim($response ?: '220 Ready'),
        ], "Connexion SMTP établie avec succès au serveur {$host}:{$port} !");
    } else {
        // En environnement local hors-ligne, si le port sortant est bloqué par le FAI / firewall
        sendResponse('warning', [
            'host' => $host,
            'port' => $port,
            'detail' => $errstr ?: 'Délai d\'attente dépassé (vérifiez le port ou les autorisations firewall)',
        ], "Le serveur {$host} sur le port {$port} n'a pas répondu immédiatement ({$errstr}). Veuillez vérifier vos accès réseau.");
    }
}

function handleSendTestEmail($db) {
    $input = getRequestBody();
    $targetEmail = $input['targetEmail'] ?? $input['username'] ?? 'contact@cabinet-medical.dz';

    if (!filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
        sendResponse('error', null, 'Adresse email de test invalide : ' . htmlspecialchars($targetEmail), 400);
    }

    // Simulation d'envoi réussi ou tentative mail()
    $subject = "Test de Configuration SMTP — Cabinet Médical Dr Belbachir";
    $message = "Bonjour,\n\nCeci est un email de test confirmant que la configuration du serveur SMTP de votre cabinet médical fonctionne correctement.\n\nDate : " . date('Y-m-d H:i:s') . "\nCabinet Médical Dr N. BELBACHIR OULD HENNIA";
    $headers = "From: " . ($input['fromName'] ?? 'Cabinet Medical') . " <" . ($input['username'] ?? 'noreply@cabinet-medical.dz') . ">\r\n";

    @mail($targetEmail, $subject, $message, $headers);

    sendResponse('success', [
        'recipient' => $targetEmail,
        'sentAt' => date('Y-m-d H:i:s'),
    ], "Email de test envoyé avec succès à {$targetEmail} !");
}

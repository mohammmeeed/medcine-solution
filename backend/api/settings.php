<?php
// backend/api/settings.php
// Gestion des paramètres du cabinet médical (Agenda, Rappels, Sécurité, Sauvegardes)

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetSettings($db);
        break;
    case 'POST':
    case 'PUT':
        handleUpdateSettings($db);
        break;
    default:
        sendResponse('error', null, 'Méthode non autorisée', 405);
        break;
}

function handleGetSettings($db) {
    try {
        $stmt = $db->query("SELECT * FROM settings ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch();

        if (!$row) {
            // Créer une ligne par défaut si la table est vide
            $insert = $db->prepare("
                INSERT INTO settings (
                    default_duration, slot_interval, sms_reminders, email_reminders,
                    reminder_hours_before, auto_backup, backup_frequency,
                    session_timeout_minutes, two_factor_auth
                ) VALUES (
                    '20 min', '15 min', 1, 1, 24, 1, 'Quotidienne (23:00)', 30, 1
                )
            ");
            $insert->execute();
            $stmt = $db->query("SELECT * FROM settings ORDER BY id ASC LIMIT 1");
            $row = $stmt->fetch();
        }

        // Default consultation types list
        $defaultTypes = [
            ['id' => 1, 'name' => 'Consultation de médecine générale', 'duration' => '20 min', 'price' => 2500, 'active' => true],
            ['id' => 2, 'name' => 'Consultation gynécologique / spécialisée', 'duration' => '25 min', 'price' => 3000, 'active' => true],
            ['id' => 3, 'name' => 'Suivi de grossesse / Maternité', 'duration' => '20 min', 'price' => 2500, 'active' => true],
            ['id' => 4, 'name' => 'Échographie obstétricale (T1 / T2 / T3)', 'duration' => '30 min', 'price' => 4000, 'active' => true],
            ['id' => 5, 'name' => 'Échographie pelvienne / gynécologique', 'duration' => '25 min', 'price' => 3500, 'active' => true],
            ['id' => 6, 'name' => 'Consultation avec frottis / acte', 'duration' => '30 min', 'price' => 3500, 'active' => true],
            ['id' => 7, 'name' => 'Visite de contrôle / Bilan', 'duration' => '15 min', 'price' => 1500, 'active' => true]
        ];

        $consultationTypes = $defaultTypes;
        if (!empty($row['consultation_types'])) {
            $decoded = json_decode($row['consultation_types'], true);
            if (is_array($decoded) && count($decoded) > 0) {
                $consultationTypes = $decoded;
            }
        }

        // Formatage pour le frontend React
        $data = [
            'id' => (int)$row['id'],
            'defaultDuration' => $row['default_duration'] ?? '20 min',
            'slotInterval' => $row['slot_interval'] ?? '15 min',
            'defaultConsultationType' => $row['default_consultation_type'] ?? 'Consultation de médecine générale',
            'consultationPrice' => isset($row['consultation_price']) ? (float)$row['consultation_price'] : 2500.0,
            'consultationTypes' => $consultationTypes,
            'smsReminders' => (bool)$row['sms_reminders'],
            'emailReminders' => (bool)$row['email_reminders'],
            'reminderHoursBefore' => (string)($row['reminder_hours_before'] ?? '24'),
            'autoBackup' => (bool)$row['auto_backup'],
            'backupFrequency' => $row['backup_frequency'] ?? 'Quotidienne (23:00)',
            'sessionTimeout' => (string)($row['session_timeout_minutes'] ?? '30'),
            'twoFactorAuth' => (bool)$row['two_factor_auth'],
            'updatedAt' => $row['updated_at'] ?? null,
        ];

        sendResponse('success', $data, 'Paramètres récupérés avec succès');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la récupération des paramètres : ' . $e->getMessage(), 500);
    }
}

function handleUpdateSettings($db) {
    $input = getRequestBody();

    try {
        // Vérifier s'il y a déjà une ligne
        $check = $db->query("SELECT id FROM settings LIMIT 1")->fetch();

        $defaultDuration = $input['defaultDuration'] ?? '20 min';
        $slotInterval = $input['slotInterval'] ?? '15 min';
        $defaultConsultationType = $input['defaultConsultationType'] ?? 'Consultation de médecine générale';
        $consultationPrice = isset($input['consultationPrice']) ? (float)$input['consultationPrice'] : 2500.0;
        
        $consultationTypes = null;
        if (isset($input['consultationTypes'])) {
            $consultationTypes = is_array($input['consultationTypes']) 
                ? json_encode($input['consultationTypes'], JSON_UNESCAPED_UNICODE) 
                : $input['consultationTypes'];
        }

        $smsReminders = !empty($input['smsReminders']) ? 1 : 0;
        $emailReminders = !empty($input['emailReminders']) ? 1 : 0;
        $reminderHoursBefore = isset($input['reminderHoursBefore']) ? (int)$input['reminderHoursBefore'] : 24;
        $autoBackup = !empty($input['autoBackup']) ? 1 : 0;
        $backupFrequency = $input['backupFrequency'] ?? 'Quotidienne (23:00)';
        $sessionTimeout = isset($input['sessionTimeout']) ? (int)$input['sessionTimeout'] : 30;
        $twoFactorAuth = !empty($input['twoFactorAuth']) ? 1 : 0;

        if ($check) {
            $stmt = $db->prepare("
                UPDATE settings SET
                    default_duration = :defaultDuration,
                    slot_interval = :slotInterval,
                    default_consultation_type = :defaultConsultationType,
                    consultation_price = :consultationPrice,
                    consultation_types = COALESCE(:consultationTypes, consultation_types),
                    sms_reminders = :smsReminders,
                    email_reminders = :emailReminders,
                    reminder_hours_before = :reminderHoursBefore,
                    auto_backup = :autoBackup,
                    backup_frequency = :backupFrequency,
                    session_timeout_minutes = :sessionTimeout,
                    two_factor_auth = :twoFactorAuth
                WHERE id = :id
            ");
            $stmt->execute([
                ':defaultDuration' => $defaultDuration,
                ':slotInterval' => $slotInterval,
                ':defaultConsultationType' => $defaultConsultationType,
                ':consultationPrice' => $consultationPrice,
                ':consultationTypes' => $consultationTypes,
                ':smsReminders' => $smsReminders,
                ':emailReminders' => $emailReminders,
                ':reminderHoursBefore' => $reminderHoursBefore,
                ':autoBackup' => $autoBackup,
                ':backupFrequency' => $backupFrequency,
                ':sessionTimeout' => $sessionTimeout,
                ':twoFactorAuth' => $twoFactorAuth,
                ':id' => $check['id'],
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO settings (
                    default_duration, slot_interval, default_consultation_type, consultation_price, consultation_types,
                    sms_reminders, email_reminders,
                    reminder_hours_before, auto_backup, backup_frequency,
                    session_timeout_minutes, two_factor_auth
                ) VALUES (
                    :defaultDuration, :slotInterval, :defaultConsultationType, :consultationPrice, :consultationTypes,
                    :smsReminders, :emailReminders,
                    :reminderHoursBefore, :autoBackup, :backupFrequency,
                    :sessionTimeout, :twoFactorAuth
                )
            ");
            $stmt->execute([
                ':defaultDuration' => $defaultDuration,
                ':slotInterval' => $slotInterval,
                ':defaultConsultationType' => $defaultConsultationType,
                ':consultationPrice' => $consultationPrice,
                ':consultationTypes' => $consultationTypes,
                ':smsReminders' => $smsReminders,
                ':emailReminders' => $emailReminders,
                ':reminderHoursBefore' => $reminderHoursBefore,
                ':autoBackup' => $autoBackup,
                ':backupFrequency' => $backupFrequency,
                ':sessionTimeout' => $sessionTimeout,
                ':twoFactorAuth' => $twoFactorAuth,
            ]);
        }

        handleGetSettings($db);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la mise à jour des paramètres : ' . $e->getMessage(), 500);
    }
}

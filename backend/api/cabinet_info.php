<?php
// backend/api/cabinet_info.php
// Coordonnées officielles du Cabinet et du Médecin titulaire

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetCabinetInfo($db);
        break;
    case 'POST':
    case 'PUT':
        handleUpdateCabinetInfo($db);
        break;
    default:
        sendResponse('error', null, 'Méthode non autorisée', 405);
        break;
}

function handleGetCabinetInfo($db) {
    try {
        $stmt = $db->query("SELECT * FROM cabinet_info ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch();

        if (!$row) {
            $insert = $db->prepare("
                INSERT INTO cabinet_info (
                    clinic_name, doctor_name, doctor_name_ar, title, title_ar,
                    specialty, sub_specialty, rpps, adeli, siret, order_number,
                    convention, email, phone, address, hours, legal_notice
                ) VALUES (
                    'Cabinet Médical Saint-Honoré',
                    'Dr N. BELBACHIR OULD HENNIA',
                    'الدكتورة ن. بلبشير ولد هنية',
                    'Médecin Spécialiste en Gynécologie Obstétrique',
                    'طبيبة مختصة في أمراض النساء والتوليد',
                    'Gynécologie Obstétrique & Échographie',
                    'Échographie',
                    '10104892341',
                    '751293842',
                    '482 918 274 00018',
                    '31/24891',
                    'Secteur Conventionné',
                    'dr.belbachir@cabinet-medical.dz',
                    '0560 06 74 66',
                    'Haï Essedikia, Avenue Seghier Benali, Oran',
                    'Sam - Jeu: 09:00 - 18:00 | Ven: Fermé',
                    'Membre d\'une association de gestion agréée par l\'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.'
                )
            ");
            $insert->execute();
            $stmt = $db->query("SELECT * FROM cabinet_info ORDER BY id ASC LIMIT 1");
            $row = $stmt->fetch();
        }

        $data = [
            'id' => (int)$row['id'],
            'clinicName' => $row['clinic_name'] ?? 'Cabinet Médical Saint-Honoré',
            'doctorName' => $row['doctor_name'] ?? 'Dr N. BELBACHIR OULD HENNIA',
            'doctorNameAr' => $row['doctor_name_ar'] ?? '',
            'title' => $row['title'] ?? 'Médecin Spécialiste en Gynécologie Obstétrique',
            'titleAr' => $row['title_ar'] ?? '',
            'specialty' => $row['specialty'] ?? 'Gynécologie Obstétrique & Échographie',
            'subSpecialty' => $row['sub_specialty'] ?? 'Échographie',
            'rpps' => $row['rpps'] ?? '',
            'adeli' => $row['adeli'] ?? '',
            'siret' => $row['siret'] ?? '',
            'orderNumber' => $row['order_number'] ?? '',
            'convention' => $row['convention'] ?? 'Secteur Conventionné',
            'email' => $row['email'] ?? '',
            'phone' => $row['phone'] ?? '',
            'address' => $row['address'] ?? '',
            'hours' => $row['hours'] ?? '',
            'legalNotice' => $row['legal_notice'] ?? '',
            'updatedAt' => $row['updated_at'] ?? null,
        ];

        sendResponse('success', $data, 'Informations du cabinet récupérées');
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la récupération des données : ' . $e->getMessage(), 500);
    }
}

function handleUpdateCabinetInfo($db) {
    $input = getRequestBody();

    try {
        $check = $db->query("SELECT id FROM cabinet_info LIMIT 1")->fetch();

        $clinicName = $input['clinicName'] ?? 'Cabinet Médical Saint-Honoré';
        $doctorName = $input['doctorName'] ?? 'Dr N. BELBACHIR OULD HENNIA';
        $doctorNameAr = $input['doctorNameAr'] ?? null;
        $title = $input['title'] ?? 'Médecin Spécialiste en Gynécologie Obstétrique';
        $titleAr = $input['titleAr'] ?? null;
        $specialty = $input['specialty'] ?? 'Gynécologie Obstétrique & Échographie';
        $subSpecialty = $input['subSpecialty'] ?? 'Échographie';
        $rpps = $input['rpps'] ?? '';
        $adeli = $input['adeli'] ?? '';
        $siret = $input['siret'] ?? '';
        $orderNumber = $input['orderNumber'] ?? '';
        $convention = $input['convention'] ?? 'Secteur Conventionné';
        $email = $input['email'] ?? '';
        $phone = $input['phone'] ?? '';
        $address = $input['address'] ?? '';
        $hours = $input['hours'] ?? '';
        $legalNotice = $input['legalNotice'] ?? '';

        if ($check) {
            $stmt = $db->prepare("
                UPDATE cabinet_info SET
                    clinic_name = :clinicName,
                    doctor_name = :doctorName,
                    doctor_name_ar = :doctorNameAr,
                    title = :title,
                    title_ar = :titleAr,
                    specialty = :specialty,
                    sub_specialty = :subSpecialty,
                    rpps = :rpps,
                    adeli = :adeli,
                    siret = :siret,
                    order_number = :orderNumber,
                    convention = :convention,
                    email = :email,
                    phone = :phone,
                    address = :address,
                    hours = :hours,
                    legal_notice = :legalNotice
                WHERE id = :id
            ");
            $stmt->execute([
                ':clinicName' => $clinicName,
                ':doctorName' => $doctorName,
                ':doctorNameAr' => $doctorNameAr,
                ':title' => $title,
                ':titleAr' => $titleAr,
                ':specialty' => $specialty,
                ':subSpecialty' => $subSpecialty,
                ':rpps' => $rpps,
                ':adeli' => $adeli,
                ':siret' => $siret,
                ':orderNumber' => $orderNumber,
                ':convention' => $convention,
                ':email' => $email,
                ':phone' => $phone,
                ':address' => $address,
                ':hours' => $hours,
                ':legalNotice' => $legalNotice,
                ':id' => $check['id'],
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO cabinet_info (
                    clinic_name, doctor_name, doctor_name_ar, title, title_ar,
                    specialty, sub_specialty, rpps, adeli, siret, order_number,
                    convention, email, phone, address, hours, legal_notice
                ) VALUES (
                    :clinicName, :doctorName, :doctorNameAr, :title, :titleAr,
                    :specialty, :subSpecialty, :rpps, :adeli, :siret, :orderNumber,
                    :convention, :email, :phone, :address, :hours, :legalNotice
                )
            ");
            $stmt->execute([
                ':clinicName' => $clinicName,
                ':doctorName' => $doctorName,
                ':doctorNameAr' => $doctorNameAr,
                ':title' => $title,
                ':titleAr' => $titleAr,
                ':specialty' => $specialty,
                ':subSpecialty' => $subSpecialty,
                ':rpps' => $rpps,
                ':adeli' => $adeli,
                ':siret' => $siret,
                ':orderNumber' => $orderNumber,
                ':convention' => $convention,
                ':email' => $email,
                ':phone' => $phone,
                ':address' => $address,
                ':hours' => $hours,
                ':legalNotice' => $legalNotice,
            ]);
        }

        handleGetCabinetInfo($db);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la mise à jour des coordonnées : ' . $e->getMessage(), 500);
    }
}

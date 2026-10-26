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
        try {
            $colCheck = $db->query("SHOW COLUMNS FROM cabinet_info LIKE 'doctor_photo'")->fetch();
            if (!$colCheck) {
                $db->exec("ALTER TABLE cabinet_info ADD COLUMN doctor_photo LONGTEXT NULL");
            }
        } catch (Exception $e) {}

        $stmt = $db->query("SELECT * FROM cabinet_info ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch();

        if (!$row) {
            $insert = $db->prepare("
                INSERT INTO cabinet_info (
                    clinic_name, doctor_name, doctor_name_ar, title, title_ar,
                    specialty, sub_specialty, rpps, adeli, siret, order_number,
                    convention, email, phone, address, hours, legal_notice, doctor_photo
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
                    'Membre d\'une association de gestion agréée par l\'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.',
                    '/doctor.jpg'
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
            'aboutText' => $row['about_text'] ?? '',
            'aboutSummary' => $row['about_summary'] ?? '',
            'slotDuration' => (int)($row['slot_duration'] ?? 30),
            'slotStartMorning' => $row['slot_start_morning'] ?? '09:00',
            'slotEndMorning' => $row['slot_end_morning'] ?? '12:30',
            'slotStartEvening' => $row['slot_start_evening'] ?? '13:00',
            'slotEndEvening' => $row['slot_end_evening'] ?? '18:00',
            'secretaryPhone' => $row['secretary_phone'] ?? '0560 06 74 66',
            'closedDays' => $row['closed_days'] ?? 'Vendredi: Fermé',
            'mapsUrl' => $row['maps_url'] ?? '',
            'mapsIframe' => $row['maps_iframe'] ?? '',
            'doctorPhoto' => !empty($row['doctor_photo']) ? $row['doctor_photo'] : '/doctor.jpg',
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
        $existing = $db->query("SELECT * FROM cabinet_info LIMIT 1")->fetch(PDO::FETCH_ASSOC);

        $defaultAboutText = "Cabinet médical de gynécologie obstétrique et d'échographie du Dr N. BELBACHIR OULD HENNIA, situé à Haï Essedikia (Avenue Seghier Benali) à Oran.\n\nDédié à la santé et au bien-être de la femme, notre cabinet assure un suivi bienveillant et personnalisé de votre grossesse, de la conception jusqu'au terme. Équipée des dernières technologies d'imagerie ultrasonore avec Doppler couleur et rendu 3D/4D HD Live, la praticienne réalise vos bilans morphologiques et diagnostics prénataux avec la plus haute précision.\n\nNous assurons également les consultations de gynécologie générale, le dépistage précoce, les bilans de fertilité et la contraception, dans un cadre serein privilégiant l'écoute attentive, le respect du secret médical et la ponctualité.";
        $defaultAboutSummary = "Cabinet médical moderne dédié à la santé féminine, au suivi complet de la grossesse, au diagnostic prénatal et aux échographies obstétricales et pelviennes de haute précision.";
        $defaultMapsIframe = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1362.0324598325215!2d-0.6038324575020871!3d35.714476270634655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e88208f3036ef%3A0xe61f6a97eabb0912!2sGynecologue%20Belbachir%20Ouldhennia!5e0!3m2!1sfr!2sdz!4v1792679429928!5m2!1sfr!2sdz";

        $clinicName = (array_key_exists('clinicName', $input) && $input['clinicName'] !== '') ? $input['clinicName'] : ($existing['clinic_name'] ?? 'Cabinet Médical belbachir');
        $doctorName = (array_key_exists('doctorName', $input) && $input['doctorName'] !== '') ? $input['doctorName'] : ($existing['doctor_name'] ?? 'Dr N. BELBACHIR OULD HENNIA');
        $doctorNameAr = array_key_exists('doctorNameAr', $input) ? $input['doctorNameAr'] : ($existing['doctor_name_ar'] ?? 'الدكتورة ن. بلبشير ولد هنية • طبيبة مختصة');
        $title = array_key_exists('title', $input) ? $input['title'] : ($existing['title'] ?? 'Médecin Spécialiste en Gynécologie Obstétrique');
        $titleAr = array_key_exists('titleAr', $input) ? $input['titleAr'] : ($existing['title_ar'] ?? '');
        $specialty = (array_key_exists('specialty', $input) && $input['specialty'] !== '') ? $input['specialty'] : ($existing['specialty'] ?? 'Spécialiste Gynécologie Obstétrique & Échographie');
        $subSpecialty = array_key_exists('subSpecialty', $input) ? $input['subSpecialty'] : ($existing['sub_specialty'] ?? 'Échographie');
        $rpps = array_key_exists('rpps', $input) ? $input['rpps'] : ($existing['rpps'] ?? '10104892341');
        $adeli = array_key_exists('adeli', $input) ? $input['adeli'] : ($existing['adeli'] ?? '751293842');
        $siret = array_key_exists('siret', $input) ? $input['siret'] : ($existing['siret'] ?? '482 918 274 00018');
        $orderNumber = array_key_exists('orderNumber', $input) ? $input['orderNumber'] : ($existing['order_number'] ?? '31/24891');
        $convention = array_key_exists('convention', $input) ? $input['convention'] : ($existing['convention'] ?? 'Secteur Conventionné');
        $email = array_key_exists('email', $input) ? $input['email'] : ($existing['email'] ?? 'dr.belbachir@cabinet-medical.dz');
        $phone = array_key_exists('phone', $input) ? $input['phone'] : ($existing['phone'] ?? '041 53 97 82');
        $address = (array_key_exists('address', $input) && $input['address'] !== '') ? $input['address'] : ($existing['address'] ?? 'Haï Seddikia (ex-Cité Boulanger), Cité 340 Logements, Bâtiment 18/A, Oran');
        $hours = array_key_exists('hours', $input) ? $input['hours'] : ($existing['hours'] ?? 'Samedi — Jeudi: 09:00 — 18:00');
        $legalNotice = array_key_exists('legalNotice', $input) ? $input['legalNotice'] : ($existing['legal_notice'] ?? 'Membre d\'une association de gestion agréée par l\'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.');
        $aboutText = (array_key_exists('aboutText', $input) && !empty($input['aboutText'])) ? $input['aboutText'] : (!empty($existing['about_text']) ? $existing['about_text'] : $defaultAboutText);
        $aboutSummary = (array_key_exists('aboutSummary', $input) && !empty($input['aboutSummary'])) ? $input['aboutSummary'] : (!empty($existing['about_summary']) ? $existing['about_summary'] : $defaultAboutSummary);
        $slotDuration = isset($input['slotDuration']) ? (int)$input['slotDuration'] : (int)($existing['slot_duration'] ?? 30);
        $slotStartMorning = (array_key_exists('slotStartMorning', $input) && !empty($input['slotStartMorning'])) ? $input['slotStartMorning'] : ($existing['slot_start_morning'] ?? '09:00');
        $slotEndMorning = (array_key_exists('slotEndMorning', $input) && !empty($input['slotEndMorning'])) ? $input['slotEndMorning'] : ($existing['slot_end_morning'] ?? '12:30');
        $slotStartEvening = (array_key_exists('slotStartEvening', $input) && !empty($input['slotStartEvening'])) ? $input['slotStartEvening'] : ($existing['slot_start_evening'] ?? '13:00');
        $slotEndEvening = (array_key_exists('slotEndEvening', $input) && !empty($input['slotEndEvening'])) ? $input['slotEndEvening'] : ($existing['slot_end_evening'] ?? '18:00');
        $secretaryPhone = (array_key_exists('secretaryPhone', $input) && !empty($input['secretaryPhone'])) ? $input['secretaryPhone'] : ($existing['secretary_phone'] ?? '0560 06 74 66');
        $closedDays = array_key_exists('closedDays', $input) ? $input['closedDays'] : ($existing['closed_days'] ?? 'Vendredi: Fermé');
        $mapsUrl = (array_key_exists('mapsUrl', $input) && !empty($input['mapsUrl'])) ? $input['mapsUrl'] : (!empty($existing['maps_url']) ? $existing['maps_url'] : 'https://maps.google.com/?q=Gynecologue+Belbachir+Ouldhennia!5e0');
        $mapsIframe = (array_key_exists('mapsIframe', $input) && !empty($input['mapsIframe'])) ? $input['mapsIframe'] : (!empty($existing['maps_iframe']) ? $existing['maps_iframe'] : $defaultMapsIframe);
        $doctorPhoto = (array_key_exists('doctorPhoto', $input) && !empty($input['doctorPhoto'])) ? $input['doctorPhoto'] : ($existing['doctor_photo'] ?? '/doctor.jpg');

        if ($existing) {
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
                    legal_notice = :legalNotice,
                    about_text = :aboutText,
                    about_summary = :aboutSummary,
                    slot_duration = :slotDuration,
                    slot_start_morning = :slotStartMorning,
                    slot_end_morning = :slotEndMorning,
                    slot_start_evening = :slotStartEvening,
                    slot_end_evening = :slotEndEvening,
                    secretary_phone = :secretaryPhone,
                    closed_days = :closedDays,
                    maps_url = :mapsUrl,
                    maps_iframe = :mapsIframe,
                    doctor_photo = :doctorPhoto
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
                ':aboutText' => $aboutText,
                ':aboutSummary' => $aboutSummary,
                ':slotDuration' => $slotDuration,
                ':slotStartMorning' => $slotStartMorning,
                ':slotEndMorning' => $slotEndMorning,
                ':slotStartEvening' => $slotStartEvening,
                ':slotEndEvening' => $slotEndEvening,
                ':secretaryPhone' => $secretaryPhone,
                ':closedDays' => $closedDays,
                ':mapsUrl' => $mapsUrl,
                ':mapsIframe' => $mapsIframe,
                ':doctorPhoto' => $doctorPhoto,
                ':id' => $existing['id'],
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO cabinet_info (
                    clinic_name, doctor_name, doctor_name_ar, title, title_ar,
                    specialty, sub_specialty, rpps, adeli, siret, order_number,
                    convention, email, phone, address, hours, legal_notice,
                    about_text, about_summary, slot_duration, slot_start_morning,
                    slot_end_morning, slot_start_evening, slot_end_evening,
                    secretary_phone, closed_days, maps_url, maps_iframe, doctor_photo
                ) VALUES (
                    :clinicName, :doctorName, :doctorNameAr, :title, :titleAr,
                    :specialty, :subSpecialty, :rpps, :adeli, :siret, :orderNumber,
                    :convention, :email, :phone, :address, :hours, :legalNotice,
                    :aboutText, :aboutSummary, :slotDuration, :slotStartMorning,
                    :slotEndMorning, :slotStartEvening, :slotEndEvening,
                    :secretaryPhone, :closedDays, :mapsUrl, :mapsIframe, :doctorPhoto
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
                ':aboutText' => $aboutText,
                ':aboutSummary' => $aboutSummary,
                ':slotDuration' => $slotDuration,
                ':slotStartMorning' => $slotStartMorning,
                ':slotEndMorning' => $slotEndMorning,
                ':slotStartEvening' => $slotStartEvening,
                ':slotEndEvening' => $slotEndEvening,
                ':secretaryPhone' => $secretaryPhone,
                ':closedDays' => $closedDays,
                ':mapsUrl' => $mapsUrl,
                ':mapsIframe' => $mapsIframe,
                ':doctorPhoto' => $doctorPhoto,
            ]);
        }

        handleGetCabinetInfo($db);
    } catch (PDOException $e) {
        sendResponse('error', null, 'Erreur lors de la mise à jour des coordonnées : ' . $e->getMessage(), 500);
    }
}

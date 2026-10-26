<?php
// backend/api/consultations.php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetConsultations($db);
        break;
    case 'POST':
        handleCreateConsultation($db);
        break;
    case 'DELETE':
        handleDeleteConsultation($db);
        break;
    default:
        sendResponse("error", null, "Méthode HTTP non autorisée", 405);
}

function handleGetConsultations($db) {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $patientId = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;

        $sql = "SELECT c.*, 
                       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                       p.first_name AS patient_first_name,
                       p.last_name AS patient_last_name,
                       p.dob AS patient_dob,
                       p.file_number AS patient_file_number,
                       p.blood_group AS patient_blood_group,
                       p.phone AS patient_phone
                FROM consultations c
                JOIN patients p ON c.patient_id = p.id ";

        $params = [];
        if ($id) {
            $sql .= " WHERE c.id = :id ";
            $params[':id'] = $id;
        } elseif ($patientId) {
            $sql .= " WHERE c.patient_id = :patient_id ";
            $params[':patient_id'] = $patientId;
        }

        $sql .= " ORDER BY c.consultation_date DESC, c.consultation_time DESC ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $consultations = [];
        foreach ($rows as $r) {
            // Calculer l'âge
            $age = null;
            if (!empty($r['patient_dob'])) {
                $dobDate = new DateTime($r['patient_dob']);
                $today = new DateTime();
                $age = $today->diff($dobDate)->y;
            }

            // Récupérer les médicaments si une ordonnance existe
            $prescriptionData = null;
            if (!empty($r['prescription_id'])) {
                $pStmt = $db->prepare("SELECT * FROM prescriptions WHERE id = :pid");
                $pStmt->execute([':pid' => $r['prescription_id']]);
                $presc = $pStmt->fetch();

                if ($presc) {
                    $itemsStmt = $db->prepare("SELECT medication, dosage, posology, duration, renewable FROM prescription_items WHERE prescription_id = :pid");
                    $itemsStmt->execute([':pid' => $presc['id']]);
                    $items = $itemsStmt->fetchAll();

                    $prescriptionData = [
                        "id" => intval($presc['id']),
                        "prescriptionNumber" => $presc['prescription_number'],
                        "patientId" => intval($presc['patient_id']),
                        "patientName" => $r['patient_name'],
                        "date" => $presc['prescription_date'],
                        "validity" => $presc['validity'],
                        "ald" => boolval($presc['ald']),
                        "doctorName" => $presc['doctor_name'],
                        "items" => $items,
                        "notes" => $presc['notes'],
                        "validated" => boolval($presc['validated'])
                    ];
                }
            }

            // Récupérer le compte-rendu d'échographie spécialisé si existant
            $echoReport = null;
            $echoStmt = $db->prepare("SELECT * FROM ultrasound_reports WHERE consultation_id = :cid LIMIT 1");
            $echoStmt->execute([':cid' => $r['id']]);
            $echoRow = $echoStmt->fetch();
            if ($echoRow) {
                if (!empty($echoRow['morphology_details']) && is_string($echoRow['morphology_details'])) {
                    $echoRow['morphology_details'] = json_decode($echoRow['morphology_details'], true);
                }
                $echoReport = $echoRow;
            }

            // Récupérer les documents rattachés à cette consultation
            $docStmt = $db->prepare("SELECT id, title, category, doc_date as date, file_path as filePath, file_size as fileSize, file_type as fileType, status FROM medical_documents WHERE consultation_id = :cid ORDER BY id DESC");
            $docStmt->execute([':cid' => $r['id']]);
            $attachedDocs = $docStmt->fetchAll(PDO::FETCH_ASSOC);

            $consultations[] = [
                "id" => intval($r['id']),
                "consultationNumber" => $r['consultation_number'],
                "patientId" => intval($r['patient_id']),
                "patientName" => $r['patient_name'],
                "date" => $r['consultation_date'],
                "time" => substr($r['consultation_time'], 0, 5),
                "reason" => $r['reason'],
                "billingCode" => $r['billing_code'],
                "vitals" => [
                    "bp" => $r['bp'] ?: "-",
                    "weight" => $r['weight'] ? strval($r['weight']) : "-",
                    "temperature" => $r['temperature'] ? strval($r['temperature']) : "-",
                    "heartRate" => $r['heart_rate'] ? strval($r['heart_rate']) : "-",
                    "ddr" => $r['ddr'] ?: "-",
                    "terme" => $r['terme'] ?: "-"
                ],
                "examFindings" => $r['exam_findings'],
                "diagnosis" => $r['diagnosis'],
                "recommendations" => $r['recommendations'],
                "echoFindings" => $r['echo_findings'],
                "echoConclusion" => $r['echo_conclusion'],
                "echoType" => $r['echo_type'],
                "echoData" => $echoReport['morphology_details'] ?? null,
                "prescriptionCreated" => boolval($r['prescription_created']),
                "prescriptionId" => $r['prescription_id'] ? intval($r['prescription_id']) : null,
                "prescriptionData" => $prescriptionData,
                "ultrasoundReport" => $echoReport,
                "documents" => $attachedDocs,
                "patientDetails" => [
                    "nom" => $r['patient_last_name'],
                    "prenom" => $r['patient_first_name'],
                    "dob" => $r['patient_dob'],
                    "age" => $age ? ($age . " ans") : "",
                    "fileNumber" => $r['patient_file_number'],
                    "bloodGroup" => $r['patient_blood_group'],
                    "phone" => $r['patient_phone']
                ],
                "status" => $r['status']
            ];
        }

        sendResponse("success", $consultations, "Consultations récupérées avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur lors de la récupération : " . $e->getMessage(), 500);
    }
}

function handleCreateConsultation($db) {
    $body = getRequestBody();

    if (empty($body['patientId'])) {
        sendResponse("error", null, "L'identifiant du patient (patientId) est requis", 400);
    }

    try {
        $db->beginTransaction();

        $patientId = intval($body['patientId']);
        $date = !empty($body['date']) ? $body['date'] : date('Y-m-d');
        $time = !empty($body['time']) ? $body['time'] : date('H:i:s');
        if (!empty($body['billingCode'])) {
            $billingCode = $body['billingCode'];
        } else {
            $setStmt = $db->query("SELECT default_consultation_type, consultation_price FROM settings ORDER BY id ASC LIMIT 1");
            $setRow = $setStmt ? $setStmt->fetch() : null;
            if ($setRow && !empty($setRow['default_consultation_type'])) {
                $pr = isset($setRow['consultation_price']) ? number_format((float)$setRow['consultation_price'], 0, '', ' ') : '3 000';
                $billingCode = $setRow['default_consultation_type'] . " (" . $pr . " DA)";
            } else {
                $billingCode = "Consultation générale (2 500 DA)";
            }
        }

        // Générer le numéro de consultation séquentiel unique
        $year = date('Y', strtotime($date));
        $countStmt = $db->query("SELECT COUNT(*) FROM consultations");
        $count = $countStmt->fetchColumn() + 1;
        $consultNumber = !empty($body['consultationNumber'])
            ? $body['consultationNumber']
            : sprintf("CS-%s-%04d", $year, $count);

        $vitals = isset($body['vitals']) && is_array($body['vitals']) ? $body['vitals'] : [];
        $bp = $vitals['bp'] ?? ($body['bp'] ?? null);
        $weight = isset($vitals['weight']) && is_numeric($vitals['weight']) ? floatval($vitals['weight']) : (isset($body['weight']) && is_numeric($body['weight']) ? floatval($body['weight']) : null);
        $temperature = isset($vitals['temperature']) && is_numeric($vitals['temperature']) ? floatval($vitals['temperature']) : (isset($body['temperature']) && is_numeric($body['temperature']) ? floatval($body['temperature']) : null);
        $heartRate = isset($vitals['heartRate']) && is_numeric($vitals['heartRate']) ? intval($vitals['heartRate']) : (isset($body['heartRate']) && is_numeric($body['heartRate']) ? intval($body['heartRate']) : null);
        $ddr = $vitals['ddr'] ?? ($body['ddr'] ?? null);
        $terme = $vitals['terme'] ?? ($body['terme'] ?? null);

        $symptoms = $body['symptoms'] ?? null;
        $examFindings = $body['examFindings'] ?? null;
        $diagnosis = $body['diagnosis'] ?? "Bilan médical normal";
        $recommendations = $body['recommendations'] ?? null;
        $examType = $body['examType'] ?? null;
        $echoType = $body['echoType'] ?? (!empty($examType) ? ("Échographie " . strtoupper($examType)) : null);
        $echoFindings = $body['echoFindings'] ?? ($body['conclusion'] ?? null);
        $echoConclusion = $body['echoConclusion'] ?? ($body['conclusionText'] ?? ($body['diagnosis'] ?? null));

        // Insertion dans la table consultations
        $cSql = "INSERT INTO consultations 
                    (consultation_number, patient_id, doctor_id, consultation_date, consultation_time, 
                     reason, bp, weight, temperature, heart_rate, ddr, terme, symptoms, exam_findings, 
                     echo_type, echo_findings, echo_conclusion, diagnosis, recommendations, billing_code, status)
                 VALUES 
                    (:num, :pid, 1, :cdate, :ctime, :reason, :bp, :weight, :temp, :hr, :ddr, :terme, 
                     :symptoms, :exam, :etype, :efind, :econcl, :diag, :recom, :bcode, 'Clôturée')";

        $cStmt = $db->prepare($cSql);
        $cStmt->execute([
            ':num' => $consultNumber,
            ':pid' => $patientId,
            ':cdate' => $date,
            ':ctime' => strlen($time) === 5 ? ($time . ":00") : $time,
            ':reason' => $reason,
            ':bp' => $bp,
            ':weight' => $weight,
            ':temp' => $temperature,
            ':hr' => $heartRate,
            ':ddr' => (!empty($ddr) && $ddr !== '-') ? $ddr : null,
            ':terme' => $terme,
            ':symptoms' => $symptoms,
            ':exam' => $examFindings,
            ':etype' => $echoType,
            ':efind' => $echoFindings,
            ':econcl' => $echoConclusion,
            ':diag' => $diagnosis,
            ':recom' => $recommendations,
            ':bcode' => $billingCode
        ]);

        $consultationId = intval($db->lastInsertId());

        // 1. Gestion de l'Ordonnance Médicale
        $prescriptionId = null;
        $prescriptionData = null;
        $hasPrescription = false;

        $prescPayload = $body['prescriptionData'] ?? null;
        $rawItems = $body['prescriptionItems'] ?? ($prescPayload['items'] ?? []);

        if (is_array($rawItems) && count($rawItems) > 0) {
            $validItems = array_filter($rawItems, function($i) {
                return !empty(trim($i['medication'] ?? ''));
            });

            if (count($validItems) > 0) {
                $hasPrescription = true;
                $prescCount = $db->query("SELECT COUNT(*) FROM prescriptions")->fetchColumn() + 1;
                $prescNumber = $prescPayload['prescriptionNumber'] ?? sprintf("ORD-%s-%04d", $year, $prescCount);
                $docName = $prescPayload['doctorName'] ?? "Dr N. BELBACHIR OULD HENNIA";

                $pSql = "INSERT INTO prescriptions 
                            (prescription_number, consultation_id, patient_id, doctor_name, prescription_date, validity, ald, notes, validated)
                         VALUES 
                            (:pnum, :cid, :pid, :dname, :pdate, '3 mois', 0, :notes, 1)";
                $pStmt = $db->prepare($pSql);
                $pStmt->execute([
                    ':pnum' => $prescNumber,
                    ':cid' => $consultationId,
                    ':pid' => $patientId,
                    ':dname' => $docName,
                    ':pdate' => $date,
                    ':notes' => $recommendations ?: "Respecter la posologie prescrite."
                ]);

                $prescriptionId = intval($db->lastInsertId());

                // Insertion des médicaments
                $itSql = "INSERT INTO prescription_items 
                            (prescription_id, medication, dosage, posology, duration, renewable)
                          VALUES 
                            (:pid, :med, :dos, :pos, :dur, :ren)";
                $itStmt = $db->prepare($itSql);

                foreach ($validItems as $it) {
                    $itStmt->execute([
                        ':pid' => $prescriptionId,
                        ':med' => trim($it['medication']),
                        ':dos' => $it['dosage'] ?? null,
                        ':pos' => $it['posology'] ?? '1 comprimé par jour',
                        ':dur' => $it['duration'] ?? '5 jours',
                        ':ren' => $it['renewable'] ?? 'Non renouvelable'
                    ]);
                }

                // Mettre à jour la consultation avec la prescription liée
                $upStmt = $db->prepare("UPDATE consultations SET prescription_created = 1, prescription_id = :prid WHERE id = :cid");
                $upStmt->execute([':prid' => $prescriptionId, ':cid' => $consultationId]);

                $prescriptionData = [
                    "id" => $prescriptionId,
                    "prescriptionNumber" => $prescNumber,
                    "patientId" => $patientId,
                    "date" => $date,
                    "doctorName" => $docName,
                    "items" => array_values($validItems),
                    "validated" => true
                ];

                // Enregistrer l'ordonnance dans medical_documents pour le dossier médical
                try {
                    $docSql = "INSERT INTO medical_documents 
                                (patient_id, consultation_id, title, category, doc_date, author, file_size, file_type, status)
                               VALUES 
                                (:pid, :cid, :title, 'Autre', :ddate, :author, 'Ordonnance', 'Prescription', 'Validée')";
                    $db->prepare($docSql)->execute([
                        ':pid' => $patientId,
                        ':cid' => $consultationId,
                        ':title' => "Ordonnance Médicale #" . $prescNumber,
                        ':ddate' => $date,
                        ':author' => $docName
                    ]);
                } catch (Exception $e) {}
            }
        }

        // 2. Gestion du Compte-Rendu Échographique Spécialisé (si applicable)
        $hasEcho = !empty($examType) || !empty($body['echoData']) || !empty($echoType) || !empty($echoFindings);
        if ($hasEcho) {
            $echoCount = $db->query("SELECT COUNT(*) FROM ultrasound_reports")->fetchColumn() + 1;
            $reportNumber = sprintf("CR-ECHO-%s-%04d", $year, $echoCount);
            $calc = $body['calculated'] ?? [];
            $echoData = $body['echoData'] ?? [];

            $repSql = "INSERT INTO ultrasound_reports 
                        (report_number, consultation_id, patient_id, exam_type, exam_date, indication, 
                         ddr, terme_sa, bip_mm, pc_mm, ca_mm, lf_mm, lcc_mm, cn_mm, epf_hadlock_g, 
                         morphology_details, findings, conclusion)
                       VALUES 
                        (:rnum, :cid, :pid, :etype, :edate, :indic, :ddr, :terme, 
                         :bip, :pc, :ca, :lf, :lcc, :cn, :epf, :morpho, :find, :concl)";

            $repStmt = $db->prepare($repSql);
            $repStmt->execute([
                ':rnum' => $reportNumber,
                ':cid' => $consultationId,
                ':pid' => $patientId,
                ':etype' => in_array($examType, ['ob1','ob2','ob3','gyn','ggt1','ggt23']) ? $examType : 'ob2',
                ':edate' => $date,
                ':indic' => $reason,
                ':ddr' => (!empty($ddr) && $ddr !== '-') ? $ddr : null,
                ':terme' => $terme,
                ':bip' => isset($echoData['ob2_bip']) && is_numeric($echoData['ob2_bip']) ? floatval($echoData['ob2_bip']) : null,
                ':pc' => isset($echoData['ob2_pc']) && is_numeric($echoData['ob2_pc']) ? floatval($echoData['ob2_pc']) : null,
                ':ca' => isset($echoData['ob2_ca']) && is_numeric($echoData['ob2_ca']) ? floatval($echoData['ob2_ca']) : null,
                ':lf' => isset($echoData['ob2_lf']) && is_numeric($echoData['ob2_lf']) ? floatval($echoData['ob2_lf']) : null,
                ':lcc' => isset($echoData['ob1_lcc']) && is_numeric($echoData['ob1_lcc']) ? floatval($echoData['ob1_lcc']) : null,
                ':cn' => isset($echoData['ob1_cn']) && is_numeric($echoData['ob1_cn']) ? floatval($echoData['ob1_cn']) : null,
                ':epf' => isset($calc['ob2Poids']) ? intval($calc['ob2Poids']) : (isset($calc['ob3Poids']) ? intval($calc['ob3Poids']) : null),
                ':morpho' => json_encode($echoData, JSON_UNESCAPED_UNICODE),
                ':find' => $echoFindings ?: $examFindings,
                ':concl' => $echoConclusion ?: $diagnosis
            ]);

            // Enregistrer automatiquement le rapport d'échographie dans medical_documents pour le dossier du patient
            try {
                $docSql = "INSERT INTO medical_documents 
                            (patient_id, consultation_id, title, category, doc_date, author, file_size, file_type, status)
                           VALUES 
                            (:pid, :cid, :title, 'Imagerie & Radiologie', :ddate, 'Dr N. BELBACHIR OULD HENNIA', 'Compte-rendu officiel', 'Échographie', 'Archivé')";
                $db->prepare($docSql)->execute([
                    ':pid' => $patientId,
                    ':cid' => $consultationId,
                    ':title' => "Compte-Rendu Échographique (" . ($echoType ?: "Échographie") . ")",
                    ':ddate' => $date
                ]);
            } catch (Exception $e) {}
        }

        // 3. Enregistrer automatiquement la facture correspondante dans la section des factures
        try {
            $invCount = $db->query("SELECT COUNT(*) FROM invoices")->fetchColumn() + 1;
            $invNumber = sprintf("FAC-%s-%04d", $year, $invCount);

            // Calcul automatique du montant selon la cotation
            $amount = 2500.00;
            if (!empty($billingCode) && preg_match('/([\d\s]+)\s*DA/i', $billingCode, $m)) {
                $clean = str_replace(' ', '', $m[1]);
                if (is_numeric($clean) && floatval($clean) > 0) {
                    $amount = floatval($clean);
                }
            } elseif ($hasEcho) {
                $amount = 4000.00;
            }

            $actDesc = !empty($billingCode) ? $billingCode : ($reason ?: "Consultation médicale");

            $invSql = "INSERT INTO invoices 
                        (invoice_number, patient_id, consultation_id, invoice_date, act_description, amount, covered_amo, covered_amc, patient_remaining, payment_method, status)
                       VALUES 
                        (:invNum, :pid, :cid, :idate, :actDesc, :amt, 0.00, 0.00, :rem, 'Espèces', 'Payée')";
            $db->prepare($invSql)->execute([
                ':invNum' => $invNumber,
                ':pid' => $patientId,
                ':cid' => $consultationId,
                ':idate' => $date,
                ':actDesc' => $actDesc,
                ':amt' => $amount,
                ':rem' => $amount
            ]);
        } catch (Exception $e) {}

        // Mettre à jour la fiche patient (dernière visite et antécédents obstétricaux si fournis)
        try {
            $patUpdates = ["last_visit = :lvisit"];
            $patParams = [':lvisit' => $date, ':pid' => $patientId];
            if (!empty($body['atcd']) && is_array($body['atcd'])) {
                $atcd = $body['atcd'];
                if (isset($atcd['gestite']) && is_numeric($atcd['gestite'])) {
                    $patUpdates[] = "gravida = :grav";
                    $patParams[':grav'] = intval($atcd['gestite']);
                }
                if (isset($atcd['parite']) && is_numeric($atcd['parite'])) {
                    $patUpdates[] = "para = :para";
                    $patParams[':para'] = intval($atcd['parite']);
                }
                if (isset($atcd['cesarienne']) && is_numeric($atcd['cesarienne'])) {
                    $patUpdates[] = "cesarean = :cesar";
                    $patParams[':cesar'] = intval($atcd['cesarienne']);
                }
                if (isset($atcd['faussesCouches']) && is_numeric($atcd['faussesCouches'])) {
                    $patUpdates[] = "abortions = :abort";
                    $patParams[':abort'] = intval($atcd['faussesCouches']);
                }
            }
            $db->prepare("UPDATE patients SET " . implode(", ", $patUpdates) . " WHERE id = :pid")->execute($patParams);
        } catch (Exception $e) {}

        // 4. Enregistrer les fichiers joints téléversés lors de la consultation dans medical_documents (Dossier Médical)
        if (!empty($body['documents']) && is_array($body['documents'])) {
            foreach ($body['documents'] as $doc) {
                $docPath = $doc['filePath'] ?? ($doc['dataUrl'] ?? null);
                if (!empty($docPath)) {
                    $docTitle = !empty($doc['title']) ? trim($doc['title']) : (!empty($doc['name']) ? trim($doc['name']) : 'Fichier Consultation');
                    $docCategory = $doc['category'] ?? 'Imagerie & Radiologie';
                    $docDate = $doc['date'] ?? $date;
                    $docAuthor = $doc['author'] ?? 'Dr N. BELBACHIR OULD HENNIA';
                    $docSize = $doc['fileSize'] ?? ($doc['size'] ?? '1.5 Mo');
                    $docType = $doc['fileType'] ?? ($doc['extension'] ?? 'Fichier');

                    try {
                        $docSql = "INSERT INTO medical_documents 
                                    (patient_id, consultation_id, title, category, doc_date, author, file_path, file_size, file_type, status)
                                   VALUES 
                                    (:pid, :cid, :title, :cat, :ddate, :author, :fpath, :fsize, :ftype, 'Validé')";
                        $db->prepare($docSql)->execute([
                            ':pid' => $patientId,
                            ':cid' => $consultationId,
                            ':title' => $docTitle,
                            ':cat' => $docCategory,
                            ':ddate' => $docDate,
                            ':author' => $docAuthor,
                            ':fpath' => $docPath,
                            ':fsize' => $docSize,
                            ':ftype' => $docType
                        ]);
                    } catch (Exception $e) {}
                }
            }
        }

        // Si le patient était dans la salle d'attente, mettre à jour son statut à 'Terminé'
        $upWait = $db->prepare("UPDATE waiting_room SET status = 'Terminé' WHERE patient_id = :pid AND status IN ('Attente', 'Appelé', 'En consultation')");
        $upWait->execute([':pid' => $patientId]);

        $db->commit();

        sendResponse("success", [
            "id" => $consultationId,
            "consultationNumber" => $consultNumber,
            "patientId" => $patientId,
            "date" => $date,
            "time" => substr($time, 0, 5),
            "reason" => $reason,
            "billingCode" => $billingCode,
            "prescriptionCreated" => $hasPrescription,
            "prescriptionData" => $prescriptionData
        ], "Consultation enregistrée avec succès dans la base de données MySQL", 201);

    } catch (Exception $e) {
        $db->rollBack();
        sendResponse("error", null, "Erreur lors de l'enregistrement : " . $e->getMessage(), 500);
    }
}

function handleDeleteConsultation($db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        sendResponse("error", null, "ID requis", 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM consultations WHERE id = :id");
        $stmt->execute([':id' => $id]);
        sendResponse("success", null, "Consultation supprimée avec succès");
    } catch (Exception $e) {
        sendResponse("error", null, "Erreur suppression : " . $e->getMessage(), 500);
    }
}

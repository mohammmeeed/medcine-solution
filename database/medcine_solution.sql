-- =====================================================================
-- Base de Données MySQL pour le Cabinet Médical
-- Dr N. BELBACHIR OULD HENNIA (Gynécologie Obstétrique & Échographie)
-- Système : medcine-solution
-- =====================================================================

DROP DATABASE IF EXISTS `medcine_solution_db`;
CREATE DATABASE IF NOT EXISTS `medcine_solution_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `medcine_solution_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. TABLE: cabinet_info
-- Informations officielles de l'établissement et du médecin titulaire
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cabinet_info`;
CREATE TABLE `cabinet_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clinic_name` VARCHAR(150) NOT NULL DEFAULT 'Cabinet Médical de Gynécologie Obstétrique',
  `doctor_name` VARCHAR(150) NOT NULL,
  `doctor_name_ar` VARCHAR(150) DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `title_ar` VARCHAR(150) DEFAULT NULL,
  `specialty` VARCHAR(150) NOT NULL,
  `sub_specialty` VARCHAR(100) DEFAULT NULL,
  `rpps` VARCHAR(50) DEFAULT NULL,
  `adeli` VARCHAR(50) DEFAULT NULL,
  `siret` VARCHAR(50) DEFAULT NULL,
  `order_number` VARCHAR(50) DEFAULT NULL,
  `convention` VARCHAR(100) DEFAULT 'Secteur Conventionné',
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `hours` VARCHAR(255) DEFAULT NULL,
  `legal_notice` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. TABLE: staff_users
-- Utilisateurs, médecins, secrétaires et droits d'accès
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `staff_users`;
CREATE TABLE `staff_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `role` VARCHAR(100) NOT NULL,
  `type` ENUM('doctor', 'secretary', 'admin') NOT NULL DEFAULT 'secretary',
  `status` ENUM('Actif', 'Inactif', 'Suspendu') NOT NULL DEFAULT 'Actif',
  `access_level` VARCHAR(150) DEFAULT NULL,
  `permission_agenda` VARCHAR(100) DEFAULT 'Plein accès',
  `permission_medical_records` VARCHAR(100) DEFAULT 'Restreint',
  `permission_prescriptions` VARCHAR(100) DEFAULT 'Aucun accès',
  `permission_billing` VARCHAR(100) DEFAULT 'Enregistrement des règlements',
  `permission_settings` VARCHAR(100) DEFAULT 'Lecture seule',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. TABLE: patients
-- Dossiers des patients du cabinet
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `file_number` VARCHAR(50) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `dob` DATE DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `gender` ENUM('Féminin', 'Masculin', 'Autre') NOT NULL DEFAULT 'Féminin',
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `secu_number` VARCHAR(50) DEFAULT NULL,
  `blood_group` VARCHAR(10) DEFAULT NULL,
  `gravida` INT DEFAULT 0 COMMENT 'Nombre de grossesses (G)',
  `para` INT DEFAULT 0 COMMENT 'Nombre d''accouchements (P)',
  `abortions` INT DEFAULT 0 COMMENT 'Nombre de fausses couches ou IVG (A)',
  `cesarean` INT DEFAULT 0 COMMENT 'Nombre de césariennes (C)',
  `living_children` INT DEFAULT 0 COMMENT 'Enfants vivants (E)',
  `last_visit` DATE DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Actif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_patient_name` (`last_name`, `first_name`),
  INDEX `idx_patient_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. TABLE: patient_allergies
-- Allergies déclarées pour chaque patient
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patient_allergies`;
CREATE TABLE `patient_allergies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `allergy` VARCHAR(255) NOT NULL,
  `severity` ENUM('Faible', 'Modérée', 'Sévère', 'Non précisée') DEFAULT 'Non précisée',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_allergies_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. TABLE: patient_chronic_diseases
-- Pathologies chroniques et antécédents médicaux
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patient_chronic_diseases`;
CREATE TABLE `patient_chronic_diseases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `disease` VARCHAR(255) NOT NULL,
  `diagnosed_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_diseases_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. TABLE: patient_regular_treatments
-- Traitements de fond et médicaments réguliers
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patient_regular_treatments`;
CREATE TABLE `patient_regular_treatments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `treatment` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) DEFAULT NULL,
  `frequency` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_treatments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. TABLE: appointments
-- Agenda et gestion des rendez-vous
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT DEFAULT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` TIME NOT NULL,
  `duration` VARCHAR(30) DEFAULT '20 min',
  `reason` VARCHAR(255) NOT NULL,
  `status` ENUM('Confirmé', 'Arrivé', 'En consultation', 'Terminé', 'Absent', 'Annulé') NOT NULL DEFAULT 'Confirmé',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `staff_users` (`id`) ON DELETE SET NULL,
  INDEX `idx_appointment_date` (`appointment_date`, `appointment_time`),
  INDEX `idx_appointment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. TABLE: waiting_room
-- File d'attente en temps réel du cabinet
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `waiting_room`;
CREATE TABLE `waiting_room` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `appointment_id` INT DEFAULT NULL,
  `appointment_time` TIME DEFAULT NULL,
  `arrival_time` TIME NOT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `wait_time_minutes` INT DEFAULT 0,
  `status` ENUM('En attente', 'Appelé', 'En consultation', 'Terminé') NOT NULL DEFAULT 'En attente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_waiting_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_waiting_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. TABLE: consultations
-- Actes et dossiers de consultations médicales
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `consultations`;
CREATE TABLE `consultations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `consultation_number` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` INT NOT NULL,
  `doctor_id` INT DEFAULT NULL,
  `appointment_id` INT DEFAULT NULL,
  `consultation_date` DATE NOT NULL,
  `consultation_time` TIME NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `bp` VARCHAR(20) DEFAULT NULL,
  `weight` DECIMAL(5,2) DEFAULT NULL,
  `temperature` DECIMAL(4,1) DEFAULT NULL,
  `heart_rate` INT DEFAULT NULL,
  `ddr` DATE DEFAULT NULL COMMENT 'Date des dernières règles',
  `terme` VARCHAR(50) DEFAULT NULL COMMENT 'Terme en SA',
  `symptoms` TEXT DEFAULT NULL,
  `exam_findings` TEXT DEFAULT NULL,
  `echo_type` VARCHAR(150) DEFAULT NULL,
  `echo_findings` TEXT DEFAULT NULL,
  `echo_conclusion` TEXT DEFAULT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `recommendations` TEXT DEFAULT NULL,
  `prescription_created` TINYINT(1) DEFAULT 0,
  `prescription_id` INT DEFAULT NULL,
  `billing_code` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('En cours', 'Clôturée', 'Archivée') NOT NULL DEFAULT 'Clôturée',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_consultations_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consultations_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `staff_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_consultations_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  INDEX `idx_consultation_date` (`consultation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. TABLE: ultrasound_reports
-- Comptes rendus détaillés d'échographie (OB1, OB2, OB3, GYN, GG)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ultrasound_reports`;
CREATE TABLE `ultrasound_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_number` VARCHAR(50) NOT NULL UNIQUE,
  `consultation_id` INT DEFAULT NULL,
  `patient_id` INT NOT NULL,
  `exam_type` ENUM('ob1', 'ob2', 'ob3', 'gyn', 'ggt1', 'ggt23') NOT NULL,
  `exam_date` DATE NOT NULL,
  `indication` VARCHAR(255) DEFAULT NULL,
  `ddr` DATE DEFAULT NULL,
  `terme_sa` VARCHAR(50) DEFAULT NULL,
  `pregnancy_type` VARCHAR(100) DEFAULT 'Unique',
  `bip_mm` DECIMAL(5,2) DEFAULT NULL COMMENT 'Diamètre bipariétal (mm)',
  `pc_mm` DECIMAL(5,2) DEFAULT NULL COMMENT 'Périmètre crânien (mm)',
  `ca_mm` DECIMAL(5,2) DEFAULT NULL COMMENT 'Circonférence abdominale (mm)',
  `lf_mm` DECIMAL(5,2) DEFAULT NULL COMMENT 'Longueur fémorale (mm)',
  `lcc_mm` DECIMAL(5,2) DEFAULT NULL COMMENT 'Longueur cranio-caudale (mm)',
  `cn_mm` DECIMAL(4,2) DEFAULT NULL COMMENT 'Clarté nucale (mm)',
  `cervelet_mm` DECIMAL(5,2) DEFAULT NULL,
  `epf_hadlock_g` INT DEFAULT NULL COMMENT 'Estimation poids fœtal Hadlock (g)',
  `morphology_details` JSON DEFAULT NULL COMMENT 'Organes, cerveau, 4 cavités, membres, placenta',
  `doppler_details` JSON DEFAULT NULL COMMENT 'Artères utérines, ombilicale, ACM',
  `gynecology_details` JSON DEFAULT NULL COMMENT 'Utérus, endomètre, ovaires D/G, Douglas',
  `findings` TEXT DEFAULT NULL,
  `conclusion` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_echo_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_echo_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. TABLE: prescriptions
-- Ordonnances médicales
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prescription_number` VARCHAR(50) NOT NULL UNIQUE,
  `consultation_id` INT DEFAULT NULL,
  `patient_id` INT NOT NULL,
  `doctor_name` VARCHAR(150) NOT NULL,
  `prescription_date` DATE NOT NULL,
  `validity` VARCHAR(50) DEFAULT '3 mois',
  `ald` TINYINT(1) DEFAULT 0 COMMENT 'Affection Longue Durée',
  `notes` TEXT DEFAULT NULL,
  `validated` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_prescriptions_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prescriptions_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  INDEX `idx_prescription_date` (`prescription_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. TABLE: prescription_items
-- Lignes de médicaments prescrites
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `prescription_items`;
CREATE TABLE `prescription_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prescription_id` INT NOT NULL,
  `medication` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) DEFAULT NULL,
  `posology` TEXT NOT NULL,
  `duration` VARCHAR(100) DEFAULT NULL,
  `renewable` VARCHAR(100) DEFAULT 'Non renouvelable',
  `instructions` TEXT DEFAULT NULL,
  CONSTRAINT `fk_items_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. TABLE: clinical_examinations
-- Constantes biométriques et paramètres vitaux
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `clinical_examinations`;
CREATE TABLE `clinical_examinations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `consultation_id` INT DEFAULT NULL,
  `exam_date` DATE NOT NULL,
  `bp_systolic` INT DEFAULT NULL,
  `bp_diastolic` INT DEFAULT NULL,
  `heart_rate` INT DEFAULT NULL,
  `temperature` DECIMAL(4,1) DEFAULT NULL,
  `weight` DECIMAL(5,2) DEFAULT NULL,
  `height` DECIMAL(5,2) DEFAULT NULL,
  `bmi` DECIMAL(4,1) DEFAULT NULL,
  `spo2` INT DEFAULT NULL,
  `blood_sugar` DECIMAL(4,2) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_exam_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exam_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  INDEX `idx_exam_patient_date` (`patient_id`, `exam_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. TABLE: medical_documents
-- Documents, imageries et analyses scannées ou générées
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `medical_documents`;
CREATE TABLE `medical_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `consultation_id` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Analyses de laboratoire', 'Imagerie & Radiologie', 'Certificats médicaux', 'Comptes rendus spécialistes', 'Autre') NOT NULL,
  `doc_date` DATE NOT NULL,
  `author` VARCHAR(150) DEFAULT NULL,
  `file_path` VARCHAR(255) DEFAULT NULL,
  `file_size` VARCHAR(50) DEFAULT NULL,
  `file_type` VARCHAR(20) DEFAULT 'PDF',
  `status` VARCHAR(50) DEFAULT 'Validé',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_docs_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_docs_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. TABLE: invoices
-- Factures, honoraires et tiers-payant
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` INT NOT NULL,
  `consultation_id` INT DEFAULT NULL,
  `invoice_date` DATE NOT NULL,
  `act_description` TEXT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `covered_amo` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Prise en charge CNAS / Assurance obligatoire',
  `covered_amc` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Prise en charge Mutuelle / Complémentaire',
  `patient_remaining` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) DEFAULT 'Espèces',
  `status` ENUM('Payée', 'Télétransmise', 'En attente', 'Annulée') NOT NULL DEFAULT 'En attente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_invoices_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invoices_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  INDEX `idx_invoice_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 16. TABLE: payments
-- Reçus de règlements et encaissements de la caisse
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE,
  `invoice_id` INT DEFAULT NULL,
  `invoice_number` VARCHAR(50) DEFAULT NULL,
  `patient_name` VARCHAR(150) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_time` TIME NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `method` VARCHAR(50) NOT NULL DEFAULT 'Espèces',
  `operator` VARCHAR(150) NOT NULL,
  `status` ENUM('Encaissé', 'Annulé', 'Remboursé') NOT NULL DEFAULT 'Encaissé',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  INDEX `idx_payment_date` (`payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 17. TABLE: audit_logs
-- Journal d'audit, traçabilité et conformité RGPD / Secret Médical
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` DATETIME NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `action` VARCHAR(150) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  `severity` ENUM('Information', 'Action médicale', 'Sécurité', 'Alerte') NOT NULL DEFAULT 'Information',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 18. TABLE: notifications
-- Alertes du cabinet, rappels et notifications internes
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `display_time` VARCHAR(100) DEFAULT NULL,
  `type` ENUM('info', 'success', 'warning', 'primary', 'danger') NOT NULL DEFAULT 'info',
  `icon` VARCHAR(100) DEFAULT 'flaticon-381-clock',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 19. TABLE: settings
-- Configuration de la pratique, de l'agenda et de la sécurité
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `default_duration` VARCHAR(30) DEFAULT '20 min',
  `slot_interval` VARCHAR(30) DEFAULT '15 min',
  `sms_reminders` TINYINT(1) DEFAULT 1,
  `email_reminders` TINYINT(1) DEFAULT 1,
  `reminder_hours_before` INT DEFAULT 24,
  `auto_backup` TINYINT(1) DEFAULT 1,
  `backup_frequency` VARCHAR(100) DEFAULT 'Quotidienne (23:00)',
  `session_timeout_minutes` INT DEFAULT 30,
  `two_factor_auth` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- INSERTION DES DONNÉES EXISTANTES DE L'APPLICATION
-- =====================================================================

-- 1. Fiche du Cabinet & Médecin
INSERT INTO `cabinet_info` (
  `id`, `clinic_name`, `doctor_name`, `doctor_name_ar`, `title`, `title_ar`,
  `sub_specialty`, `specialty`, `rpps`, `adeli`, `siret`, `order_number`,
  `convention`, `email`, `phone`, `address`, `hours`, `legal_notice`
) VALUES (
  1,
  'Cabinet Médical Saint-Honoré',
  'Dr N. BELBACHIR OULD HENNIA',
  'الحكيمة ن. بلبشير ولد هنية',
  'Médecin Spécialiste en Gynécologie Obstétrique',
  'طبيبة مختصة في أمراض النساء',
  'Échographie',
  'Gynécologie Obstétrique & Échographie',
  '10104892341',
  '751293842',
  '482 918 274 00018',
  '31/24891',
  'Secteur Conventionné',
  'dr.belbachir@cabinet-medical.dz',
  '05 50 12 34 56',
  'Cabinet Médical de Gynécologie Obstétrique',
  'Dim - Jeu: 08:30 - 16:30 | Sam: 09:00 - 13:00',
  'Membre d''une association de gestion agréée par l''administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.'
);

-- 2. Personnel et Utilisateurs
INSERT INTO `staff_users` (
  `id`, `name`, `email`, `password_hash`, `phone`, `role`, `type`, `status`,
  `access_level`, `permission_agenda`, `permission_medical_records`,
  `permission_prescriptions`, `permission_billing`, `permission_settings`
) VALUES
(
  1,
  'Dr N. BELBACHIR OULD HENNIA',
  'dr.belbachir@cabinet-medical.dz',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- mot de passe par défaut sécurisé
  '01 42 68 50 10',
  'Médecin Spécialiste Titulaire',
  'doctor',
  'Actif',
  'Administrateur & Accès Médical Complet',
  'Plein accès',
  'Plein accès (Secret médical)',
  'Édition et signature numérique',
  'Plein accès',
  'Plein accès'
),
(
  2,
  'Sophie Vasseur',
  'accueil@cabinet-saint-honore.fr',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '01 42 68 50 11',
  'Secrétaire Médicale',
  'secretary',
  'Actif',
  'Accueil & Gestion Administrative',
  'Création, modification, annulation',
  'Restreint (Coordonnées administratives uniquement)',
  'Aucun accès (Interdit par défaut)',
  'Enregistrement des règlements',
  'Lecture seule'
);

-- 3. Patients
INSERT INTO `patients` (
  `id`, `file_number`, `first_name`, `last_name`, `dob`, `age`, `gender`,
  `phone`, `email`, `address`, `secu_number`, `blood_group`, `gravida`, `para`, `abortions`, `cesarean`, `living_children`, `last_visit`, `status`
) VALUES
(
  1, 'DOS-2024-001', 'Claire', 'Dubois', '1988-04-12', 36, 'Féminin',
  '06 12 34 56 78', 'claire.dubois@email.fr', '15 rue de Rivoli, 75001 Paris',
  '2 88 04 75 123 456 78', 'A+', 2, 1, 0, 0, 1, '2024-10-14', 'Suivi régulier'
),
(
  2, 'DOS-2024-002', 'Marc', 'Lemoine', '1962-09-23', 62, 'Masculin',
  '06 98 76 54 32', 'marc.lemoine@email.fr', '8 boulevard Sébastopol, 75004 Paris',
  '1 62 09 75 987 654 32', 'O+', 0, 0, 0, 0, 0, '2024-10-18', 'Suivi régulier'
),
(
  3, 'DOS-2024-003', 'Sophie', 'Bernard', '1995-11-05', 28, 'Féminin',
  '07 45 67 89 01', 'sophie.bernard@email.fr', '42 avenue de l''Opéra, 75002 Paris',
  '2 95 11 75 456 789 01', 'B+', 1, 0, 0, 0, 0, '2024-10-17', 'Actif'
),
(
  4, 'DOS-2024-004', 'Lucas', 'Moreau', '2018-06-15', 6, 'Masculin',
  '06 33 22 11 00', 'parents.moreau@email.fr', '3 rue Montmartre, 75001 Paris',
  '1 18 06 75 332 211 00', 'A-', 0, 0, 0, 0, 0, '2024-10-10', 'Suivi régulier'
),
(
  5, 'DOS-2024-005', 'Yasmine', 'Belkacem', '1979-02-28', 45, 'Féminin',
  '06 55 44 33 22', 'y.belkacem@email.fr', '19 rue de Turbigo, 75003 Paris',
  '2 79 02 75 554 433 22', 'O-', 3, 2, 1, 1, 2, '2024-09-30', 'Actif'
);

-- 4. Allergies des patients
INSERT INTO `patient_allergies` (`patient_id`, `allergy`, `severity`) VALUES
(1, 'Pénicilline', 'Sévère'),
(1, 'Arachides', 'Modérée'),
(2, 'Aucune allergie connue', 'Non précisée'),
(3, 'AINS (Ibuprofène)', 'Modérée'),
(4, 'Acariens', 'Faible'),
(4, 'Poils de chat', 'Faible'),
(5, 'Iode de contraste', 'Sévère');

-- 5. Maladies chroniques des patients
INSERT INTO `patient_chronic_diseases` (`patient_id`, `disease`) VALUES
(1, 'Asthme modéré'),
(2, 'Hypertension Artérielle'),
(2, 'Diabète Type 2'),
(3, 'Migraines cataméniales'),
(4, 'Eczéma atopique'),
(5, 'Hypothyroïdie fruste');

-- 6. Traitements réguliers
INSERT INTO `patient_regular_treatments` (`patient_id`, `treatment`) VALUES
(1, 'Ventoline 100µg (si besoin)'),
(1, 'Inuvair 100/6 (matin et soir)'),
(2, 'Metformine 1000mg'),
(2, 'Amlodipine 5mg'),
(3, 'Zomig 2.5mg (en crise)'),
(4, 'Crème émolliente'),
(4, 'Desloratadine sirop'),
(5, 'Lévothyrox 75µg');

-- 7. Rendez-vous
INSERT INTO `appointments` (
  `id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`,
  `duration`, `reason`, `status`, `notes`
) VALUES
(1, 1, 1, CURDATE(), '09:00:00', '20 min', 'Suivi asthme et renouvellement', 'Terminé', 'Examen clinique normal, DEP à 450 L/min.'),
(2, 2, 1, CURDATE(), '09:30:00', '25 min', 'Bilan trimestriel HTA et diabète', 'En consultation', 'Constantes à contrôler, ajustement posologique.'),
(3, 3, 1, CURDATE(), '10:15:00', '20 min', 'Céphalées et fatigue persistante', 'Arrivé', 'Patient en salle d''attente.'),
(4, 4, 1, CURDATE(), '11:00:00', '20 min', 'Poussée d''eczéma et certificat de sport', 'Confirmé', 'Rendez-vous confirmé par SMS.'),
(5, 5, 1, CURDATE(), '14:30:00', '20 min', 'Contrôle TSH et ordonnance', 'Confirmé', 'Apporter le bilan biologique récent.');

-- 8. Salle d'attente
INSERT INTO `waiting_room` (
  `id`, `patient_id`, `appointment_id`, `appointment_time`, `arrival_time`,
  `reason`, `wait_time_minutes`, `status`
) VALUES
(1, 3, 3, '10:15:00', '10:05:00', 'Céphalées et fatigue persistante', 10, 'En attente'),
(2, 2, 2, '09:30:00', '09:25:00', 'Bilan trimestriel HTA', 35, 'En consultation');

-- 9. Consultations
INSERT INTO `consultations` (
  `id`, `consultation_number`, `patient_id`, `doctor_id`, `appointment_id`,
  `consultation_date`, `consultation_time`, `reason`, `bp`, `weight`,
  `temperature`, `heart_rate`, `ddr`, `terme`, `symptoms`, `exam_findings`,
  `echo_type`, `echo_findings`, `echo_conclusion`, `diagnosis`,
  `recommendations`, `prescription_created`, `prescription_id`, `billing_code`, `status`
) VALUES
(
  1,
  'CS-2024-0104',
  1,
  1,
  1,
  '2024-10-14',
  '09:15:00',
  'Suivi de grossesse (Prénatal)',
  '115/70',
  62.00,
  36.8,
  68,
  '2024-05-15',
  '22 SA',
  'Mouvements actifs fœtaux bien perçus. Pas de métrorragies.',
  'Hauteur utérine : 20 cm. Bruits du cœur fœtal perçus (145 bpm).',
  'Échographie obstétrique T2',
  'Fœtus eutrophe, biométrie conforme au terme, liquide amniotique normal.',
  'Grossesse monofoetale évolutive du 2ème trimestre sans anomalie morphologique décelable.',
  'Grossesse intra-utérine évolutive 22 SA',
  'Bilan du 6ème mois (glycémie, NFS). Supplémentation fer et acide folique.',
  1,
  1,
  'Échographie obstétrique (4 000 DA)',
  'Clôturée'
),
(
  2,
  'CS-2024-0105',
  3,
  1,
  NULL,
  '2024-10-18',
  '10:00:00',
  'Consultation gynécologique de routine',
  '120/75',
  58.00,
  37.1,
  78,
  '2024-10-02',
  '-',
  'Douleurs pelviennes modérées prémenstruelles.',
  'Col sain, frottis cervico-utérin de dépistage réalisé. Seins sans anomalie.',
  'Échographie pelvienne / gynécologique',
  'Utérus antéversé homogène, ovaires normaux sans formation kystique.',
  'Examen échographique pelvien endovaginal et sus-pubien strictement normal.',
  'Bilan gynécologique de contrôle normal',
  'Résultats du frottis sous 10 jours. Prochain contrôle dans 1 an.',
  0,
  NULL,
  'Consultation + Frottis FCU (3 500 DA)',
  'Clôturée'
);

-- 10. Comptes rendus d'échographie
INSERT INTO `ultrasound_reports` (
  `id`, `report_number`, `consultation_id`, `patient_id`, `exam_type`,
  `exam_date`, `indication`, `ddr`, `terme_sa`, `pregnancy_type`,
  `bip_mm`, `pc_mm`, `ca_mm`, `lf_mm`, `cervelet_mm`, `epf_hadlock_g`,
  `findings`, `conclusion`
) VALUES
(
  1,
  'ECHO-2024-0042',
  1,
  1,
  'ob2',
  '2024-10-14',
  'Échographie morphologique du 2ème trimestre',
  '2024-05-15',
  '22 SA + 0 j',
  'Unique',
  54.00,
  200.00,
  175.00,
  38.00,
  23.00,
  495,
  'Morphologie fœtale normale : pôle céphalique bien visualisé, 4 cavités cardiaques symétriques, estomac et vessie visualisés, membres intègres, rachis sans anomalie. Placenta postérieur non praevia. Quantité normale de liquide amniotique.',
  'Grossesse intra-utérine évolutive de 22 SA. Fœtus unique sans signe d''appel morphologique ce jour. Biométrie au 50ème percentile.'
);

-- 11. Ordonnances
INSERT INTO `prescriptions` (
  `id`, `prescription_number`, `consultation_id`, `patient_id`, `doctor_name`,
  `prescription_date`, `validity`, `ald`, `notes`, `validated`
) VALUES
(
  1,
  'ORD-2024-0089',
  1,
  1,
  'Dr N. BELBACHIR OULD HENNIA',
  '2024-10-14',
  '3 mois',
  0,
  'Bien rincer la bouche à l''eau après inhalation. Revoir si besoin.',
  1
),
(
  2,
  'ORD-2024-0090',
  NULL,
  2,
  'Dr N. BELBACHIR OULD HENNIA',
  '2024-10-18',
  '6 mois',
  1,
  'Bilan sanguin de contrôle (créatininémie, HbA1c) à réaliser dans 3 mois.',
  1
);

-- 12. Lignes d'ordonnance
INSERT INTO `prescription_items` (
  `id`, `prescription_id`, `medication`, `dosage`, `posology`, `duration`, `renewable`
) VALUES
(1, 1, 'INUVAIR 100 µg/6 µg solution pour inhalation', '100/6 µg', '2 inhalations matin et soir', '10 jours puis 1 matin et soir', 'Renouvelable 2 fois'),
(2, 1, 'VENTOLINE 100 µg/dose aérosol-doseur', '100 µg', '1 à 2 bouffées en cas de gêne respiratoire', 'Flacon d''urgence', '1 flacon'),
(3, 2, 'AMLODIPINE 5 mg comprimé', '5 mg', '1 comprimé le matin', '3 mois', 'Renouvelable 1 fois'),
(4, 2, 'METFORMINE 1000 mg comprimé pelliculé', '1000 mg', '1 comprimé au milieu des 2 principaux repas', '3 mois', 'Renouvelable 1 fois');

-- 13. Examens cliniques et constantes
INSERT INTO `clinical_examinations` (
  `id`, `patient_id`, `consultation_id`, `exam_date`, `bp_systolic`,
  `bp_diastolic`, `heart_rate`, `temperature`, `weight`, `height`,
  `bmi`, `spo2`, `blood_sugar`, `notes`
) VALUES
(1, 2, NULL, '2024-10-18', 145, 88, 76, 36.9, 84.00, 178.00, 26.5, 97, 1.28, 'Pression artérielle légèrement élevée, glycémie à surveiller.'),
(2, 2, NULL, '2024-07-15', 140, 85, 72, 36.7, 85.20, 178.00, 26.9, 98, 1.34, 'Consultation antérieure de contrôle.'),
(3, 1, 1, '2024-10-14', 120, 75, 68, 36.8, 58.00, 165.00, 21.3, 99, 0.92, 'Paramètres vitaux optimaux.'),
(4, 3, 2, '2024-10-17', 115, 70, 78, 37.1, 54.50, 168.00, 19.3, 99, 0.90, 'Pas de fièvre, pouls régulier.');

-- 14. Documents médicaux
INSERT INTO `medical_documents` (
  `id`, `patient_id`, `consultation_id`, `title`, `category`,
  `doc_date`, `author`, `file_size`, `file_type`, `status`
) VALUES
(1, 2, NULL, 'Bilan sanguin complet & HbA1c', 'Analyses de laboratoire', '2024-10-15', 'Laboratoire d''Analyses Médicales Pyramides', '420 Ko', 'PDF', 'Validé par le médecin'),
(2, 1, 1, 'Radiographie thoracique face/profil', 'Imagerie & Radiologie', '2024-05-12', 'Centre d''Imagerie Paris Centre', '2.4 Mo', 'PDF', 'Validé'),
(3, 4, NULL, 'Certificat médical d''aptitude à la natation', 'Certificats médicaux', '2024-09-08', 'Dr N. BELBACHIR OULD HENNIA', '180 Ko', 'PDF', 'Délivré'),
(4, 3, 2, 'Compte rendu consultation Neurologie', 'Comptes rendus spécialistes', '2024-06-20', 'Dr. H. Vaneau (Neurologue)', '310 Ko', 'PDF', 'Archivé');

-- 15. Factures
INSERT INTO `invoices` (
  `id`, `invoice_number`, `patient_id`, `consultation_id`, `invoice_date`,
  `act_description`, `amount`, `covered_amo`, `covered_amc`, `patient_remaining`,
  `payment_method`, `status`
) VALUES
(1, 'FAC-2024-0248', 1, 1, '2024-10-14', 'Consultation de médecine générale', 2500.00, 2000.00, 500.00, 0.00, 'Espèces', 'Payée'),
(2, 'FAC-2024-0249', 2, NULL, '2024-10-18', 'Consultation suivi pathologie chronique + ECG', 3500.00, 3500.00, 0.00, 0.00, 'Tiers-Payant CNAS', 'Télétransmise'),
(3, 'FAC-2024-0250', 3, 2, '2024-10-17', 'Consultation générale', 2500.00, 0.00, 0.00, 2500.00, 'En attente', 'En attente'),
(4, 'FAC-2024-0251', 4, NULL, '2024-10-10', 'Consultation pédiatrique (Enfant)', 3000.00, 2400.00, 600.00, 0.00, 'Espèces', 'Payée');

-- 16. Paiements
INSERT INTO `payments` (
  `id`, `receipt_number`, `invoice_id`, `invoice_number`, `patient_name`,
  `payment_date`, `payment_time`, `amount`, `method`, `operator`, `status`
) VALUES
(1, 'REC-2024-0182', 2, 'FAC-2024-0249', 'Marc Lemoine', '2024-10-18', '10:30:00', 3500.00, 'Tiers-Payant CNAS', 'Sophie Vasseur', 'Encaissé'),
(2, 'REC-2024-0181', 1, 'FAC-2024-0248', 'Claire Dubois', '2024-10-14', '09:40:00', 2500.00, 'Espèces', 'Sophie Vasseur', 'Encaissé'),
(3, 'REC-2024-0180', 4, 'FAC-2024-0251', 'Lucas Moreau', '2024-10-10', '11:25:00', 3000.00, 'Chèque', 'Dr N. BELBACHIR OULD HENNIA', 'Encaissé');

-- 17. Journal d'Audit
INSERT INTO `audit_logs` (
  `id`, `timestamp`, `user_name`, `role`, `action`, `details`, `ip_address`, `severity`
) VALUES
(1, '2024-10-19 10:45:12', 'Dr N. BELBACHIR OULD HENNIA', 'Médecin', 'Consultation de dossier médical', 'Accès au dossier #DOS-2024-001 (Claire Dubois)', '192.168.1.15', 'Information'),
(2, '2024-10-19 10:15:02', 'Sophie Vasseur', 'Secrétaire', 'Arrivée patient enregistrée', 'Enregistrement en salle d''attente : Sophie Bernard (#DOS-2024-003)', '192.168.1.20', 'Information'),
(3, '2024-10-18 10:18:40', 'Dr N. BELBACHIR OULD HENNIA', 'Médecin', 'Validation ordonnance', 'Signature numérique de l''ordonnance #ORD-2024-0090 pour Marc Lemoine', '192.168.1.15', 'Action médicale'),
(4, '2024-10-18 09:30:15', 'Sophie Vasseur', 'Secrétaire', 'Création rendez-vous', 'RDV programmé le 2024-10-25 à 14:00 pour Yasmine Belkacem', '192.168.1.20', 'Information'),
(5, '2024-10-17 18:00:21', 'Dr N. BELBACHIR OULD HENNIA', 'Médecin', 'Sauvegarde chiffrée', 'Sauvegarde locale et HDS sécurisée des dossiers patients réussie', '192.168.1.15', 'Sécurité');

-- 18. Notifications
INSERT INTO `notifications` (
  `id`, `title`, `message`, `display_time`, `type`, `icon`, `is_read`
) VALUES
(1, 'Patient en salle d''attente', 'Sophie Bernard est arrivée pour son rendez-vous de 10:15.', 'Il y a 10 minutes', 'info', 'flaticon-381-clock', 0),
(2, 'Résultat d''analyse reçu', 'Bilan biologique disponible pour Marc Lemoine (Labo Pyramides).', 'Il y a 1 heure', 'success', 'flaticon-381-file-1', 0),
(3, 'Rappel facture impayée', 'Facture FAC-2024-0250 en attente de règlement (2 500 DA).', 'Il y a 2 jours', 'warning', 'flaticon-381-calculator', 1),
(4, 'Sauvegarde HDS effectuée', 'Sauvegarde quotidienne conforme RGPD & Secret Médical réalisée avec succès.', 'Hier à 22:00', 'primary', 'flaticon-381-shield', 1);

-- 19. Paramètres
INSERT INTO `settings` (
  `id`, `default_duration`, `slot_interval`, `sms_reminders`, `email_reminders`,
  `reminder_hours_before`, `auto_backup`, `backup_frequency`,
  `session_timeout_minutes`, `two_factor_auth`
) VALUES (
  1, '20 min', '15 min', 1, 1, 24, 1, 'Quotidienne (23:00)', 30, 1
);

-- =====================================================================
-- VUES UTILES POUR L'APPLICATION ET LES RAPPORTS
-- =====================================================================

-- Vue: Dossier Patient Complet avec coordonnées et statistiques
CREATE OR REPLACE VIEW `v_patient_summary` AS
SELECT 
  p.id,
  p.file_number,
  CONCAT(p.first_name, ' ', p.last_name) AS full_name,
  p.gender,
  p.dob,
  p.age,
  p.phone,
  p.email,
  p.secu_number,
  p.blood_group,
  p.status,
  COUNT(DISTINCT c.id) AS total_consultations,
  COUNT(DISTINCT pr.id) AS total_prescriptions,
  COUNT(DISTINCT i.id) AS total_invoices,
  COALESCE(SUM(i.amount), 0) AS total_billed,
  COALESCE(SUM(i.patient_remaining), 0) AS total_outstanding
FROM `patients` p
LEFT JOIN `consultations` c ON c.patient_id = p.id
LEFT JOIN `prescriptions` pr ON pr.patient_id = p.id
LEFT JOIN `invoices` i ON i.patient_id = p.id
GROUP BY p.id;

-- Vue: Agenda du jour avec détails patients
CREATE OR REPLACE VIEW `v_today_appointments` AS
SELECT 
  a.id AS appointment_id,
  a.appointment_date,
  a.appointment_time,
  a.duration,
  a.reason,
  a.status AS appointment_status,
  p.id AS patient_id,
  p.file_number,
  CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
  p.phone,
  p.gender,
  p.age
FROM `appointments` a
JOIN `patients` p ON p.id = a.patient_id
WHERE a.appointment_date = CURDATE()
ORDER BY a.appointment_time ASC;

-- Vue: Chiffre d'affaires et paiements du mois
CREATE OR REPLACE VIEW `v_monthly_revenue` AS
SELECT 
  DATE_FORMAT(payment_date, '%Y-%m') AS month,
  method,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_collected
FROM `payments`
WHERE status = 'Encaissé'
GROUP BY DATE_FORMAT(payment_date, '%Y-%m'), method;

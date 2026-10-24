-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: medcine_solution_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Database schema for medcine_solution
-- Compatible with cPanel / Host.dz phpMyAdmin
--

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration` varchar(30) DEFAULT '20 min',
  `reason` varchar(255) NOT NULL,
  `status` enum('Confirmé','Arrivé','En consultation','Terminé','Absent','Annulé') NOT NULL DEFAULT 'Confirmé',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_appointments_patient` (`patient_id`),
  KEY `fk_appointments_doctor` (`doctor_id`),
  KEY `idx_appointment_date` (`appointment_date`,`appointment_time`),
  KEY `idx_appointment_status` (`status`),
  CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `staff_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `user_name` varchar(150) NOT NULL,
  `role` varchar(100) NOT NULL,
  `action` varchar(150) NOT NULL,
  `details` text NOT NULL,
  `ip_address` varchar(50) DEFAULT '127.0.0.1',
  `severity` enum('Information','Action médicale','Sécurité','Alerte') NOT NULL DEFAULT 'Information',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'2024-10-19 10:45:12','Dr N. BELBACHIR OULD HENNIA','Médecin','Consultation de dossier médical','Accès au dossier #DOS-2024-001 (Claire Dubois)','192.168.1.15','Information','2026-10-22 08:29:34'),(2,'2024-10-19 10:15:02','Sophie Vasseur','Secrétaire','Arrivée patient enregistrée','Enregistrement en salle d\'attente : Sophie Bernard (#DOS-2024-003)','192.168.1.20','Information','2026-10-22 08:29:34'),(3,'2024-10-18 10:18:40','Dr N. BELBACHIR OULD HENNIA','Médecin','Validation ordonnance','Signature numérique de l\'ordonnance #ORD-2024-0090 pour Marc Lemoine','192.168.1.15','Action médicale','2026-10-22 08:29:34'),(4,'2024-10-18 09:30:15','Sophie Vasseur','Secrétaire','Création rendez-vous','RDV programmé le 2024-10-25 à 14:00 pour Yasmine Belkacem','192.168.1.20','Information','2026-10-22 08:29:34'),(5,'2024-10-17 18:00:21','Dr N. BELBACHIR OULD HENNIA','Médecin','Sauvegarde chiffrée','Sauvegarde locale et HDS sécurisée des dossiers patients réussie','192.168.1.15','Sécurité','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinet_info`
--

DROP TABLE IF EXISTS `cabinet_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cabinet_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clinic_name` varchar(150) NOT NULL DEFAULT 'Cabinet Médical de Gynécologie Obstétrique',
  `doctor_name` varchar(150) NOT NULL,
  `doctor_name_ar` varchar(150) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `title_ar` varchar(150) DEFAULT NULL,
  `specialty` varchar(150) NOT NULL,
  `sub_specialty` varchar(100) DEFAULT NULL,
  `rpps` varchar(50) DEFAULT NULL,
  `adeli` varchar(50) DEFAULT NULL,
  `siret` varchar(50) DEFAULT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `convention` varchar(100) DEFAULT 'Secteur Conventionné',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `hours` varchar(255) DEFAULT NULL,
  `legal_notice` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinet_info`
--

LOCK TABLES `cabinet_info` WRITE;
/*!40000 ALTER TABLE `cabinet_info` DISABLE KEYS */;
INSERT INTO `cabinet_info` VALUES (1,'Cabinet Médical Saint-Honoré','Dr N. BELBACHIR OULD HENNIA','الدكتورة ن. بلبشير ولد هنية','Médecin Spécialiste en Gynécologie Obstétrique','طبيبة مختصة في أمراض النساء والتوليد','Gynécologie Obstétrique & Échographie','Échographie','10104892341','751293842','482 918 274 00018','31/24891','Secteur Conventionné','dr.belbachir@cabinet-medical.dz','0560 06 74 66','Haï Essedikia, Avenue Seghier Benali, Oran','Sam - Jeu: 09:00 - 18:00 | Ven: Fermé','Membre d\'une association de gestion agréée par l\'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.','2026-10-22 08:29:34','2026-10-22 14:39:06');
/*!40000 ALTER TABLE `cabinet_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinical_examinations`
--

DROP TABLE IF EXISTS `clinical_examinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clinical_examinations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `consultation_id` int(11) DEFAULT NULL,
  `exam_date` date NOT NULL,
  `bp_systolic` int(11) DEFAULT NULL,
  `bp_diastolic` int(11) DEFAULT NULL,
  `heart_rate` int(11) DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(4,1) DEFAULT NULL,
  `spo2` int(11) DEFAULT NULL,
  `blood_sugar` decimal(4,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_exam_consultation` (`consultation_id`),
  KEY `idx_exam_patient_date` (`patient_id`,`exam_date`),
  CONSTRAINT `fk_exam_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exam_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinical_examinations`
--

LOCK TABLES `clinical_examinations` WRITE;
/*!40000 ALTER TABLE `clinical_examinations` DISABLE KEYS */;
INSERT INTO `clinical_examinations` VALUES (1,2,NULL,'2024-10-18',145,88,76,36.9,84.00,178.00,26.5,97,1.28,'Pression artérielle légèrement élevée, glycémie à surveiller.','2026-10-22 08:29:34'),(2,2,NULL,'2024-07-15',140,85,72,36.7,85.20,178.00,26.9,98,1.34,'Consultation antérieure de contrôle.','2026-10-22 08:29:34'),(3,1,1,'2024-10-14',120,75,68,36.8,58.00,165.00,21.3,99,0.92,'Paramètres vitaux optimaux.','2026-10-22 08:29:34'),(4,3,2,'2024-10-17',115,70,78,37.1,54.50,168.00,19.3,99,0.90,'Pas de fièvre, pouls régulier.','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `clinical_examinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultations`
--

DROP TABLE IF EXISTS `consultations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consultation_number` varchar(50) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `consultation_date` date NOT NULL,
  `consultation_time` time NOT NULL,
  `reason` varchar(255) NOT NULL,
  `bp` varchar(20) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `heart_rate` int(11) DEFAULT NULL,
  `ddr` date DEFAULT NULL COMMENT 'Date des dernières règles',
  `terme` varchar(50) DEFAULT NULL COMMENT 'Terme en SA',
  `symptoms` text DEFAULT NULL,
  `exam_findings` text DEFAULT NULL,
  `echo_type` varchar(150) DEFAULT NULL,
  `echo_findings` text DEFAULT NULL,
  `echo_conclusion` text DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `prescription_created` tinyint(1) DEFAULT 0,
  `prescription_id` int(11) DEFAULT NULL,
  `billing_code` varchar(150) DEFAULT NULL,
  `status` enum('En cours','Clôturée','Archivée') NOT NULL DEFAULT 'Clôturée',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `consultation_number` (`consultation_number`),
  KEY `fk_consultations_patient` (`patient_id`),
  KEY `fk_consultations_doctor` (`doctor_id`),
  KEY `fk_consultations_appointment` (`appointment_id`),
  KEY `idx_consultation_date` (`consultation_date`),
  CONSTRAINT `fk_consultations_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_consultations_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `staff_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_consultations_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultations`
--

LOCK TABLES `consultations` WRITE;
/*!40000 ALTER TABLE `consultations` DISABLE KEYS */;
INSERT INTO `consultations` VALUES (1,'CS-2024-0104',1,1,1,'2024-10-14','09:15:00','Suivi de grossesse (Prénatal)','115/70',62.00,36.8,68,'2024-05-15','22 SA','Mouvements actifs fœtaux bien perçus. Pas de métrorragies.','Hauteur utérine : 20 cm. Bruits du cœur fœtal perçus (145 bpm).','Échographie obstétrique T2','Fœtus eutrophe, biométrie conforme au terme, liquide amniotique normal.','Grossesse monofoetale évolutive du 2ème trimestre sans anomalie morphologique décelable.','Grossesse intra-utérine évolutive 22 SA','Bilan du 6ème mois (glycémie, NFS). Supplémentation fer et acide folique.',1,1,'Échographie obstétrique (4 000 DA)','Clôturée','2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,'CS-2024-0105',3,1,NULL,'2024-10-18','10:00:00','Consultation gynécologique de routine','120/75',58.00,37.1,78,'2024-10-02','-','Douleurs pelviennes modérées prémenstruelles.','Col sain, frottis cervico-utérin de dépistage réalisé. Seins sans anomalie.','Échographie pelvienne / gynécologique','Utérus antéversé homogène, ovaires normaux sans formation kystique.','Examen échographique pelvien endovaginal et sus-pubien strictement normal.','Bilan gynécologique de contrôle normal','Résultats du frottis sous 10 jours. Prochain contrôle dans 1 an.',0,NULL,'Consultation + Frottis FCU (3 500 DA)','Clôturée','2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `consultations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `consultation_id` int(11) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `act_description` text NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `covered_amo` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Prise en charge CNAS / Assurance obligatoire',
  `covered_amc` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Prise en charge Mutuelle / Complémentaire',
  `patient_remaining` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT 'Espèces',
  `status` enum('Payée','Télétransmise','En attente','Annulée') NOT NULL DEFAULT 'En attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `fk_invoices_patient` (`patient_id`),
  KEY `fk_invoices_consultation` (`consultation_id`),
  KEY `idx_invoice_status` (`status`),
  CONSTRAINT `fk_invoices_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invoices_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'FAC-2024-0248',1,1,'2024-10-14','Consultation de médecine générale',2500.00,2000.00,500.00,0.00,'Espèces','Payée','2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,'FAC-2024-0249',2,NULL,'2024-10-18','Consultation suivi pathologie chronique + ECG',3500.00,3500.00,0.00,0.00,'Tiers-Payant CNAS','Télétransmise','2026-10-22 08:29:34','2026-10-22 08:29:34'),(3,'FAC-2024-0250',3,2,'2024-10-17','Consultation générale',2500.00,0.00,0.00,2500.00,'En attente','En attente','2026-10-22 08:29:34','2026-10-22 08:29:34'),(4,'FAC-2024-0251',4,NULL,'2024-10-10','Consultation pédiatrique (Enfant)',3000.00,2400.00,600.00,0.00,'Espèces','Payée','2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_documents`
--

DROP TABLE IF EXISTS `medical_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medical_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `consultation_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('Analyses de laboratoire','Imagerie & Radiologie','Certificats médicaux','Comptes rendus spécialistes','Autre') NOT NULL,
  `doc_date` date NOT NULL,
  `author` varchar(150) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `file_type` varchar(20) DEFAULT 'PDF',
  `status` varchar(50) DEFAULT 'Validé',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_docs_patient` (`patient_id`),
  KEY `fk_docs_consultation` (`consultation_id`),
  CONSTRAINT `fk_docs_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_docs_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_documents`
--

LOCK TABLES `medical_documents` WRITE;
/*!40000 ALTER TABLE `medical_documents` DISABLE KEYS */;
INSERT INTO `medical_documents` VALUES (1,2,NULL,'Bilan sanguin complet & HbA1c','Analyses de laboratoire','2024-10-15','Laboratoire d\'Analyses Médicales Pyramides',NULL,'420 Ko','PDF','Validé par le médecin','2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,1,1,'Radiographie thoracique face/profil','Imagerie & Radiologie','2024-05-12','Centre d\'Imagerie Paris Centre',NULL,'2.4 Mo','PDF','Validé','2026-10-22 08:29:34','2026-10-22 08:29:34'),(3,4,NULL,'Certificat médical d\'aptitude à la natation','Certificats médicaux','2024-09-08','Dr N. BELBACHIR OULD HENNIA',NULL,'180 Ko','PDF','Délivré','2026-10-22 08:29:34','2026-10-22 08:29:34'),(4,3,2,'Compte rendu consultation Neurologie','Comptes rendus spécialistes','2024-06-20','Dr. H. Vaneau (Neurologue)',NULL,'310 Ko','PDF','Archivé','2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `medical_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medications`
--

DROP TABLE IF EXISTS `medications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `form` varchar(100) DEFAULT NULL,
  `default_posology` varchar(255) DEFAULT NULL,
  `default_duration` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medications`
--

LOCK TABLES `medications` WRITE;
/*!40000 ALTER TABLE `medications` DISABLE KEYS */;
INSERT INTO `medications` VALUES (1,'AMOXICILLINE 1g','1g','Comprimé dispersible','1 comprimé matin et soir','7 jours','Antibiotique','2026-10-22 08:41:47'),(2,'AUGMENTIN 1g/125mg','1g','Comprimé pelliculé','1 comprimé matin et soir au cours du repas','7 jours','Antibiotique','2026-10-22 08:41:47'),(3,'PARACÉTAMOL 1000 mg','1000 mg','Comprimé','1 comprimé toutes les 6 heures si douleur/fièvre (max 3g/j)','5 jours','Antalgique','2026-10-22 08:41:47'),(4,'SPASFON 80mg','80 mg','Lyoc','2 lyocs au moment des douleurs, à renouveler si besoin','5 jours','Antispasmodique','2026-10-22 08:41:47'),(5,'INUVAIR 100 µg/6 µg','100/6 µg','Solution pour inhalation','2 inhalations matin et soir','1 mois','Pneumologie','2026-10-22 08:41:47'),(6,'VENTOLINE 100 µg','100 µg','Aérosol-doseur','1 à 2 bouffées en cas de gêne respiratoire','Selon besoin','Pneumologie','2026-10-22 08:41:47'),(7,'AMLODIPINE 5 mg','5 mg','Comprimé','1 comprimé le matin','3 mois','Cardiologie','2026-10-22 08:41:47'),(8,'METFORMINE 1000 mg','1000 mg','Comprimé pelliculé','1 comprimé au milieu des 2 principaux repas','3 mois','Diabétologie','2026-10-22 08:41:47'),(9,'KARDEGIC 75 mg','75 mg','Sachet','1 sachet par jour au milieu d\'un repas','3 mois','Cardiologie','2026-10-22 08:41:47'),(10,'OMÉPRAZOLE 20 mg','20 mg','Gélule','1 gélule le matin à jeun','1 mois','Gastro-entérologie','2026-10-22 08:41:47'),(11,'ACIDE FOLIQUE 5 mg','5 mg','Comprimé','1 comprimé par jour','1 mois','Gynécologie','2026-10-22 08:41:47'),(12,'TARDYFERON B9','50 mg','Comprimé','1 comprimé par jour avant le repas','1 mois','Hématologie','2026-10-22 08:41:47'),(13,'GYNO-PEVARYL 150 mg','150 mg','Ovule','1 ovule au coucher pendant 3 jours','3 jours','Gynécologie','2026-10-22 08:41:47'),(14,'FLAGYL 500 mg','500 mg','Comprimé','1 comprimé matin et soir pendant les repas','7 jours','Anti-infectieux','2026-10-22 08:41:47'),(15,'AZITHROMYCINE 500 mg','500 mg','Comprimé','1 comprimé par jour pendant 3 jours','3 jours','Antibiotique','2026-10-22 08:41:47'),(16,'CEFIXIME 200 mg','200 mg','Comprimé','1 comprimé matin et soir','8 jours','Antibiotique','2026-10-22 08:41:47'),(17,'IBUPROFÈNE 400 mg','400 mg','Comprimé','1 comprimé au cours du repas, max 3 par jour','5 jours','Anti-inflammatoire','2026-10-22 08:41:47');
/*!40000 ALTER TABLE `medications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `display_time` varchar(100) DEFAULT NULL,
  `type` enum('info','success','warning','primary','danger') NOT NULL DEFAULT 'info',
  `icon` varchar(100) DEFAULT 'flaticon-381-clock',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Patient en salle d\'attente','Sophie Bernard est arrivée pour son rendez-vous de 10:15.','Il y a 10 minutes','info','flaticon-381-clock',0,'2026-10-22 08:29:34'),(2,'Résultat d\'analyse reçu','Bilan biologique disponible pour Marc Lemoine (Labo Pyramides).','Il y a 1 heure','success','flaticon-381-file-1',0,'2026-10-22 08:29:34'),(3,'Rappel facture impayée','Facture FAC-2024-0250 en attente de règlement (2 500 DA).','Il y a 2 jours','warning','flaticon-381-calculator',1,'2026-10-22 08:29:34'),(4,'Sauvegarde HDS effectuée','Sauvegarde quotidienne conforme RGPD & Secret Médical réalisée avec succès.','Hier à 22:00','primary','flaticon-381-shield',1,'2026-10-22 08:29:34');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_allergies`
--

DROP TABLE IF EXISTS `patient_allergies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_allergies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `allergy` varchar(255) NOT NULL,
  `severity` enum('Faible','Modérée','Sévère','Non précisée') DEFAULT 'Non précisée',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_allergies_patient` (`patient_id`),
  CONSTRAINT `fk_allergies_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_allergies`
--

LOCK TABLES `patient_allergies` WRITE;
/*!40000 ALTER TABLE `patient_allergies` DISABLE KEYS */;
INSERT INTO `patient_allergies` VALUES (1,1,'Pénicilline','Sévère','2026-10-22 08:29:34'),(2,1,'Arachides','Modérée','2026-10-22 08:29:34'),(3,2,'Aucune allergie connue','Non précisée','2026-10-22 08:29:34'),(4,3,'AINS (Ibuprofène)','Modérée','2026-10-22 08:29:34'),(5,4,'Acariens','Faible','2026-10-22 08:29:34'),(6,4,'Poils de chat','Faible','2026-10-22 08:29:34'),(7,5,'Iode de contraste','Sévère','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `patient_allergies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_chronic_diseases`
--

DROP TABLE IF EXISTS `patient_chronic_diseases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_chronic_diseases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `disease` varchar(255) NOT NULL,
  `diagnosed_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_diseases_patient` (`patient_id`),
  CONSTRAINT `fk_diseases_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_chronic_diseases`
--

LOCK TABLES `patient_chronic_diseases` WRITE;
/*!40000 ALTER TABLE `patient_chronic_diseases` DISABLE KEYS */;
INSERT INTO `patient_chronic_diseases` VALUES (1,1,'Asthme modéré',NULL,NULL,'2026-10-22 08:29:34'),(2,2,'Hypertension Artérielle',NULL,NULL,'2026-10-22 08:29:34'),(3,2,'Diabète Type 2',NULL,NULL,'2026-10-22 08:29:34'),(4,3,'Migraines cataméniales',NULL,NULL,'2026-10-22 08:29:34'),(5,4,'Eczéma atopique',NULL,NULL,'2026-10-22 08:29:34'),(6,5,'Hypothyroïdie fruste',NULL,NULL,'2026-10-22 08:29:34');
/*!40000 ALTER TABLE `patient_chronic_diseases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_regular_treatments`
--

DROP TABLE IF EXISTS `patient_regular_treatments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_regular_treatments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `treatment` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_treatments_patient` (`patient_id`),
  CONSTRAINT `fk_treatments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_regular_treatments`
--

LOCK TABLES `patient_regular_treatments` WRITE;
/*!40000 ALTER TABLE `patient_regular_treatments` DISABLE KEYS */;
INSERT INTO `patient_regular_treatments` VALUES (1,1,'Ventoline 100µg (si besoin)',NULL,NULL,'2026-10-22 08:29:34'),(2,1,'Inuvair 100/6 (matin et soir)',NULL,NULL,'2026-10-22 08:29:34'),(3,2,'Metformine 1000mg',NULL,NULL,'2026-10-22 08:29:34'),(4,2,'Amlodipine 5mg',NULL,NULL,'2026-10-22 08:29:34'),(5,3,'Zomig 2.5mg (en crise)',NULL,NULL,'2026-10-22 08:29:34'),(6,4,'Crème émolliente',NULL,NULL,'2026-10-22 08:29:34'),(7,4,'Desloratadine sirop',NULL,NULL,'2026-10-22 08:29:34'),(8,5,'Lévothyrox 75µg',NULL,NULL,'2026-10-22 08:29:34');
/*!40000 ALTER TABLE `patient_regular_treatments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Féminin','Masculin','Autre') NOT NULL DEFAULT 'Féminin',
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `secu_number` varchar(50) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `gravida` int(11) DEFAULT 0 COMMENT 'Nombre de grossesses (G)',
  `para` int(11) DEFAULT 0 COMMENT 'Nombre d''accouchements (P)',
  `abortions` int(11) DEFAULT 0 COMMENT 'Nombre de fausses couches ou IVG (A)',
  `cesarean` int(11) DEFAULT 0 COMMENT 'Nombre de césariennes (C)',
  `living_children` int(11) DEFAULT 0 COMMENT 'Enfants vivants (E)',
  `last_visit` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_number` (`file_number`),
  KEY `idx_patient_name` (`last_name`,`first_name`),
  KEY `idx_patient_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'DOS-2024-001','Claire','Dubois','1988-04-12',36,'Féminin','06 12 34 56 78','claire.dubois@email.fr','15 rue de Rivoli, 75001 Paris','2 88 04 75 123 456 78','A+',2,1,0,0,1,'2024-10-14','Suivi régulier','2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,'DOS-2024-002','Marc','Lemoine','1962-09-23',62,'Masculin','06 98 76 54 32','marc.lemoine@email.fr','8 boulevard Sébastopol, 75004 Paris','1 62 09 75 987 654 32','O+',0,0,0,0,0,'2024-10-18','Suivi régulier','2026-10-22 08:29:34','2026-10-22 08:29:34'),(3,'DOS-2024-003','Sophie','Bernard','1995-11-05',28,'Féminin','07 45 67 89 01','sophie.bernard@email.fr','42 avenue de l\'Opéra, 75002 Paris','2 95 11 75 456 789 01','B+',1,0,0,0,0,'2024-10-17','Actif','2026-10-22 08:29:34','2026-10-22 08:29:34'),(4,'DOS-2024-004','Lucas','Moreau','2018-06-15',6,'Masculin','06 33 22 11 00','parents.moreau@email.fr','3 rue Montmartre, 75001 Paris','1 18 06 75 332 211 00','A-',0,0,0,0,0,'2024-10-10','Suivi régulier','2026-10-22 08:29:34','2026-10-22 08:29:34'),(5,'DOS-2024-005','Yasmine','Belkacem','1979-02-28',45,'Féminin','06 55 44 33 22','y.belkacem@email.fr','19 rue de Turbigo, 75003 Paris','2 79 02 75 554 433 22','O-',3,2,1,1,2,'2024-09-30','Actif','2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(50) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `patient_name` varchar(150) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_time` time NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `method` varchar(50) NOT NULL DEFAULT 'Espèces',
  `operator` varchar(150) NOT NULL,
  `status` enum('Encaissé','Annulé','Remboursé') NOT NULL DEFAULT 'Encaissé',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `fk_payments_invoice` (`invoice_id`),
  KEY `idx_payment_date` (`payment_date`),
  CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'REC-2024-0182',2,'FAC-2024-0249','Marc Lemoine','2024-10-18','10:30:00',3500.00,'Tiers-Payant CNAS','Sophie Vasseur','Encaissé','2026-10-22 08:29:34'),(2,'REC-2024-0181',1,'FAC-2024-0248','Claire Dubois','2024-10-14','09:40:00',2500.00,'Espèces','Sophie Vasseur','Encaissé','2026-10-22 08:29:34'),(3,'REC-2024-0180',4,'FAC-2024-0251','Lucas Moreau','2024-10-10','11:25:00',3000.00,'Chèque','Dr N. BELBACHIR OULD HENNIA','Encaissé','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prescription_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prescription_id` int(11) NOT NULL,
  `medication` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `posology` text NOT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `renewable` varchar(100) DEFAULT 'Non renouvelable',
  `instructions` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_items_prescription` (`prescription_id`),
  CONSTRAINT `fk_items_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES (1,1,'INUVAIR 100 µg/6 µg solution pour inhalation','100/6 µg','2 inhalations matin et soir','10 jours puis 1 matin et soir','Renouvelable 2 fois',NULL),(2,1,'VENTOLINE 100 µg/dose aérosol-doseur','100 µg','1 à 2 bouffées en cas de gêne respiratoire','Flacon d\'urgence','1 flacon',NULL),(3,2,'AMLODIPINE 5 mg comprimé','5 mg','1 comprimé le matin','3 mois','Renouvelable 1 fois',NULL),(4,2,'METFORMINE 1000 mg comprimé pelliculé','1000 mg','1 comprimé au milieu des 2 principaux repas','3 mois','Renouvelable 1 fois',NULL);
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prescription_number` varchar(50) NOT NULL,
  `consultation_id` int(11) DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_name` varchar(150) NOT NULL,
  `prescription_date` date NOT NULL,
  `validity` varchar(50) DEFAULT '3 mois',
  `ald` tinyint(1) DEFAULT 0 COMMENT 'Affection Longue Durée',
  `notes` text DEFAULT NULL,
  `validated` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescription_number` (`prescription_number`),
  KEY `fk_prescriptions_patient` (`patient_id`),
  KEY `fk_prescriptions_consultation` (`consultation_id`),
  KEY `idx_prescription_date` (`prescription_date`),
  CONSTRAINT `fk_prescriptions_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prescriptions_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,'ORD-2024-0089',1,1,'Dr N. BELBACHIR OULD HENNIA','2024-10-14','3 mois',0,'Bien rincer la bouche à l\'eau après inhalation. Revoir si besoin.',1,'2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,'ORD-2024-0090',NULL,2,'Dr N. BELBACHIR OULD HENNIA','2024-10-18','6 mois',1,'Bilan sanguin de contrôle (créatininémie, HbA1c) à réaliser dans 3 mois.',1,'2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `default_duration` varchar(30) DEFAULT '20 min',
  `slot_interval` varchar(30) DEFAULT '15 min',
  `sms_reminders` tinyint(1) DEFAULT 1,
  `email_reminders` tinyint(1) DEFAULT 1,
  `reminder_hours_before` int(11) DEFAULT 24,
  `auto_backup` tinyint(1) DEFAULT 1,
  `backup_frequency` varchar(100) DEFAULT 'Quotidienne (23:00)',
  `session_timeout_minutes` int(11) DEFAULT 30,
  `two_factor_auth` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'20 min','15 min',1,1,24,1,'Quotidienne (23:00)',30,1,'2026-10-22 08:29:34');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_users`
--

DROP TABLE IF EXISTS `staff_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(100) NOT NULL,
  `type` enum('doctor','secretary','admin') NOT NULL DEFAULT 'secretary',
  `status` enum('Actif','Inactif','Suspendu') NOT NULL DEFAULT 'Actif',
  `access_level` varchar(150) DEFAULT NULL,
  `permission_agenda` varchar(100) DEFAULT 'Plein accès',
  `permission_medical_records` varchar(100) DEFAULT 'Restreint',
  `permission_prescriptions` varchar(100) DEFAULT 'Aucun accès',
  `permission_billing` varchar(100) DEFAULT 'Enregistrement des règlements',
  `permission_settings` varchar(100) DEFAULT 'Lecture seule',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_users`
--

LOCK TABLES `staff_users` WRITE;
/*!40000 ALTER TABLE `staff_users` DISABLE KEYS */;
INSERT INTO `staff_users` VALUES (1,'Dr N. BELBACHIR OULD HENNIA','dr.belbachir@cabinet-medical.dz','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','01 42 68 50 10','Médecin Spécialiste Titulaire','doctor','Actif','Administrateur & Accès Médical Complet','Plein accès','Plein accès (Secret médical)','Édition et signature numérique','Plein accès','Plein accès',NULL,'2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,'Sophie Vasseur','accueil@cabinet-saint-honore.fr','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','01 42 68 50 11','Secrétaire Médicale','secretary','Actif','Accueil & Gestion Administrative','Création, modification, annulation','Restreint (Coordonnées administratives uniquement)','Aucun accès (Interdit par défaut)','Enregistrement des règlements','Lecture seule',NULL,'2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `staff_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ultrasound_reports`
--

DROP TABLE IF EXISTS `ultrasound_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ultrasound_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_number` varchar(50) NOT NULL,
  `consultation_id` int(11) DEFAULT NULL,
  `patient_id` int(11) NOT NULL,
  `exam_type` enum('ob1','ob2','ob3','gyn','ggt1','ggt23') NOT NULL,
  `exam_date` date NOT NULL,
  `indication` varchar(255) DEFAULT NULL,
  `ddr` date DEFAULT NULL,
  `terme_sa` varchar(50) DEFAULT NULL,
  `pregnancy_type` varchar(100) DEFAULT 'Unique',
  `bip_mm` decimal(5,2) DEFAULT NULL COMMENT 'Diamètre bipariétal (mm)',
  `pc_mm` decimal(5,2) DEFAULT NULL COMMENT 'Périmètre crânien (mm)',
  `ca_mm` decimal(5,2) DEFAULT NULL COMMENT 'Circonférence abdominale (mm)',
  `lf_mm` decimal(5,2) DEFAULT NULL COMMENT 'Longueur fémorale (mm)',
  `lcc_mm` decimal(5,2) DEFAULT NULL COMMENT 'Longueur cranio-caudale (mm)',
  `cn_mm` decimal(4,2) DEFAULT NULL COMMENT 'Clarté nucale (mm)',
  `cervelet_mm` decimal(5,2) DEFAULT NULL,
  `epf_hadlock_g` int(11) DEFAULT NULL COMMENT 'Estimation poids fœtal Hadlock (g)',
  `morphology_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Organes, cerveau, 4 cavités, membres, placenta' CHECK (json_valid(`morphology_details`)),
  `doppler_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Artères utérines, ombilicale, ACM' CHECK (json_valid(`doppler_details`)),
  `gynecology_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Utérus, endomètre, ovaires D/G, Douglas' CHECK (json_valid(`gynecology_details`)),
  `findings` text DEFAULT NULL,
  `conclusion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_number` (`report_number`),
  KEY `fk_echo_consultation` (`consultation_id`),
  KEY `fk_echo_patient` (`patient_id`),
  CONSTRAINT `fk_echo_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_echo_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ultrasound_reports`
--

LOCK TABLES `ultrasound_reports` WRITE;
/*!40000 ALTER TABLE `ultrasound_reports` DISABLE KEYS */;
INSERT INTO `ultrasound_reports` VALUES (1,'ECHO-2024-0042',1,1,'ob2','2024-10-14','Échographie morphologique du 2ème trimestre','2024-05-15','22 SA + 0 j','Unique',54.00,200.00,175.00,38.00,NULL,NULL,23.00,495,NULL,NULL,NULL,'Morphologie fœtale normale : pôle céphalique bien visualisé, 4 cavités cardiaques symétriques, estomac et vessie visualisés, membres intègres, rachis sans anomalie. Placenta postérieur non praevia. Quantité normale de liquide amniotique.','Grossesse intra-utérine évolutive de 22 SA. Fœtus unique sans signe d\'appel morphologique ce jour. Biométrie au 50ème percentile.','2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `ultrasound_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_monthly_revenue`
--

DROP TABLE IF EXISTS `v_monthly_revenue`;
/*!50001 DROP VIEW IF EXISTS `v_monthly_revenue`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_monthly_revenue` AS SELECT
 1 AS `month`,
  1 AS `method`,
  1 AS `transaction_count`,
  1 AS `total_collected` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_patient_summary`
--

DROP TABLE IF EXISTS `v_patient_summary`;
/*!50001 DROP VIEW IF EXISTS `v_patient_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_patient_summary` AS SELECT
 1 AS `id`,
  1 AS `file_number`,
  1 AS `full_name`,
  1 AS `gender`,
  1 AS `dob`,
  1 AS `age`,
  1 AS `phone`,
  1 AS `email`,
  1 AS `secu_number`,
  1 AS `blood_group`,
  1 AS `status`,
  1 AS `total_consultations`,
  1 AS `total_prescriptions`,
  1 AS `total_invoices`,
  1 AS `total_billed`,
  1 AS `total_outstanding` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_today_appointments`
--

DROP TABLE IF EXISTS `v_today_appointments`;
/*!50001 DROP VIEW IF EXISTS `v_today_appointments`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_today_appointments` AS SELECT
 1 AS `appointment_id`,
  1 AS `appointment_date`,
  1 AS `appointment_time`,
  1 AS `duration`,
  1 AS `reason`,
  1 AS `appointment_status`,
  1 AS `patient_id`,
  1 AS `file_number`,
  1 AS `patient_name`,
  1 AS `phone`,
  1 AS `gender`,
  1 AS `age` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `waiting_room`
--

DROP TABLE IF EXISTS `waiting_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `waiting_room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `arrival_time` time NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `wait_time_minutes` int(11) DEFAULT 0,
  `status` enum('En attente','Appelé','En consultation','Terminé') NOT NULL DEFAULT 'En attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_waiting_patient` (`patient_id`),
  KEY `fk_waiting_appointment` (`appointment_id`),
  CONSTRAINT `fk_waiting_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_waiting_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiting_room`
--

LOCK TABLES `waiting_room` WRITE;
/*!40000 ALTER TABLE `waiting_room` DISABLE KEYS */;
INSERT INTO `waiting_room` VALUES (1,3,3,'10:15:00','10:05:00','Céphalées et fatigue persistante',10,'En attente','2026-10-22 08:29:34','2026-10-22 08:29:34'),(2,2,2,'09:30:00','09:25:00','Bilan trimestriel HTA',35,'En consultation','2026-10-22 08:29:34','2026-10-22 08:29:34');
/*!40000 ALTER TABLE `waiting_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'medcine_solution_db'
--

--
-- Views structure
--

--
-- Final view structure for view `v_monthly_revenue`
--

/*!50001 DROP VIEW IF EXISTS `v_monthly_revenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
CREATE OR REPLACE VIEW `v_monthly_revenue` AS select date_format(`payments`.`payment_date`,'%Y-%m') AS `month`,`payments`.`method` AS `method`,count(0) AS `transaction_count`,sum(`payments`.`amount`) AS `total_collected` from `payments` where `payments`.`status` = 'Encaissé' group by date_format(`payments`.`payment_date`,'%Y-%m'),`payments`.`method`;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_patient_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_patient_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
CREATE OR REPLACE VIEW `v_patient_summary` AS select `p`.`id` AS `id`,`p`.`file_number` AS `file_number`,concat(`p`.`first_name`,' ',`p`.`last_name`) AS `full_name`,`p`.`gender` AS `gender`,`p`.`dob` AS `dob`,`p`.`age` AS `age`,`p`.`phone` AS `phone`,`p`.`email` AS `email`,`p`.`secu_number` AS `secu_number`,`p`.`blood_group` AS `blood_group`,`p`.`status` AS `status`,count(distinct `c`.`id`) AS `total_consultations`,count(distinct `pr`.`id`) AS `total_prescriptions`,count(distinct `i`.`id`) AS `total_invoices`,coalesce(sum(`i`.`amount`),0) AS `total_billed`,coalesce(sum(`i`.`patient_remaining`),0) AS `total_outstanding` from (((`patients` `p` left join `consultations` `c` on(`c`.`patient_id` = `p`.`id`)) left join `prescriptions` `pr` on(`pr`.`patient_id` = `p`.`id`)) left join `invoices` `i` on(`i`.`patient_id` = `p`.`id`)) group by `p`.`id`;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_today_appointments`
--

/*!50001 DROP VIEW IF EXISTS `v_today_appointments`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
CREATE OR REPLACE VIEW `v_today_appointments` AS select `a`.`id` AS `appointment_id`,`a`.`appointment_date` AS `appointment_date`,`a`.`appointment_time` AS `appointment_time`,`a`.`duration` AS `duration`,`a`.`reason` AS `reason`,`a`.`status` AS `appointment_status`,`p`.`id` AS `patient_id`,`p`.`file_number` AS `file_number`,concat(`p`.`first_name`,' ',`p`.`last_name`) AS `patient_name`,`p`.`phone` AS `phone`,`p`.`gender` AS `gender`,`p`.`age` AS `age` from (`appointments` `a` join `patients` `p` on(`p`.`id` = `a`.`patient_id`)) where `a`.`appointment_date` = curdate() order by `a`.`appointment_time`;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 16:15:38

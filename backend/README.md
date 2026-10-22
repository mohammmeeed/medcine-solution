# Backend PHP - Medcine Solution

Backend REST API développé en PHP avec PDO pour gérer les données médicales du cabinet (patients, consultations, ordonnances, salle d'attente, rendez-vous) connectées à MySQL.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **PHP** 7.4+ ou 8.x avec extension `pdo_mysql` activée (ex: XAMPP).
- **MySQL / MariaDB** démarré sur le port `3306`.
- Base de données **`medcine_solution_db`** (importée depuis `database/medcine_solution_db.sql`).

### 2. Lancer le serveur backend PHP
Ouvrez un terminal ou double-cliquez sur `run-backend.bat` à la racine :
```bash
php -S 127.0.0.1:8000 -t backend
```
L'API est alors accessible sur : `http://127.0.0.1:8000/`

---

## 🗄️ Configuration Base de Données

Le fichier de configuration se trouve dans [`backend/config/database.php`](config/database.php) :
- **Hôte** : `127.0.0.1` (port 3306)
- **Base** : `medcine_solution_db`
- **Utilisateur** : `root`
- **Mot de passe** : `""` (vide par défaut sous XAMPP)
- **Encodage** : `utf8mb4`
- **CORS** : Entêtes activés pour autoriser les requêtes depuis React (`http://localhost:5173` ou `http://localhost:3000`).

---

## 📡 Endpoints de l'API

### 1. État et Diagnostic
- **`GET /`** ou **`GET /index.php`**
  - Vérifie la connexion MySQL et liste les 22 tables détectées.

### 2. Consultations & Examens
- **`GET /api/consultations.php`**
  - Retourne la liste de toutes les consultations avec les constantes, examens, ordonnance liée et compte-rendu échographique.
  - Paramètres optionnels : `?id=1` ou `?patient_id=1`.
- **`POST /api/consultations.php`**
  - Enregistre une nouvelle consultation, son ordonnance médicale et ses mesures échographiques dans les tables MySQL correspondantes (`consultations`, `prescriptions`, `prescription_items`, `ultrasound_reports`).
- **`PUT /api/consultations.php`**
  - Met à jour le diagnostic, recommandations ou statut d'une consultation.

### 3. Patients
- **`GET /api/patients.php`**
  - Liste les patients avec leurs antécédents, allergies, maladies chroniques et traitements réguliers.
  - Recherche : `?search=Dubois` ou par ID : `?id=1`.
- **`POST /api/patients.php`**
  - Ajoute un nouveau dossier patient.
- **`PUT /api/patients.php`**
  - Met à jour les informations du patient.

### 4. Ordonnances Médicales
- **`GET /api/prescriptions.php`**
  - Liste toutes les ordonnances avec le détail de chaque médicament prescrit (posologie, dosage, durée, renouvellement).
  - Filtrage : `?patient_id=1` ou `?id=1`.
- **`POST /api/prescriptions.php`**
  - Crée une ordonnance avec validation du médecin.

### 5. Salle d'Attente
- **`GET /api/waiting_room.php`**
  - Liste les patients du jour en salle d'attente (En attente, En consultation, Terminé).
- **`PUT /api/waiting_room.php`**
  - Met à jour le statut du patient en temps réel (`En consultation`, `Terminé`, `Annulé`).

### 6. Rendez-vous
- **`GET /api/appointments.php`**
  - Liste les rendez-vous du planning médical (par date : `?date=2026-10-21`).
- **`POST /api/appointments.php`**
  - Planifie un nouveau rendez-vous.

---

## 📂 Structure des Fichiers

```
medcine-solution/
├── backend/
│   ├── config/
│   │   └── database.php         # Connexion PDO MySQL & En-têtes CORS
│   ├── api/
│   │   ├── consultations.php    # CRUD Consultations & Transactions MySQL
│   │   ├── patients.php         # Gestion des patients & antécédents
│   │   ├── prescriptions.php     # Ordonnances & médicaments
│   │   ├── waiting_room.php     # File d'attente du jour
│   │   └── appointments.php     # Rendez-vous de l'agenda
│   ├── index.php                # Page d'accueil & Santé de l'API
│   └── README.md
├── admin/
│   └── src/
│       └── services/
│           └── ApiService.js    # Client Axios connecté au backend PHP
└── run-backend.bat              # Script de démarrage en 1-clic
```

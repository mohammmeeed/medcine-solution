# Base de Données MySQL - medcine-solution

Base de données relationnelle MySQL créée pour la gestion intégrale du Cabinet Médical du Dr N. BELBACHIR OULD HENNIA (Gynécologie Obstétrique & Échographie).

---

## 📌 Informations de Connexion

| Paramètre | Valeur |
|---|---|
| **SGBD** | MySQL / MariaDB (XAMPP) |
| **Hôte** | `localhost` ou `127.0.0.1` |
| **Port** | `3306` |
| **Nom de la base** | `medcine_solution_db` |
| **Encodage** | `utf8mb4` / `utf8mb4_unicode_ci` |
| **Utilisateur par défaut** | `root` |
| **Mot de passe** | *(vide par défaut)* |

---

## 🗄️ Structure des Tables (19 Tables & 3 Vues)

### 1. Cabinet & Équipe
- **`cabinet_info`** : Coordonnées officielles, spécialité, numéros d'identification (RPPS, ADELI, SIRET, Ordre), horaires et mentions légales.
- **`staff_users`** : Comptes du personnel (Médecin titulaire, Secrétaire médicale, Administrateur) avec gestion des rôles et permissions fines.

### 2. Dossiers Patients & Antécédents
- **`patients`** : Données d'état civil, numéro de dossier (`DOS-2024-XXX`), contact, groupe sanguin, statut, antécédents obstétricaux (Grossesses, Parité, Fausses couches, Césariennes, Enfants vivants).
- **`patient_allergies`** : Liste des allergies connues et niveau de sévérité.
- **`patient_chronic_diseases`** : Pathologies chroniques et antécédents médicaux.
- **`patient_regular_treatments`** : Traitements de fond et posologies habituelles.

### 3. Agenda & Flux Patients
- **`appointments`** : Rendez-vous avec date, heure, durée, motif, statut (Confirmé, Arrivé, En consultation, Terminé, etc.) et notes.
- **`waiting_room`** : Gestion de la salle d'attente en direct (heure d'arrivée, temps d'attente calculé, statut).

### 4. Consultations & Échographies
- **`consultations`** : Historique des consultations médicales, symptômes, examen clinique, biométrie, diagnostic et recommandations.
- **`ultrasound_reports`** : Comptes rendus spécialisés d'échographie (OB1, OB2, OB3, GYN, GG) avec mesures complètes (BIP, PC, CA, LF, LCC, CN, Hadlock EPF), morphologie et dopplers.

### 5. Prescriptions & Constantes
- **`prescriptions`** : Ordonnances horodatées, validité, statut ALD, signature et validation.
- **`prescription_items`** : Détail des médicaments prescrits (dosage, posologie, durée, renouvellement).
- **`clinical_examinations`** : Suivi des constantes vitales (Tension artérielle systolique/diastolique, pouls, température, poids, taille, IMC, SpO2, glycémie).

### 6. Documents & Facturation
- **`medical_documents`** : Fichiers PDF, radios, bilans d'analyses, certificats médicaux et comptes rendus externes.
- **`invoices`** : Factures d'honoraires, part CNAS/AMO, part mutuelle/AMC, reste à charge patient et mode de règlement.
- **`payments`** : Reçus d'encaissement de caisse, montants perçus, mode et opérateur.

### 7. Sécurité & Paramètres
- **`audit_logs`** : Journal d'audit complet assurant la traçabilité des accès aux dossiers médicaux et la conformité déontologique/RGPD.
- **`notifications`** : Alertes internes du cabinet (arrivées en salle d'attente, bilans reçus, rappels).
- **`settings`** : Préférences du cabinet (durée par défaut des RDV, rappels SMS/Email, sauvegarde automatique, double authentification).

### 8. Vues Prêtes à l'Emploi
- **`v_patient_summary`** : Vue consolidée par patient avec nombre de consultations, ordonnances, facturation et impayés.
- **`v_today_appointments`** : Liste chronologique des rendez-vous du jour avec détails patients.
- **`v_monthly_revenue`** : Total des encaissements par mois et par méthode de paiement.

---

## 🚀 Réimportation / Déploiement

Pour réimporter ou déployer la base sur un autre serveur MySQL :

```bash
mysql -u root -p medcine_solution_db < database/medcine_solution.sql
```

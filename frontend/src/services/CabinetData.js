// Store et Données partagées pour le Cabinet Médical du Dr N. BELBACHIR OULD HENNIA
// Spécialiste en Gynécologie Obstétrique & Échographie

export const initialDoctor = {
  name: "Dr N. BELBACHIR OULD HENNIA",
  nameAr: "الدكتورة ن. بلبشير ولد هنية",
  title: "Médecin Spécialiste en Gynécologie Obstétrique",
  titleAr: "طبيبة مختصة في أمراض النساء والتوليد",
  subSpecialty: "Échographie",
  specialty: "Gynécologie Obstétrique & Échographie",
  rpps: "10104892341",
  adeli: "751293842",
  siret: "482 918 274 00018",
  email: "dr.belbachir@cabinet-medical.dz",
  phone: "0560 06 74 66",
  phoneMobile: "0560 06 74 66",
  address: "Haï Essedikia, Avenue Seghier Benali, Oran",
  convention: "Secteur Conventionné",
  orderNumber: "31/24891",
  hours: "Sam - Jeu: 09:00 - 18:00 | Ven: Fermé",
};

export const initialStaff = [
  {
    id: 1,
    name: "Dr N. BELBACHIR OULD HENNIA",
    role: "Médecin Spécialiste Titulaire",
    type: "doctor",
    email: "dr.belbachir@cabinet-medical.dz",
    phone: "041 53 97 82",
    status: "Actif",
    access: "Administrateur & Accès Médical Complet",
    permissions: {
      agenda: "Plein accès",
      medicalRecords: "Plein accès (Secret médical)",
      prescriptions: "Édition et signature numérique",
      billing: "Plein accès",
      settings: "Plein accès",
    },
  },
  {
    id: 2,
    name: "Sophie Vasseur",
    role: "Secrétaire Médicale",
    type: "secretary",
    email: "accueil@cabinet-saint-honore.fr",
    phone: "01 42 68 50 11",
    status: "Actif",
    access: "Accueil & Gestion Administrative",
    permissions: {
      agenda: "Création, modification, annulation",
      medicalRecords: "Restreint (Coordonnées administratives uniquement)",
      prescriptions: "Aucun accès (Interdit par défaut)",
      billing: "Enregistrement des règlements",
      settings: "Lecture seule",
    },
  },
];

export const initialPatients = [];

// Calcul automatique des dates de la semaine courante (Lundi à Dimanche)
const _calcWeekDates = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};
const _wd = _calcWeekDates();

export const initialAppointments = [];

export const initialWaitingRoom = [];

export const initialConsultations = [];

export const initialPrescriptions = [];

export const initialExaminations = [];

export const initialDocuments = [];

export const initialInvoices = [];

export const initialPayments = [];

export const initialAuditLogs = [];

export const initialNotifications = [];

export const initialMedications = [
  {
    id: 1,
    name: "AMOXICILLINE 1g",
    dosage: "1g",
    form: "Comprimé dispersible",
    defaultPosology: "1 comprimé matin et soir",
    defaultDuration: "7 jours",
    category: "Antibiotique",
  },
  {
    id: 2,
    name: "AUGMENTIN 1g/125mg",
    dosage: "1g",
    form: "Comprimé pelliculé",
    defaultPosology: "1 comprimé matin et soir au cours du repas",
    defaultDuration: "7 jours",
    category: "Antibiotique",
  },
  {
    id: 3,
    name: "PARACÉTAMOL 1000 mg",
    dosage: "1000 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé toutes les 6 heures si douleur/fièvre (max 3g/j)",
    defaultDuration: "5 jours",
    category: "Antalgique",
  },
  {
    id: 4,
    name: "SPASFON 80mg",
    dosage: "80 mg",
    form: "Lyoc",
    defaultPosology: "2 lyocs au moment des douleurs, à renouveler si besoin",
    defaultDuration: "5 jours",
    category: "Antispasmodique",
  },
  {
    id: 5,
    name: "INUVAIR 100 µg/6 µg",
    dosage: "100/6 µg",
    form: "Solution pour inhalation",
    defaultPosology: "2 inhalations matin et soir",
    defaultDuration: "1 mois",
    category: "Pneumologie",
  },
  {
    id: 6,
    name: "VENTOLINE 100 µg",
    dosage: "100 µg",
    form: "Aérosol-doseur",
    defaultPosology: "1 à 2 bouffées en cas de gêne respiratoire",
    defaultDuration: "Selon besoin",
    category: "Pneumologie",
  },
  {
    id: 7,
    name: "AMLODIPINE 5 mg",
    dosage: "5 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé le matin",
    defaultDuration: "3 mois",
    category: "Cardiologie",
  },
  {
    id: 8,
    name: "METFORMINE 1000 mg",
    dosage: "1000 mg",
    form: "Comprimé pelliculé",
    defaultPosology: "1 comprimé au milieu des 2 principaux repas",
    defaultDuration: "3 mois",
    category: "Diabétologie",
  },
  {
    id: 9,
    name: "KARDEGIC 75 mg",
    dosage: "75 mg",
    form: "Sachet",
    defaultPosology: "1 sachet par jour au milieu d'un repas",
    defaultDuration: "3 mois",
    category: "Cardiologie",
  },
  {
    id: 10,
    name: "OMÉPRAZOLE 20 mg",
    dosage: "20 mg",
    form: "Gélule",
    defaultPosology: "1 gélule le matin à jeun",
    defaultDuration: "1 mois",
    category: "Gastro-entérologie",
  },
  {
    id: 11,
    name: "ACIDE FOLIQUE 5 mg",
    dosage: "5 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé par jour",
    defaultDuration: "1 mois",
    category: "Gynécologie",
  },
  {
    id: 12,
    name: "TARDYFERON B9",
    dosage: "50 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé par jour avant le repas",
    defaultDuration: "1 mois",
    category: "Hématologie",
  },
  {
    id: 13,
    name: "GYNO-PEVARYL 150 mg",
    dosage: "150 mg",
    form: "Ovule",
    defaultPosology: "1 ovule au coucher pendant 3 jours",
    defaultDuration: "3 jours",
    category: "Gynécologie",
  },
  {
    id: 14,
    name: "FLAGYL 500 mg",
    dosage: "500 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé matin et soir pendant les repas",
    defaultDuration: "7 jours",
    category: "Anti-infectieux",
  },
  {
    id: 15,
    name: "AZITHROMYCINE 500 mg",
    dosage: "500 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé par jour pendant 3 jours",
    defaultDuration: "3 jours",
    category: "Antibiotique",
  },
  {
    id: 16,
    name: "CEFIXIME 200 mg",
    dosage: "200 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé matin et soir",
    defaultDuration: "8 jours",
    category: "Antibiotique",
  },
  {
    id: 17,
    name: "IBUPROFÈNE 400 mg",
    dosage: "400 mg",
    form: "Comprimé",
    defaultPosology: "1 comprimé au cours du repas, max 3 par jour",
    defaultDuration: "5 jours",
    category: "Anti-inflammatoire",
  },
];



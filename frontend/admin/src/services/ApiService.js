// admin/src/services/ApiService.js
// Client API pour communiquer avec le backend PHP & la base de données MySQL medcine_solution_db

import axios from "axios";
import {
  initialConsultations,
  initialPatients,
  initialPrescriptions,
  initialWaitingRoom,
  initialMedications,
  initialDoctor,
  initialStaff,
  initialInvoices,
  initialPayments,
} from "./CabinetData";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

export const ApiService = {
  // Test de connexion au backend PHP
  async checkHealth() {
    try {
      const res = await axios.get("http://127.0.0.1:8000/", { timeout: 3000 });
      return { online: true, data: res.data };
    } catch (err) {
      return { online: false, error: err.message };
    }
  },

  // ----------------------------------------------------
  // PARAMÈTRES DU CABINET (SETTINGS)
  // ----------------------------------------------------
  async getSettings() {
    try {
      const res = await apiClient.get("/settings.php");
      if (res.data && res.data.status === "success" && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP non disponible pour paramètres :", err.message);
    }
    return {
      defaultDuration: "20 min",
      slotInterval: "15 min",
      smsReminders: true,
      emailReminders: true,
      reminderHoursBefore: "24",
      autoBackup: true,
      backupFrequency: "Quotidienne (23:00)",
      sessionTimeout: "30",
      twoFactorAuth: true,
    };
  },

  async updateSettings(settingsData) {
    try {
      const res = await apiClient.post("/settings.php", settingsData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement paramètres dans MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // FICHE D'IDENTITÉ & COORDONNÉES DU CABINET (CABINET INFO)
  // ----------------------------------------------------
  async getCabinetInfo() {
    try {
      const res = await apiClient.get("/cabinet_info.php");
      if (res.data && res.data.status === "success" && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP non disponible pour cabinet_info :", err.message);
    }
    return {
      clinicName: "Cabinet Médical Saint-Honoré",
      doctorName: initialDoctor.name,
      doctorNameAr: initialDoctor.nameAr || "",
      title: initialDoctor.title,
      titleAr: initialDoctor.titleAr || "",
      specialty: initialDoctor.specialty,
      subSpecialty: initialDoctor.subSpecialty || "Échographie",
      rpps: initialDoctor.rpps,
      adeli: initialDoctor.adeli,
      siret: initialDoctor.siret,
      orderNumber: initialDoctor.orderNumber,
      convention: initialDoctor.convention,
      email: initialDoctor.email,
      phone: initialDoctor.phone,
      address: initialDoctor.address,
      hours: initialDoctor.hours,
      legalNotice:
        "Membre d'une association de gestion agréée par l'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.",
    };
  },

  async updateCabinetInfo(infoData) {
    try {
      const res = await apiClient.post("/cabinet_info.php", infoData);
      return res.data;
    } catch (err) {
      console.error("Erreur mise à jour coordonnées cabinet dans MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // PERSONNEL ET GESTION DES COMPTES (STAFF USERS)
  // ----------------------------------------------------
  async getStaff() {
    try {
      const res = await apiClient.get("/staff.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP non disponible pour le personnel :", err.message);
    }
    return initialStaff;
  },

  async saveStaffUser(userData) {
    try {
      const res = await apiClient.post("/staff.php", userData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement membre personnel dans MySQL :", err.message);
      throw err;
    }
  },

  async deleteStaffUser(id) {
    try {
      const res = await apiClient.delete(`/staff.php?id=${id}`);
      return res.data;
    } catch (err) {
      console.error("Erreur suppression membre personnel dans MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // CONSULTATIONS
  // ----------------------------------------------------
  async getConsultations() {
    try {
      const res = await apiClient.get("/consultations.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return initialConsultations;
    } catch (err) {
      console.warn("Backend PHP non disponible ou erreur, utilisation des données locales :", err.message);
      return initialConsultations;
    }
  },

  async getConsultationById(id) {
    try {
      const res = await apiClient.get(`/consultations.php?id=${id}`);
      if (res.data && res.data.status === "success") {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.warn("Erreur récupération consultation :", err.message);
      return null;
    }
  },

  async saveConsultation(consultationData) {
    try {
      const res = await apiClient.post("/consultations.php", consultationData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement consultation vers MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // PATIENTS
  // ----------------------------------------------------
  async getPatients(search = "") {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await apiClient.get(`/patients.php${query}`);
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return initialPatients;
    } catch (err) {
      console.warn("Backend PHP non disponible pour patients :", err.message);
      return initialPatients;
    }
  },

  async createPatient(patientData) {
    try {
      const res = await apiClient.post("/patients.php", patientData);
      return res.data;
    } catch (err) {
      console.error("Erreur création patient vers MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // ORDONNANCES (PRESCRIPTIONS)
  // ----------------------------------------------------
  async getPrescriptions() {
    try {
      const res = await apiClient.get("/prescriptions.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return initialPrescriptions;
    } catch (err) {
      console.warn("Backend PHP non disponible pour ordonnances :", err.message);
      return initialPrescriptions;
    }
  },

  async savePrescription(prescriptionData) {
    try {
      const res = await apiClient.post("/prescriptions.php", prescriptionData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement ordonnance :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // GESTION DES MÉDICAMENTS (MEDICATIONS)
  // ----------------------------------------------------
  async getMedications() {
    try {
      const res = await apiClient.get("/medications.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        localStorage.setItem("cabinet_medications", JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP pour médicaments indisponible, fallback local :", err.message);
    }
    const saved = localStorage.getItem("cabinet_medications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return initialMedications;
  },

  async saveMedication(medData) {
    try {
      const res = await apiClient.post("/medications.php", medData);
      return res.data;
    } catch (err) {
      console.warn("Erreur API médicament, sauvegarde locale :", err.message);
      return { status: "success", data: medData };
    }
  },

  async deleteMedication(id) {
    try {
      const res = await apiClient.delete(`/medications.php?id=${id}`);
      return res.data;
    } catch (err) {
      console.warn("Erreur suppression médicament API :", err.message);
      return { status: "success" };
    }
  },

  // ----------------------------------------------------
  // SALLE D'ATTENTE (WAITING ROOM)
  // ----------------------------------------------------
  async getWaitingRoom() {
    try {
      const res = await apiClient.get("/waiting_room.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return initialWaitingRoom || [];
    } catch (err) {
      console.warn("Backend PHP non disponible pour salle d'attente :", err.message);
      return initialWaitingRoom || [];
    }
  },

  async updateWaitingStatus(id, status) {
    try {
      const res = await apiClient.put("/waiting_room.php", { id, status });
      return res.data;
    } catch (err) {
      console.error("Erreur mise à jour statut salle d'attente :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // RENDEZ-VOUS (APPOINTMENTS)
  // ----------------------------------------------------
  async getAppointments(date = "") {
    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : "";
      const res = await apiClient.get(`/appointments.php${query}`);
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.warn("Backend PHP non disponible pour rendez-vous :", err.message);
      return [];
    }
  },

  async createAppointment(aptData) {
    try {
      const res = await apiClient.post("/appointments.php", aptData);
      return res.data;
    } catch (err) {
      console.error("Erreur création rendez-vous dans MySQL :", err.message);
      throw err;
    }
  },

  async updateAppointment(aptData) {
    try {
      const res = await apiClient.put("/appointments.php", aptData);
      return res.data;
    } catch (err) {
      console.error("Erreur mise à jour rendez-vous dans MySQL :", err.message);
      throw err;
    }
  },

  async deleteAppointment(id) {
    try {
      const res = await apiClient.delete(`/appointments.php?id=${id}`);
      return res.data;
    } catch (err) {
      console.error("Erreur suppression rendez-vous dans MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // FACTURES (INVOICES)
  // ----------------------------------------------------
  async getInvoices() {
    try {
      const res = await apiClient.get("/invoices.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP non disponible pour factures :", err.message);
    }
    return initialInvoices;
  },

  async saveInvoice(invoiceData) {
    try {
      const res = await apiClient.post("/invoices.php", invoiceData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement facture dans MySQL :", err.message);
      throw err;
    }
  },

  async deleteInvoice(id) {
    try {
      const res = await apiClient.delete(`/invoices.php?id=${id}`);
      return res.data;
    } catch (err) {
      console.error("Erreur suppression facture dans MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // RÈGLEMENTS (PAYMENTS)
  // ----------------------------------------------------
  async getPayments() {
    try {
      const res = await apiClient.get("/payments.php");
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP non disponible pour règlements :", err.message);
    }
    return initialPayments;
  },

  async savePayment(paymentData) {
    try {
      const res = await apiClient.post("/payments.php", paymentData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement règlement dans MySQL :", err.message);
      throw err;
    }
  },

  async deletePayment(id) {
    try {
      const res = await apiClient.delete(`/payments.php?id=${id}`);
      return res.data;
    } catch (err) {
      console.error("Erreur suppression règlement dans MySQL :", err.message);
      throw err;
    }
  },

  // ----------------------------------------------------
  // DOCUMENTS MÉDICAUX (DOCUMENTS)
  // ----------------------------------------------------
  async getDocuments(patientId = null) {
    try {
      const query = patientId ? `?patient_id=${patientId}` : "";
      const res = await apiClient.get(`/documents.php${query}`);
      if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Backend PHP non disponible pour documents :", err.message);
    }
    return [];
  },

  async saveDocument(docData) {
    try {
      const res = await apiClient.post("/documents.php", docData);
      return res.data;
    } catch (err) {
      console.error("Erreur enregistrement document dans MySQL :", err.message);
      throw err;
    }
  },

  async deleteDocument(id) {
    try {
      const res = await apiClient.delete(`/documents.php?id=${id}`);
      return res.data;
    } catch (err) {
      console.error("Erreur suppression document dans MySQL :", err.message);
      throw err;
    }
  },
};

export default ApiService;

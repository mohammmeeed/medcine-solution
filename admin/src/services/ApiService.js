// admin/src/services/ApiService.js
// Client API pour communiquer avec le backend PHP & la base de données MySQL medcine_solution_db

import axios from "axios";
import {
  initialConsultations,
  initialPatients,
  initialPrescriptions,
  initialWaitingRoom,
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
};

export default ApiService;

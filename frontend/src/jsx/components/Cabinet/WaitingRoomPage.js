import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import ApiService from "../../../services/ApiService";
import {
  initialWaitingRoom,
  initialPatients,
} from "../../../services/CabinetData";

// Créneaux horaires officiels pour calcul du ticket réservé
const ALL_DAY_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const calculateTicketNumber = (timeStr) => {
  if (!timeStr) return 1;
  const normalized = timeStr.trim().substring(0, 5).padStart(5, "0");
  const idx = ALL_DAY_SLOTS.indexOf(normalized);
  if (idx !== -1) return idx + 1;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 1;
  const totalMin = h * 60 + m;
  const startMin = 9 * 60; // 09:00
  const diff = totalMin - startMin;
  if (diff < 0) return 1;
  return Math.floor(diff / 30) + 1;
};

const WaitingRoomPage = () => {
  const navigate = useNavigate();
  const [waitingList, setWaitingList] = useState(() => {
    try {
      const saved = localStorage.getItem("cabinet_waiting_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p) => p.patientName !== "Sophie Bernard" && p.patientName !== "Marc Lemoine"
          );
        }
      }
    } catch (e) {}
    return [];
  });
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArrival, setNewArrival] = useState({
    patientId: "",
    appointmentTime: "11:30",
    reason: "Consultation générale",
  });

  const broadcastWaitingList = (list) => {
    try {
      localStorage.setItem("cabinet_waiting_list", JSON.stringify(list));
      const channel = new BroadcastChannel("waiting_room_display_channel");
      channel.postMessage({ type: "UPDATE_LIST", list });
      channel.close();
    } catch (e) {}
  };

  useEffect(() => {
    // 1. Synchroniser depuis MySQL API uniquement (données réelles)
    const loadWaitingFromApi = async () => {
      try {
        const data = await ApiService.getWaitingRoom();
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (p) => p.patientName !== "Sophie Bernard" && p.patientName !== "Marc Lemoine"
          );
          setWaitingList(filtered);
          localStorage.setItem("cabinet_waiting_list", JSON.stringify(filtered));
        }
      } catch (err) {
        console.warn("Erreur chargement salle d'attente MySQL :", err);
      }

      try {
        const pData = await ApiService.getPatients();
        const clean = (Array.isArray(pData) ? pData : []).filter((p) => {
          const last = (p.lastName || "").toLowerCase().trim();
          const first = (p.firstName || "").toLowerCase().trim();
          return (
            !["dubois", "lemoine", "bernard", "moreau", "belkacem"].includes(last) &&
            !["claire", "marc", "sophie", "lucas", "yasmine"].includes(first)
          );
        });
        setPatients(clean);
        if (clean.length > 0) {
          setNewArrival((prev) => ({ ...prev, patientId: clean[0].id }));
        }
      } catch (err) {
        console.warn("Erreur chargement patients dans salle d'attente :", err);
      }
    };
    loadWaitingFromApi();

    // 2. Écouter le BroadcastChannel pour les arrivées en direct (ex: depuis l'agenda)
    let channel;
    try {
      channel = new BroadcastChannel("waiting_room_display_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "UPDATE_LIST" && Array.isArray(event.data.list)) {
          setWaitingList(event.data.list);
        }
      };
    } catch (e) {}

    // 3. Écouter les modifications du localStorage (depuis l'agenda dans le même navigateur)
    const handleStorage = (e) => {
      if (e.key === "cabinet_waiting_list" && e.newValue) {
        try {
          setWaitingList(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Polling périodique léger toutes les 10 secondes
    const interval = setInterval(() => {
      loadWaitingFromApi();
    }, 10000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleCallPatient = (patient) => {
    const updated = waitingList.map((p) =>
      p.id === patient.id ? { ...p, status: "Appelé" } : p
    );
    setWaitingList(updated);
    broadcastWaitingList(updated);

    ApiService.updateWaitingStatus(patient.id, "Appelé").catch((e) =>
      console.warn("Erreur mise à jour statut MySQL :", e)
    );

    const ticketNum = patient.ticketNumber || calculateTicketNumber(patient.appointmentTime);
    const callPayload = {
      patientId: patient.patientId || patient.id,
      patientName: patient.patientName,
      ticketNumber: ticketNum,
      appointmentTime: patient.appointmentTime,
      doctorName: "Dr N. BELBACHIR OULD HENNIA",
      room: "Cabinet de Consultation N° 1",
      calledAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem("current_called_patient", JSON.stringify(callPayload));
      const channel = new BroadcastChannel("waiting_room_display_channel");
      channel.postMessage({ type: "CALL_PATIENT", data: callPayload });
      channel.close();
    } catch (e) {}

    Swal.fire({
      icon: "info",
      title: "Patient appelé !",
      text: `${patient.patientName} a été appelé(e) et affiché(e) en grand sur l'écran de la salle d'attente.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleStartConsultation = (patient) => {
    const updated = waitingList.map((p) =>
      p.id === patient.id ? { ...p, status: "En consultation" } : p
    );
    setWaitingList(updated);
    broadcastWaitingList(updated);

    ApiService.updateWaitingStatus(patient.id, "En consultation").catch((e) =>
      console.warn("Erreur mise à jour statut MySQL :", e)
    );

    if (patient.patientId) {
      navigate(`/consultations?patientId=${patient.patientId}`);
    } else {
      navigate(`/consultations?patientName=${encodeURIComponent(patient.patientName)}&appointmentId=${patient.appointmentId || ""}`);
    }
  };

  const handleRemovePatient = (id) => {
    Swal.fire({
      title: "Supprimer de la salle d'attente ?",
      text: "Le patient sera définitivement supprimé de la base de données.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#f72b50",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updated = waitingList.filter((p) => p.id !== id);
        setWaitingList(updated);
        broadcastWaitingList(updated);

        // Suppression directe dans la base de données MySQL
        try {
          await ApiService.deleteWaitingPatient(id);
        } catch (err) {
          console.warn("Erreur suppression patient MySQL :", err);
        }

        Swal.fire({
          icon: "success",
          title: "Supprimé !",
          text: "Le patient a été supprimé de la salle d'attente et de la base de données.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleRegisterArrival = async (e) => {
    e.preventDefault();
    const pat =
      patients.find((p) => p.id === parseInt(newArrival.patientId)) ||
      patients[0];
    if (!pat) {
      Swal.fire("Attention", "Veuillez d'abord enregistrer un patient dans le répertoire.", "warning");
      return;
    }
    const now = new Date();
    const arrivalTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    try {
      const res = await ApiService.createWaitingArrival({
        patientId: pat.id,
        appointmentTime: newArrival.appointmentTime,
        arrivalTime: arrivalTime,
        reason: newArrival.reason,
      });

      const newId = res?.data?.id || Date.now();

      const created = {
        id: newId,
        patientId: pat.id,
        patientName: `${pat.firstName} ${pat.lastName}`,
        fileNumber: pat.fileNumber || `DOS-${pat.id}`,
        appointmentTime: newArrival.appointmentTime,
        arrivalTime: arrivalTime,
        reason: newArrival.reason,
        waitTimeMinutes: 0,
        status: "En attente",
      };

      const updated = [created, ...waitingList];
      setWaitingList(updated);
      broadcastWaitingList(updated);
      setShowAddModal(false);
      Swal.fire({
        icon: "success",
        title: "Arrivée enregistrée",
        text: `${created.patientName} a été ajouté(e) en salle d'attente et sauvegardé(e) dans la base.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.warn("Erreur enregistrement arrivée :", err);
    }
  };

  const waitingCount = waitingList.filter((p) => p.status === "En attente").length;
  const inConsultCount = waitingList.filter((p) => p.status === "En consultation").length;

  return (
    <>
      <PageTitle motherMenu="Principal" activeMenu="Salle d'attente" />

      {/* Barre d'action */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div className="d-flex align-items-center gap-3 text-muted fs-14">
          <span>
            <strong className="text-dark font-w600">{waitingCount}</strong> patient(s) en attente
          </span>
          {inConsultCount > 0 && (
            <span>
              • <strong className="text-primary font-w600">{inConsultCount}</strong> en consultation
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <a
            href="/affichage-salle-attente"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-info btn-rounded"
            title="Ouvrir l'affichage grand écran pour la télévision de la salle d'attente"
          >
            <i className="fa fa-tv me-2"></i> Affichage Salle d'attente
          </a>

          <Button
            variant="primary"
            className="btn-rounded"
            onClick={() => setShowAddModal(true)}
          >
            <i className="flaticon-381-add-1 me-2"></i> Enregistrer une Arrivée
          </Button>
        </div>
      </div>

      {/* Tableau de la Salle d'attente en temps réel */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Patients actuellement au cabinet</h4>
            <p className="text-muted fs-13 mb-0">
              Mise à jour en temps réel pour le cabinet et le secrétariat
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>TICKET</strong></th>
                  <th><strong>ARRIVÉE</strong></th>
                  <th><strong>RDV PRÉVU</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>MOTIF</strong></th>
                  <th><strong>STATUT</strong></th>
                  <th><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {waitingList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="flaticon-381-clock fs-36 d-block mb-2 text-primary"></i>
                      La salle d'attente est actuellement vide.
                    </td>
                  </tr>
                ) : (
                  waitingList.map((p) => (
                    <tr
                      key={p.id}
                      className={p.status === "En consultation" ? "bg-light-primary" : ""}
                    >
                      <td>
                        <span className="badge badge-info light font-w800" style={{ fontSize: "13px" }}>
                          #{p.ticketNumber || calculateTicketNumber(p.appointmentTime)}
                        </span>
                      </td>
                      <td>
                        <span className="font-w600 text-primary">
                          {p.arrivalTime}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">{p.appointmentTime}</span>
                      </td>
                      <td>
                        {p.patientId ? (
                          <Link
                            to={`/patient-details?id=${p.patientId}`}
                            className="font-w600 text-dark hover-primary"
                          >
                            {p.patientName}
                          </Link>
                        ) : (
                          <span className="font-w600 text-dark">
                            {p.patientName}{" "}
                            <span className="badge badge-xs badge-info light ms-1">En ligne</span>
                          </span>
                        )}
                      </td>
                      <td>{p.reason}</td>
                      <td>
                        <span className="appointment-status-badge">
                          <span className="status-dot"></span>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {p.status === "En attente" && (
                            <button
                              type="button"
                              className="btn btn-warning shadow btn-xs sharp me-1 text-white"
                              onClick={() => handleCallPatient(p)}
                              title="Appeler le patient dans le cabinet"
                            >
                              <i className="fa fa-bell"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-primary shadow btn-xs sharp me-1"
                            onClick={() => handleStartConsultation(p)}
                            title="Ouvrir la consultation clinique"
                          >
                            <i className="fa fa-stethoscope"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger shadow btn-xs sharp"
                            onClick={() => handleRemovePatient(p.id)}
                            title="Retirer de la salle d'attente"
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Enregistrer Arrivée Patient */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <div className="modal-header">
          <h5 className="modal-title">Enregistrer l'arrivée d'un patient</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowAddModal(false)}
          ></button>
        </div>
        <form onSubmit={handleRegisterArrival}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Sélectionner le patient *</label>
              <select
                className="form-control"
                value={newArrival.patientId}
                onChange={(e) =>
                  setNewArrival({ ...newArrival, patientId: e.target.value })
                }
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.firstName || "")} {(p.lastName || "").toUpperCase()} ({p.fileNumber || ""})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Heure du rendez-vous prévu</label>
              <input
                type="time"
                className="form-control"
                value={newArrival.appointmentTime}
                onChange={(e) =>
                  setNewArrival({ ...newArrival, appointmentTime: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Motif</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Suivi tension, ordonnance..."
                value={newArrival.reason}
                onChange={(e) =>
                  setNewArrival({ ...newArrival, reason: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="danger" light onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Valider l'arrivée
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default WaitingRoomPage;

import React, { useState, useContext, useEffect } from "react";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { Modal, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import Swal from "sweetalert2";
import ApiService from "../../../services/ApiService";

import {
  initialDoctor,
  initialAppointments,
  initialPatients,
  initialWaitingRoom,
  initialInvoices,
} from "../../../services/CabinetData";
const VisitorChart = loadable(() =>
  pMinDelay(import("../Dashboard/charts/home/VisitorChart"), 600)
);
const ChartCircle = loadable(() =>
  pMinDelay(import("../Dashboard/charts/home/ChartCircle"), 600)
);

const DashboardCabinet = () => {
  const navigate = useNavigate();
  const { changeBackground } = useContext(ThemeContext);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [waitingRoom, setWaitingRoom] = useState(() => {
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
    } catch {
      // ignore
    }
    return [];
  });
  const [showRdvModal, setShowRdvModal] = useState(false);
  const [newRdv, setNewRdv] = useState({
    patientId: "",
    time: "15:00",
    reason: "Consultation générale",
  });

  useEffect(() => {
    changeBackground({ value: "light", label: "Light" });

    const fetchPatients = async () => {
      try {
        const data = await ApiService.getPatients();
        const clean = (Array.isArray(data) ? data : []).filter((p) => {
          const last = (p.lastName || "").toLowerCase().trim();
          const first = (p.firstName || "").toLowerCase().trim();
          return (
            !["dubois", "lemoine", "bernard", "moreau", "belkacem"].includes(last) &&
            !["claire", "marc", "sophie", "lucas", "yasmine"].includes(first)
          );
        });
        setPatients(clean);
        if (clean.length > 0) {
          setNewRdv((prev) => ({ ...prev, patientId: clean[0].id }));
        }
      } catch (e) {
        console.warn("Erreur chargement patients dans dashboard :", e);
      }
    };
    fetchPatients();

    let channel;
    try {
      channel = new BroadcastChannel("waiting_room_display_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "UPDATE_LIST" && Array.isArray(event.data.list)) {
          setWaitingRoom(event.data.list);
        }
      };
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === "cabinet_waiting_list" && e.newValue) {
        try {
          setWaitingRoom(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Statistiques calculées du cabinet
  const totalPatientsCount = patients.length; // Nombre réel de patients en DB
  const todayAppointments = appointments.length;
  const waitingCount = waitingRoom.filter((w) => w.status === "En attente").length;
  const completedToday = appointments.filter((a) => a.status === "Terminé").length;
  const todayRevenue = initialInvoices
    .filter((inv) => inv.status === "Payée")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingInvoicesAmount = initialInvoices
    .filter((inv) => inv.status !== "Payée")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleCreateRdv = (e) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === parseInt(newRdv.patientId)) || patients[0];
    if (!pat) {
      Swal.fire("Attention", "Veuillez d'abord enregistrer un patient dans le répertoire.", "warning");
      return;
    }
    const created = {
      id: appointments.length + 1,
      patientId: pat.id,
      patientName: `${pat.firstName || ""} ${pat.lastName || ""}`.trim(),
      phone: pat.phone || "",
      date: new Date().toISOString().split("T")[0],
      time: newRdv.time,
      duration: "20 min",
      reason: newRdv.reason,
      status: "Confirmé",
      notes: "Pris depuis le tableau de bord",
    };
    setAppointments([...appointments, created]);
    setShowRdvModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Terminé":
        return <Badge bg="success" className="badge-lg">Terminé</Badge>;
      case "En consultation":
        return <Badge bg="primary" className="badge-lg">En consultation</Badge>;
      case "Arrivé":
        return <Badge bg="warning" className="badge-lg text-white">Arrivé</Badge>;
      case "Confirmé":
        return <Badge bg="info" className="badge-lg">Confirmé</Badge>;
      case "Absent":
      case "Annulé":
        return <Badge bg="danger" className="badge-lg">Absent</Badge>;
      default:
        return <Badge bg="secondary" className="badge-lg">{status}</Badge>;
    }
  };

  return (
    <>
      {/* En-tête de bienvenue du Cabinet */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-start flex-wrap justify-content-between">
        <div className="me-auto d-lg-block">
          <h3 className="text-primary font-w600 mb-1">
            Bonjour, {initialDoctor.name}
          </h3>
          <p className="mb-0 text-muted">
            {initialDoctor.title} • {initialDoctor.convention} • Cabinet Saint-Honoré
          </p>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-2 mt-2 mt-sm-0">
          <Link to="/appointments" className="btn btn-outline-primary btn-rounded">
            <i className="flaticon-381-calendar-1 me-2"></i> Voir l'agenda
          </Link>
          <Button
            variant="primary"
            className="btn-rounded"
            onClick={() => setShowRdvModal(true)}
          >
            <i className="flaticon-381-add-1 me-2"></i> Nouveau RDV
          </Button>
        </div>
      </div>

      {/* Cartes métriques Cabinet (4 colonnes fidèles à Mediqu) */}
      <div className="row">
        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-user-7 fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Patients du cabinet</p>
                  <h3 className="text-primary font-w600 mb-0">{totalPatientsCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-info text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-calendar-1 fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">RDV du jour</p>
                  <h3 className="text-info font-w600 mb-0">{todayAppointments}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-warning text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-clock fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">En salle d'attente</p>
                  <h3 className="text-warning font-w600 mb-0">{waitingCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-diamond fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Recettes du jour</p>
                  <h3 className="text-success font-w600 mb-0">{todayRevenue.toLocaleString("fr-DZ")} DA</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rangée Principale : Graphiques & Activités du Cabinet */}
      <div className="row">
        {/* Graphique de fréquentation du site public en temps réel */}
        <div className="col-xl-6 col-xxl-6 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h4 className="card-title mb-0">Visites du Site Public</h4>
                <p className="mb-0 text-muted fs-13 mt-1">
                  Fréquentation et volume des visiteurs du portail patient
                </p>
              </div>
              <a
                href="/patient-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-xxs"
                style={{ borderRadius: "20px", fontSize: "11.5px", padding: "3px 10px" }}
                title="Tester le site public dans un nouvel onglet"
              >
                <i className="fa fa-external-link me-1"></i> Portail Patient
              </a>
            </div>
            <div className="card-body px-3 pt-2 pb-0">
              <div id="chartStrock">
                <VisitorChart />
              </div>
            </div>
          </div>
        </div>

        {/* Répartition des actes et patientèle */}
        <div className="col-xl-6 col-xxl-6 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <div>
                <h4 className="card-title mb-1">Typologie des Actes</h4>
                <p className="mb-0 text-muted fs-13">Consultations et suivis</p>
              </div>
            </div>
            <div className="card-body pt-2">
              <div className="row align-items-center">
                <div className="col-sm-7 px-0">
                  <div id="chartCircle">
                    <ChartCircle />
                  </div>
                </div>
                <div className="col-sm-5 px-0">
                  <div className="patients-chart-deta">
                    <div className="col px-0 mb-3">
                      <span className="bg-primary"></span>
                      <div>
                        <p className="mb-0 text-muted">Consultation Générale (G)</p>
                        <h4 className="mb-0">65%</h4>
                      </div>
                    </div>
                    <div className="col px-0 mb-3">
                      <span className="bg-success"></span>
                      <div>
                        <p className="mb-0 text-muted">Suivi Pathologies / ALD</p>
                        <h4 className="mb-0">22%</h4>
                      </div>
                    </div>
                    <div className="col px-0">
                      <span className="bg-warning"></span>
                      <div>
                        <p className="mb-0 text-muted">Pédiatrie & Urgences</p>
                        <h4 className="mb-0">13%</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rangée : Rendez-vous du jour & Salle d'attente en direct */}
      <div className="row">
        {/* Rendez-vous du jour au cabinet */}
        <div className="col-xl-8 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h4 className="card-title">Agenda du jour</h4>
                <p className="text-muted fs-13 mb-0">
                  {todayAppointments} créneaux programmés • {completedToday} honorés
                </p>
              </div>
              <Link to="/appointments" className="btn btn-sm btn-outline-primary mt-2 mt-sm-0">
                Gérer l'agenda complet <i className="flaticon-381-next ms-1"></i>
              </Link>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-responsive-md table-hover">
                  <thead>
                    <tr>
                      <th><strong>HEURE</strong></th>
                      <th><strong>PATIENT</strong></th>
                      <th><strong>MOTIF</strong></th>
                      <th><strong>TÉLÉPHONE</strong></th>
                      <th><strong>STATUT</strong></th>
                      <th><strong>ACTION</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((rdv) => (
                      <tr key={rdv.id}>
                        <td>
                          <span className="badge badge-light text-primary font-w600">
                            <i className="flaticon-381-clock me-1"></i>
                            {rdv.time}
                          </span>
                        </td>
                        <td>
                          <Link
                            to="/patient-details"
                            className="font-w600 text-dark hover-primary"
                          >
                            {rdv.patientName}
                          </Link>
                        </td>
                        <td>
                          <span className="text-muted">{rdv.reason}</span>
                        </td>
                        <td>{rdv.phone}</td>
                        <td>{getStatusBadge(rdv.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            {rdv.status === "Arrivé" && (
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => navigate("/consultations")}
                                title="Lancer la consultation"
                              >
                                Consulter
                              </button>
                            )}
                            {rdv.status === "Confirmé" && (
                              <button
                                className="btn btn-outline-success btn-xs"
                                onClick={() => {
                                  const updated = appointments.map((a) =>
                                    a.id === rdv.id ? { ...a, status: "Arrivé" } : a
                                  );
                                  setAppointments(updated);
                                }}
                              >
                                Marquer arrivé
                              </button>
                            )}
                            <Link
                              to="/patient-details"
                              className="btn btn-light btn-xs"
                              title="Dossier"
                            >
                              <i className="flaticon-381-folder"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Salle d'attente en temps réel & Synthèse financière */}
        <div className="col-xl-4 col-lg-12">
          {/* Salle d'attente */}
          <div className="card">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h4 className="card-title">Salle d'attente</h4>
                <p className="text-muted fs-13 mb-0">Accueil en cours</p>
              </div>
              <Link to="/waiting-room" className="btn btn-xs btn-outline-warning">
                Direct
              </Link>
            </div>
            <div className="card-body">
              {waitingRoom.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="flaticon-381-clock fs-32 d-block mb-2"></i>
                  Aucun patient en salle d'attente.
                </div>
              ) : (
                <div className="widget-media">
                  <ul className="timeline">
                    {waitingRoom.map((w, idx) => (
                      <li key={idx}>
                        <div className={`timeline-panel ${w.status === "En consultation" ? "bg-light-primary" : ""}`}>
                          <div className="media me-2 media-primary">
                            <i className="flaticon-381-user-7"></i>
                          </div>
                          <div className="media-body">
                            <h6 className="mb-1 font-w600">{w.patientName}</h6>
                            <p className="mb-1 text-muted fs-12">
                              Arrivé à {w.arrivalTime} • RDV {w.appointmentTime}
                            </p>
                            <span className="badge badge-warning light fs-11">
                              Attente: {w.waitTimeMinutes} min
                            </span>
                          </div>
                          <button
                            className="btn btn-primary btn-xs ms-2"
                            onClick={() => navigate("/consultations")}
                          >
                            Appeler
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Synthèse financière du cabinet */}
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="card-title">Caisse & Facturation</h4>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Recettes encaissées ce jour :</span>
                <span className="font-w600 text-success fs-16">{todayRevenue.toLocaleString("fr-DZ")} DA</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Factures en attente / télétransmises :</span>
                <span className="font-w600 text-warning fs-16">{pendingInvoicesAmount.toLocaleString("fr-DZ")} DA</span>
              </div>
              <div className="progress mb-3" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: "70%" }}
                  role="progressbar"
                ></div>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: "30%" }}
                  role="progressbar"
                ></div>
              </div>
              <div className="d-grid gap-2">
                <Link to="/invoices" className="btn btn-outline-primary btn-sm">
                  <i className="flaticon-381-calculator me-1"></i> Consulter les factures
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nouveau Rendez-vous Rapide */}
      <Modal show={showRdvModal} onHide={() => setShowRdvModal(false)} centered>
        <div className="modal-header">
          <h5 className="modal-title">Nouveau Rendez-vous</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowRdvModal(false)}
          ></button>
        </div>
        <form onSubmit={handleCreateRdv}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Sélectionner un Patient</label>
              <select
                className="form-control"
                value={newRdv.patientId}
                onChange={(e) => setNewRdv({ ...newRdv, patientId: e.target.value })}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.firstName || "")} {(p.lastName || "").toUpperCase()} ({p.fileNumber || ""})
                  </option>
                ))}
              </select>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Heure du RDV</label>
                <input
                  type="time"
                  className="form-control"
                  value={newRdv.time}
                  onChange={(e) => setNewRdv({ ...newRdv, time: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Durée</label>
                <select className="form-control" defaultValue="20 min">
                  <option>15 min</option>
                  <option>20 min</option>
                  <option>30 min</option>
                  <option>45 min</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Motif de consultation</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Consultation générale, renouvellement, certificat..."
                value={newRdv.reason}
                onChange={(e) => setNewRdv({ ...newRdv, reason: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="danger" light onClick={() => setShowRdvModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Enregistrer le RDV
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default DashboardCabinet;

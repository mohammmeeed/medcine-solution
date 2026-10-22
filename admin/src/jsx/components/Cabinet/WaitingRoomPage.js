import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import {
  initialWaitingRoom,
  initialPatients,
} from "../../../services/CabinetData";

const WaitingRoomPage = () => {
  const navigate = useNavigate();
  const [waitingList, setWaitingList] = useState(initialWaitingRoom);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArrival, setNewArrival] = useState({
    patientId: 1,
    appointmentTime: "11:30",
    reason: "Consultation générale",
  });

  const handleCallPatient = (patient) => {
    setWaitingList(
      waitingList.map((p) =>
        p.id === patient.id ? { ...p, status: "Appelé" } : p
      )
    );
    Swal.fire({
      icon: "info",
      title: "Patient appelé !",
      text: `${patient.patientName} a été invité(e) à entrer dans le cabinet de consultation.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleStartConsultation = (patient) => {
    setWaitingList(
      waitingList.map((p) =>
        p.id === patient.id ? { ...p, status: "En consultation" } : p
      )
    );
    navigate(`/consultations?patientId=${patient.patientId}`);
  };

  const handleRemovePatient = (id) => {
    Swal.fire({
      title: "Retirer de la salle d'attente ?",
      text: "Le patient sera marqué comme ayant quitté la salle.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, retirer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setWaitingList(waitingList.filter((p) => p.id !== id));
      }
    });
  };

  const handleRegisterArrival = (e) => {
    e.preventDefault();
    const pat =
      initialPatients.find((p) => p.id === parseInt(newArrival.patientId)) ||
      initialPatients[0];
    const now = new Date();
    const arrivalTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const created = {
      id: waitingList.length + 1,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      appointmentTime: newArrival.appointmentTime,
      arrivalTime: arrivalTime,
      reason: newArrival.reason,
      waitTimeMinutes: 0,
      status: "En attente",
    };

    setWaitingList([...waitingList, created]);
    setShowAddModal(false);
    Swal.fire({
      icon: "success",
      title: "Arrivée enregistrée",
      text: `${created.patientName} a été ajouté(e) en salle d'attente.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const waitingCount = waitingList.filter((p) => p.status === "En attente").length;
  const inConsultCount = waitingList.filter((p) => p.status === "En consultation").length;

  return (
    <>
      <PageTitle motherMenu="Principal" activeMenu="Salle d'attente" />

      {/* Barre d'action */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="primary"
            className="btn-rounded"
            onClick={() => setShowAddModal(true)}
          >
            <i className="flaticon-381-add-1 me-2"></i> Enregistrer une Arrivée
          </Button>
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
                  <th><strong>ARRIVÉE</strong></th>
                  <th><strong>RDV PRÉVU</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>MOTIF</strong></th>
                  <th><strong>TEMPS D'ATTENTE</strong></th>
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
                        <span className="font-w600 text-primary">
                          {p.arrivalTime}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">{p.appointmentTime}</span>
                      </td>
                      <td>
                        <Link
                          to={`/patient-details?id=${p.patientId}`}
                          className="font-w600 text-dark hover-primary"
                        >
                          {p.patientName}
                        </Link>
                      </td>
                      <td>{p.reason}</td>
                      <td>
                        <span className="text-muted">{p.waitTimeMinutes} min</span>
                      </td>
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
                {initialPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.fileNumber})
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

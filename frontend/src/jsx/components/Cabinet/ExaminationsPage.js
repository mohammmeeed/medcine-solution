import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import {
  initialExaminations,
  initialPatients,
} from "../../../services/CabinetData";

const ExaminationsPage = () => {
  const [examinations, setExaminations] = useState(initialExaminations);
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formExam, setFormExam] = useState({
    patientId: 1,
    date: new Date().toISOString().split("T")[0],
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 72,
    temperature: 36.8,
    weight: 70,
    height: 172,
    spo2: 99,
    bloodSugar: 1.0,
    notes: "",
  });

  const handleSaveExam = (e) => {
    e.preventDefault();
    const pat =
      initialPatients.find((p) => p.id === parseInt(formExam.patientId)) ||
      initialPatients[0];
    const bmiCalc = (
      formExam.weight / Math.pow(formExam.height / 100, 2)
    ).toFixed(1);

    const created = {
      id: examinations.length + 1,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      date: formExam.date,
      bpSystolic: parseInt(formExam.bpSystolic),
      bpDiastolic: parseInt(formExam.bpDiastolic),
      heartRate: parseInt(formExam.heartRate),
      temperature: parseFloat(formExam.temperature),
      weight: parseFloat(formExam.weight),
      height: parseInt(formExam.height),
      bmi: parseFloat(bmiCalc),
      spo2: parseInt(formExam.spo2),
      bloodSugar: parseFloat(formExam.bloodSugar),
      notes: formExam.notes,
    };

    setExaminations([created, ...examinations]);
    setShowAddModal(false);

    Swal.fire({
      icon: "success",
      title: "Constantes enregistrées",
      text: `Mesures ajoutées au dossier de ${created.patientName}.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const filteredExams = examinations.filter((ex) =>
    selectedPatientId === "all" ? true : ex.patientId === parseInt(selectedPatientId)
  );

  return (
    <>
      <PageTitle motherMenu="Gestion médicale" activeMenu="Examens et constantes" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted fs-13">Filtrer par patient :</span>
          <select
            className="form-control w-auto default-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="all">Tous les patients du cabinet</option>
            {initialPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.lastName.toUpperCase()} {p.firstName} ({p.fileNumber})
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          className="btn-rounded"
          onClick={() => setShowAddModal(true)}
        >
          <i className="flaticon-381-add-1 me-2"></i> Relever des Constantes
        </Button>
      </div>

      {/* Cartes d'indicateurs moyens */}
      <div className="row">
        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-danger text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-heart fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Tension Moyenne</p>
                  <h3 className="text-danger font-w600 mb-0">125 / 78</h3>
                  <small className="text-muted">mmHg (Repos)</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-pulse fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Fréq. Cardiaque</p>
                  <h3 className="text-primary font-w600 mb-0">72 bpm</h3>
                  <small className="text-muted">Rythme sinusal</small>
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
                  <i className="flaticon-381-cloud fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">SpO2 Moyenne</p>
                  <h3 className="text-info font-w600 mb-0">98.5%</h3>
                  <small className="text-muted">Air ambiant</small>
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
                  <i className="flaticon-381-user-7 fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">IMC Médian</p>
                  <h3 className="text-success font-w600 mb-0">22.8</h3>
                  <small className="text-muted">Corpulence normale</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau historique des constantes */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Registre des Constantes Vitales</h4>
            <p className="text-muted fs-13 mb-0">
              Historique chronologique des prises de paramètres au cabinet
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>DATE</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>TENSION (mmHg)</strong></th>
                  <th><strong>POULS (bpm)</strong></th>
                  <th><strong>TEMPÉRATURE</strong></th>
                  <th><strong>POIDS / TAILLE</strong></th>
                  <th><strong>IMC</strong></th>
                  <th><strong>SpO2</strong></th>
                  <th><strong>GLYCÉMIE</strong></th>
                  <th><strong>OBSERVATIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      Aucune mesure enregistrée pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((ex) => {
                    const isBpHigh = ex.bpSystolic >= 140 || ex.bpDiastolic >= 90;
                    return (
                      <tr key={ex.id}>
                        <td><strong>{ex.date}</strong></td>
                        <td>
                          <Link
                            to={`/patient-details?id=${ex.patientId}`}
                            className="font-w600 text-dark hover-primary"
                          >
                            {ex.patientName}
                          </Link>
                        </td>
                        <td>
                          <Badge
                            bg={isBpHigh ? "danger" : "light"}
                            text={isBpHigh ? "white" : "dark"}
                            className="font-w600 fs-12 border"
                          >
                            {ex.bpSystolic} / {ex.bpDiastolic}
                          </Badge>
                        </td>
                        <td>{ex.heartRate} bpm</td>
                        <td>{ex.temperature} °C</td>
                        <td>
                          {ex.weight} kg <span className="text-muted fs-11">({ex.height} cm)</span>
                        </td>
                        <td>
                          <Badge
                            bg={ex.bmi >= 25 ? "warning" : "success"}
                            className="light"
                          >
                            {ex.bmi}
                          </Badge>
                        </td>
                        <td>{ex.spo2}%</td>
                        <td>{ex.bloodSugar} g/L</td>
                        <td>
                          <span className="text-muted fs-12">{ex.notes || "—"}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Relevé de Constantes */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="flaticon-381-heart me-2 text-danger"></i>
            Enregistrer les Constantes Vitales
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
        </div>
        <form onSubmit={handleSaveExam}>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label font-w600">Patient *</label>
                <select
                  className="form-control"
                  value={formExam.patientId}
                  onChange={(e) => setFormExam({ ...formExam, patientId: e.target.value })}
                  required
                >
                  {initialPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} ({p.fileNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label font-w600">Date du relevé</label>
                <input
                  type="date"
                  className="form-control"
                  value={formExam.date}
                  onChange={(e) => setFormExam({ ...formExam, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Tension Systolique (mmHg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formExam.bpSystolic}
                  onChange={(e) => setFormExam({ ...formExam, bpSystolic: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Tension Diastolique (mmHg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formExam.bpDiastolic}
                  onChange={(e) => setFormExam({ ...formExam, bpDiastolic: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Fréquence Cardiaque (bpm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formExam.heartRate}
                  onChange={(e) => setFormExam({ ...formExam, heartRate: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Température (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formExam.temperature}
                  onChange={(e) => setFormExam({ ...formExam, temperature: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Poids (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={formExam.weight}
                  onChange={(e) => setFormExam({ ...formExam, weight: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Taille (cm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formExam.height}
                  onChange={(e) => setFormExam({ ...formExam, height: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">SpO2 (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formExam.spo2}
                  onChange={(e) => setFormExam({ ...formExam, spo2: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label fs-13">Glycémie capillaire (g/L)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formExam.bloodSugar}
                  onChange={(e) => setFormExam({ ...formExam, bloodSugar: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fs-13">Observations médicales</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Ex: Mesure après 5 minutes de repos, pas d'orthostatisme..."
                value={formExam.notes}
                onChange={(e) => setFormExam({ ...formExam, notes: e.target.value })}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="danger" light onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Enregistrer les mesures
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ExaminationsPage;

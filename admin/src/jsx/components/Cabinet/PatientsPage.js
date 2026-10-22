import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import { initialPatients } from "../../../services/CabinetData";

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Féminin",
    phone: "",
    email: "",
    address: "",
    secuNumber: "",
    bloodGroup: "A+",
    allergies: "",
    chronicDiseases: "",
  });

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      firstName: "",
      lastName: "",
      dob: "1990-01-01",
      gender: "Féminin",
      phone: "",
      email: "",
      address: "",
      secuNumber: "",
      bloodGroup: "A+",
      allergies: "",
      chronicDiseases: "",
    });
    setShowModal(true);
    setTimeout(() => {
      const el = document.getElementById("patient-form-card");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleOpenEdit = (p) => {
    setEditId(p.id);
    setFormData({
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      address: p.address,
      secuNumber: p.secuNumber,
      bloodGroup: p.bloodGroup,
      allergies: Array.isArray(p.allergies) ? p.allergies.join(", ") : p.allergies || "",
      chronicDiseases: Array.isArray(p.chronicDiseases) ? p.chronicDiseases.join(", ") : p.chronicDiseases || "",
    });
    setShowModal(true);
    setTimeout(() => {
      const el = document.getElementById("patient-form-card");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (editId) {
      setPatients(
        patients.map((p) =>
          p.id === editId
            ? {
                ...p,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                secuNumber: formData.secuNumber,
                bloodGroup: formData.bloodGroup,
                allergies: formData.allergies ? formData.allergies.split(",").map((s) => s.trim()) : [],
                chronicDiseases: formData.chronicDiseases
                  ? formData.chronicDiseases.split(",").map((s) => s.trim())
                  : [],
              }
            : p
        )
      );
      Swal.fire({
        icon: "success",
        title: "Dossier patient mis à jour",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const nextId = patients.length + 1;
      const newPatient = {
        id: nextId,
        fileNumber: `DOS-2024-00${nextId}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        age: new Date().getFullYear() - new Date(formData.dob).getFullYear(),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        secuNumber: formData.secuNumber,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies ? formData.allergies.split(",").map((s) => s.trim()) : [],
        chronicDiseases: formData.chronicDiseases
          ? formData.chronicDiseases.split(",").map((s) => s.trim())
          : [],
        regularTreatments: [],
        lastVisit: new Date().toISOString().split("T")[0],
        status: "Actif",
      };
      setPatients([...patients, newPatient]);
      Swal.fire({
        icon: "success",
        title: "Patient enregistré avec succès",
        timer: 1500,
        showConfirmButton: false,
      });
    }
    setShowModal(false);
  };

  const handleDeletePatient = (id) => {
    Swal.fire({
      title: "Supprimer ce patient ?",
      text: "Le dossier sera retiré du répertoire.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f72b50",
      cancelButtonColor: "#6e6e6e",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setPatients(patients.filter((p) => p.id !== id));
        Swal.fire("Supprimé", "Le dossier patient a été retiré.", "success");
      }
    });
  };

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      p.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <PageTitle motherMenu="Principal" activeMenu="Patients" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <Button
          variant={showModal && !editId ? "outline-primary" : "primary"}
          className="btn-rounded"
          onClick={() => {
            if (showModal && !editId) {
              setShowModal(false);
            } else {
              handleOpenAdd();
            }
          }}
        >
          <i className={showModal && !editId ? "fa fa-times me-2" : "flaticon-381-add-1 me-2"}></i>
          {showModal && !editId ? "Fermer le formulaire" : "Ajouter un Patient"}
        </Button>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="input-group search-area w-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par nom, dossier, tél..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <i className="flaticon-381-search-2"></i>
            </span>
          </div>

          <select
            className="form-control w-auto default-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les patients</option>
            <option value="Suivi régulier">Suivi régulier</option>
            <option value="Actif">Actif</option>
          </select>
        </div>
      </div>

      {/* Formulaire Ajout / Modification de Patient (Intégré dans la page sans popup) */}
      {showModal && (
        <div className="card mb-4" id="patient-form-card">
          <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="card-title">
                {editId ? "Modifier la fiche patient" : "Créer un nouveau dossier patient"}
              </h4>
              <p className="text-muted fs-13 mb-0">
                {editId
                  ? "Mise à jour des coordonnées et alertes médicales du patient"
                  : "Renseignez les coordonnées et informations médicales pour créer le dossier"}
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Fermer"
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          <form onSubmit={handleSavePatient}>
            <div className="card-body">
              <h6 className="text-primary font-w600 mb-3 border-bottom pb-2">
                Informations Administratives
              </h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nom de famille *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date de naissance *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Genre</label>
                  <select
                    className="form-control"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Féminin">Féminin</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Groupe Sanguin</label>
                  <select
                    className="form-control"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Téléphone portable *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="06 00 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="patient@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <h6 className="text-primary font-w600 mt-3 mb-3 border-bottom pb-2">
                Alertes Médicales (Confidentiel)
              </h6>

              <div className="mb-3">
                <label className="form-label text-danger font-w600">
                  Allergies et intolérances (séparées par une virgule)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Pénicilline, Arachides, Ibuprofène..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Pathologies chroniques / ALD (séparées par une virgule)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Diabète type 2, HTA, Asthme..."
                  value={formData.chronicDiseases}
                  onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                />
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2 border-0 pt-0">
              <Button variant="danger" light onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {editId ? "Enregistrer les modifications" : "Créer le dossier"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des patients */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Répertoire des Patients du Cabinet</h4>
            <p className="text-muted fs-13 mb-0">
              {filteredPatients.length} patient(s) répertorié(s)
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>NOM & PRÉNOM</strong></th>
                  <th><strong>DATE NAISS. (ÂGE)</strong></th>
                  <th><strong>TÉLÉPHONE</strong></th>
                  <th><strong>DERNIÈRE VISITE</strong></th>
                  <th><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Aucun patient trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link
                          to={`/patient-details?id=${p.id}`}
                          className="font-w600 text-dark hover-primary"
                        >
                          {p.lastName.toUpperCase()} {p.firstName}
                        </Link>
                        <span className="d-block text-muted fs-12">{p.gender}</span>
                      </td>
                      <td>
                        {p.dob}{" "}
                        <span className="text-muted fs-12">({p.age || 35} ans)</span>
                      </td>
                      <td>{p.phone}</td>
                      <td>
                        <span className="text-muted">
                          {p.lastVisit || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <Link
                            to={`/patient-details?id=${p.id}`}
                            className="btn btn-primary shadow btn-xs sharp me-1"
                            title="Ouvrir le dossier médical"
                          >
                            <i className="fa fa-folder-open"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-info shadow btn-xs sharp me-1 text-white"
                            onClick={() => handleOpenEdit(p)}
                            title="Modifier les coordonnées"
                          >
                            <i className="fa fa-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-success shadow btn-xs sharp me-1"
                            onClick={() => navigate(`/consultations?patientId=${p.id}`)}
                            title="Démarrer consultation"
                          >
                            <i className="fa fa-stethoscope"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger shadow btn-xs sharp"
                            onClick={() => handleDeletePatient(p.id)}
                            title="Supprimer le patient"
                          >
                            <i className="fa fa-trash"></i>
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

    </>
  );
};

export default PatientsPage;

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import Select from "react-select";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import PrescriptionPreviewModal from "./PrescriptionPreviewModal";
import MedicationsModal from "./MedicationsModal";
import { ApiService } from "../../../services/ApiService";
import {
  initialDoctor,
  initialPatients,
  initialPrescriptions,
  initialMedications,
} from "../../../services/CabinetData";

const PrescriptionsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patientIdQuery = searchParams.get("patientId");

  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [medications, setMedications] = useState(initialMedications);
  const [showMedModal, setShowMedModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewPrescription, setPreviewPrescription] = useState(null);

  useEffect(() => {
    ApiService.getMedications().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setMedications(data);
      }
    });
  }, []);

  const handleOpenCreate = () => {
    setShowCreateModal(true);
    setFormData((prev) => ({
      ...prev,
      patientId: patientIdQuery ? parseInt(patientIdQuery) : "",
    }));
    setTimeout(() => {
      document.getElementById("prescription-form-card")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    if (patientIdQuery) {
      const found = prescriptions.find((p) => p.patientId === parseInt(patientIdQuery));
      if (found) {
        setPreviewPrescription(found);
      }
    }
  }, [patientIdQuery, prescriptions]);

  // Formulaire d'ordonnance
  const [formData, setFormData] = useState({
    patientId: patientIdQuery ? parseInt(patientIdQuery) : "",
    validity: "3 mois",
    ald: false,
    items: [
      {
        medication: "PARACÉTAMOL 1000 mg comprimé",
        dosage: "1000 mg",
        posology: "1 comprimé toutes les 6 heures en cas de douleur ou fièvre",
        duration: "5 jours",
        renewable: "Non renouvelable",
      },
    ],
    notes: "Prendre les comprimés avec un grand verre d'eau. Ne pas dépasser 3g par jour.",
  });

  const patientOptions = initialPatients.map((p) => ({
    value: p.id,
    label: `${p.lastName.toUpperCase()} ${p.firstName} — ${p.fileNumber} (Née le ${p.dob} • ${p.age} ans)`,
  }));

  const selectedPatientOption = formData.patientId
    ? patientOptions.find((opt) => String(opt.value) === String(formData.patientId)) || null
    : null;

  const patientSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "45px",
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#1e60d5" : "#e4e7ea",
      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(30, 96, 213, 0.15)" : "none",
      "&:hover": {
        borderColor: "#1e60d5",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1e60d5"
        : state.isFocused
        ? "rgba(30, 96, 213, 0.08)"
        : "transparent",
      color: state.isSelected ? "#ffffff" : "#333333",
      fontSize: "13px",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "14px",
      fontWeight: "500",
      color: "#333333",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "13px",
      color: "#9ca3af",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "0.75rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    }),
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          medication: "",
          dosage: "",
          posology: "",
          duration: "",
          renewable: "Non renouvelable",
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const handleSelectPredefinedMed = (index, medName) => {
    const found = medications.find((m) => m.name.toLowerCase() === medName.toLowerCase());
    const updated = [...formData.items];
    if (found) {
      updated[index].medication = found.name;
      if (found.dosage) updated[index].dosage = found.dosage;
      if (found.defaultPosology) updated[index].posology = found.defaultPosology;
      if (found.defaultDuration) updated[index].duration = found.defaultDuration;
    } else {
      updated[index].medication = medName;
    }
    setFormData({ ...formData, items: updated });
  };

  const handleSavePrescription = (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      Swal.fire({
        icon: "warning",
        title: "Patient requis",
        text: "Veuillez sélectionner un(e) patient(e) avant d'enregistrer l'ordonnance.",
        confirmButtonColor: "#1e60d5",
      });
      return;
    }
    const pat =
      initialPatients.find((p) => String(p.id) === String(formData.patientId)) ||
      initialPatients[0];

    const newOrd = {
      id: prescriptions.length + 1,
      prescriptionNumber: `ORD-2024-00${prescriptions.length + 91}`,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      date: new Date().toISOString().split("T")[0],
      validity: formData.validity,
      ald: formData.ald,
      doctorName: initialDoctor.name,
      items: formData.items,
      notes: formData.notes,
      validated: true,
    };

    setPrescriptions([newOrd, ...prescriptions]);
    setShowCreateModal(false);

    Swal.fire({
      icon: "success",
      title: "Ordonnance validée et signée",
      text: `Prescription #${newOrd.prescriptionNumber} enregistrée avec succès.`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageTitle motherMenu="Gestion médicale" activeMenu="Ordonnances" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div className="input-group search-area w-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par patient, n° ordonnance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="input-group-text">
            <i className="flaticon-381-search-2"></i>
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="outline-primary"
            className="btn-rounded"
            onClick={() => setShowMedModal(true)}
            title="Base et répertoire des médicaments"
          >
            <i className="fa fa-pills me-2"></i> Médicaments
          </Button>

          <Button
            variant={showCreateModal ? "outline-primary" : "primary"}
            className="btn-rounded"
            onClick={() => {
              if (showCreateModal) {
                setShowCreateModal(false);
              } else {
                handleOpenCreate();
              }
            }}
          >
            <i className={showCreateModal ? "fa fa-times me-2" : "flaticon-381-add-1 me-2"}></i>
            {showCreateModal ? "Fermer le formulaire" : "Rédiger une Ordonnance"}
          </Button>
        </div>
      </div>

      {/* Formulaire Rédiger une Ordonnance (Intégré dans la page sans popup) */}
      {showCreateModal && (
        <div className="card mb-4" id="prescription-form-card">
          <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="card-title">
                <i className="flaticon-381-file-1 me-2 text-primary"></i>
                Rédiger une Ordonnance Médicale
              </h4>
              <p className="text-muted fs-13 mb-0">
                Prescription médicamenteuse et posologies pour le patient
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Fermer"
              onClick={() => setShowCreateModal(false)}
            ></button>
          </div>
          <form onSubmit={handleSavePrescription}>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-7">
                  <label className="form-label font-w600">Patient *</label>
                  <Select
                    isSearchable={true}
                    isClearable={true}
                    placeholder="Tapez pour rechercher un(e) patient(e) (nom, prénom, dossier)..."
                    options={patientOptions}
                    value={selectedPatientOption}
                    styles={patientSelectStyles}
                    onChange={(selected) => {
                      setFormData({ ...formData, patientId: selected ? selected.value : "" });
                    }}
                    noOptionsMessage={({ inputValue }) =>
                      inputValue
                        ? `Aucun patient trouvé pour "${inputValue}"`
                        : "Tapez le nom, prénom ou n° dossier pour rechercher"
                    }
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label font-w600">Durée de validité</label>
                  <select
                    className="form-control"
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  >
                    <option value="1 mois">1 mois</option>
                    <option value="3 mois">3 mois</option>
                    <option value="6 mois">6 mois</option>
                    <option value="1 an">1 an</option>
                  </select>
                </div>
              </div>

              {/* Liste des lignes de médicaments */}
              <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <h6 className="text-primary font-w600 mb-0">Médicaments et Posologies</h6>
                <Button variant="outline-primary" size="sm" onClick={handleAddItem}>
                  + Ajouter une ligne
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="p-3 border rounded mb-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-muted">Médicament #{index + 1}</strong>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-12 mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                        <label className="form-label fs-12 mb-0 font-w600">
                          DCI ou Spécialité pharmaceutique *
                        </label>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted fs-11">Sélection directe :</span>
                          <select
                            className="form-select form-select-sm py-0 px-2 fs-12 text-primary"
                            style={{ width: "auto", minWidth: "190px", height: "26px" }}
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSelectPredefinedMed(index, e.target.value);
                              }
                            }}
                          >
                            <option value="">-- Choisir un médicament --</option>
                            {medications.map((m, mIdx) => (
                              <option key={m.id || `${m.name}-${mIdx}`} value={m.name}>
                                {m.name} {m.dosage ? `(${m.dosage})` : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-link text-primary p-0 fs-11 text-decoration-none"
                            onClick={() => setShowMedModal(true)}
                            title="Ajouter ou gérer les médicaments"
                          >
                            + Nouveau
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        list="medications-catalog-datalist"
                        className="form-control form-control-sm"
                        placeholder="Ex: AMOXICILLINE 1g, INUVAIR 100/6, KARDEGIC 75mg..."
                        value={item.medication}
                        onChange={(e) => {
                          handleItemChange(index, "medication", e.target.value);
                          const exact = medications.find(
                            (m) => m.name.toLowerCase() === e.target.value.trim().toLowerCase()
                          );
                          if (exact) {
                            handleSelectPredefinedMed(index, exact.name);
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8 mb-2">
                      <label className="form-label fs-12">Posologie détaillée *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ex: 1 comprimé matin et soir au cours du repas..."
                        value={item.posology}
                        onChange={(e) => handleItemChange(index, "posology", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label fs-12">Durée</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ex: 7 jours, 3 mois..."
                        value={item.duration}
                        onChange={(e) => handleItemChange(index, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label font-w500">Conseils et recommandations hygiéno-diététiques</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ex: Bien s'hydrater, ne pas conduire, revenir si persistance des symptômes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2 border-0 pt-0">
              <Button variant="danger" light onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                <i className="flaticon-381-check-2 me-1"></i> Signer & Valider l'ordonnance
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des ordonnances */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Registre des Ordonnances Médicales</h4>
            <p className="text-muted fs-13 mb-0">
              Validées et signées numériquement par le {initialDoctor.name}
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>N° ORDONNANCE</strong></th>
                  <th><strong>DATE</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>MÉDICAMENTS PRESCRITS</strong></th>
                  <th><strong>VALIDITÉ</strong></th>
                  <th><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Aucune ordonnance trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong className="text-primary">{ord.prescriptionNumber}</strong>
                      </td>
                      <td>{ord.date}</td>
                      <td>
                        <span className="font-w600 text-dark">{ord.patientName}</span>
                      </td>
                      <td>
                        <ul className="mb-0 ps-3 fs-13">
                          {ord.items.map((item, idx) => (
                            <li key={idx}>
                              <strong>{item.medication}</strong> ({item.posology})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{ord.validity}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-xs"
                            onClick={() => setPreviewPrescription(ord)}
                            title="Aperçu & Impression officielle"
                          >
                            <i className="flaticon-381-print me-1"></i> Imprimer
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



      {/* Modal Prévisualisation & Impression Officielle d'Ordonnance avec En-tête Bilingue Officiel */}
      <PrescriptionPreviewModal
        show={!!previewPrescription}
        onHide={() => setPreviewPrescription(null)}
        prescription={previewPrescription}
      />

      {/* Datalist pour autocomplétion rapide de la saisie */}
      <datalist id="medications-catalog-datalist">
        {medications.map((m, mIdx) => (
          <option key={m.id || `${m.name}-${mIdx}`} value={m.name}>
            {m.dosage ? `${m.dosage} - ${m.defaultPosology || ""}` : ""}
          </option>
        ))}
      </datalist>

      {/* Modal Répertoire & Base Médicaments */}
      <MedicationsModal
        show={showMedModal}
        onHide={() => setShowMedModal(false)}
        medications={medications}
        onMedicationsUpdated={setMedications}
      />
    </>
  );
};

export default PrescriptionsPage;

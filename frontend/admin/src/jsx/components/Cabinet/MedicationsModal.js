import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { ApiService } from "../../../services/ApiService";

const MedicationsModal = ({ show, onHide, medications = [], onMedicationsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMedName, setNewMedName] = useState("");

  const handleAddMedication = async (e) => {
    e.preventDefault();
    const cleanName = newMedName.trim().toUpperCase();
    if (!cleanName) {
      Swal.fire({
        icon: "warning",
        title: "Nom requis",
        text: "Veuillez saisir le nom du médicament.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: cleanName,
        dosage: "",
        form: "",
        defaultPosology: "",
        defaultDuration: "",
        category: "Général",
      };

      const res = await ApiService.saveMedication(payload);
      const createdItem = {
        id: res && res.data && res.data.id ? res.data.id : Date.now(),
        ...payload,
      };

      const updated = [
        createdItem,
        ...medications.filter((m) => m.name.toLowerCase() !== cleanName.toLowerCase()),
      ];
      localStorage.setItem("cabinet_medications", JSON.stringify(updated));
      if (onMedicationsUpdated) {
        onMedicationsUpdated(updated);
      }

      setNewMedName("");

      Swal.fire({
        icon: "success",
        title: "Médicament ajouté !",
        text: `"${cleanName}" est désormais disponible pour les ordonnances.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible d'enregistrer le médicament : " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = async (med) => {
    const result = await Swal.fire({
      title: "Supprimer ce médicament ?",
      text: `Êtes-vous sûr de vouloir supprimer "${med.name}" de la liste ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        if (med.id) {
          await ApiService.deleteMedication(med.id);
        }
        const updated = medications.filter((m) => (m.id ? m.id !== med.id : m.name !== med.name));
        localStorage.setItem("cabinet_medications", JSON.stringify(updated));
        if (onMedicationsUpdated) {
          onMedicationsUpdated(updated);
        }
        Swal.fire({
          icon: "success",
          title: "Supprimé",
          text: "Médicament retiré de la liste.",
          timer: 1400,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Erreur lors de la suppression : " + err.message,
        });
      }
    }
  };

  const filtered = medications.filter((m) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <div className="modal-header bg-primary text-white">
        <h5 className="modal-title text-white d-flex align-items-center">
          <i className="fa fa-pills me-2 fs-18"></i> Base & Répertoire des Médicaments
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onHide}
          aria-label="Fermer"
        ></button>
      </div>

      <div className="modal-body p-4">
        {/* Formulaire simplifié : SEULEMENT LE NOM DU MÉDICAMENT */}
        <div className="card border mb-4 bg-light shadow-sm">
          <div className="card-header bg-white py-2 border-bottom">
            <h6 className="card-title text-primary mb-0 fs-14 font-w600">
              <i className="fa fa-plus-circle me-1"></i> Ajouter un Médicament
            </h6>
          </div>
          <form onSubmit={handleAddMedication}>
            <div className="card-body p-3">
              <div className="row g-2 align-items-end">
                <div className="col-md-9 mb-1">
                  <label className="form-label fs-13 font-w600 mb-1">
                    Nom du médicament <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: PARACÉTAMOL 1000 mg, AMOXICILLINE 1g, SPASFON, AUGMENTIN..."
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    required
                    autoFocus
                    style={{ height: "45px" }}
                  />
                </div>
                <div className="col-md-3 mb-1">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 d-flex align-items-center justify-content-center"
                    style={{
                      height: "45px",
                      padding: "0 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      lineHeight: "1"
                    }}
                    disabled={loading}
                  >
                    <i className="fa fa-plus me-2" style={{ lineHeight: 1, fontSize: "13px" }}></i>
                    <span style={{ lineHeight: 1 }}>{loading ? "Ajout..." : "Ajouter"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Liste des médicaments avec barre de recherche */}
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h6 className="font-w600 text-dark mb-0 fs-14">
            Médicaments enregistrés ({filtered.length} / {medications.length})
          </h6>
          <div className="input-group search-area" style={{ maxWidth: "260px" }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text py-0">
              <i className="flaticon-381-search-2 fs-12"></i>
            </span>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: "320px", overflowY: "auto" }}>
          <table className="table table-sm table-hover align-middle border mb-0">
            <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
              <tr>
                <th className="fs-12 font-w600" style={{ width: "60px" }}>N°</th>
                <th className="fs-12 font-w600">NOM DU MÉDICAMENT</th>
                <th className="fs-12 font-w600 text-end" style={{ width: "100px" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted fs-13">
                    Aucun médicament trouvé correspondant à la recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((med, idx) => (
                  <tr key={med.id || `${med.name}-${idx}`}>
                    <td className="text-muted fs-12 font-w500">#{idx + 1}</td>
                    <td>
                      <strong className="text-primary font-w600 fs-14">{med.name}</strong>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs py-1 px-2"
                        title="Supprimer de la base"
                        onClick={() => handleDeleteMedication(med)}
                      >
                        <i className="fa fa-trash fs-12 me-1"></i> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modal-footer bg-light py-2">
        <Button variant="secondary" size="sm" onClick={onHide}>
          Fermer
        </Button>
      </div>
    </Modal>
  );
};

export default MedicationsModal;

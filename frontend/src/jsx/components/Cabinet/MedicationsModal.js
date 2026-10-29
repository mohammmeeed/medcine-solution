import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { ApiService } from "../../../services/ApiService";

const MedicationsModal = ({ show, onHide, medications = [], onMedicationsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [editingMed, setEditingMed] = useState(null);
  const [editMedName, setEditMedName] = useState("");

  const handleStartEdit = (med) => {
    setEditingMed(med);
    setEditMedName(med.name || "");
  };

  const handleCancelEdit = () => {
    setEditingMed(null);
    setEditMedName("");
  };

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

  const handleSaveEdit = async (e, medTarget = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const med = medTarget || editingMed;
    if (!med) return;

    const cleanName = editMedName.trim().toUpperCase();
    if (!cleanName) {
      Swal.fire({
        icon: "warning",
        title: "Nom requis",
        text: "Le nom du médicament ne peut pas être vide.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: med.id,
        name: cleanName,
        dosage: med.dosage || "",
        form: med.form || "",
        defaultPosology: med.defaultPosology || med.posology || "",
        defaultDuration: med.defaultDuration || med.duration || "",
        category: med.category || "Général",
      };

      const res = await ApiService.saveMedication(payload);
      const updatedItem = {
        ...med,
        ...payload,
        id: res && res.data && res.data.id ? res.data.id : (med.id || Date.now()),
        name: cleanName,
      };

      const updated = medications.map((m) => {
        const match = (med.id && m.id && m.id === med.id) || (m.name.toLowerCase() === med.name.toLowerCase());
        return match ? updatedItem : m;
      });

      localStorage.setItem("cabinet_medications", JSON.stringify(updated));
      if (onMedicationsUpdated) {
        onMedicationsUpdated(updated);
      }

      setEditingMed(null);
      setEditMedName("");

      Swal.fire({
        icon: "success",
        title: "Médicament modifié !",
        text: `"${cleanName}" a été mis à jour avec succès.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de modifier le médicament : " + err.message,
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
        if (editingMed && ((med.id && editingMed.id === med.id) || editingMed.name === med.name)) {
          setEditingMed(null);
          setEditMedName("");
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
        {/* Formulaire : Ajouter OU Modifier un Médicament */}
        <div
          className="card border mb-4 shadow-sm"
          style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
        >
          <div className="card-header bg-white py-2 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="card-title mb-0 fs-14 font-w600" style={{ color: editingMed ? "#d97706" : "#2563eb" }}>
              <i className={`fa ${editingMed ? "fa-pencil" : "fa-plus-circle"} me-2`}></i>
              {editingMed ? `Modifier le Médicament : "${editingMed.name}"` : "Ajouter Un Médicament"}
            </h6>
            {editingMed && (
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-0 px-2"
                onClick={handleCancelEdit}
              >
                Annuler
              </button>
            )}
          </div>
          <form onSubmit={editingMed ? handleSaveEdit : handleAddMedication}>
            <div className="card-body p-3">
              <div className="row g-2 align-items-end">
                <div className="col-md-8 mb-1">
                  <label className="form-label fs-13 font-w600 mb-1">
                    Nom du médicament <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: PARACÉTAMOL 1000 mg, AMOXICILLINE 1g, SPASFON, AUGMENTIN..."
                    value={editingMed ? editMedName : newMedName}
                    onChange={(e) =>
                      editingMed ? setEditMedName(e.target.value) : setNewMedName(e.target.value)
                    }
                    required
                    autoFocus
                    style={{ height: "42px" }}
                  />
                </div>
                <div className="col-md-4 mb-1">
                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant={editingMed ? "warning" : "primary"}
                      className={`flex-grow-1 d-flex align-items-center justify-content-center ${editingMed ? "text-white" : ""}`}
                      style={{
                        height: "42px",
                        padding: "0 16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "1",
                      }}
                      disabled={loading}
                    >
                      <i className={`fa ${editingMed ? "fa-check" : "fa-plus"} me-2`} style={{ lineHeight: 1, fontSize: "13px" }}></i>
                      <span style={{ lineHeight: 1 }}>
                        {loading ? "Enregistrement..." : editingMed ? "Mettre à jour" : "+ Ajouter"}
                      </span>
                    </Button>
                    {editingMed && (
                      <Button
                        type="button"
                        variant="light"
                        className="border"
                        style={{ height: "42px", fontSize: "13px" }}
                        onClick={handleCancelEdit}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
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
                <th className="fs-12 font-w600 text-end" style={{ width: "190px" }}>ACTION</th>
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
                filtered.map((med, idx) => {
                  const isEditing = editingMed && ((med.id && editingMed.id === med.id) || editingMed.name === med.name);
                  return (
                    <tr
                      key={med.id || `${med.name}-${idx}`}
                      className={isEditing ? "table-warning align-middle" : "align-middle"}
                    >
                      <td className="text-muted fs-12 font-w500">#{idx + 1}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editMedName}
                            onChange={(e) => setEditMedName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(e, med);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            placeholder="Nom du médicament..."
                            style={{ height: "32px" }}
                          />
                        ) : (
                          <strong className="text-primary font-w600 fs-14">{med.name}</strong>
                        )}
                      </td>
                      <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-success btn-xs py-1 px-2 me-1 text-white"
                              title="Valider la modification"
                              onClick={(e) => handleSaveEdit(e, med)}
                              disabled={loading}
                            >
                              <i className="fa fa-check fs-12 me-1"></i> Valider
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs py-1 px-2"
                              title="Annuler"
                              onClick={handleCancelEdit}
                            >
                              <i className="fa fa-times fs-12 me-1"></i> Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-xs py-1 px-2 me-1"
                              title="Modifier ce médicament"
                              onClick={() => handleStartEdit(med)}
                            >
                              <i className="fa fa-pencil fs-12 me-1"></i> Modifier
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-xs py-1 px-2"
                              title="Supprimer de la base"
                              onClick={() => handleDeleteMedication(med)}
                            >
                              <i className="fa fa-trash fs-12 me-1"></i> Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
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

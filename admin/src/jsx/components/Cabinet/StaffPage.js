import React, { useState } from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import { initialStaff } from "../../../services/CabinetData";

const StaffPage = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleToggleStatus = (id) => {
    setStaff(
      staff.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Actif" ? "Inactif" : "Actif" }
          : s
      )
    );
  };

  const handleSavePermissions = (e) => {
    e.preventDefault();
    setStaff(
      staff.map((s) => (s.id === selectedStaff.id ? selectedStaff : s))
    );
    setSelectedStaff(null);
    Swal.fire({
      icon: "success",
      title: "Permissions mises à jour",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <>
      <PageTitle motherMenu="Cabinet et configuration" activeMenu="Personnel & Permissions" />

      {/* En-tête informatif */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div>
          <h4 className="text-primary font-w600 mb-1">Équipe & Contrôle d'Accès du Cabinet</h4>
          <p className="text-muted fs-13 mb-0">
            Structure restreinte : Praticien titulaire & Secrétariat médical (Conformité Secret Médical)
          </p>
        </div>
      </div>

      {/* Cartes des membres de l'équipe */}
      <div className="row">
        {staff.map((member) => (
          <div key={member.id} className="col-xl-6 col-lg-12">
            <div className="card">
              <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h4 className="card-title mb-0">{member.name}</h4>
                    <Badge
                      bg={member.type === "doctor" ? "primary" : "info"}
                      className="light"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-muted fs-13 mb-0">{member.access}</p>
                </div>
                <Badge bg={member.status === "Actif" ? "success" : "danger"}>
                  {member.status}
                </Badge>
              </div>

              <div className="card-body">
                <div className="row text-muted fs-13 mb-3">
                  <div className="col-sm-6 mb-1">
                    <i className="flaticon-381-mail me-1 text-primary"></i>
                    {member.email}
                  </div>
                  <div className="col-sm-6 mb-1">
                    <i className="flaticon-381-smartphone me-1 text-primary"></i>
                    {member.phone}
                  </div>
                </div>

                <h6 className="font-w600 text-dark mb-2">Matrice des Droits & Habilitations :</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered fs-12 mb-3">
                    <thead className="table-light">
                      <tr>
                        <th>Module</th>
                        <th>Niveau d'autorisation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Agenda & Rendez-vous</strong></td>
                        <td><span className="text-success font-w600">{member.permissions.agenda}</span></td>
                      </tr>
                      <tr>
                        <td><strong>Dossiers Médicaux (Diagnostics)</strong></td>
                        <td>
                          {member.type === "doctor" ? (
                            <span className="text-success font-w600">{member.permissions.medicalRecords}</span>
                          ) : (
                            <span className="text-danger font-w600">
                              <i className="flaticon-381-lock me-1"></i> {member.permissions.medicalRecords}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Prescriptions & Ordonnances</strong></td>
                        <td>
                          {member.type === "doctor" ? (
                            <span className="text-success font-w600">{member.permissions.prescriptions}</span>
                          ) : (
                            <span className="text-danger font-w600">
                              <i className="flaticon-381-lock me-1"></i> Interdit (Médecin uniquement)
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Facturation & Règlements</strong></td>
                        <td><span className="text-info font-w600">{member.permissions.billing}</span></td>
                      </tr>
                      <tr>
                        <td><strong>Configuration du Cabinet</strong></td>
                        <td><span className="text-muted">{member.permissions.settings}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSelectedStaff({ ...member })}
                  >
                    <i className="flaticon-381-edit me-1"></i> Modifier habilitations
                  </button>
                  {member.type !== "doctor" && (
                    <button
                      className={`btn btn-sm ${
                        member.status === "Actif" ? "btn-outline-danger" : "btn-outline-success"
                      }`}
                      onClick={() => handleToggleStatus(member.id)}
                    >
                      {member.status === "Actif" ? "Désactiver compte" : "Activer compte"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Modification des Permissions */}
      <Modal show={!!selectedStaff} onHide={() => setSelectedStaff(null)} centered>
        <div className="modal-header">
          <h5 className="modal-title">
            Habilitations pour {selectedStaff?.name}
          </h5>
          <button type="button" className="btn-close" onClick={() => setSelectedStaff(null)}></button>
        </div>
        {selectedStaff && (
          <form onSubmit={handleSavePermissions}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label font-w600">Rôle au cabinet</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedStaff.role}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, role: e.target.value })
                  }
                  disabled={selectedStaff.type === "doctor"}
                />
              </div>

              <div className="mb-3">
                <label className="form-label font-w600">Accès Agenda</label>
                <select
                  className="form-control"
                  value={selectedStaff.permissions.agenda}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      permissions: { ...selectedStaff.permissions, agenda: e.target.value },
                    })
                  }
                >
                  <option value="Plein accès">Plein accès (Création, modification, suppression)</option>
                  <option value="Lecture seule">Lecture seule</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label font-w600">Accès Dossiers Médicaux</label>
                <select
                  className="form-control"
                  value={selectedStaff.permissions.medicalRecords}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      permissions: { ...selectedStaff.permissions, medicalRecords: e.target.value },
                    })
                  }
                  disabled={selectedStaff.type === "doctor"}
                >
                  <option value="Plein accès (Secret médical)">Plein accès (Médecin)</option>
                  <option value="Restreint (Coordonnées administratives uniquement)">
                    Restreint (Coordonnées administratives uniquement — Secrétaire)
                  </option>
                  <option value="Interdit">Accès interdit</option>
                </select>
                <small className="text-muted">
                  Le secret médical protège les diagnostics et les antécédents médicaux.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label font-w600">Accès Facturation</label>
                <select
                  className="form-control"
                  value={selectedStaff.permissions.billing}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      permissions: { ...selectedStaff.permissions, billing: e.target.value },
                    })
                  }
                >
                  <option value="Plein accès">Plein accès (Création d'actes & encaissement)</option>
                  <option value="Enregistrement des règlements">Enregistrement des règlements seuls</option>
                  <option value="Lecture seule">Lecture seule</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="danger" light onClick={() => setSelectedStaff(null)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer les permissions
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default StaffPage;

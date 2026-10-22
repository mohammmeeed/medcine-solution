import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import ApiService from "../../../services/ApiService";
import { initialDoctor } from "../../../services/CabinetData";

const ClinicProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinic, setClinic] = useState({
    clinicName: "Cabinet Médical Saint-Honoré",
    doctorName: initialDoctor.name,
    doctorNameAr: initialDoctor.nameAr || "",
    title: initialDoctor.title,
    titleAr: initialDoctor.titleAr || "",
    specialty: initialDoctor.specialty,
    subSpecialty: initialDoctor.subSpecialty || "Échographie",
    rpps: initialDoctor.rpps,
    adeli: initialDoctor.adeli,
    siret: initialDoctor.siret,
    orderNumber: initialDoctor.orderNumber,
    convention: initialDoctor.convention,
    email: initialDoctor.email,
    phone: initialDoctor.phone,
    address: initialDoctor.address,
    hours: initialDoctor.hours,
    legalNotice:
      "Membre d'une association de gestion agréée par l'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.",
  });

  // Chargement des coordonnées officielles depuis la base de données MySQL
  useEffect(() => {
    const fetchClinicInfo = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCabinetInfo();
        if (data) {
          setClinic(data);
        }
      } catch (err) {
        console.error("Erreur chargement coordonnées cabinet :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinicInfo();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await ApiService.updateCabinetInfo(clinic);
      Swal.fire({
        icon: "success",
        title: "Coordonnées enregistrées dans la Base de Données",
        text: "Les informations officielles du cabinet et du médecin titulaire sont maintenant synchronisées avec MySQL.",
        confirmButtonColor: "#1e60d5",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erreur de synchronisation",
        text: "Impossible d'enregistrer dans MySQL : " + err.message,
        confirmButtonColor: "#1e60d5",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu="Cabinet et configuration" activeMenu="Mon cabinet" />

      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h4 className="card-title">Fiche d'Identité & Configuration du Cabinet</h4>
                <p className="text-muted fs-13 mb-0">
                  Ces informations officielles figurent sur les ordonnances, factures et courriers (Base MySQL)
                </p>
              </div>
              <span className="badge badge-success badge-pill light">
                <i className="fa fa-database me-1"></i> Connecté à la Base de Données
              </span>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Chargement des coordonnées depuis MySQL...</p>
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  <h5 className="text-primary font-w600 mb-3 border-bottom pb-2">
                    1. Identification de la Structure
                  </h5>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Nom du Cabinet Médical *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.clinicName}
                        onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Médecin Titulaire Exploitant *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.doctorName}
                        onChange={(e) => setClinic({ ...clinic, doctorName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Titre & Qualification</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.title}
                        onChange={(e) => setClinic({ ...clinic, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Spécialité déclarée</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.specialty}
                        onChange={(e) => setClinic({ ...clinic, specialty: e.target.value })}
                      />
                    </div>
                  </div>

                  <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
                    2. Identifiants Professionnels & Réglementaires
                  </h5>
                  <div className="row mb-3">
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Numéro RPPS *</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={clinic.rpps}
                        onChange={(e) => setClinic({ ...clinic, rpps: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Numéro ADELI</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={clinic.adeli}
                        onChange={(e) => setClinic({ ...clinic, adeli: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">N° Inscription Ordre</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={clinic.orderNumber}
                        onChange={(e) => setClinic({ ...clinic, orderNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Conventionnement</label>
                      <select
                        className="form-control"
                        value={clinic.convention}
                        onChange={(e) => setClinic({ ...clinic, convention: e.target.value })}
                      >
                        <option value="Secteur Conventionné">Secteur Conventionné</option>
                        <option value="Secteur 1 (Tarif conventionné)">Secteur 1 (Sans dépassement)</option>
                        <option value="Secteur 2 (Honoraires libres)">Secteur 2 (Honoraires libres)</option>
                        <option value="Non conventionné">Non conventionné</option>
                      </select>
                    </div>
                  </div>

                  <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
                    3. Coordonnées & Horaires de Consultation
                  </h5>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Adresse géographique du cabinet *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.address}
                        onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Téléphone du standard *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.phone}
                        onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Email professionnel</label>
                      <input
                        type="email"
                        className="form-control"
                        value={clinic.email}
                        onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label font-w500">Horaires d'accueil & de consultation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clinic.hours}
                      onChange={(e) => setClinic({ ...clinic, hours: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label font-w500">Mentions légales obligatoires (Factures & Ordonnances)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={clinic.legalNotice}
                      onChange={(e) => setClinic({ ...clinic, legalNotice: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" className="btn-rounded" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enregistrement en cours...
                        </>
                      ) : (
                        <>
                          <i className="flaticon-381-check-2 me-1"></i> Sauvegarder dans la base de données
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicProfilePage;

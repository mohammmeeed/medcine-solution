import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import ApiService from "../../../services/ApiService";
import { initialDoctor } from "../../../services/CabinetData";

const ClinicProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [clinic, setClinic] = useState({
    clinicName: "Cabinet Médical belbachir",
    doctorName: initialDoctor.name,
    doctorNameAr: "الدكتورة ن. بلبشير ولد هنية • طبيبة مختصة",
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
    secretaryPhone: "0560 06 74 66",
    address: initialDoctor.address,
    hours: "Samedi — Jeudi: 09:00 — 18:00",
    closedDays: "Vendredi: Fermé",
    aboutText: "",
    aboutSummary: "",
    slotDuration: 30,
    slotStartMorning: "09:00",
    slotEndMorning: "12:30",
    slotStartEvening: "13:00",
    slotEndEvening: "18:00",
    mapsUrl: "https://maps.google.com/?q=Gynecologue+Belbachir+Ouldhennia!5e0",
    mapsIframe: "",
    doctorPhoto: "/doctor.jpg",
    legalNotice:
      "Membre d'une association de gestion agréée par l'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.",
  });

  // Gestion du téléversement et compression automatique de la photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Format non supporté",
        text: "Veuillez sélectionner une image (JPG, PNG ou WEBP).",
        confirmButtonColor: "#1e60d5",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionnement fluide si l'image est très lourde (> 1000px)
        const canvas = document.createElement("canvas");
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setClinic((prev) => ({
          ...prev,
          doctorPhoto: optimizedDataUrl,
        }));

        Swal.fire({
          icon: "info",
          title: "Nouvelle photo chargée",
          text: "La photo est prête en aperçu. Cliquez sur « Enregistrer » pour valider la mise en ligne.",
          timer: 3000,
          showConfirmButton: false,
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    setClinic((prev) => ({
      ...prev,
      doctorPhoto: "/doctor.jpg",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Chargement des coordonnées officielles depuis la base de données MySQL
  useEffect(() => {
    const fetchClinicInfo = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCabinetInfo();
        if (data) {
          setClinic((prev) => ({
            ...prev,
            ...data,
          }));
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
      try {
        localStorage.setItem("cabinet_info", JSON.stringify(clinic));
      } catch (err) {}
      Swal.fire({
        icon: "success",
        title: "Informations enregistrées",
        text: "Toutes les informations du cabinet et du site public ont été enregistrées avec succès.",
        confirmButtonColor: "#1e60d5",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erreur d'enregistrement",
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
                  Ces informations officielles figurent sur le site public, ordonnances et factures
                </p>
              </div>
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
                    1. Identification de la Structure & Praticien
                  </h5>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Nom du Cabinet Médical *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.clinicName || ""}
                        onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Médecin Titulaire Exploitant *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.doctorName || ""}
                        onChange={(e) => setClinic({ ...clinic, doctorName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Titre & Qualification</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.title || ""}
                        onChange={(e) => setClinic({ ...clinic, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Spécialité déclarée *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.specialty || ""}
                        onChange={(e) => setClinic({ ...clinic, specialty: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Titre & Praticien en Arabe (Site Public)</label>
                      <input
                        type="text"
                        className="form-control"
                        dir="rtl"
                        value={clinic.doctorNameAr || ""}
                        onChange={(e) => setClinic({ ...clinic, doctorNameAr: e.target.value })}
                      />
                    </div>
                  </div>

                  <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2 d-flex align-items-center">
                    <i className="flaticon-381-picture me-2"></i>
                    2. Photo Officielle du Médecin (Affichée sur le Site Public)
                  </h5>
                  <div
                    className="card mb-4"
                    style={{
                      background: "#f8fafd",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      overflow: "hidden",
                    }}
                  >
                    <div className="card-body p-3 p-md-4">
                      <div className="row align-items-center">
                        {/* Cadre Aperçu en direct façon portail patient */}
                        <div className="col-lg-4 col-md-5 text-center mb-3 mb-md-0">
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              maxWidth: "280px",
                              margin: "0 auto",
                              borderRadius: "16px",
                              overflow: "hidden",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                              border: "3px solid #10b981",
                              background: "#0c1713",
                            }}
                          >
                            <img
                              src={clinic.doctorPhoto || "/doctor.jpg"}
                              alt={clinic.doctorName || "Dr. Titulaire"}
                              style={{
                                width: "100%",
                                height: "210px",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.target.src = "/doctor.jpg";
                              }}
                            />
                            {/* Badge Consultations Ouvertes comme sur le site public */}
                            <div
                              style={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                                background: "rgba(16, 185, 129, 0.95)",
                                color: "#ffffff",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                              }}
                            >
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  background: "#ffffff",
                                  display: "inline-block",
                                }}
                              ></span>
                              Consultations Ouvertes
                            </div>
                          </div>
                          <small className="text-muted d-block mt-2 font-w500 fs-12">
                            Aperçu réel sur l'accueil et la page À Propos
                          </small>
                        </div>

                        {/* Contrôles de sélection de fichier et d'URL */}
                        <div className="col-lg-8 col-md-7">
                          <h6 className="font-w600 text-dark mb-2">Modifier l'image affichée sur le site</h6>
                          <p className="text-muted fs-13 mb-3">
                            Cette image est la photo officielle du médecin affichée sur la page d'accueil du portail patient (au-dessus du bouton de réservation) ainsi que sur la fiche profil de la section « À Propos ».
                          </p>

                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              style={{ display: "none" }}
                              onChange={handlePhotoUpload}
                            />
                            <button
                              type="button"
                              className="btn btn-primary btn-sm rounded"
                              onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                              <i className="flaticon-381-upload me-1"></i> Téléverser une photo (JPG, PNG, WEBP)
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm rounded"
                              onClick={handleResetPhoto}
                              title="Rétablir la photo par défaut du site"
                            >
                              <i className="flaticon-381-refresh me-1"></i> Rétablir photo par défaut
                            </button>
                          </div>

                          <div className="mt-3">
                            <label className="form-label font-w500 fs-13 mb-1">
                              Ou saisir / coller un lien direct d'image (URL web ou chemin local) :
                            </label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-white">
                                <i className="flaticon-381-link"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="/doctor.jpg ou https://exemple.com/photo.jpg"
                                value={clinic.doctorPhoto || ""}
                                onChange={(e) => setClinic({ ...clinic, doctorPhoto: e.target.value })}
                              />
                              {clinic.doctorPhoto && clinic.doctorPhoto.startsWith("data:") && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={handleResetPhoto}
                                  title="Effacer la photo téléversée"
                                >
                                  Retirer
                                </button>
                              )}
                            </div>
                            <small className="text-muted fs-11 mt-1 d-block">
                              Formats supportés : JPEG, PNG, WEBP. L'image est automatiquement optimisée pour un chargement instantané.
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
                    3. Présentation du Cabinet (Site Public)
                  </h5>
                  <div className="mb-3">
                    <label className="form-label font-w500">Texte de présentation complet (Page d'accueil du site public)</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={clinic.aboutText || ""}
                      onChange={(e) => setClinic({ ...clinic, aboutText: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label font-w500">Résumé court du cabinet (Onglet À Propos du site public)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={clinic.aboutSummary || ""}
                      onChange={(e) => setClinic({ ...clinic, aboutSummary: e.target.value })}
                    ></textarea>
                  </div>

                  <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
                    4. Paramètres de Réservation & Créneaux (Site Public)
                  </h5>
                  <div className="row mb-3">
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Durée d'un créneau de consultation *</label>
                      <select
                        className="form-control"
                        value={clinic.slotDuration || 30}
                        onChange={(e) => setClinic({ ...clinic, slotDuration: parseInt(e.target.value, 10) })}
                        required
                      >
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={25}>25 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={40}>40 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes (1 heure)</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Heure début matin</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="09:00"
                        value={clinic.slotStartMorning || ""}
                        onChange={(e) => setClinic({ ...clinic, slotStartMorning: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Heure fin matin</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="12:30"
                        value={clinic.slotEndMorning || ""}
                        onChange={(e) => setClinic({ ...clinic, slotEndMorning: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Heure début après-midi</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="13:00"
                        value={clinic.slotStartEvening || ""}
                        onChange={(e) => setClinic({ ...clinic, slotStartEvening: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Heure fin après-midi</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="18:00"
                        value={clinic.slotEndEvening || ""}
                        onChange={(e) => setClinic({ ...clinic, slotEndEvening: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Jour de fermeture</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Vendredi: Fermé"
                        value={clinic.closedDays || ""}
                        onChange={(e) => setClinic({ ...clinic, closedDays: e.target.value })}
                      />
                    </div>
                  </div>

                  <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
                    5. Coordonnées, Contact & Localisation
                  </h5>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label font-w500">Adresse géographique du cabinet *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.address || ""}
                        onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Téléphone Secrétariat & RDV *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.secretaryPhone || ""}
                        onChange={(e) => setClinic({ ...clinic, secretaryPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="form-label font-w500">Téléphone du standard</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clinic.phone || ""}
                        onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Email professionnel</label>
                      <input
                        type="email"
                        className="form-control"
                        value={clinic.email || ""}
                        onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Horaires d'accueil & de consultation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Samedi — Jeudi: 09:00 — 18:00"
                        value={clinic.hours || ""}
                        onChange={(e) => setClinic({ ...clinic, hours: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label font-w500">Lien Google Maps (Ouvrir GPS)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://maps.google.com/..."
                        value={clinic.mapsUrl || ""}
                        onChange={(e) => setClinic({ ...clinic, mapsUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label font-w500">Lien d'intégration Carte Google Maps (Iframe)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://www.google.com/maps/embed?..."
                      value={clinic.mapsIframe || ""}
                      onChange={(e) => setClinic({ ...clinic, mapsIframe: e.target.value })}
                    />
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
                          <i className="flaticon-381-check-2 me-1"></i> Enregistrer
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

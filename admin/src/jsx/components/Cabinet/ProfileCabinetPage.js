import React, { useState } from "react";
import { Button, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import profile2 from "../../../images/profile/pic1.jpg";
import { initialDoctor } from "../../../services/CabinetData";

const ProfileCabinetPage = () => {
  const [profile, setProfile] = useState({
    name: initialDoctor.name,
    email: initialDoctor.email,
    title: initialDoctor.title,
    specialty: initialDoctor.specialty,
    phone: initialDoctor.phone,
    rpps: initialDoctor.rpps,
    adeli: initialDoctor.adeli,
    currentPassword: "",
    newPassword: "",
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "Profil praticien mis à jour",
      text: "Vos informations de connexion et d'exercice ont été enregistrées.",
      confirmButtonColor: "#1e60d5",
    });
  };

  return (
    <>
      <PageTitle motherMenu="Principal" activeMenu="Profil Praticien" />

      <div className="row">
        {/* Carte Profil Médecin */}
        <div className="col-xl-4 col-lg-5">
          <div className="card">
            <div className="card-body text-center p-4">
              <div className="profile-photo mb-3">
                <img
                  src={profile2}
                  className="img-fluid rounded-circle"
                  alt={profile.name}
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
              </div>
              <h4 className="font-w600 mb-1">{profile.name}</h4>
              <p className="text-muted fs-13 mb-2">{profile.title}</p>
              <Badge bg="primary" className="light mb-3">
                Médecin Titulaire — Administrateur
              </Badge>

              <div className="text-start border-top pt-3 fs-13 text-muted">
                <p className="mb-2">
                  <i className="flaticon-381-id-card-1 me-2 text-primary"></i>
                  N° RPPS : <strong className="text-dark">{profile.rpps}</strong>
                </p>
                <p className="mb-2">
                  <i className="flaticon-381-id-card me-2 text-primary"></i>
                  N° Adeli : <strong className="text-dark">{profile.adeli}</strong>
                </p>
                <p className="mb-2">
                  <i className="flaticon-381-mail me-2 text-primary"></i>
                  {profile.email}
                </p>
                <p className="mb-0">
                  <i className="flaticon-381-smartphone me-2 text-primary"></i>
                  {profile.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire Modification Profil & Sécurité */}
        <div className="col-xl-8 col-lg-7">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="card-title">Paramètres du Compte Praticien</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleUpdate}>
                <h5 className="text-primary font-w600 mb-3 border-bottom pb-2">
                  Informations Générales
                </h5>
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label font-w500">Nom complet *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label font-w500">Email professionnel *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label font-w500">Qualification</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label font-w500">Téléphone direct</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
                  Sécurité & Mot de Passe
                </h5>
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label font-w500">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={profile.currentPassword}
                      onChange={(e) =>
                        setProfile({ ...profile, currentPassword: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label font-w500">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Nouveau mot de passe complexe"
                      value={profile.newPassword}
                      onChange={(e) =>
                        setProfile({ ...profile, newPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <Button variant="primary" type="submit" className="btn-rounded">
                    Mettre à jour mon profil
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCabinetPage;

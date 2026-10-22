import React, { useState } from "react";
import { Link } from "react-router-dom";

import PageTitle from "../../layouts/PageTitle";
import {
  initialPatients,
  initialConsultations,
} from "../../../services/CabinetData";

const MedicalRecordsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients] = useState(initialPatients);

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      p.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.secuNumber.includes(searchTerm)
    );
  });

  return (
    <>
      <PageTitle motherMenu="Gestion médicale" activeMenu="Dossiers médicaux" />

      {/* Barre d'action et recherche */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div>
          <h4 className="text-primary font-w600 mb-1">Dossiers Médicaux Partagés du Cabinet</h4>
          <p className="text-muted fs-13 mb-0">
            Consultation intégrale de l'anamnèse, des allergies et des antécédents des patients
          </p>
        </div>

        <div className="input-group search-area w-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par dossier, nom, n° sécu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="input-group-text">
            <i className="flaticon-381-search-2"></i>
          </span>
        </div>
      </div>

      <style>{`
        .record-file-code {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.3px;
        }
        .record-clean-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          color: #334155;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.35;
        }
        .record-clean-tag .tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .tag-dot.dot-danger {
          background-color: #dc2626;
        }
        .tag-dot.dot-warning {
          background-color: #d97706;
        }
        .tag-dot.dot-neutral {
          background-color: #94a3b8;
        }
      `}</style>

      {/* Cartes récapitulatives des dossiers patients */}
      <div className="row">
        {filteredPatients.map((p) => {
          const patientConsults = initialConsultations.filter((c) => c.patientId === p.id);
          const hasAllergies = p.allergies && p.allergies.length > 0 && p.allergies[0] !== "Aucune allergie connue";

          return (
            <div key={p.id} className="col-xl-6 col-xxl-6 col-lg-12">
              <div className="card">
                <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-start">
                  <div>
                    <span className="record-file-code mb-1">
                      {p.fileNumber}
                    </span>
                    <h4 className="card-title mb-0">
                      <Link to={`/patient-details?id=${p.id}`} className="hover-primary">
                        {p.lastName.toUpperCase()} {p.firstName}
                      </Link>
                    </h4>
                    <p className="text-muted fs-12 mb-0">
                      {p.gender} • Né(e) le {p.dob} ({p.age || 35} ans) • Groupe {p.bloodGroup}
                    </p>
                  </div>
                  <Link
                    to={`/patient-details?id=${p.id}`}
                    className="btn btn-primary btn-sm btn-rounded"
                  >
                    Ouvrir dossier <i className="flaticon-381-next ms-1"></i>
                  </Link>
                </div>

                <div className="card-body">
                  {/* Allergies & Facteurs de risque */}
                  <div className="mb-3">
                    <span className="text-muted fs-12 d-block mb-1">
                      <strong>ALLERGIES & CONTRE-INDICATIONS :</strong>
                    </span>
                    {hasAllergies ? (
                      <div className="d-flex flex-wrap gap-2">
                        {p.allergies.map((all, i) => (
                          <span key={i} className="record-clean-tag">
                            <span className="tag-dot dot-danger"></span>
                            {all}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted fs-13">
                        Aucune allergie connue
                      </span>
                    )}
                  </div>

                  {/* Pathologies chroniques */}
                  <div className="mb-3">
                    <span className="text-muted fs-12 d-block mb-1">
                      <strong>PATHOLOGIES CHRONIQUES / ALD :</strong>
                    </span>
                    {p.chronicDiseases && p.chronicDiseases.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {p.chronicDiseases.map((dis, i) => (
                          <span key={i} className="record-clean-tag">
                            <span className="tag-dot dot-warning"></span>
                            {dis}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted fs-13">Aucune affection longue durée</span>
                    )}
                  </div>

                  {/* Traitements habituels */}
                  <div className="mb-3">
                    <span className="text-muted fs-12 d-block mb-1">
                      <strong>TRAITEMENTS EN COURS :</strong>
                    </span>
                    {p.regularTreatments && p.regularTreatments.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {p.regularTreatments.map((t, idx) => (
                          <span key={idx} className="record-clean-tag">
                            <span className="tag-dot dot-neutral"></span>
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted fs-13">Aucun traitement de fond</span>
                    )}
                  </div>

                  {/* Historique récent des consultations */}
                  <div className="border-top pt-2 d-flex justify-content-between align-items-center flex-wrap fs-12 text-muted">
                    <span>
                      <i className="flaticon-381-notepad me-1 text-primary"></i>
                      {patientConsults.length} consultation(s) archivée(s)
                    </span>
                    <span>
                      Dernière visite : <strong>{p.lastVisit || "N/A"}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MedicalRecordsPage;

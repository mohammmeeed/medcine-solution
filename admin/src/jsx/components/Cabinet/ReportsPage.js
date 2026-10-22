import React from "react";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import PageTitle from "../../layouts/PageTitle";
import { initialPatients } from "../../../services/CabinetData";

const RevenueChart = loadable(() =>
  pMinDelay(import("../Dashboard/charts/home/RevenueChart"), 600)
);
const VisitorChart = loadable(() =>
  pMinDelay(import("../Dashboard/charts/home/VisitorChart"), 600)
);
const ChartCircle = loadable(() =>
  pMinDelay(import("../Dashboard/charts/home/ChartCircle"), 600)
);

const ReportsPage = () => {
  const totalPatients = initialPatients.length + 185;
  const totalConsultations = 482; // Annuel
  const completedRate = "94%";
  const missedRate = "6%";
  const monthlyRevenue = "580 000 DA";
  const paidInvoicesRate = "92%";

  return (
    <>
      <PageTitle motherMenu="Gestion administrative" activeMenu="Rapports & Statistiques" />

      {/* Cartes métriques récapitulatives */}
      <div className="row">
        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-user-7 fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Patientèle active</p>
                  <h3 className="text-primary font-w600 mb-0">{totalPatients}</h3>
                  <small className="text-success">+12 ce mois-ci</small>
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
                  <i className="flaticon-381-notepad fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Consultations (Année)</p>
                  <h3 className="text-info font-w600 mb-0">{totalConsultations}</h3>
                  <small className="text-muted">Moyenne: 22 / jour</small>
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
                  <i className="flaticon-381-calendar fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Taux d'assiduité</p>
                  <h3 className="text-success font-w600 mb-0">{completedRate}</h3>
                  <small className="text-danger">RDV non honorés : {missedRate}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-warning text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-diamond fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Chiffre d'Affaires Mensuel</p>
                  <h3 className="text-warning font-w600 mb-0">{monthlyRevenue}</h3>
                  <small className="text-success">{paidInvoicesRate} recouvré</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques d'activité médicale et financière */}
      <div className="row">
        {/* Évolution des consultations */}
        <div className="col-xl-8 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <div>
                <h4 className="card-title">Évolution du Volume de Consultations</h4>
                <p className="text-muted fs-13 mb-0">Fréquentation du cabinet par semaine</p>
              </div>
            </div>
            <div className="card-body px-3 pt-2 pb-0">
              <div id="chartStrock">
                <VisitorChart />
              </div>
            </div>
          </div>
        </div>

        {/* Répartition des actes et pathologies */}
        <div className="col-xl-4 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="card-title">Typologie de la Patientèle</h4>
              <p className="text-muted fs-13 mb-0">Répartition par catégorie de soins</p>
            </div>
            <div className="card-body pt-2">
              <div id="chartCircle" className="mb-3">
                <ChartCircle />
              </div>
              <div className="patients-chart-deta">
                <div className="col px-0 mb-2">
                  <span className="bg-primary"></span>
                  <div>
                    <p className="mb-0 text-muted">Médecine Générale Adulte</p>
                    <h5 className="mb-0">65%</h5>
                  </div>
                </div>
                <div className="col px-0 mb-2">
                  <span className="bg-success"></span>
                  <div>
                    <p className="mb-0 text-muted">Affection Longue Durée (ALD)</p>
                    <h5 className="mb-0">22%</h5>
                  </div>
                </div>
                <div className="col px-0">
                  <span className="bg-warning"></span>
                  <div>
                    <p className="mb-0 text-muted">Pédiatrie & Vaccinations</p>
                    <h5 className="mb-0">13%</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique de Chiffre d'Affaires et Recettes */}
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <div>
                <h4 className="card-title">Chiffre d'Affaires & Encaissements</h4>
                <p className="text-muted fs-13 mb-0">Honoraires conventionnés du cabinet</p>
              </div>
            </div>
            <div className="card-body">
              <div id="revenueChart">
                <RevenueChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;

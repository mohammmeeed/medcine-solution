import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import {
  initialDoctor,
  initialPatients,
  initialInvoices,
} from "../../../services/CabinetData";

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const [formInvoice, setFormInvoice] = useState({
    patientId: 1,
    actDescription: "Consultation de médecine générale (Code G)",
    amount: 26.50,
    coveredAmo: 18.55,
    coveredAmc: 7.95,
    patientRemaining: 0.00,
    paymentMethod: "Carte Bancaire",
    status: "Payée",
  });

  const handleActChange = (act) => {
    switch (act) {
      case "G":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Consultation de médecine générale",
          amount: 2500,
          coveredAmo: 2000,
          coveredAmc: 500,
          patientRemaining: 0,
        });
        break;
      case "G_MEG":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Consultation Enfant / Pédiatrie",
          amount: 3000,
          coveredAmo: 2400,
          coveredAmc: 600,
          patientRemaining: 0,
        });
        break;
      case "G_ECG":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Consultation avec Électrocardiogramme (ECG)",
          amount: 3500,
          coveredAmo: 3500,
          coveredAmc: 0,
          patientRemaining: 0,
        });
        break;
      case "VISITE":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Visite médicale à domicile",
          amount: 3500,
          coveredAmo: 2500,
          coveredAmc: 1000,
          patientRemaining: 0,
        });
        break;
      default:
        break;
    }
  };

  const handleSaveInvoice = (e) => {
    e.preventDefault();
    const pat =
      initialPatients.find((p) => p.id === parseInt(formInvoice.patientId)) ||
      initialPatients[0];

    const newInv = {
      id: invoices.length + 1,
      invoiceNumber: `FAC-2024-025${invoices.length + 2}`,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      date: new Date().toISOString().split("T")[0],
      actDescription: formInvoice.actDescription,
      amount: parseFloat(formInvoice.amount),
      coveredAmo: parseFloat(formInvoice.coveredAmo),
      coveredAmc: parseFloat(formInvoice.coveredAmc),
      patientRemaining: parseFloat(formInvoice.patientRemaining),
      paymentMethod: formInvoice.paymentMethod,
      status: formInvoice.status,
    };

    setInvoices([newInv, ...invoices]);
    setShowNewModal(false);

    Swal.fire({
      icon: "success",
      title: "Facture créée",
      text: `Facture #${newInv.invoiceNumber} enregistrée pour ${newInv.patientName}.`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    const matchSearch =
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.actDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "Payée")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status !== "Payée")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <>
      <PageTitle motherMenu="Gestion administrative" activeMenu="Factures" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <Button
          variant="primary"
          className="btn-rounded"
          onClick={() => setShowNewModal(true)}
        >
          <i className="flaticon-381-add-1 me-2"></i> Émettre une Facture
        </Button>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="input-group search-area w-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher facture, patient..."
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
            <option value="all">Tous les états</option>
            <option value="Payée">Payée</option>
            <option value="Télétransmise">Télétransmise</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      {/* Cartes métriques de facturation */}
      <div className="row">
        <div className="col-xl-4 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-calculator fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Total Facturé</p>
                  <h3 className="text-primary font-w600 mb-0">{totalBilled.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">{invoices.length} actes réalisés</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-diamond fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Encaissé</p>
                  <h3 className="text-success font-w600 mb-0">{totalPaid.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Règlements patients</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-warning text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-clock fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">En attente / Télétransmis</p>
                  <h3 className="text-warning font-w600 mb-0">{totalPending.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Tiers-payant CNAS / Mutuelle</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .invoice-clean-tag {
          display: inline-block;
          padding: 3px 9px;
          background-color: #f8fafc;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.35;
          white-space: nowrap;
        }
      `}</style>

      {/* Tableau des factures */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Factures & Feuilles de Soins Électroniques</h4>
            <p className="text-muted fs-13 mb-0">
              Cabinet Médical de Gynécologie Obstétrique • Dr N. BELBACHIR OULD HENNIA
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>N° FACTURE</strong></th>
                  <th><strong>DATE</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>ACTE / COTATION</strong></th>
                  <th><strong>MONTANT TOTAL</strong></th>
                  <th><strong>PART AMO (SÉCU)</strong></th>
                  <th><strong>RESTE PATIENT</strong></th>
                  <th><strong>RÈGLEMENT</strong></th>
                  <th><strong>DÉTAIL</strong></th>
                  <th><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      Aucune facture trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong className="text-primary">{inv.invoiceNumber}</strong>
                      </td>
                      <td>{inv.date}</td>
                      <td>
                        <Link
                          to={`/patient-details?id=${inv.patientId}`}
                          className="font-w600 text-dark hover-primary"
                        >
                          {inv.patientName}
                        </Link>
                      </td>
                      <td>
                        <span className="text-dark fs-13">{inv.actDescription}</span>
                      </td>
                      <td>
                        <strong className="text-dark">{inv.amount.toLocaleString("fr-DZ")} DA</strong>
                      </td>
                      <td>{inv.coveredAmo.toLocaleString("fr-DZ")} DA</td>
                      <td>
                        {inv.patientRemaining > 0 ? (
                          <strong className="text-danger">{inv.patientRemaining.toLocaleString("fr-DZ")} DA</strong>
                        ) : (
                          <span className="text-success font-w600">0 DA</span>
                        )}
                      </td>
                      <td>
                        <span className="invoice-clean-tag">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-xs"
                          onClick={() => setPreviewInvoice(inv)}
                          title="Afficher les détails de la facture"
                        >
                          <i className="fa fa-eye"></i>
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-xs"
                            onClick={() => setPreviewInvoice(inv)}
                            title="Imprimer la facture / reçu"
                          >
                            <i className="flaticon-381-print"></i>
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

      {/* Modal Nouvelle Facture */}
      <Modal show={showNewModal} onHide={() => setShowNewModal(false)} size="lg" centered>
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="flaticon-381-calculator me-2 text-primary"></i>
            Émettre une Facture d'Honoraires Médicaux
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowNewModal(false)}></button>
        </div>
        <form onSubmit={handleSaveInvoice}>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label font-w600">Patient *</label>
                <select
                  className="form-control"
                  value={formInvoice.patientId}
                  onChange={(e) =>
                    setFormInvoice({ ...formInvoice, patientId: e.target.value })
                  }
                  required
                >
                  {initialPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} ({p.fileNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label font-w600">Acte standardisé</label>
                <select
                  className="form-control"
                  onChange={(e) => handleActChange(e.target.value)}
                  defaultValue="G"
                >
                  <option value="G">Consultation médecine générale (2 500 DA)</option>
                  <option value="G_MEG">Consultation enfant / pédiatrie (3 000 DA)</option>
                  <option value="G_ECG">Consultation + Électrocardiogramme (3 500 DA)</option>
                  <option value="VISITE">Visite médicale à domicile (3 500 DA)</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label font-w600">Libellé de l'acte</label>
              <input
                type="text"
                className="form-control"
                value={formInvoice.actDescription}
                onChange={(e) =>
                  setFormInvoice({ ...formInvoice, actDescription: e.target.value })
                }
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label font-w600">Montant total (DA) *</label>
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  value={formInvoice.amount}
                  onChange={(e) =>
                    setFormInvoice({ ...formInvoice, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label font-w600">Prise en charge CNAS (DA)</label>
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  value={formInvoice.coveredAmo}
                  onChange={(e) =>
                    setFormInvoice({ ...formInvoice, coveredAmo: e.target.value })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label font-w600">Reste patient (DA)</label>
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  value={formInvoice.patientRemaining}
                  onChange={(e) =>
                    setFormInvoice({ ...formInvoice, patientRemaining: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label font-w600">Mode de règlement</label>
                <select
                  className="form-control"
                  value={formInvoice.paymentMethod}
                  onChange={(e) =>
                    setFormInvoice({ ...formInvoice, paymentMethod: e.target.value })
                  }
                >
                  <option value="Carte Bancaire">Carte Bancaire</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Tiers-Payant CPAM">Tiers-Payant CPAM</option>
                  <option value="Virement">Virement bancaire</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label font-w600">Statut de la facture</label>
                <select
                  className="form-control"
                  value={formInvoice.status}
                  onChange={(e) =>
                    setFormInvoice({ ...formInvoice, status: e.target.value })
                  }
                >
                  <option value="Payée">Payée (Règlement encaissé)</option>
                  <option value="Télétransmise">Télétransmise (Attente virement CPAM)</option>
                  <option value="En attente">En attente de paiement</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="danger" light onClick={() => setShowNewModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Enregistrer la facture
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Aperçu & Impression Facture Patient */}
      <Modal
        show={!!previewInvoice}
        onHide={() => setPreviewInvoice(null)}
        size="lg"
        centered
      >
        <div className="modal-header">
          <h5 className="modal-title">Note d'honoraires & Facture médicale</h5>
          <button type="button" className="btn-close" onClick={() => setPreviewInvoice(null)}></button>
        </div>
        <div className="modal-body p-4 bg-light">
          {previewInvoice && (
            <div className="p-4 bg-white shadow-sm border rounded">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                <div>
                  <h4 className="text-primary font-w600 mb-1">{initialDoctor.name}</h4>
                  <p className="text-muted fs-12 mb-0">{initialDoctor.title} • {initialDoctor.convention}</p>
                  <p className="text-muted fs-12 mb-0">{initialDoctor.address}</p>
                  <p className="text-muted fs-12 mb-0">N° RPPS : {initialDoctor.rpps} • Adeli : {initialDoctor.adeli}</p>
                </div>
                <div className="text-end">
                  <h5 className="font-w600 text-dark mb-1">{previewInvoice.invoiceNumber}</h5>
                  <span className="text-muted fs-13 d-block">Date : {previewInvoice.date}</span>
                  <span className="invoice-clean-tag mt-1">
                    {previewInvoice.status || "Payée"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted fs-12 mb-1">FACTURÉ À :</h6>
                <h5 className="text-dark font-w600 mb-0">{previewInvoice.patientName}</h5>
                <span className="text-muted fs-13">Bénéficiaire des soins</span>
              </div>

              <table className="table table-bordered mb-4">
                <thead className="table-light">
                  <tr>
                    <th>Désignation de l'acte</th>
                    <th className="text-end">Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{previewInvoice.actDescription}</td>
                    <td className="text-end font-w600">{previewInvoice.amount.toLocaleString("fr-DZ")} DA</td>
                  </tr>
                  <tr>
                    <td className="text-muted fs-13">Prise en charge CNAS</td>
                    <td className="text-end text-muted fs-13">- {previewInvoice.coveredAmo.toLocaleString("fr-DZ")} DA</td>
                  </tr>
                  {previewInvoice.coveredAmc > 0 && (
                    <tr>
                      <td className="text-muted fs-13">Prise en charge complémentaire (Mutuelle)</td>
                      <td className="text-end text-muted fs-13">- {previewInvoice.coveredAmc.toLocaleString("fr-DZ")} DA</td>
                    </tr>
                  )}
                  <tr className="table-primary">
                    <td><strong>Reste à charge patient payé ({previewInvoice.paymentMethod})</strong></td>
                    <td className="text-end font-w700 fs-16">{previewInvoice.patientRemaining.toLocaleString("fr-DZ")} DA</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-muted fs-12 border-top pt-2">
                Membre d'une association de gestion agréée par l'administration fiscale, acceptant à ce titre le règlement des honoraires par chèque et carte bancaire.
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setPreviewInvoice(null)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="flaticon-381-print me-1"></i> Imprimer la note d'honoraires
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default InvoicesPage;

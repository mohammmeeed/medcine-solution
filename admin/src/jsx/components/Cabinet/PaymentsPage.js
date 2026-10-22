import React, { useState } from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import {
  initialPayments,
  initialPatients,
  initialDoctor,
} from "../../../services/CabinetData";

const PaymentsPage = () => {
  const [payments, setPayments] = useState(initialPayments);
  const [methodFilter, setMethodFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const [formPayment, setFormPayment] = useState({
    patientId: 1,
    invoiceNumber: "FAC-2024-0250",
    amount: 26.50,
    method: "Carte Bancaire",
    operator: "Sophie Vasseur",
    notes: "",
  });

  const handleSavePayment = (e) => {
    e.preventDefault();
    const pat =
      initialPatients.find((p) => p.id === parseInt(formPayment.patientId)) ||
      initialPatients[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const created = {
      id: payments.length + 1,
      date: now.toISOString().split("T")[0],
      time: timeStr,
      receiptNumber: `REC-2024-018${payments.length + 3}`,
      patientName: `${pat.firstName} ${pat.lastName}`,
      invoiceNumber: formPayment.invoiceNumber,
      amount: parseFloat(formPayment.amount),
      method: formPayment.method,
      operator: formPayment.operator,
      status: "Encaissé",
    };

    setPayments([created, ...payments]);
    setShowAddModal(false);

    Swal.fire({
      icon: "success",
      title: "Règlement enregistré !",
      text: `Reçu #${created.receiptNumber} généré (${created.amount.toLocaleString("fr-DZ")} DA).`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const filteredPayments = payments.filter((p) => {
    if (methodFilter === "all") return true;
    return p.method.includes(methodFilter);
  });

  // Totaux de caisse
  const totalCaisseJour = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCb = payments
    .filter((p) => p.method.includes("Carte"))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalEspeces = payments
    .filter((p) => p.method.includes("Espèces"))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalCheques = payments
    .filter((p) => p.method.includes("Chèque"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <>
      <PageTitle motherMenu="Gestion administrative" activeMenu="Paiements / Caisse" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <Button
          variant="primary"
          className="btn-rounded"
          onClick={() => setShowAddModal(true)}
        >
          <i className="flaticon-381-add-1 me-2"></i> Encaisser un Règlement
        </Button>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted fs-13">Filtrer par mode :</span>
          <select
            className="form-control w-auto default-select"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="all">Tous les modes de paiement</option>
            <option value="Carte">Carte Bancaire</option>
            <option value="Espèces">Espèces</option>
            <option value="Chèque">Chèque</option>
            <option value="Tiers-Payant">Tiers-Payant CPAM</option>
          </select>
        </div>
      </div>

      {/* Cartes récapitulatives de Caisse */}
      <div className="row">
        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-diamond fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Total Caisse du Jour</p>
                  <h3 className="text-success font-w600 mb-0">{totalCaisseJour.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Tous règlements</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-credit-card fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Cartes Bancaires (TPE / CIB)</p>
                  <h3 className="text-primary font-w600 mb-0">{totalCb.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Télécollecte bancaire</small>
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
                  <i className="flaticon-381-box fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Espèces en Tiroir</p>
                  <h3 className="text-info font-w600 mb-0">{totalEspeces.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Caisse physique</small>
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
                  <i className="flaticon-381-notepad fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Chèques à déposer</p>
                  <h3 className="text-warning font-w600 mb-0">{totalCheques.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Bordereau prêt</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journal des encaissements */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Journal Quotidien des Encaissements</h4>
            <p className="text-muted fs-13 mb-0">
              Traçabilité financière du cabinet conforme aux exigences comptables
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>N° REÇU</strong></th>
                  <th><strong>DATE & HEURE</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>RÉF. FACTURE</strong></th>
                  <th><strong>MONTANT ENCAISSÉ</strong></th>
                  <th><strong>MODE DE RÈGLEMENT</strong></th>
                  <th><strong>OPÉRATEUR</strong></th>
                  <th><strong>STATUT</strong></th>
                  <th><strong>ACTION</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      Aucun encaissement enregistré.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id}>
                      <td>
                        <strong className="text-primary">{pay.receiptNumber}</strong>
                      </td>
                      <td>
                        {pay.date} <span className="text-muted fs-12">à {pay.time}</span>
                      </td>
                      <td>
                        <strong className="text-dark">{pay.patientName}</strong>
                      </td>
                      <td>
                        <span className="badge badge-light border">{pay.invoiceNumber}</span>
                      </td>
                      <td>
                        <strong className="text-success fs-15">{pay.amount.toLocaleString("fr-DZ")} DA</strong>
                      </td>
                      <td>
                        <span className="badge badge-primary light">{pay.method}</span>
                      </td>
                      <td>
                        <span className="text-muted fs-13">{pay.operator}</span>
                      </td>
                      <td>
                        <Badge bg="success" className="light">{pay.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-xs"
                          onClick={() => setPreviewReceipt(pay)}
                          title="Imprimer le reçu"
                        >
                          <i className="flaticon-381-print me-1"></i> Reçu
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Encaisser un règlement */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="flaticon-381-diamond me-2 text-primary"></i>
            Enregistrer un Règlement
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
        </div>
        <form onSubmit={handleSavePayment}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label font-w600">Patient *</label>
              <select
                className="form-control"
                value={formPayment.patientId}
                onChange={(e) =>
                  setFormPayment({ ...formPayment, patientId: e.target.value })
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

            <div className="mb-3">
              <label className="form-label font-w600">Réf. Facture / Acte</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: FAC-2024-0250"
                value={formPayment.invoiceNumber}
                onChange={(e) =>
                  setFormPayment({ ...formPayment, invoiceNumber: e.target.value })
                }
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label font-w600">Montant versé (DA) *</label>
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  value={formPayment.amount}
                  onChange={(e) =>
                    setFormPayment({ ...formPayment, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label font-w600">Mode de paiement *</label>
                <select
                  className="form-control"
                  value={formPayment.method}
                  onChange={(e) =>
                    setFormPayment({ ...formPayment, method: e.target.value })
                  }
                >
                  <option value="Carte Bancaire">Carte Bancaire (TPE)</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Tiers-Payant CPAM">Tiers-Payant CPAM</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label font-w600">Encaissé par (Opérateur)</label>
              <select
                className="form-control"
                value={formPayment.operator}
                onChange={(e) =>
                  setFormPayment({ ...formPayment, operator: e.target.value })
                }
              >
                <option value="Sophie Vasseur">Sophie Vasseur (Secrétaire)</option>
                <option value={initialDoctor.name}>{initialDoctor.name} (Médecin)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="danger" light onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Valider l'encaissement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Reçu de Paiement Imprimable */}
      <Modal
        show={!!previewReceipt}
        onHide={() => setPreviewReceipt(null)}
        centered
      >
        <div className="modal-header">
          <h5 className="modal-title">Reçu de Paiement Patient</h5>
          <button type="button" className="btn-close" onClick={() => setPreviewReceipt(null)}></button>
        </div>
        <div className="modal-body p-4 bg-light">
          {previewReceipt && (
            <div className="p-4 bg-white border rounded text-center">
              <h5 className="text-primary font-w600 mb-1">{initialDoctor.address}</h5>
              <p className="text-muted fs-12 mb-3">{initialDoctor.name} • {initialDoctor.specialty}</p>
              <div className="badge badge-success mb-3">PAIEMENT ACQUITTÉ</div>
              <h2 className="text-dark font-w700 mb-2">{previewReceipt.amount.toLocaleString("fr-DZ")} DA</h2>
              <p className="fs-13 text-muted mb-1">
                Règlement par <strong>{previewReceipt.method}</strong>
              </p>
              <p className="fs-12 text-muted mb-1">
                Patient : <strong>{previewReceipt.patientName}</strong>
              </p>
              <p className="fs-12 text-muted mb-0">
                N° Reçu : {previewReceipt.receiptNumber} • Facture : {previewReceipt.invoiceNumber}
              </p>
              <p className="fs-11 text-muted mt-2">
                Date : {previewReceipt.date} à {previewReceipt.time} • Opérateur : {previewReceipt.operator}
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setPreviewReceipt(null)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="flaticon-381-print me-1"></i> Imprimer le reçu
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PaymentsPage;

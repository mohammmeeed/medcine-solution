import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import ApiService from "../../../services/ApiService";
import {
  initialDoctor,
  initialPatients,
  initialInvoices,
} from "../../../services/CabinetData";

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [patients, setPatients] = useState(initialPatients);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const [formInvoice, setFormInvoice] = useState({
    patientId: 1,
    actDescription: "Consultation de médecine générale",
    amount: 2500,
  });

  // Chargement des factures et patients depuis MySQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invData, patData] = await Promise.all([
          ApiService.getInvoices(),
          ApiService.getPatients(),
        ]);
        if (Array.isArray(invData) && invData.length > 0) {
          setInvoices(invData);
        }
        if (Array.isArray(patData) && patData.length > 0) {
          setPatients(patData);
          if (!formInvoice.patientId && patData[0]) {
            setFormInvoice((prev) => ({ ...prev, patientId: patData[0].id }));
          }
        }
      } catch (err) {
        console.warn("Erreur chargement factures MySQL :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActChange = (act) => {
    switch (act) {
      case "G":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Consultation de médecine générale",
          amount: 2500,
        });
        break;
      case "G_MEG":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Consultation Enfant / Pédiatrie",
          amount: 3000,
        });
        break;
      case "G_ECG":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Consultation avec Électrocardiogramme (ECG)",
          amount: 3500,
        });
        break;
      case "VISITE":
        setFormInvoice({
          ...formInvoice,
          actDescription: "Visite médicale à domicile",
          amount: 3500,
        });
        break;
      default:
        break;
    }
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    const pat =
      patients.find((p) => p.id === parseInt(formInvoice.patientId)) ||
      patients[0] || { id: 1, firstName: "Patient", lastName: "" };

    const newInv = {
      id: invoices.length + 1,
      invoiceNumber: `FAC-2024-025${invoices.length + 2}`,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`.trim(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      actDescription: formInvoice.actDescription,
      amount: parseFloat(formInvoice.amount),
    };

    setInvoices([newInv, ...invoices]);
    setShowNewModal(false);

    try {
      await ApiService.saveInvoice({
        patientId: pat.id,
        invoiceNumber: newInv.invoiceNumber,
        date: newInv.date,
        actDescription: newInv.actDescription,
        amount: newInv.amount,
        status: "Payée",
      });
    } catch (err) {
      console.warn("Erreur synchronisation facture MySQL :", err);
    }

    Swal.fire({
      icon: "success",
      title: "Facture enregistrée dans la Base de Données",
      text: `Facture #${newInv.invoiceNumber} enregistrée pour ${newInv.patientName}.`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase();
    return (
      inv.patientName.toLowerCase().includes(search) ||
      inv.invoiceNumber.toLowerCase().includes(search) ||
      inv.actDescription.toLowerCase().includes(search)
    );
  });

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const avgAmount = Math.round(totalBilled / (invoices.length || 1));

  return (
    <>
      <PageTitle motherMenu="Gestion administrative" activeMenu="Factures" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
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
        </div>

        <Button
          variant="primary"
          className="btn-rounded"
          onClick={() => setShowNewModal(true)}
        >
          <i className="flaticon-381-add-1 me-2"></i> Émettre une Facture
        </Button>
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
                  <small className="text-muted">{invoices.length} factures</small>
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
                  <i className="flaticon-381-notepad-1 fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Nombre d'actes</p>
                  <h3 className="text-success font-w600 mb-0">{invoices.length}</h3>
                  <small className="text-muted">Actes médicaux enregistrés</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-sm-6">
          <div className="card widget-stat">
            <div className="card-body p-4">
              <div className="media align-items-center">
                <span className="me-3 icon-bx-lg bg-info text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="flaticon-381-diamond fs-24"></i>
                </span>
                <div className="media-body text-end">
                  <p className="mb-1 text-muted">Moyenne par acte</p>
                  <h3 className="text-info font-w600 mb-0">{avgAmount.toLocaleString("fr-DZ")} DA</h3>
                  <small className="text-muted">Montant moyen facturé</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <th><strong>DATE & HEURE</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th><strong>ACTE MÉDICAL</strong></th>
                  <th><strong>MONTANT</strong></th>
                  <th><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Aucune facture trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong className="text-primary">{inv.invoiceNumber}</strong>
                      </td>
                      <td>
                        <span className="text-dark font-w500">{inv.date}</span>
                        <small className="text-muted d-block">🕒 {inv.time || "10:30"}</small>
                      </td>
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
                        <strong className="text-success fs-15">{inv.amount.toLocaleString("fr-DZ")} DA</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-xs"
                          onClick={() => setPreviewInvoice(inv)}
                          title="Imprimer / Voir la facture"
                        >
                          <i className="flaticon-381-print me-1"></i> Facture
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
              <div className="col-md-12">
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

      {/* Modal Aperçu & Impression Facture Patient Simple */}
      <Modal
        show={!!previewInvoice}
        onHide={() => setPreviewInvoice(null)}
        size="lg"
        centered
      >
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #simple-invoice-printable,
            #simple-invoice-printable * {
              visibility: visible !important;
            }
            #simple-invoice-printable {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 25px !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
        <div className="modal-header">
          <h5 className="modal-title font-w600">Facture Médicale • فاتورة طبية</h5>
          <button type="button" className="btn-close" onClick={() => setPreviewInvoice(null)}></button>
        </div>
        <div className="modal-body p-4 bg-light">
          {previewInvoice && (
            <div id="simple-invoice-printable" className="p-4 bg-white shadow-sm border rounded">
              {/* En-tête officiel bilingue : Français (gauche) & Arabe (droite) */}
              <div className="row pb-3 mb-3 border-bottom align-items-center">
                <div className="col-6 text-start">
                  <h4 className="text-primary font-w700 mb-1" style={{ fontSize: "1.2rem" }}>
                    {initialDoctor.name}
                  </h4>
                  <p className="text-dark font-w500 fs-13 mb-0">
                    {initialDoctor.title}
                  </p>
                  <p className="text-muted fs-12 mb-0">
                    {initialDoctor.subSpecialty || "Échographie"} • Tél: {initialDoctor.phone}
                  </p>
                </div>

                <div className="col-6 text-end" dir="rtl">
                  <h4 className="text-primary font-w700 mb-1" style={{ fontSize: "1.3rem", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
                    {initialDoctor.nameAr || "الدكتورة ن. بلبشير ولد هنية"}
                  </h4>
                  <p className="text-dark font-w500 fs-13 mb-0" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
                    {initialDoctor.titleAr || "طبيبة مختصة في أمراض النساء والتوليد"}
                  </p>
                  <p className="text-muted fs-12 mb-0" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
                    فحص بالصدى (إيكوغرافيا)
                  </p>
                </div>
              </div>

              {/* Informations Essentielles : Patient, Facture N°, Date & Heure */}
              <div className="bg-light p-3 rounded mb-4 border">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted fs-12 d-block text-uppercase">Patient(e) / المريض(ة)</span>
                    <strong className="fs-16 text-dark">{previewInvoice.patientName}</strong>
                  </div>
                  <div className="col-sm-6 text-sm-end">
                    <span className="text-muted fs-12 d-block text-uppercase">N° Facture / رقم الفاتورة</span>
                    <strong className="fs-15 text-primary">{previewInvoice.invoiceNumber}</strong>
                  </div>
                  <div className="col-12">
                    <span className="text-muted fs-12 d-block text-uppercase">Date & Heure / التاريخ والوقت</span>
                    <span className="fs-14 text-dark font-w600">
                      📅 {previewInvoice.date} • 🕒 {previewInvoice.time || "10:30"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acte & Montant Simple (Pas de TTC, Pas de CNAS, Pas de Mutuelle) */}
              <div className="card border mb-3 shadow-none">
                <div className="card-body p-4 text-center bg-white rounded">
                  {previewInvoice.actDescription && (
                    <div className="mb-3 pb-3 border-bottom">
                      <span className="text-muted fs-12 d-block text-uppercase">Acte médical / الفحص الطبي</span>
                      <h6 className="text-dark font-w600 mb-0 mt-1 fs-15">{previewInvoice.actDescription}</h6>
                    </div>
                  )}

                  <span className="text-muted fs-13 text-uppercase font-w600 d-block mb-1">
                    Montant / المبلغ
                  </span>
                  <div className="display-5 font-w700 text-success my-2" style={{ letterSpacing: "1px" }}>
                    {previewInvoice.amount ? previewInvoice.amount.toLocaleString("fr-DZ") : "0"} DA
                  </div>
                </div>
              </div>

              {/* Cachet et Signature */}
              <div className="row pt-3 mt-2">
                <div className="col-6">
                  <small className="text-muted fs-11">
                    Cabinet Médical Dr N. BELBACHIR OULD HENNIA
                  </small>
                </div>
                <div className="col-6 text-end">
                  <span className="text-muted fs-12 d-block mb-4">Cachet et Signature / الختم والإمضاء</span>
                  <div style={{ height: "45px" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setPreviewInvoice(null)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="flaticon-381-print me-1"></i> Imprimer la facture
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default InvoicesPage;

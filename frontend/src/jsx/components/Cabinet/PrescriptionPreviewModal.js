import React from "react";
import { Modal, Button } from "react-bootstrap";

const PrescriptionPreviewModal = ({ show, onHide, prescription }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Masquer tous les composants du site */
          body * {
            visibility: hidden !important;
          }
          /* Afficher uniquement la feuille d'ordonnance */
          #printable-prescription-sheet,
          #printable-prescription-sheet * {
            visibility: visible !important;
          }
          #printable-prescription-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Masquer les en-têtes et boutons lors de l'impression */
          .modal-backdrop,
          .modal-header,
          .modal-footer,
          .btn,
          .btn-close,
          .no-print {
            display: none !important;
          }
          .modal,
          .modal-dialog,
          .modal-content,
          .modal-body {
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <Modal show={show} onHide={onHide} size="lg" centered className="prescription-modal">
        <div className="modal-header no-print">
          <h5 className="modal-title d-flex align-items-center">
            <i className="flaticon-381-print me-2 text-primary"></i>
            Aperçu officiel de l'ordonnance médicale
          </h5>
          <button type="button" className="btn-close" onClick={onHide}></button>
        </div>

        <div className="modal-body p-4 bg-light">
          {/* Feuille officielle d'ordonnance imprimable */}
          <div
            id="printable-prescription-sheet"
            className="p-5 bg-white shadow-sm border rounded mx-auto"
            style={{
              maxWidth: "780px",
              minHeight: "820px",
              color: "#1a202c",
              position: "relative",
            }}
          >
            {/* ============================================================== */}
            {/* EN-TÊTE OFFICIEL BILINGUE (FRANÇAIS - ARABE)                   */}
            {/* Reproduction exacte de l'en-tête de la praticienne             */}
            {/* ============================================================== */}
            <div className="d-flex justify-content-between align-items-start">
              {/* Volet Français (Gauche) */}
              <div className="text-start" style={{ direction: "ltr", flex: 1 }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#163759",
                    fontFamily: "'Times New Roman', Times, 'Georgia', serif",
                    letterSpacing: "0.2px",
                    lineHeight: "1.25",
                  }}
                >
                  Dr N. BELBACHIR OULD HENNIA
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontStyle: "italic",
                    color: "#2c5f8a",
                    fontFamily: "'Times New Roman', Times, 'Georgia', serif",
                    marginTop: "4px",
                    lineHeight: "1.3",
                  }}
                >
                  Médecin Spécialiste en Gynécologie Obstétrique
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontStyle: "italic",
                    color: "#2c5f8a",
                    fontFamily: "'Times New Roman', Times, 'Georgia', serif",
                    lineHeight: "1.3",
                  }}
                >
                  Échographie
                </div>
              </div>

              {/* Volet Arabe (Droite) */}
              <div className="text-end" style={{ direction: "rtl", flex: 1 }}>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#163759",
                    fontFamily: "'Amiri', 'Traditional Arabic', 'Cairo', 'Segoe UI', Tahoma, sans-serif",
                    lineHeight: "1.25",
                  }}
                >
                  الدكتورة ن. بلبشير ولد هنية
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#2c5f8a",
                    fontFamily: "'Amiri', 'Traditional Arabic', 'Cairo', 'Segoe UI', Tahoma, sans-serif",
                    marginTop: "4px",
                    lineHeight: "1.3",
                  }}
                >
                  طبيبة مختصة في أمراض النساء والتوليد
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#2c5f8a",
                    fontFamily: "'Amiri', 'Traditional Arabic', 'Cairo', 'Segoe UI', Tahoma, sans-serif",
                    lineHeight: "1.3",
                  }}
                >
                  الفحص بالصدى (إيكوغرافيا)
                </div>
              </div>
            </div>

            {/* Ligne séparatrice officielle bleu marine */}
            <div
              style={{
                height: "3.5px",
                backgroundColor: "#163759",
                width: "100%",
                marginTop: "14px",
                marginBottom: "24px",
              }}
            ></div>

            {/* Métadonnées : Date, N° d'ordonnance et Patient */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <span className="text-muted fs-13">Patient(e) :</span>
                <div className="fs-18 font-w600 text-dark">
                  {(prescription.patientName || "").replace(/\s*\(sc\)\s*/gi, "").trim()}
                </div>
              </div>
              <div className="text-end">
                <div className="fs-13 text-muted">
                  Le : <strong className="text-dark">{prescription.date}</strong>
                </div>
              </div>
            </div>

            {/* Titre central ORDONNANCE */}
            <div className="text-center my-4">
              <span
                style={{
                  fontFamily: "'Times New Roman', Times, 'Georgia', serif",
                  fontSize: "22px",
                  fontWeight: "bold",
                  letterSpacing: "4px",
                  color: "#163759",
                  borderBottom: "2px solid #163759",
                  paddingBottom: "4px",
                  display: "inline-block",
                }}
              >
                ORDONNANCE
              </span>
            </div>

            {/* Liste des Médicaments et Traitements */}
            <div className="my-4 px-2" style={{ minHeight: "340px" }}>
              <ol className="ps-3" style={{ fontSize: "16px", lineHeight: "1.8" }}>
                {prescription.items && prescription.items.map((item, idx) => (
                  <li key={idx} className="mb-4">
                    <div className="d-flex justify-content-between align-items-baseline">
                      <strong className="text-dark" style={{ fontSize: "16px" }}>
                        {item.medication}
                      </strong>
                      {false && item.dosage && (
                        <span className="text-muted fs-13 ms-2">
                          ({item.dosage})
                        </span>
                      )}
                    </div>
                    <div className="ps-2 fs-14 text-dark font-w500 mt-1">
                      • {item.posology}
                    </div>
                    {(item.duration || item.renewable) && (
                      <div className="ps-2 fs-13 text-muted">
                        • Durée : {item.duration} {item.renewable && `— ${item.renewable}`}
                      </div>
                    )}
                  </li>
                ))}
              </ol>

            </div>


            {/* Pied de page discret de la feuille */}
            <div
              className="text-center text-muted fs-11 mt-4 pt-3 border-top"
              style={{
                position: "absolute",
                bottom: "20px",
                left: "40px",
                right: "40px",
              }}
            >
              Cabinet Médical de Gynécologie Obstétrique — Échographie • Haï Essedikia, Avenue Seghier Benali, Oran • Tél : 0560 06 74 66
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <Button variant="secondary" onClick={onHide}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handlePrint} className="px-4">
            <i className="flaticon-381-print me-2"></i> Imprimer l'ordonnance
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PrescriptionPreviewModal;

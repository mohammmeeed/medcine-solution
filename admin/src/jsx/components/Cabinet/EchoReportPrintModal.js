import React from "react";
import { Modal, Button } from "react-bootstrap";

const EchoReportPrintModal = ({ show, onHide, consultation }) => {
  if (!consultation) return null;

  const handlePrint = () => {
    window.print();
  };

  const echo = consultation.echoData || {};
  const pt = consultation.patientDetails || {};
  const atcd = consultation.atcd || {};
  const calc = consultation.calculated || {};

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <div className="modal-header d-print-none">
        <h5 className="modal-title font-w600 text-primary">
          <i className="flaticon-381-notepad me-2"></i>
          Compte Rendu Échographique — {consultation.consultationNumber}
        </h5>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>

      <div className="modal-body p-4 bg-light">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #printable-echo-sheet, #printable-echo-sheet * { visibility: visible; }
            #printable-echo-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 10mm 15mm;
              background: #fff !important;
              box-shadow: none !important;
            }
            .d-print-none { display: none !important; }
          }
          .crecho-sheet {
            background: #ffffff;
            border: 1px solid #c0d3e8;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            padding: 20px 25px;
            font-family: Georgia, 'Times New Roman', serif;
            color: #1a1a2e;
            font-size: 13px;
          }
          .crecho-header-table { width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1a3a5c; padding-bottom: 8px; margin-bottom: 12px; }
          .crecho-header-table td { vertical-align: middle; }
          .crecho-title {
            text-align: center;
            font-size: 15px;
            font-weight: bold;
            color: #1a3a5c;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 8px 0 14px;
          }
          .crecho-box {
            border: 1px solid #c0d3e8;
            border-radius: 5px;
            background: #f8fbff;
            padding: 8px 12px;
            margin-bottom: 10px;
          }
          .crecho-box-title {
            font-size: 11px;
            font-weight: bold;
            color: #1a3a5c;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #c0d3e8;
            padding-bottom: 3px;
            margin-bottom: 6px;
          }
          .crecho-lbl-bold { font-weight: bold; color: #1a3a5c; }
          .crecho-footer-txt {
            border-top: 1.5px solid #1a3a5c;
            text-align: center;
            font-size: 11px;
            color: #1a3a5c;
            margin-top: 20px;
            padding-top: 6px;
          }
        `}</style>

        <div id="printable-echo-sheet" className="crecho-sheet">
          {/* En-tête Bilingue Officiel */}
          <table className="crecho-header-table">
            <tbody>
              <tr>
                <td style={{ textAlign: "left", width: "50%" }}>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#1a3a5c" }}>
                    Dr N. BELBACHIR OULD HENNIA
                  </div>
                  <div style={{ fontSize: "12px", color: "#2d6a9f", fontStyle: "italic" }}>
                    Médecin Spécialiste en Gynécologie Obstétrique
                  </div>
                  <div style={{ fontSize: "12px", color: "#2d6a9f", fontStyle: "italic" }}>
                    Échographie
                  </div>
                </td>
                <td style={{ textAlign: "right", width: "50%", direction: "rtl", fontFamily: "Arial, sans-serif" }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1a3a5c" }}>
                    الدكتورة ن. بلبشير ولد هنية
                  </div>
                  <div style={{ fontSize: "13px", color: "#2d6a9f" }}>
                    طبيبة مختصة في أمراض النساء والتوليد
                  </div>
                  <div style={{ fontSize: "13px", color: "#2d6a9f" }}>
                    الفحص بالصدى
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Titre */}
          <div className="crecho-title">Compte Rendu Échographique</div>

          {/* Informations Patiente */}
          <div className="crecho-box">
            <div className="crecho-box-title">Informations Patiente</div>
            <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
              <div>
                <span className="crecho-lbl-bold">Nom & Prénom : </span>
                <span>{consultation.patientName}</span>
              </div>
              <div>
                <span className="crecho-lbl-bold">Date d'examen : </span>
                <span>{consultation.date}</span>
              </div>
              {pt.age && (
                <div>
                  <span className="crecho-lbl-bold">Âge : </span>
                  <span>{pt.age}</span>
                </div>
              )}
            </div>
            {(pt.ddr || pt.termeDdr) && (
              <div className="d-flex gap-3 flex-wrap mt-1 pt-1 border-top">
                {pt.ddr && (
                  <div>
                    <span className="crecho-lbl-bold">DDR : </span>
                    <span>{pt.ddr}</span>
                  </div>
                )}
                {pt.termeDdr && (
                  <div>
                    <span className="crecho-lbl-bold">Terme actuel : </span>
                    <strong style={{ color: "#b03a2e" }}>{pt.termeDdr}</strong>
                  </div>
                )}
                {pt.ddrc?.ddrcVal && (
                  <div>
                    <span className="crecho-lbl-bold">DDRC (écho) : </span>
                    <span>{pt.ddrc.ddrcVal}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Antécédents si présents */}
          {(atcd.gestite !== null || atcd.parite !== null || atcd.cesarienne || atcd.hta || atcd.diabete || atcd.autres) && (
            <div className="crecho-box">
              <div className="crecho-box-title">Antécédents</div>
              <div className="d-flex flex-wrap gap-3">
                {atcd.gestite !== null && atcd.parite !== null && (
                  <span><strong className="crecho-lbl-bold">Parité : </strong>G{atcd.gestite}P{atcd.parite}</span>
                )}
                {atcd.cesarienne && (
                  <span><strong className="crecho-lbl-bold">Césarienne(s) : </strong>{atcd.cesarienne}</span>
                )}
                {atcd.avb && (
                  <span><strong className="crecho-lbl-bold">AVB : </strong>{atcd.avb}</span>
                )}
                {atcd.faussesCouches && (
                  <span><strong className="crecho-lbl-bold">Fausse(s) couche(s) : </strong>{atcd.faussesCouches}</span>
                )}
                {atcd.hta && <span className="badge badge-light border">HTA</span>}
                {atcd.diabete && <span className="badge badge-light border">Diabète</span>}
                {atcd.autres && (
                  <span><strong className="crecho-lbl-bold">Autres : </strong>{atcd.autres}</span>
                )}
              </div>
            </div>
          )}

          {/* Examen & Mesures */}
          <div className="crecho-box" style={{ borderLeft: "4px solid #1a3a5c" }}>
            <div className="crecho-box-title">{consultation.reason || "Examen Échographique"}</div>

            {/* Mesures calculées principales */}
            <div className="row g-2 mb-2">
              {calc.ob1LccAge && (
                <div className="col-6">
                  <span className="crecho-lbl-bold">Âge gestationnel (Robinson) : </span>
                  <strong style={{ color: "#b03a2e" }}>{calc.ob1LccAge}</strong>
                </div>
              )}
              {calc.ob2Poids && (
                <div className="col-6">
                  <span className="crecho-lbl-bold">Poids fœtal estimé (Hadlock) : </span>
                  <strong style={{ color: "#7d3c98" }}>{calc.ob2Poids} g</strong>
                </div>
              )}
              {calc.ob3Poids && (
                <div className="col-6">
                  <span className="crecho-lbl-bold">Poids fœtal estimé (Hadlock) : </span>
                  <strong style={{ color: "#7d3c98" }}>{calc.ob3Poids} g</strong>
                </div>
              )}
              {calc.discordance !== null && (
                <div className="col-12">
                  <span className="crecho-lbl-bold">Discordance de croissance : </span>
                  <strong>{calc.discordance} %</strong>
                </div>
              )}
            </div>

            {/* Observations cliniques */}
            {consultation.examFindings && (
              <div className="mb-2">
                <span className="crecho-lbl-bold d-block mb-1">Observations :</span>
                <p className="mb-0 text-dark fs-13" style={{ whiteSpace: "pre-wrap" }}>
                  {consultation.examFindings}
                </p>
              </div>
            )}
          </div>

          {/* Conclusion */}
          <div className="crecho-box">
            <div className="crecho-box-title">Conclusion Médicale</div>
            <div className="p-2 border rounded bg-white font-w600 text-dark fs-13">
              {consultation.diagnosis || consultation.echoFindings || "Examen sans anomalie décelable."}
            </div>
            {consultation.recommendations && (
              <div className="mt-2 text-muted fs-12">
                <strong className="crecho-lbl-bold">Conduite à tenir : </strong>
                {consultation.recommendations}
              </div>
            )}
          </div>

          {/* Pied de page officiel du cabinet */}
          <div className="crecho-footer-txt">
            Haï Seddikia (ex-Cité Boulanger), Cité 340 Logements, Bâtiment 18/A, Oran &nbsp;|&nbsp; ☎ 041 53 97 82 / 05 50 12 34 56
          </div>
        </div>
      </div>

      <div className="modal-footer d-print-none">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <i className="flaticon-381-print me-1"></i> Imprimer le Compte Rendu
        </Button>
      </div>
    </Modal>
  );
};

export default EchoReportPrintModal;

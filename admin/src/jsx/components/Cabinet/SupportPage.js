import React from "react";
import { Accordion, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";

const SupportPage = () => {
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "Demande envoyée au support",
      text: "Notre équipe technique dédiée aux cabinets médicaux vous répondra sous 2h ouvrées.",
      confirmButtonColor: "#1e60d5",
    });
  };

  return (
    <>
      <PageTitle motherMenu="Cabinet et configuration" activeMenu="Aide & Support" />

      <div className="row">
        {/* FAQ d'utilisation rapide */}
        <div className="col-xl-8 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="card-title">Foire Aux Questions — Logiciel Cabinet</h4>
              <p className="text-muted fs-13 mb-0">Guides pratiques pour le médecin et le secrétariat</p>
            </div>
            <div className="card-body">
              <Accordion defaultActiveKey="0" className="accordion accordion-flush">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    Comment le système prévient-il les chevauchements de rendez-vous ?
                  </Accordion.Header>
                  <Accordion.Body className="text-muted fs-14">
                    Le logiciel contrôle automatiquement l'agenda du praticien avant d'enregistrer tout créneau. Si une consultation est déjà prévue à la même heure et sur la même date, une alerte immédiate est affichée et le double créneau est bloqué.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    Qui a accès aux données de santé et aux diagnostics ?
                  </Accordion.Header>
                  <Accordion.Body className="text-muted fs-14">
                    Conformément au secret médical (Article L1110-4 du Code de la santé publique), l'accès aux antécédents médicaux, diagnostics CIM-10 et ordonnances est réservé au compte médecin. La secrétaire médicale n'accède qu'aux coordonnées administratives, à l'agenda et à la caisse.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    Comment imprimer une ordonnance ou une note d'honoraires ?
                  </Accordion.Header>
                  <Accordion.Body className="text-muted fs-14">
                    Dans le module <em>Ordonnances</em> ou <em>Factures</em>, cliquez sur le bouton "Imprimer" sur la ligne concernée. Un aperçu officiel prêt à l'impression avec l'en-tête, le numéro RPPS et le tampon du Dr. Martin s'affiche instantanément.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>
                    Comment fonctionne la salle d'attente connectée ?
                  </Accordion.Header>
                  <Accordion.Body className="text-muted fs-14">
                    Dès qu'un patient se présente à l'accueil, la secrétaire clique sur "Enregistrer une arrivée". Le patient apparaît instantanément sur l'écran du médecin avec son temps d'attente calculé. Le médecin peut alors cliquer sur "Appeler" ou "Consulter".
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Contact Support & Assistance */}
        <div className="col-xl-4 col-lg-12">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="card-title">Assistance Technique Dédiée</h4>
            </div>
            <div className="card-body">
              <div className="p-3 bg-light rounded mb-3">
                <p className="mb-1 text-primary font-w600">Ligne Praticiens Prioritaire :</p>
                <h5 className="font-w700 mb-1">01 89 20 40 50</h5>
                <small className="text-muted">Du lundi au samedi : 08h00 - 20h00</small>
              </div>

              <h6 className="font-w600 text-dark mb-2">Ouvrir un ticket d'assistance :</h6>
              <form onSubmit={handleSubmitTicket}>
                <div className="mb-2">
                  <label className="form-label fs-12 font-w500">Objet de la demande</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: Question télétransmission..."
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fs-12 font-w500">Message</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    placeholder="Décrivez votre question..."
                    required
                  ></textarea>
                </div>
                <div className="d-grid">
                  <Button variant="primary" size="sm" type="submit" className="btn-rounded">
                    Envoyer au support
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

export default SupportPage;

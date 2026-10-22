import React from "react";
import { Accordion } from "react-bootstrap";
import PageTitle from "../../layouts/PageTitle";

const SupportPage = () => {
  return (
    <>
      <PageTitle motherMenu="Cabinet et configuration" activeMenu="Aide & Support" />

      <div className="row">
        {/* FAQ d'utilisation rapide */}
        <div className="col-12">
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
                    Conformément au secret médical, l'accès aux antécédents médicaux, diagnostics et ordonnances est réservé au compte médecin. Le secrétariat médical n'accède qu'aux coordonnées administratives, à l'agenda et à la caisse.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    Comment imprimer une ordonnance ou une note d'honoraires ?
                  </Accordion.Header>
                  <Accordion.Body className="text-muted fs-14">
                    Dans le module <em>Ordonnances</em> ou <em>Factures</em>, cliquez sur le bouton "Facture" ou "Ordonnance" sur la ligne concernée. Un aperçu officiel prêt à l'impression avec l'en-tête et le cachet du Dr N. BELBACHIR OULD HENNIA s'affiche instantanément.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>
                    Comment fonctionne la salle d'attente connectée ?
                  </Accordion.Header>
                  <Accordion.Body className="text-muted fs-14">
                    Dès qu'un patient se présente au cabinet, le secrétariat clique sur "Enregistrer une arrivée". Le patient apparaît instantanément sur la liste d'attente et sur l'écran d'affichage de la salle d'attente. Le médecin peut alors cliquer sur "Appeler" pour diffuser le carillon et le nom du patient.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;

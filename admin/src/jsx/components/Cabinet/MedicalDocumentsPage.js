import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import {
  initialDocuments,
  initialPatients,
} from "../../../services/CabinetData";

const MedicalDocumentsPage = () => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newDoc, setNewDoc] = useState({
    patientId: 1,
    title: "",
    category: "Analyses de laboratoire",
    author: "Laboratoire d'analyses médicales",
    notes: "",
  });

  const handleAddDocument = (e) => {
    e.preventDefault();
    const pat =
      initialPatients.find((p) => p.id === parseInt(newDoc.patientId)) ||
      initialPatients[0];

    const created = {
      id: documents.length + 1,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      title: newDoc.title,
      category: newDoc.category,
      date: new Date().toISOString().split("T")[0],
      author: newDoc.author,
      fileSize: "1.2 Mo",
      type: "PDF",
      status: "Validé par le médecin",
    };

    setDocuments([created, ...documents]);
    setShowAddModal(false);

    Swal.fire({
      icon: "success",
      title: "Document archivé",
      text: `Document associé avec succès au dossier de ${created.patientName}.`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const handleDownload = (doc) => {
    Swal.fire({
      icon: "info",
      title: "Téléchargement sécurisé",
      text: `Téléchargement du document : ${doc.title} (${doc.fileSize})`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchCat = categoryFilter === "all" || doc.category === categoryFilter;
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <PageTitle motherMenu="Gestion médicale" activeMenu="Documents médicaux" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <Button
          variant="primary"
          className="btn-rounded"
          onClick={() => setShowAddModal(true)}
        >
          <i className="flaticon-381-add-1 me-2"></i> Ajouter un Document
        </Button>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="input-group search-area w-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher document, patient, labo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <i className="flaticon-381-search-2"></i>
            </span>
          </div>

          <select
            className="form-control w-auto default-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            <option value="Analyses de laboratoire">Analyses de laboratoire</option>
            <option value="Imagerie & Radiologie">Imagerie & Radiologie</option>
            <option value="Certificats médicaux">Certificats médicaux</option>
            <option value="Comptes rendus spécialistes">Comptes rendus spécialistes</option>
          </select>
        </div>
      </div>

      {/* Tableau des documents médicaux */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Classement et Archivage Médical Sécurisé</h4>
            <p className="text-muted fs-13 mb-0">
              Biologie, radiologies, courriers spécialistes et certificats patients
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-responsive-md table-hover">
              <thead>
                <tr>
                  <th><strong>TITRE DU DOCUMENT</strong></th>
                  <th><strong>PATIENT ASSOCIÉ</strong></th>
                  <th><strong>CATÉGORIE</strong></th>
                  <th><strong>DATE D'AJOUT</strong></th>
                  <th><strong>ÉMETTEUR / AUTEUR</strong></th>
                  <th><strong>TAILLE</strong></th>
                  <th><strong>STATUT</strong></th>
                  <th><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      Aucun document médical trouvé dans cette catégorie.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="flaticon-381-file-1 text-primary fs-20 me-2"></i>
                          <div>
                            <strong className="text-dark">{doc.title}</strong>
                            <span className="d-block text-muted fs-11">Format {doc.type}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/patient-details?id=${doc.patientId}`}
                          className="font-w600 text-dark hover-primary"
                        >
                          {doc.patientName}
                        </Link>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {doc.category}
                        </Badge>
                      </td>
                      <td>{doc.date}</td>
                      <td>
                        <span className="text-muted fs-13">{doc.author}</span>
                      </td>
                      <td>{doc.fileSize}</td>
                      <td>
                        <Badge bg="success" className="light">{doc.status}</Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-xs"
                            onClick={() => handleDownload(doc)}
                            title="Télécharger"
                          >
                            <i className="flaticon-381-download"></i>
                          </button>
                          <Link
                            to={`/patient-details?id=${doc.patientId}`}
                            className="btn btn-light btn-xs"
                            title="Voir le dossier"
                          >
                            <i className="flaticon-381-folder"></i>
                          </Link>
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

      {/* Modal Ajout Nouveau Document */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="flaticon-381-file me-2 text-primary"></i>
            Ajouter un document au dossier patient
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
        </div>
        <form onSubmit={handleAddDocument}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label font-w600">Patient *</label>
              <select
                className="form-control"
                value={newDoc.patientId}
                onChange={(e) => setNewDoc({ ...newDoc, patientId: e.target.value })}
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
              <label className="form-label font-w600">Titre du document *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Bilan lipidique, Radiographie rachis, Compte rendu cardio..."
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-w600">Catégorie *</label>
              <select
                className="form-control"
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
              >
                <option value="Analyses de laboratoire">Analyses de laboratoire</option>
                <option value="Imagerie & Radiologie">Imagerie & Radiologie</option>
                <option value="Certificats médicaux">Certificats médicaux</option>
                <option value="Comptes rendus spécialistes">Comptes rendus spécialistes</option>
                <option value="Autre document médical">Autre document médical</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label font-w600">Auteur / Émetteur</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Labo d'Analyses, Centre d'Imagerie, Dr. Confrère..."
                value={newDoc.author}
                onChange={(e) => setNewDoc({ ...newDoc, author: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-w600">Fichier (PDF, Image, Scanner)</label>
              <input type="file" className="form-control" accept=".pdf,.png,.jpg,.jpeg" />
              <small className="text-muted">Taille max autorisée : 10 Mo. Chiffré au repos.</small>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="danger" light onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Archiver dans le dossier
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MedicalDocumentsPage;

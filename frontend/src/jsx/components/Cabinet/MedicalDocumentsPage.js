import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import ApiService from "../../../services/ApiService";
import {
  initialDocuments,
  initialPatients,
} from "../../../services/CabinetData";

const MedicalDocumentsPage = () => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [newDoc, setNewDoc] = useState({
    patientId: "",
    title: "",
    category: "Analyses de laboratoire",
    author: "Laboratoire d'analyses médicales",
    notes: "",
  });

  // Chargement des documents et patients depuis MySQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docData, patData] = await Promise.all([
          ApiService.getDocuments(),
          ApiService.getPatients(),
        ]);
        if (Array.isArray(docData) && docData.length > 0) {
          setDocuments(docData);
        }
        if (Array.isArray(patData)) {
          const clean = patData.filter((p) => {
            const last = (p.lastName || "").toLowerCase().trim();
            const first = (p.firstName || "").toLowerCase().trim();
            return (
              !["dubois", "lemoine", "bernard", "moreau", "belkacem"].includes(last) &&
              !["claire", "marc", "sophie", "lucas", "yasmine"].includes(first)
            );
          });
          setPatients(clean);
          if (clean.length > 0) {
            setNewDoc((prev) => ({ ...prev, patientId: clean[0].id }));
          }
        }
      } catch (err) {
        console.warn("Erreur chargement documents MySQL :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!newDoc.title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setNewDoc((prev) => ({ ...prev, title: cleanName }));
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    const pat =
      patients.find((p) => p.id === parseInt(newDoc.patientId)) ||
      patients[0] || { id: 1, firstName: "Patient", lastName: "" };

    const fileSizeStr = selectedFile
      ? selectedFile.size > 1024 * 1024
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} Mo`
        : `${Math.round(selectedFile.size / 1024)} Ko`
      : "1.2 Mo";

    const isImg = selectedFile ? selectedFile.type.startsWith("image/") : false;
    const fileExt = selectedFile ? selectedFile.name.split(".").pop().toUpperCase() : "PDF";

    const created = {
      id: documents.length + 1,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`.trim(),
      title: newDoc.title,
      category: newDoc.category,
      date: new Date().toISOString().split("T")[0],
      author: newDoc.author,
      fileSize: fileSizeStr,
      type: fileExt,
      isImage: isImg,
      fileDataUrl: filePreview || null,
      fileName: selectedFile ? selectedFile.name : null,
      status: "Validé par le médecin",
    };

    setDocuments([created, ...documents]);
    setShowAddModal(false);
    setSelectedFile(null);
    setFilePreview(null);

    // Synchronisation MySQL
    try {
      await ApiService.saveDocument({
        patientId: pat.id,
        title: newDoc.title,
        category: newDoc.category,
        date: created.date,
        author: newDoc.author,
        fileSize: fileSizeStr,
        fileType: fileExt,
        filePath: filePreview ? "data_url" : null,
        status: "Validé",
      });
    } catch (err) {
      console.warn("Erreur synchronisation document MySQL :", err);
    }

    Swal.fire({
      icon: "success",
      title: "Document archivé dans la Base de Données",
      text: `"${created.title}" a été associé avec succès au dossier de ${created.patientName}.`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const handleDownload = (doc) => {
    if (doc.fileDataUrl) {
      const link = document.createElement("a");
      link.href = doc.fileDataUrl;
      link.download = doc.fileName || `${doc.title}.${(doc.type || "pdf").toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Swal.fire({
        icon: "info",
        title: "Téléchargement sécurisé",
        text: `Téléchargement du document : ${doc.title} (${doc.fileSize})`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
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

        <Button
          variant="primary"
          className="btn-rounded"
          onClick={() => setShowAddModal(true)}
        >
          <i className="flaticon-381-add-1 me-2"></i> Ajouter un Document
        </Button>
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
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.lastName || "").toUpperCase()} {p.firstName || ""} ({p.fileNumber || ""})
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
              <label className="form-label font-w600">Photo ou Fichier depuis l'appareil</label>
              <input
                type="file"
                className="form-control"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <div className="mt-2 d-flex align-items-center gap-2 p-2 bg-light rounded">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Aperçu"
                      style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  ) : (
                    <i className="fa fa-file-pdf fs-24 text-danger"></i>
                  )}
                  <div>
                    <strong className="d-block fs-13 text-dark">{selectedFile.name}</strong>
                    <small className="text-muted">{(selectedFile.size / 1024).toFixed(1)} Ko</small>
                  </div>
                </div>
              )}
              <small className="text-muted">Photos (JPG, PNG, WebP), Scanners, Radios, PDF (max 25 Mo).</small>
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

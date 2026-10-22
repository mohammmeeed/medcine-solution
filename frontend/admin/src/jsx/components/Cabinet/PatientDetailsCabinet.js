import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import PrescriptionPreviewModal from "./PrescriptionPreviewModal";
import {
  initialPatients,
  initialConsultations,
  initialPrescriptions,
  initialExaminations,
  initialDocuments,
  initialInvoices,
} from "../../../services/CabinetData";

const PatientDetailsCabinet = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patientIdParam = parseInt(searchParams.get("id")) || 1;

  const [selectedPatientId, setSelectedPatientId] = useState(patientIdParam);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [activeTab, setActiveTab] = useState("synthese");

  // État des documents du patient & formulaire d'ajout
  const [allDocuments, setAllDocuments] = useState(initialDocuments);
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Imagerie & Radiologie");
  const [docAuthor, setDocAuthor] = useState("Centre d'Imagerie / Dr N. BELBACHIR OULD HENNIA");
  const [docDate, setDocDate] = useState(new Date().toISOString().split("T")[0]);
  const [docFile, setDocFile] = useState(null);
  const [docFilePreview, setDocFilePreview] = useState(null);
  const [previewingDoc, setPreviewingDoc] = useState(null);

  const patient =
    initialPatients.find((p) => p.id === selectedPatientId) || initialPatients[0];

  const patientConsultations = initialConsultations.filter(
    (c) => c.patientId === patient.id
  );
  const patientPrescriptions = initialPrescriptions.filter(
    (p) => p.patientId === patient.id
  );
  const patientExaminations = initialExaminations.filter(
    (e) => e.patientId === patient.id
  );
  const patientDocuments = allDocuments.filter(
    (d) => d.patientId === patient.id
  );
  const patientInvoices = initialInvoices.filter(
    (i) => i.patientId === patient.id
  );

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setDocFile(file);
      if (!docTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setDocTitle(cleanName);
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocFilePreview(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setDocFilePreview(null);
      }
    }
  };

  const handleResetDocForm = () => {
    setDocTitle("");
    setDocCategory("Imagerie & Radiologie");
    setDocAuthor("Centre d'Imagerie / Dr N. BELBACHIR OULD HENNIA");
    setDocDate(new Date().toISOString().split("T")[0]);
    setDocFile(null);
    setDocFilePreview(null);
    setShowAddDocForm(false);
  };

  const handleSaveDocument = (e) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Titre requis",
        text: "Veuillez renseigner le titre du document.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const fileSizeStr = docFile
      ? docFile.size > 1024 * 1024
        ? `${(docFile.size / (1024 * 1024)).toFixed(1)} Mo`
        : `${Math.round(docFile.size / 1024)} Ko`
      : "1.2 Mo";

    const isImage = docFile ? docFile.type.startsWith("image/") : false;
    const fileExt = docFile ? docFile.name.split(".").pop().toUpperCase() : "PDF";

    const newDocument = {
      id: Date.now(),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      title: docTitle.trim(),
      category: docCategory,
      date: docDate,
      author: docAuthor.trim() || "Cabinet Médical",
      fileSize: fileSizeStr,
      type: fileExt,
      isImage: isImage,
      fileDataUrl: docFilePreview || null,
      fileName: docFile ? docFile.name : null,
      status: "Validé par le médecin",
    };

    setAllDocuments((prev) => [newDocument, ...prev]);
    initialDocuments.unshift(newDocument);
    handleResetDocForm();

    Swal.fire({
      icon: "success",
      title: "Document rattaché avec succès",
      text: `Le document "${newDocument.title}" a été ajouté au dossier du patient.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleDeleteDocument = (docId, title) => {
    Swal.fire({
      title: "Supprimer ce document ?",
      text: `Êtes-vous sûr de vouloir retirer "${title}" du dossier ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setAllDocuments((prev) => prev.filter((d) => d.id !== docId));
        Swal.fire({
          icon: "success",
          title: "Document supprimé",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDownloadDoc = (doc) => {
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
        title: "Téléchargement",
        text: `Téléchargement du document : ${doc.title} (${doc.fileSize})`,
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="patient-dossier-wrapper">
      <style>{`
        .patient-dossier-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
        }

        /* 1. Breadcrumb Bar */
        .patient-breadcrumb-bar {
          background: #ffffff;
          padding: 12px 20px;
          border-radius: 14px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .patient-breadcrumb-list {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
          font-size: 13.5px;
        }
        .patient-breadcrumb-list a {
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .patient-breadcrumb-list a:hover {
          color: #2563eb;
        }
        .patient-breadcrumb-list .separator {
          color: #cbd5e1;
          font-weight: 300;
        }
        .patient-breadcrumb-list .current {
          color: #2563eb;
          font-weight: 600;
        }
        .patient-sync-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }
        .patient-sync-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #10b981;
          display: inline-block;
        }

        /* 2. Action Controls Bar */
        .patient-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }
        .patient-toolbar-left {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }
        .patient-btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid rgba(37, 99, 235, 0.6);
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }
        .patient-btn-back:hover {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #2563eb;
        }
        .patient-selector-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          padding: 4px 6px 4px 14px;
          border-radius: 12px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
        }
        .patient-selector-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          white-space: nowrap;
          margin: 0;
        }
        .patient-select-wrapper {
          position: relative;
          display: inline-block;
        }
        .patient-select-native {
          appearance: none;
          -webkit-appearance: none;
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
          font-size: 12px;
          border-radius: 8px;
          padding: 6px 30px 6px 12px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          cursor: pointer;
          outline: none;
          transition: all 0.15s;
        }
        .patient-select-native:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .patient-select-arrow {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #64748b;
          display: flex;
          align-items: center;
        }

        .patient-toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .patient-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 600;
          font-size: 12px;
          border: none;
          text-decoration: none;
          box-shadow: 0 3px 10px -1px rgba(37, 99, 235, 0.35);
          transition: all 0.2s ease;
        }
        .patient-btn-primary:hover {
          background: #1d4ed8;
          color: #ffffff;
          box-shadow: 0 5px 14px -2px rgba(37, 99, 235, 0.45);
        }
        .patient-btn-emerald {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: rgba(236, 253, 245, 0.85);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.7);
          font-weight: 600;
          font-size: 12px;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(16, 185, 129, 0.1);
          transition: all 0.2s ease;
        }
        .patient-btn-emerald:hover {
          background: #d1fae5;
          color: #065f46;
          border-color: #10b981;
        }

        /* 3. Patient Identity Card (NO AVATAR PHOTO) */
        .patient-identity-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 2px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
          overflow: hidden;
          margin-bottom: 24px;
        }
        .patient-card-accent-top {
          height: 6px;
          width: 100%;
          background: linear-gradient(to right, #2563eb, #6366f1, #10b981);
        }
        .patient-card-inner {
          padding: 24px;
        }

        /* Top Row: Name + Badges */
        .patient-header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }
        .patient-name-bar {
          width: 6px;
          height: 32px;
          border-radius: 9999px;
          background: #2563eb;
          display: inline-block;
          flex-shrink: 0;
        }
        .patient-main-name {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }
        .patient-badge-id {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid rgba(226, 232, 240, 0.9);
        }
        .patient-badge-blood {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          background: #fff1f2;
          color: #be123c;
          border: 1px solid rgba(254, 205, 211, 0.8);
        }
        .patient-badge-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid rgba(167, 243, 208, 0.8);
        }
        .patient-status-dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
        }

        /* Demographic 3-Column Grid */
        .patient-demographics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding-top: 20px;
        }
        @media (max-width: 991px) {
          .patient-demographics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 767px) {
          .patient-demographics-grid {
            grid-template-columns: 1fr;
          }
        }
        .patient-demographic-cell {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(248, 250, 252, 0.85);
          border: 1px solid #f1f5f9;
        }
        .patient-cell-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .patient-cell-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin: 0;
          line-height: 1.2;
        }
        .patient-cell-val {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          margin: 3px 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .patient-cell-val-sub {
          font-weight: 500;
          color: #64748b;
        }

        /* Clinical Alerts (Allergies & Pathologies) */
        .patient-alerts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }
        @media (max-width: 767px) {
          .patient-alerts-grid {
            grid-template-columns: 1fr;
          }
        }
        .patient-alert-card-rose {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 241, 242, 0.7);
          border: 1px solid rgba(254, 205, 211, 0.85);
        }
        .patient-alert-pill-rose {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          background: #ffffff;
          color: #be123c;
          border: 1px solid #ffe4e6;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          flex-shrink: 0;
        }
        .patient-alert-pill-rose .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e11d48;
        }
        .patient-alert-text-rose {
          font-size: 13.5px;
          font-weight: 600;
          color: #4c0519;
        }

        .patient-alert-card-amber {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(254, 243, 199, 0.5);
          border: 1px solid rgba(253, 230, 138, 0.85);
        }
        .patient-alert-pill-amber {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          background: #ffffff;
          color: #92400e;
          border: 1px solid #fef3c7;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          flex-shrink: 0;
        }
        .patient-alert-pill-amber .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
        }
        .patient-alert-text-amber {
          font-size: 13.5px;
          font-weight: 600;
          color: #451a03;
        }

        /* 4. Tab Navigation Bar */
        .patient-tabs-nav-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
          margin-bottom: 24px;
          padding-bottom: 0;
        }
        .patient-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .patient-tab-btn:hover {
          color: #0f172a;
          border-bottom-color: #cbd5e1;
        }
        .patient-tab-btn.active {
          color: #2563eb;
          font-weight: 700;
          border-bottom-color: #2563eb;
        }
        .patient-tab-btn.active svg {
          stroke: #2563eb;
        }

        /* 5. Panels */
        .patient-panel-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 2px 15px -3px rgba(15, 23, 42, 0.04);
          padding: 24px;
        }
        .patient-panel-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .patient-panel-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #2563eb;
          margin: 0;
        }
        .patient-panel-badge-pill {
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          background: #eff6ff;
          color: #2563eb;
        }
        .patient-med-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 10px;
          border-bottom: 1px solid #f1f5f9;
          border-radius: 10px;
          transition: background 0.15s;
        }
        .patient-med-row:last-child {
          border-bottom: none;
        }
        .patient-med-row:hover {
          background: #f8fafc;
        }
        .patient-med-tag {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 8px;
          white-space: nowrap;
        }
        .patient-box-item {
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(248, 250, 252, 0.85);
          border: 1px solid #f1f5f9;
          font-size: 13.5px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .patient-box-item:last-child {
          margin-bottom: 0;
        }
        .patient-box-item strong {
          color: #0f172a;
          font-weight: 700;
        }
      `}</style>

      {/* 1. BREADCRUMB BAR */}
      <nav aria-label="Breadcrumb" className="patient-breadcrumb-bar">
        <ol className="patient-breadcrumb-list">
          <li>
            <Link to="/patients">Patients</Link>
          </li>
          <li className="separator">/</li>
          <li className="current">Dossier Patient</li>
        </ol>
        <span className="patient-sync-pill">
          <span className="patient-sync-dot"></span>
          Dossier synchronisé
        </span>
      </nav>

      {/* 2. ACTION CONTROLS BAR */}
      <div className="patient-toolbar">
        {/* Left: Retour + Sélecteur de Dossier */}
        <div className="patient-toolbar-left">
          <Link to="/patients" className="patient-btn-back">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m12 8-4 4 4 4" />
              <path d="M16 12H8" />
            </svg>
            <span>Retour à la liste</span>
          </Link>

          <div className="patient-selector-box">
            <label htmlFor="patientSelectQuick" className="patient-selector-label">
              Changer de dossier :
            </label>
            <div className="patient-select-wrapper">
              <select
                id="patientSelectQuick"
                className="patient-select-native"
                value={patient.id}
                onChange={(e) => setSelectedPatientId(parseInt(e.target.value))}
              >
                {initialPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lastName.toUpperCase()} {p.firstName} ( {p.fileNumber} )
                  </option>
                ))}
              </select>
              <span className="patient-select-arrow">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Primary Medical Actions */}
        <div className="patient-toolbar-right">
          <Link
            to={`/consultations?patientId=${patient.id}`}
            className="patient-btn-primary"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M3 15h6" />
              <path d="M6 12v6" />
            </svg>
            <span>Nouvelle consultation</span>
          </Link>

          <Link
            to={`/prescriptions?patientId=${patient.id}`}
            className="patient-btn-emerald"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M8 13h2" />
              <path d="M14 13h2" />
              <path d="M8 17h2" />
              <path d="M14 17h2" />
            </svg>
            <span>Émettre Ordonnance</span>
          </Link>
        </div>
      </div>

      {/* 3. PATIENT IDENTITY CARD (STRICTLY NO PROFILE PICTURE / AVATAR) */}
      <section className="patient-identity-card">
        {/* Top decorative accent bar */}
        <div className="patient-card-accent-top"></div>

        <div className="patient-card-inner">
          {/* Top Row: Name + Badges */}
          <div className="patient-header-row">
            {/* Pure Typographic Accent Bar */}
            <div className="patient-name-bar"></div>

            <h2 className="patient-main-name">
              {patient.lastName.toUpperCase()} {patient.firstName}
            </h2>

            {/* Badge: Dossier ID */}
            <span className="patient-badge-id">{patient.fileNumber}</span>

            {/* Badge: Blood Group */}
            <span className="patient-badge-blood">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="#f43f5e"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
              Groupe {patient.bloodGroup}
            </span>

            {/* Badge: Follow-up Status */}
            <span className="patient-badge-status">
              <span className="patient-status-dot-pulse"></span>
              {patient.status}
            </span>
          </div>

          {/* Demographic & Contact Metadata Grid (4 Cards) */}
          <div className="patient-demographics-grid">
            {/* Card 1: Date of Birth */}
            <div className="patient-demographic-cell">
              <div className="patient-cell-icon-wrap">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="patient-cell-label">Né(e) le</p>
                <p className="patient-cell-val">
                  {patient.dob}{" "}
                  <span className="patient-cell-val-sub">
                    ( {patient.age || 36} ans )
                  </span>
                </p>
              </div>
            </div>

            {/* Card 2: Phone */}
            <div className="patient-demographic-cell">
              <div className="patient-cell-icon-wrap">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="patient-cell-label">Tél</p>
                <p className="patient-cell-val">{patient.phone}</p>
              </div>
            </div>

            {/* Card 3: Email */}
            <div className="patient-demographic-cell">
              <div className="patient-cell-icon-wrap">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="patient-cell-label">Courriel</p>
                <p className="patient-cell-val">{patient.email}</p>
              </div>
            </div>
          </div>

          {/* High-Contrast Clinical Alerts (Allergies & Pathologies / ALD) */}
          <div className="patient-alerts-grid">
            {/* Alert 1: Allergies */}
            <div className="patient-alert-card-rose">
              <span className="patient-alert-pill-rose">
                <span className="dot"></span>
                Allergies :
              </span>
              <span className="patient-alert-text-rose">
                {patient.allergies && patient.allergies.length > 0
                  ? patient.allergies.join(", ")
                  : "Aucune allergie connue"}
              </span>
            </div>

            {/* Alert 2: Pathologies / ALD */}
            <div className="patient-alert-card-amber">
              <span className="patient-alert-pill-amber">
                <span className="dot"></span>
                Pathologies / ALD :
              </span>
              <span className="patient-alert-text-amber">
                {patient.chronicDiseases && patient.chronicDiseases.length > 0
                  ? patient.chronicDiseases.join(", ")
                  : "Aucune ALD déclarée"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NAVIGATION TABS (BARRE D'ONGLETS) */}
      <div className="patient-tabs-nav-bar">
        {/* Tab 1: Synthèse */}
        <button
          type="button"
          className={`patient-tab-btn ${activeTab === "synthese" ? "active" : ""}`}
          onClick={() => setActiveTab("synthese")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            <path d="M8 10v4" />
            <path d="M12 10v2" />
            <path d="M16 10v6" />
          </svg>
          <span>Synthèse et antécédents</span>
        </button>

        {/* Tab 2: Consultations */}
        <button
          type="button"
          className={`patient-tab-btn ${activeTab === "consultations" ? "active" : ""}`}
          onClick={() => setActiveTab("consultations")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 14 2 2 4-4" />
          </svg>
          <span>Consultations ( {patientConsultations.length} )</span>
        </button>

        {/* Tab 3: Ordonnances */}
        <button
          type="button"
          className={`patient-tab-btn ${activeTab === "ordonnances" ? "active" : ""}`}
          onClick={() => setActiveTab("ordonnances")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
          <span>Ordonnances ( {patientPrescriptions.length} )</span>
        </button>

        {/* Tab 4: Documents */}
        <button
          type="button"
          className={`patient-tab-btn ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
            <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
            <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h11" />
          </svg>
          <span>Documents ( {patientDocuments.length} )</span>
        </button>

        {/* Tab 6: Factures / Faits */}
        <button
          type="button"
          className={`patient-tab-btn ${activeTab === "invoices" ? "active" : ""}`}
          onClick={() => setActiveTab("invoices")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <line x1="8" x2="16" y1="6" y2="6" />
            <line x1="16" x2="16" y1="14" y2="18" />
            <path d="M16 10h.01" />
            <path d="M12 10h.01" />
            <path d="M8 10h.01" />
            <path d="M12 14h.01" />
            <path d="M8 14h.01" />
            <path d="M12 18h.01" />
            <path d="M8 18h.01" />
          </svg>
          <span>Factures ( {patientInvoices.length} )</span>
        </button>
      </div>

      {/* 5. TAB PANELS */}
      <div>
        {/* PANEL 1: SYNTHÈSE ET ANTÉCÉDENTS */}
        {activeTab === "synthese" && (
          <div className="row g-4">
            {/* Card 1: Traitements Habituels En Cours */}
            <div className="col-lg-6">
              <div className="patient-panel-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="patient-panel-card-header">
                    <div className="d-flex align-items-center gap-3">
                      <div className="patient-cell-icon-wrap">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                          <path d="m8.5 8.5 7 7" />
                        </svg>
                      </div>
                      <h3 className="patient-panel-card-title">
                        Traitements Habituels En Cours
                      </h3>
                    </div>
                    <span className="patient-panel-badge-pill">
                      {patient.regularTreatments ? patient.regularTreatments.length : 2} actifs
                    </span>
                  </div>

                  {patient.regularTreatments && patient.regularTreatments.length > 0 ? (
                    <div>
                      {patient.regularTreatments.map((t, idx) => {
                        let tag = "Traitement";
                        if (t.toLowerCase().includes("ventoline")) tag = "Inhalation";
                        else if (t.toLowerCase().includes("inuvair")) tag = "Traitement de fond";
                        else if (t.toLowerCase().includes("metformine")) tag = "Antidiabétique";
                        else if (t.toLowerCase().includes("amlodipine")) tag = "Antihypertenseur";

                        return (
                          <div key={idx} className="patient-med-row">
                            <div className="d-flex align-items-center gap-3">
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: "#2563eb",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              ></span>
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#334155",
                                }}
                              >
                                {t}
                              </span>
                            </div>
                            <span className="patient-med-tag">{tag}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted mb-0 py-3 text-center">
                      Aucun traitement au long cours enregistré.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Antécédents Médico-Chirurgicaux */}
            <div className="col-lg-6">
              <div className="patient-panel-card h-100">
                <div className="patient-panel-card-header">
                  <div className="d-flex align-items-center gap-3">
                    <div className="patient-cell-icon-wrap">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                        <circle cx="20" cy="10" r="2" />
                      </svg>
                    </div>
                    <h3 className="patient-panel-card-title">
                      Antécédents Médico-Chirurgicaux
                    </h3>
                  </div>
                </div>

                <div>
                  {/* Médicaux */}
                  <div className="patient-box-item">
                    <strong>Médicaux : </strong>
                    <span style={{ color: "#475569" }}>
                      {patient.chronicDiseases && patient.chronicDiseases.length > 0
                        ? patient.chronicDiseases.join(", ")
                        : "Asthme modéré"}
                    </span>
                  </div>

                  {/* Chirurgicaux */}
                  <div className="patient-box-item">
                    <strong>Chirurgicaux : </strong>
                    <span style={{ color: "#475569" }}>
                      Appendicectomie (enfance), amygdalectomie.
                    </span>
                  </div>

                  {/* Familiaux */}
                  <div className="patient-box-item">
                    <strong>Familiaux : </strong>
                    <span style={{ color: "#475569" }}>
                      HTA chez le père, pas d'antécédent néoplasique précoce.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: CONSULTATIONS */}
        {activeTab === "consultations" && (
          <div className="patient-panel-card">
            <div className="patient-panel-card-header">
              <h3 className="patient-panel-card-title">Consultations médicales</h3>
              <Link
                to={`/consultations?patientId=${patient.id}`}
                className="patient-btn-primary"
                style={{ padding: "6px 16px", fontSize: "11.5px" }}
              >
                + Démarrer une consultation
              </Link>
            </div>
            <div>
              {patientConsultations.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Aucune consultation archivée pour ce patient.
                </div>
              ) : (
                <div>
                  {patientConsultations.map((cs) => (
                    <div
                      key={cs.id}
                      className="p-3 mb-3 border rounded-3"
                      style={{ background: "#f8fafc" }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                        <div>
                          <h6
                            className="font-w600 mb-0"
                            style={{ color: "#2563eb" }}
                          >
                            {cs.consultationNumber} • {cs.reason}
                          </h6>
                          <span className="text-muted fs-12">
                            Date : {cs.date} à {cs.time} • Cotation :{" "}
                            {cs.billingCode}
                          </span>
                        </div>
                        <span className="patient-badge-status">
                          <span className="patient-status-dot-pulse"></span>
                          {cs.status}
                        </span>
                      </div>
                      <div
                        className="p-2 rounded mb-2 fs-13"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <strong>Constantes :</strong> TA: {cs.vitals.bp} mmHg |
                        Pouls: {cs.vitals.hr} bpm | Temp: {cs.vitals.temp}°C |
                        Poids: {cs.vitals.weight} kg
                      </div>
                      <p className="mb-1 fs-14">
                        <strong>Diagnostic :</strong> {cs.diagnosis}
                      </p>
                      <p className="mb-0 text-muted fs-13">
                        <strong>Observations :</strong> {cs.examFindings} —{" "}
                        {cs.recommendations}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 3: ORDONNANCES */}
        {activeTab === "ordonnances" && (
          <div className="patient-panel-card">
            <div className="patient-panel-card-header">
              <h3 className="patient-panel-card-title">
                Prescriptions & Ordonnances
              </h3>
              <Link
                to={`/prescriptions?patientId=${patient.id}`}
                className="patient-btn-emerald"
                style={{ padding: "6px 16px", fontSize: "11.5px" }}
              >
                + Nouvelle ordonnance
              </Link>
            </div>
            <div>
              {patientPrescriptions.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Aucune ordonnance délivrée.
                </div>
              ) : (
                patientPrescriptions.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 mb-3 border rounded-3"
                    style={{ background: "#f8fafc" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <h6
                        className="font-w600 mb-0"
                        style={{ color: "#2563eb" }}
                      >
                        {ord.prescriptionNumber} — Du {ord.date} (Validité :{" "}
                        {ord.validity})
                      </h6>
                      <div className="d-flex gap-2 align-items-center">
                        <span className="patient-badge-status">
                          <span className="patient-status-dot-pulse"></span>
                          Validée & Signée
                        </span>
                        <button
                          type="button"
                          className="patient-btn-back"
                          style={{ padding: "4px 12px", fontSize: "11px" }}
                          onClick={() => setSelectedPrescription(ord)}
                          title="Aperçu & Impression officielle"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect width="12" height="8" x="6" y="14" />
                          </svg>
                          Imprimer
                        </button>
                      </div>
                    </div>
                    <ul className="mb-2 ps-3">
                      {ord.items.map((item, idx) => (
                        <li key={idx} className="mb-1 fs-13">
                          <strong>{item.medication}</strong> : {item.posology}{" "}
                          pendant {item.duration} ({item.renewable})
                        </li>
                      ))}
                    </ul>
                    <div className="text-muted fs-12">
                      <strong>Conseils :</strong> {ord.notes}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PANEL 4: DOCUMENTS & RÉSULTATS */}
        {activeTab === "documents" && (
          <div className="patient-panel-card">
            <div className="patient-panel-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h3 className="patient-panel-card-title">
                  Documents & Résultats rattachés
                </h3>
                <p className="text-muted fs-12 mb-0">
                  Imageries médicales, bilans d'analyses, scanners et comptes-rendus du patient
                </p>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${showAddDocForm ? "btn-outline-secondary" : "btn-primary"} d-flex align-items-center gap-2`}
                style={{ borderRadius: "10px", fontWeight: "600", transition: "all 0.2s" }}
                onClick={() => setShowAddDocForm(!showAddDocForm)}
              >
                <i className={showAddDocForm ? "fa fa-times" : "fa fa-cloud-upload-alt"}></i>
                <span>{showAddDocForm ? "Fermer le formulaire" : "+ Ajouter un document"}</span>
              </button>
            </div>

            {/* FORMULAIRE INLINE D'IMPORT DE PHOTOS ET FICHIERS */}
            {showAddDocForm && (
              <div
                className="p-4 mb-4"
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fa fa-file-upload"></i>
                    </span>
                    <h5 className="font-w700 text-dark mb-0 fs-15">
                      Importer une photo ou un fichier depuis votre appareil
                    </h5>
                  </div>
                  <span className="badge bg-primary text-white fs-11 px-2 py-1">
                    Dossier {patient.fileNumber}
                  </span>
                </div>

                <form onSubmit={handleSaveDocument}>
                  <div className="row">
                    {/* Zone d'import de fichier / photo */}
                    <div className="col-12 mb-3">
                      <label className="form-label font-w600 fs-13 text-dark">
                        Photo ou Document depuis l'appareil
                      </label>
                      <div
                        style={{
                          border: docFile ? "2px solid #86efac" : "2px dashed #cbd5e1",
                          borderRadius: "12px",
                          padding: "22px 16px",
                          textAlign: "center",
                          background: docFile ? "#f0fdf4" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => document.getElementById("patientDocFileInput").click()}
                      >
                        <input
                          type="file"
                          id="patientDocFileInput"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />

                        {docFile ? (
                          <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                            {docFilePreview ? (
                              <img
                                src={docFilePreview}
                                alt="Aperçu"
                                style={{
                                  maxHeight: "95px",
                                  maxWidth: "140px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  border: "1px solid #86efac",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  borderRadius: "10px",
                                  background: "#ecfdf5",
                                  color: "#16a34a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "24px",
                                }}
                              >
                                <i className="fa fa-file-pdf"></i>
                              </span>
                            )}
                            <div className="text-start">
                              <p className="font-w700 text-dark mb-0 fs-14">
                                {docFile.name}
                              </p>
                              <small className="text-muted">
                                {(docFile.size / 1024).toFixed(1)} Ko • {docFile.type || "Fichier sélectionné"}
                              </small>
                              <div className="mt-1">
                                <span className="badge bg-success text-white fs-11">
                                  <i className="fa fa-check me-1"></i> Prêt à être importé
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-xs ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocFile(null);
                                setDocFilePreview(null);
                              }}
                            >
                              <i className="fa fa-trash me-1"></i> Changer
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2">
                              <span
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "20px",
                                }}
                              >
                                <i className="fa fa-camera-retro"></i>
                              </span>
                            </div>
                            <p className="font-w600 text-dark mb-1 fs-14">
                              Cliquez ici pour sélectionner une photo ou un fichier depuis votre appareil
                            </p>
                            <p className="text-muted fs-12 mb-0">
                              Photos (JPEG, PNG, WebP), scanners, radiographies, PDF, analyses médicales... (max 25 Mo)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Champ Titre du document (Requis) */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 fs-13 text-dark">
                        Titre du document <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Radiographie du thorax face/profil, Échographie abdominale, Bilan sanguin..."
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        required
                      />
                      <small className="text-muted fs-11">
                        Titre descriptif pour identifier rapidement le document dans le dossier
                      </small>
                    </div>

                    {/* Champ Catégorie */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label font-w600 fs-13 text-dark">
                        Catégorie
                      </label>
                      <select
                        className="form-control"
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value)}
                      >
                        <option value="Imagerie & Radiologie">Imagerie & Radiologie</option>
                        <option value="Analyses de laboratoire">Analyses de laboratoire</option>
                        <option value="Comptes rendus spécialistes">Comptes rendus spécialistes</option>
                        <option value="Certificats médicaux">Certificats médicaux</option>
                        <option value="Ordonnance externe">Ordonnance externe</option>
                        <option value="Autre document médical">Autre document médical</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label font-w600 fs-13 text-dark">
                        Date du document
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                      />
                    </div>

                    {/* Émetteur / Source */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 fs-13 text-dark">
                        Émetteur / Source
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Centre d'Imagerie, Laboratoire Pyramides, Dr Confrère..."
                        value={docAuthor}
                        onChange={(e) => setDocAuthor(e.target.value)}
                      />
                    </div>

                    {/* Boutons d'action */}
                    <div className="col-md-6 mb-3 d-flex align-items-end justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleResetDocForm}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-2"
                      >
                        <i className="fa fa-check"></i>
                        <span>Enregistrer & Joindre au dossier</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th>Titre du document</th>
                    <th>Catégorie</th>
                    <th>Date</th>
                    <th>Émetteur</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <i className="fa fa-folder-open fs-28 d-block mb-2 text-muted"></i>
                        Aucun document rattaché à ce dossier pour le moment.
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowAddDocForm(true)}
                          >
                            <i className="fa fa-plus me-1"></i> Importer le premier document
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    patientDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {doc.isImage || (doc.type && ["JPG", "JPEG", "PNG", "WEBP"].includes(doc.type.toUpperCase())) ? (
                              <span
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                  background: "#fef3c7",
                                  color: "#d97706",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  cursor: doc.fileDataUrl ? "pointer" : "default",
                                }}
                                onClick={() => doc.fileDataUrl && setPreviewingDoc(doc)}
                                title="Voir l'image"
                              >
                                {doc.fileDataUrl ? (
                                  <img
                                    src={doc.fileDataUrl}
                                    alt=""
                                    style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "8px" }}
                                  />
                                ) : (
                                  <i className="fa fa-image fs-14"></i>
                                )}
                              </span>
                            ) : (
                              <span
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <i className="fa fa-file-pdf fs-14"></i>
                              </span>
                            )}
                            <div>
                              <strong className="text-dark d-block">{doc.title}</strong>
                              <small className="text-muted">
                                {doc.fileSize || "Document"} • {doc.type || "PDF"}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="patient-med-tag">{doc.category}</span>
                        </td>
                        <td>{doc.date}</td>
                        <td>{doc.author}</td>
                        <td className="text-end">
                          <div className="d-inline-flex align-items-center gap-2">
                            {doc.fileDataUrl && (
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-info"
                                onClick={() => setPreviewingDoc(doc)}
                                title="Aperçu du document ou de la photo"
                              >
                                <i className="fa fa-eye me-1"></i> Voir
                              </button>
                            )}
                            <button
                              type="button"
                              className="patient-btn-back"
                              style={{ padding: "4px 10px", fontSize: "11px" }}
                              onClick={() => handleDownloadDoc(doc)}
                              title="Télécharger le fichier"
                            >
                              <i className="fa fa-download me-1"></i> Télécharger
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-link text-danger p-0"
                              onClick={() => handleDeleteDocument(doc.id, doc.title)}
                              title="Supprimer du dossier"
                            >
                              <i className="fa fa-trash"></i>
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
        )}

        {/* PANEL 6: FAITS / FACTURES */}
        {activeTab === "invoices" && (
          <div className="patient-panel-card">
            <div className="patient-panel-card-header">
              <h3 className="patient-panel-card-title">
                Facturation du patient
              </h3>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th>N° Facture</th>
                    <th>Date</th>
                    <th>Description de l'acte</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {patientInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong>{inv.invoiceNumber}</strong>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{inv.date}</td>
                      <td>{inv.actDescription}</td>
                      <td><strong className="text-dark">{inv.amount.toLocaleString("fr-DZ")} DA</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Prévisualisation & Impression Officielle d'Ordonnance */}
      <PrescriptionPreviewModal
        show={!!selectedPrescription}
        onHide={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />

      {/* Lightbox / Modal d'Aperçu Photo et Document */}
      {previewingDoc && (
        <Modal
          show={!!previewingDoc}
          onHide={() => setPreviewingDoc(null)}
          centered
          size="lg"
        >
          <div className="modal-header border-0 pb-0">
            <div>
              <h5 className="modal-title font-w700 text-dark mb-0">
                {previewingDoc.title}
              </h5>
              <small className="text-muted">
                {previewingDoc.category} • {previewingDoc.date} • {previewingDoc.author}
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setPreviewingDoc(null)}
            ></button>
          </div>
          <div className="modal-body text-center p-4">
            {previewingDoc.fileDataUrl && (previewingDoc.isImage || ["JPG", "JPEG", "PNG", "WEBP"].includes((previewingDoc.type || "").toUpperCase())) ? (
              <img
                src={previewingDoc.fileDataUrl}
                alt={previewingDoc.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                }}
              />
            ) : (
              <div className="p-5 bg-light rounded text-center">
                <i className="fa fa-file-pdf fs-48 text-danger mb-3 d-block"></i>
                <h6 className="font-w600 text-dark">{previewingDoc.title}</h6>
                <p className="text-muted fs-13 mb-3">Fichier document {previewingDoc.type || "PDF"}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownloadDoc(previewingDoc)}
                >
                  <i className="fa fa-download me-1"></i> Télécharger le document
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setPreviewingDoc(null)}
            >
              Fermer
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleDownloadDoc(previewingDoc)}
            >
              <i className="fa fa-download me-1"></i> Télécharger
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientDetailsCabinet;


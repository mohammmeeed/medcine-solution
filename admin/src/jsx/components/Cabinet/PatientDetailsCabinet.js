import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const patientDocuments = initialDocuments.filter(
    (d) => d.patientId === patient.id
  );
  const patientInvoices = initialInvoices.filter(
    (i) => i.patientId === patient.id
  );

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

        {/* Tab 4: Constantes et Examens */}
        <button
          type="button"
          className={`patient-tab-btn ${activeTab === "constantes" ? "active" : ""}`}
          onClick={() => setActiveTab("constantes")}
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
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </svg>
          <span>Constantes et Examens ( {patientExaminations.length} )</span>
        </button>

        {/* Tab 5: Documents */}
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
          <span>Faits ( {patientInvoices.length} )</span>
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

        {/* PANEL 4: CONSTANTES ET EXAMENS */}
        {activeTab === "constantes" && (
          <div className="patient-panel-card">
            <div className="patient-panel-card-header">
              <h3 className="patient-panel-card-title">
                Historique des constantes vitales
              </h3>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th>Date</th>
                    <th>Tension (mmHg)</th>
                    <th>Pouls (bpm)</th>
                    <th>Temp (°C)</th>
                    <th>Poids (kg)</th>
                    <th>IMC</th>
                    <th>SpO2 (%)</th>
                    <th>Glycémie (g/L)</th>
                  </tr>
                </thead>
                <tbody>
                  {patientExaminations.map((ex) => (
                    <tr key={ex.id}>
                      <td>
                        <strong>{ex.date}</strong>
                      </td>
                      <td>
                        {ex.bpSystolic}/{ex.bpDiastolic}
                      </td>
                      <td>{ex.heartRate}</td>
                      <td>{ex.temperature}</td>
                      <td>{ex.weight}</td>
                      <td>{ex.bmi}</td>
                      <td>{ex.spo2}%</td>
                      <td>{ex.bloodSugar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL 5: DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="patient-panel-card">
            <div className="patient-panel-card-header">
              <h3 className="patient-panel-card-title">
                Documents & Résultats rattachés
              </h3>
              <Link
                to="/medical-documents"
                className="patient-btn-back"
                style={{ padding: "6px 14px", fontSize: "11.5px" }}
              >
                + Ajouter un document
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th>Titre du document</th>
                    <th>Catégorie</th>
                    <th>Date</th>
                    <th>Émetteur</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patientDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.title}</strong>
                      </td>
                      <td>
                        <span className="patient-med-tag">{doc.category}</span>
                      </td>
                      <td>{doc.date}</td>
                      <td>{doc.author}</td>
                      <td>
                        <button
                          className="patient-btn-back"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          Télécharger
                        </button>
                      </td>
                    </tr>
                  ))}
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
                Facturation & Règlements du patient
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
                    <th>Prise en charge Sécu</th>
                    <th>Reste Patient</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {patientInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong>{inv.invoiceNumber}</strong>
                      </td>
                      <td>{inv.date}</td>
                      <td>{inv.actDescription}</td>
                      <td>{inv.amount.toFixed(2)} €</td>
                      <td>{inv.coveredAmo.toFixed(2)} €</td>
                      <td>{inv.patientRemaining.toFixed(2)} €</td>
                      <td>
                        <span
                          className={
                            inv.status === "Payée"
                              ? "patient-badge-status"
                              : "patient-badge-blood"
                          }
                        >
                          {inv.status}
                        </span>
                      </td>
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
    </div>
  );
};

export default PatientDetailsCabinet;


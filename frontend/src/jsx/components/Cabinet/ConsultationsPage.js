import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import PrescriptionPreviewModal from "./PrescriptionPreviewModal";
import ConsultationEchoForm from "./ConsultationEchoForm";
import EchoReportPrintModal from "./EchoReportPrintModal";
import ApiService from "../../../services/ApiService";
import {
  initialConsultations,
  initialPatients,
  initialPrescriptions,
  initialDoctor,
  initialMedications,
} from "../../../services/CabinetData";

const defaultConsultationTypesList = [
  { id: 1, name: "Consultation de médecine générale", duration: "20 min", price: 2500, active: true },
  { id: 2, name: "Consultation gynécologique / spécialisée", duration: "25 min", price: 3000, active: true },
  { id: 3, name: "Suivi de grossesse / Maternité", duration: "20 min", price: 2500, active: true },
  { id: 4, name: "Échographie obstétricale (T1 / T2 / T3)", duration: "30 min", price: 4000, active: true },
  { id: 5, name: "Échographie pelvienne / gynécologique", duration: "25 min", price: 3500, active: true },
  { id: 6, name: "Consultation avec frottis / acte", duration: "30 min", price: 3500, active: true },
  { id: 7, name: "Visite de contrôle / Bilan", duration: "15 min", price: 1500, active: true },
];

const formatBillingCode = (name, price) => {
  const p = Number(price) || 0;
  return `${name} (${p.toLocaleString("fr-FR")} DA)`;
};

const getInitialCabinetSettings = () => {
  try {
    const raw = localStorage.getItem("cabinet_settings");
    if (raw) {
      const s = JSON.parse(raw);
      const types = Array.isArray(s.consultationTypes) && s.consultationTypes.length > 0
        ? s.consultationTypes
        : defaultConsultationTypesList;
      const defName = s.defaultConsultationType || types[0]?.name || "Consultation de médecine générale";
      const matched = types.find((t) => t.name === defName);
      const defPrice = matched ? matched.price : (s.consultationPrice !== undefined ? s.consultationPrice : 2500);
      return {
        types,
        defaultBillingCode: formatBillingCode(defName, defPrice),
        defaultReason: defName,
      };
    }
  } catch (_) {}
  return {
    types: defaultConsultationTypesList,
    defaultBillingCode: formatBillingCode("Consultation gynécologique / spécialisée", 3000),
    defaultReason: "Consultation gynécologique / spécialisée",
  };
};

const ConsultationsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patientIdQuery = searchParams.get("patientId");

  const [initialSettingsInfo] = useState(() => getInitialCabinetSettings());
  const [consultationTypes, setConsultationTypes] = useState(initialSettingsInfo.types);
  const [defaultBillingCode, setDefaultBillingCode] = useState(initialSettingsInfo.defaultBillingCode);
  const [defaultReason, setDefaultReason] = useState(initialSettingsInfo.defaultReason);

  const [consultations, setConsultations] = useState(initialConsultations);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState(initialMedications);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModal, setShowNewModal] = useState(!!patientIdQuery);
  const [showPrescriptionSection, setShowPrescriptionSection] = useState(false);
  const [showEchoReportSection] = useState(false);
  const [showFullCREcho, setShowFullCREcho] = useState(false);
  const [previewPrescription, setPreviewPrescription] = useState(null);
  const [previewEchoReport, setPreviewEchoReport] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Gestion des documents et pièces jointes rattachés au dossier médical de la consultation
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [previewingDoc, setPreviewingDoc] = useState(null);
  const consultFileInputRef = useRef(null);

  const handleConsultFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      let sizeStr = "";
      if (file.size < 1024 * 1024) {
        sizeStr = `${Math.round(file.size / 1024)} Ko`;
      } else {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
      }

      const ext = file.name.split(".").pop()?.toUpperCase() || "DOC";
      let category = "Imagerie & Radiologie";
      if (["PDF", "DOC", "DOCX"].includes(ext)) {
        category = "Compte-Rendu & Analyse";
      } else if (["JPG", "JPEG", "PNG", "WEBP", "DICOM"].includes(ext)) {
        category = "Imagerie Médicale & Écho";
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: sizeStr,
            extension: ext,
            type: file.type || "application/octet-stream",
            dataUrl: event.target.result,
            category: category,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (consultFileInputRef.current) consultFileInputRef.current.value = "";
  };

  const handleRemoveAttachedFile = (idx) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    let isMounted = true;
    const loadFromApi = async () => {
      try {
        const [apiConsults, apiPatients, apiSettings] = await Promise.all([
          ApiService.getConsultations(),
          ApiService.getPatients(),
          ApiService.getSettings().catch(() => null),
        ]);
        if (isMounted) {
          if (apiConsults && apiConsults.length > 0) {
            setConsultations(apiConsults);
          }
          if (apiPatients) {
            const clean = apiPatients.filter((p) => {
              const last = (p.lastName || "").toLowerCase().trim();
              const first = (p.firstName || "").toLowerCase().trim();
              return (
                !["dubois", "lemoine", "bernard", "moreau", "belkacem"].includes(last) &&
                !["claire", "marc", "sophie", "lucas", "yasmine"].includes(first)
              );
            });
            setPatients(clean);
          }
          if (apiSettings) {
            const types = Array.isArray(apiSettings.consultationTypes) && apiSettings.consultationTypes.length > 0
              ? apiSettings.consultationTypes
              : defaultConsultationTypesList;
            setConsultationTypes(types);

            const defName = apiSettings.defaultConsultationType || types[0]?.name || "Consultation de médecine générale";
            const matched = types.find((t) => t.name === defName);
            const defPrice = matched ? matched.price : (apiSettings.consultationPrice !== undefined ? apiSettings.consultationPrice : 2500);
            const code = formatBillingCode(defName, defPrice);

            setDefaultBillingCode(code);
            setDefaultReason(defName);

            setFormConsult((prev) => {
              const isDefaultOrOld =
                !prev.billingCode ||
                prev.billingCode === "Consultation générale (2 000 DA)" ||
                prev.billingCode === initialSettingsInfo.defaultBillingCode;
              if (isDefaultOrOld) {
                return {
                  ...prev,
                  billingCode: code,
                  reason:
                    !prev.reason ||
                    prev.reason === "Consultation générale de routine" ||
                    prev.reason === initialSettingsInfo.defaultReason
                      ? defName
                      : prev.reason,
                };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn("Connexion API backend PHP : utilisation du mode local", err);
      }
    };
    loadFromApi();
    return () => {
      isMounted = false;
    };
  }, [initialSettingsInfo]);

  const [formConsult, setFormConsult] = useState({
    patientId: patientIdQuery || "",
    date: new Date().toISOString().split("T")[0],
    time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
    reason: initialSettingsInfo.defaultReason || "Consultation générale de routine",
    billingCode: initialSettingsInfo.defaultBillingCode,
    bp: "120/80",
    weight: "65",
    temperature: "37.0",
    heartRate: "72",
    symptoms: "",
    examFindings: "",
    diagnosis: "Bilan médical de contrôle normal",
    recommendations: "Respecter les règles hygiéno-diététiques et le traitement prescrit.",
    echoType: "Échographie pelvienne / gynécologique",
    echoFindings: "",
    echoConclusion: "",
  });

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.lastName.toUpperCase()} ${p.firstName} — ${p.fileNumber} (Née le ${p.dob} • ${p.age} ans)`,
  }));

  const selectedPatientOption = formConsult.patientId
    ? patientOptions.find((opt) => String(opt.value) === String(formConsult.patientId)) || null
    : null;

  const patientSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "45px",
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#1e60d5" : "#e4e7ea",
      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(30, 96, 213, 0.15)" : "none",
      "&:hover": {
        borderColor: "#1e60d5",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1e60d5"
        : state.isFocused
        ? "rgba(30, 96, 213, 0.08)"
        : "transparent",
      color: state.isSelected ? "#ffffff" : "#333333",
      fontSize: "13px",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "14px",
      fontWeight: "500",
      color: "#333333",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "13px",
      color: "#9ca3af",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "0.75rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    }),
  };

  const [prescriptionItems, setPrescriptionItems] = useState([
    {
      medication: "PARACÉTAMOL 1000 mg comprimé",
      dosage: "1000 mg",
      posology: "1 comprimé toutes les 8h si douleurs ou fièvre (max 3g/jour)",
      duration: "5 jours",
      renewable: "Non renouvelable",
    },
  ]);

  const handleAddMedication = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medication: "", dosage: "", posology: "", duration: "", renewable: "Non renouvelable" },
    ]);
  };

  const handleRemoveMedication = (index) => {
    if (prescriptionItems.length > 1) {
      setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  useEffect(() => {
    ApiService.getMedications().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setMedications(data);
      }
    });
  }, []);

  const handleSelectPredefinedMed = (index, medName) => {
    const found = medications.find((m) => m.name.toLowerCase() === medName.toLowerCase());
    const updated = [...prescriptionItems];
    if (found) {
      updated[index].medication = found.name;
      if (found.dosage) updated[index].dosage = found.dosage;
      if (found.defaultPosology) updated[index].posology = found.defaultPosology;
      if (found.defaultDuration) updated[index].duration = found.defaultDuration;
    } else {
      updated[index].medication = medName;
    }
    setPrescriptionItems(updated);
  };

  // Impression directe de l'Échographie (sans enregistrer ni fermer la consultation)
  const handlePrintEchoGeneral = () => {
    if (!formConsult.patientId) {
      Swal.fire({
        icon: "warning",
        title: "Patient requis",
        text: "Veuillez sélectionner un(e) patient(e) pour imprimer l'échographie.",
        confirmButtonColor: "#1e60d5",
      });
      return;
    }
    const selPat =
      patients.find((p) => String(p.id) === String(formConsult.patientId)) ||
      initialPatients.find((p) => String(p.id) === String(formConsult.patientId)) ||
      patients[0];

    const echoData = {
      id: Date.now(),
      consultationNumber: `CS-${new Date().getFullYear()}-00${consultations.length + 10}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      date: formConsult.date,
      time: formConsult.time,
      reason: formConsult.echoType || formConsult.reason || "Échographie",
      billingCode: formConsult.billingCode,
      diagnosis: formConsult.diagnosis,
      recommendations: formConsult.recommendations,
      examFindings:
        formConsult.examFindings ||
        (formConsult.symptoms
          ? `Motif / Symptômes : ${formConsult.symptoms}`
          : "Examen clinique normal."),
      echoFindings:
        formConsult.echoFindings ||
        formConsult.echoConclusion ||
        formConsult.diagnosis ||
        "Examen échographique sans anomalie décelable.",
      patientDetails: {
        nom: selPat.lastName,
        prenom: selPat.firstName,
        ddn: selPat.dob,
        age: `${selPat.age} ans`,
        ddr: selPat.ddr || "-",
        termeDdr: selPat.terme || "-",
      },
    };

    setPreviewEchoReport(echoData);
  };

  // Impression directe de l'Ordonnance (sans enregistrer ni fermer la consultation)
  const handlePrintPrescriptionGeneral = () => {
    if (!formConsult.patientId) {
      Swal.fire({
        icon: "warning",
        title: "Patient requis",
        text: "Veuillez sélectionner un(e) patient(e) pour faire l'ordonnance.",
        confirmButtonColor: "#1e60d5",
      });
      return;
    }
    const selPat =
      patients.find((p) => String(p.id) === String(formConsult.patientId)) ||
      initialPatients.find((p) => String(p.id) === String(formConsult.patientId)) ||
      patients[0];

    const validItems = prescriptionItems.filter(
      (item) => item.medication && item.medication.trim() !== ""
    );

    const prescData = {
      id: Date.now(),
      prescriptionNumber: `ORD-${new Date().getFullYear()}-00${consultations.length + 12}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      date: formConsult.date,
      validity: "3 mois",
      ald: false,
      doctorName: initialDoctor.name,
      items:
        validItems.length > 0
          ? validItems
          : [
              {
                medication: formConsult.diagnosis
                  ? `Traitement : ${formConsult.diagnosis}`
                  : "PARACÉTAMOL 1000 mg comprimé",
                dosage: "1000 mg",
                posology: "1 comprimé toutes les 8h si besoin",
                duration: "5 jours",
                renewable: "Non renouvelable",
              },
            ],
      notes: formConsult.recommendations || "Respecter la posologie.",
      validated: true,
    };

    setPreviewPrescription(prescData);
  };

  const handleSaveGeneralConsultation = async (e) => {
    e.preventDefault();
    if (!formConsult.patientId) {
      Swal.fire({
        icon: "warning",
        title: "Patient requis",
        text: "Veuillez sélectionner un(e) patient(e) avant d'enregistrer la consultation.",
        confirmButtonColor: "#1e60d5",
      });
      return;
    }
    const selPat =
      patients.find((p) => String(p.id) === String(formConsult.patientId)) ||
      initialPatients.find((p) => String(p.id) === String(formConsult.patientId)) ||
      patients[0];

    const hasPrescription = showPrescriptionSection && prescriptionItems.some((item) => item.medication.trim() !== "");
    const prescData = hasPrescription
      ? {
          id: consultations.length + 1,
          prescriptionNumber: `ORD-${new Date().getFullYear()}-00${consultations.length + 12}`,
          patientId: selPat.id,
          patientName: `${selPat.firstName} ${selPat.lastName}`,
          date: formConsult.date,
          validity: "3 mois",
          ald: false,
          doctorName: initialDoctor.name,
          items: prescriptionItems.filter((item) => item.medication.trim() !== ""),
          notes: formConsult.recommendations,
          validated: true,
        }
      : null;

    const hasEcho = showEchoReportSection && (formConsult.echoFindings.trim() !== "" || formConsult.echoConclusion.trim() !== "");

    const newCs = {
      id: consultations.length + 1,
      consultationNumber: `CS-${new Date().getFullYear()}-010${consultations.length + 6}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      date: formConsult.date,
      time: formConsult.time,
      reason: formConsult.reason,
      billingCode: formConsult.billingCode,
      vitals: {
        bp: formConsult.bp || "120/80",
        weight: formConsult.weight || "65",
        temperature: formConsult.temperature || "37.0",
        heartRate: formConsult.heartRate || "72",
        ddr: selPat.ddr || "-",
        terme: selPat.terme || "-",
      },
      examFindings: formConsult.examFindings || (formConsult.symptoms ? `Motif / Symptômes : ${formConsult.symptoms}` : "Examen clinique normal."),
      diagnosis: formConsult.diagnosis,
      recommendations: formConsult.recommendations,
      echoType: hasEcho ? formConsult.echoType : null,
      echoFindings: hasEcho ? `${formConsult.echoType} : ${formConsult.echoFindings}${formConsult.echoConclusion ? ` — Conclusion : ${formConsult.echoConclusion}` : ""}` : "",
      echoConclusion: hasEcho ? formConsult.echoConclusion : "",
      prescriptionCreated: hasPrescription,
      prescriptionData: prescData,
      prescriptionItems: hasPrescription ? prescData.items : [],
      documents: attachedFiles,
      status: "Clôturée",
    };

    setConsultations([newCs, ...consultations]);
    setShowNewModal(false);
    setSelectedConsultation(null);

    // Réinitialiser le formulaire avec le type et la cotation par défaut configurés
    setFormConsult({
      patientId: "",
      date: new Date().toISOString().split("T")[0],
      time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      reason: defaultReason || "Consultation de routine",
      billingCode: defaultBillingCode,
      bp: "120/80",
      weight: "65",
      temperature: "37.0",
      heartRate: "72",
      symptoms: "",
      examFindings: "",
      diagnosis: "Bilan médical de contrôle normal",
      recommendations: "Respecter les règles hygiéno-diététiques et le traitement prescrit.",
      echoType: "Échographie pelvienne / gynécologique",
      echoFindings: "",
      echoConclusion: "",
    });

    let savedConsultId = newCs.id;
    try {
      const res = await ApiService.saveConsultation(newCs);
      if (res && res.data && res.data.id) {
        savedConsultId = res.data.id;
        newCs.id = res.data.id;
        if (res.data.consultationNumber) {
          newCs.consultationNumber = res.data.consultationNumber;
        }
      }
    } catch (err) {
      console.warn("Consultation enregistrée en local (MySQL hors ligne ou avertissement):", err.message);
    }

    // Enregistrement des documents / fichiers joints dans medical_documents (Dossier Médical)
    const nbFiles = attachedFiles.length;
    if (nbFiles > 0) {
      for (const fItem of attachedFiles) {
        try {
          await ApiService.saveDocument({
            patientId: selPat.id,
            consultationId: savedConsultId,
            title: fItem.name,
            category: fItem.category || "Imagerie & Radiologie",
            date: formConsult.date || new Date().toISOString().split("T")[0],
            author: initialDoctor.name,
            filePath: fItem.dataUrl,
            fileSize: fItem.size,
            fileType: fItem.extension,
            status: "Validé",
          });
        } catch (docErr) {
          console.warn("Erreur enregistrement document dans dossier médical :", docErr);
        }
      }
    }
    setAttachedFiles([]);

    Swal.fire({
      icon: "success",
      title: "Consultation Enregistrée !",
      text: `${selPat.firstName} ${selPat.lastName} : Consultation archivée avec succès.` +
        (nbFiles > 0 ? ` ${nbFiles} document(s) enregistré(s) dans son dossier médical.` : "") +
        (prescData ? " Ordonnance médicale émise." : ""),
      confirmButtonColor: "#1e60d5",
    });
  };

  const handleOpenPrescription = (cs) => {
    if (cs.prescriptionData) {
      setPreviewPrescription(cs.prescriptionData);
      return;
    }
    const existing = initialPrescriptions.find((p) => p.patientId === cs.patientId);
    if (existing) {
      setPreviewPrescription(existing);
    } else {
      setPreviewPrescription({
        id: cs.id,
        prescriptionNumber: `ORD-${cs.consultationNumber.replace("CS-", "")}`,
        patientId: cs.patientId,
        patientName: cs.patientName,
        date: cs.date,
        validity: "3 mois",
        ald: false,
        doctorName: initialDoctor.name,
        items: cs.items || [
          {
            medication: cs.diagnosis ? `Traitement : ${cs.diagnosis}` : "PARACÉTAMOL 1000 mg comprimé",
            dosage: "1000 mg",
            posology: "1 comprimé toutes les 8h si besoin",
            duration: "5 jours",
            renewable: "Non renouvelable",
          },
        ],
        notes: cs.recommendations || "Respecter les conseils hygiéno-diététiques et la posologie.",
        validated: true,
      });
    }
  };

  const handleSaveEchoConsultation = async (payload, prescData) => {
    const newCs = {
      ...payload,
      id: consultations.length + 1,
      consultationNumber: `CS-${new Date().getFullYear()}-010${consultations.length + 6}`,
      echoType: payload.echoType || (payload.examType ? `Échographie ${payload.examType.toUpperCase()}` : "Échographie"),
      echoFindings: payload.echoFindings || payload.diagnosis,
      echoConclusion: payload.diagnosis || payload.echoFindings,
      prescriptionCreated: !!prescData,
      prescriptionData: prescData,
      prescriptionItems: prescData?.items || [],
    };

    setConsultations([newCs, ...consultations]);
    setShowNewModal(false);
    setShowFullCREcho(false);
    setSelectedConsultation(null);

    try {
      const res = await ApiService.saveConsultation(newCs);
      if (res && res.data && res.data.id) {
        newCs.id = res.data.id;
        if (res.data.consultationNumber) {
          newCs.consultationNumber = res.data.consultationNumber;
        }
      }
    } catch (err) {
      console.warn("Compte-rendu enregistré en local (MySQL hors ligne ou avertissement):", err.message);
    }

    Swal.fire({
      icon: "success",
      title: "Compte-Rendu Échographique Enregistré !",
      text: prescData
        ? `Consultation archivée dans le dossier de ${payload.patientName}. Ordonnance médicale générée.`
        : `Consultation et compte-rendu archivés dans le dossier de ${payload.patientName}.`,
      confirmButtonColor: "#1e60d5",
    });
  };

  const filteredConsultations = consultations.filter((c) => {
    const matchSearch =
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.consultationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <>
      <PageTitle motherMenu="Gestion médicale" activeMenu="Consultations" />

      {/* Barre d'action supérieure */}
      <div className="form-head d-flex mb-3 mb-md-4 align-items-center flex-wrap justify-content-between gap-2">
        <div className="input-group search-area w-100 w-sm-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher consultation, patient, diagnostic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="input-group-text">
            <i className="flaticon-381-search-2"></i>
          </span>
        </div>

        <Button
          variant={showNewModal ? "outline-primary" : "primary"}
          className="btn-rounded w-100 w-sm-auto"
          onClick={() => {
            const nextShow = !showNewModal;
            setShowNewModal(nextShow);
            if (nextShow) {
              setSelectedConsultation(null);
              setShowFullCREcho(false);

              // Recharger les paramètres depuis le localStorage au cas où modifiés sur /settings
              let activeCode = defaultBillingCode;
              let activeReason = defaultReason;
              try {
                const raw = localStorage.getItem("cabinet_settings");
                if (raw) {
                  const s = JSON.parse(raw);
                  if (Array.isArray(s.consultationTypes) && s.consultationTypes.length > 0) {
                    setConsultationTypes(s.consultationTypes);
                  }
                  if (s.defaultConsultationType) {
                    const matched = (s.consultationTypes || []).find((t) => t.name === s.defaultConsultationType);
                    const pr = matched ? matched.price : (s.consultationPrice !== undefined ? s.consultationPrice : 2500);
                    activeCode = formatBillingCode(s.defaultConsultationType, pr);
                    activeReason = s.defaultConsultationType;
                    setDefaultBillingCode(activeCode);
                    setDefaultReason(activeReason);
                  }
                }
              } catch (_) {}

              setFormConsult((prev) => ({
                ...prev,
                patientId: patientIdQuery || "",
                billingCode: activeCode || prev.billingCode,
                reason: prev.reason || activeReason,
              }));
            }
          }}
        >
          <i className={showNewModal ? "fa fa-times me-2" : "flaticon-381-add-1 me-2"}></i>
          {showNewModal ? "Fermer le formulaire" : "Nouvelle Consultation"}
        </Button>
      </div>

      <style>{`
        .consult-sober-tag {
          display: inline-block;
          padding: 3px 9px;
          background-color: #f8fafc;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.35;
          white-space: nowrap;
        }
        .consult-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          background-color: #f8fafc;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.35;
          white-space: nowrap;
        }
        .consult-status-badge .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
          background-color: #10b981;
        }
        .consult-status-badge.status-terminee .status-dot,
        .consult-status-badge.status-cloturee .status-dot {
          background-color: #10b981;
        }
        .consult-status-badge.status-en-cours .status-dot {
          background-color: #3b82f6;
        }
        .consult-status-badge.status-annulee .status-dot {
          background-color: #ef4444;
        }
      `}</style>

      {/* Formulaire de Consultation Simple & Générale pour tout Médecin */}
      {showNewModal && (
        showFullCREcho ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowFullCREcho(false)}
                className="d-flex align-items-center"
              >
                <i className="fa fa-arrow-left me-1"></i> Revenir à la consultation générale
              </Button>
            </div>
            <ConsultationEchoForm
              patients={patients}
              initialPatientId={formConsult.patientId}
              initialDoctor={initialDoctor}
              onSave={handleSaveEchoConsultation}
              onPrintEcho={(echoPayload) => {
                setPreviewEchoReport(echoPayload);
              }}
              onPrintPrescription={(prescData) => {
                setPreviewPrescription(prescData);
              }}
              onCancel={() => setShowFullCREcho(false)}
            />
          </div>
        ) : (
          <div className="card mb-4 border shadow-sm" id="consultation-form-card">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h4 className="card-title text-primary mb-1">
                  <i className="flaticon-381-notepad me-2"></i>
                  Nouvelle Consultation Médicale
                </h4>
                <p className="text-muted fs-13 mb-0">
                  Formulaire clinique général, constantes et conduite à tenir • {initialDoctor.name}
                </p>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  variant="outline-primary"
                  size="sm"
                  type="button"
                  onClick={() => setShowFullCREcho(true)}
                  className="d-flex align-items-center btn-rounded"
                  title="Ouvrir directement la formule biométrique d'échographie"
                >
                  <i className="flaticon-381-search-1 me-1"></i>
                  + Nouveau Compte-Rendu
                </Button>
                <Button
                  variant={showPrescriptionSection ? "success" : "outline-success"}
                  size="sm"
                  type="button"
                  onClick={() => setShowPrescriptionSection(!showPrescriptionSection)}
                  className="d-flex align-items-center btn-rounded"
                  title="Rédiger une ordonnance"
                >
                  <i className="flaticon-381-file-1 me-1"></i>
                  {showPrescriptionSection ? "Masquer l'ordonnance" : "Faire l'ordonnance"}
                </Button>
                <button
                  type="button"
                  className="btn-close ms-2"
                  aria-label="Fermer"
                  onClick={() => setShowNewModal(false)}
                ></button>
              </div>
            </div>

            <form onSubmit={handleSaveGeneralConsultation}>
              <div className="card-body">
                {/* 1. Informations Patiente & Acte */}
                <div className="row mb-3">
                  <div className="col-md-7 mb-2">
                    <label className="form-label font-w600">
                      Patiente / Patient <span className="text-danger">*</span>
                    </label>
                    <Select
                      isSearchable={true}
                      isClearable={true}
                      placeholder="Tapez pour rechercher un(e) patient(e) (nom, prénom, dossier)..."
                      options={patientOptions}
                      value={selectedPatientOption}
                      styles={patientSelectStyles}
                      onChange={(selected) => {
                        setFormConsult({
                          ...formConsult,
                          patientId: selected ? selected.value : "",
                        });
                      }}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue
                          ? `Aucun patient trouvé pour "${inputValue}"`
                          : "Tapez le nom, prénom ou n° dossier pour rechercher"
                      }
                    />
                  </div>

                  <div className="col-md-5 mb-2">
                    <label className="form-label font-w600">Acte & Cotation</label>
                    <select
                      className="form-control"
                      value={formConsult.billingCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const matched = consultationTypes.find(
                          (t) => formatBillingCode(t.name, t.price) === newCode
                        );
                        setFormConsult({
                          ...formConsult,
                          billingCode: newCode,
                          reason: matched ? matched.name : formConsult.reason,
                        });
                      }}
                    >
                      {consultationTypes
                        .filter((t) => t.active !== false)
                        .map((t) => {
                          const label = formatBillingCode(t.name, t.price);
                          return (
                            <option key={t.id || t.name} value={label}>
                              {label}
                            </option>
                          );
                        })}
                      {formConsult.billingCode &&
                        !consultationTypes.some(
                          (t) => formatBillingCode(t.name, t.price) === formConsult.billingCode
                        ) && (
                          <option value={formConsult.billingCode}>{formConsult.billingCode}</option>
                        )}
                    </select>
                  </div>
                </div>

                {/* 2. Paramètres Vitaux & Constantes (Simple pour tout médecin) */}
                <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                  <i className="flaticon-381-heart me-1"></i> 1. Constantes Vitales & Paramètres Cliniques
                </h6>
                <div className="row mb-3">
                  <div className="col-md-3 col-sm-6 mb-2">
                    <label className="form-label fs-13">Tension Artérielle (TA)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: 120/80 mmHg"
                      value={formConsult.bp}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, bp: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3 col-sm-6 mb-2">
                    <label className="form-label fs-13">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      placeholder="Ex: 65"
                      value={formConsult.weight}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, weight: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3 col-sm-6 mb-2">
                    <label className="form-label fs-13">Température (°C)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: 37.0"
                      value={formConsult.temperature}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, temperature: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3 col-sm-6 mb-2">
                    <label className="form-label fs-13">Pouls / Fréquence (bpm)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex: 72"
                      value={formConsult.heartRate}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, heartRate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* 3. Examen Clinique & Observations */}
                <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                  <i className="flaticon-381-search-1 me-1"></i> 2. Examen Clinique & Interrogatoire
                </h6>
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label fs-13 font-w500">Histoire de la maladie & Symptômes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Motif détaillé, antécédents, anamnèse, signes fonctionnels..."
                      value={formConsult.symptoms}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, symptoms: e.target.value })
                      }
                    ></textarea>
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label fs-13 font-w500">Examen physique & Auscultation</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Signes physiques, palpation, auscultation cardio-pulmonaire, examen général..."
                      value={formConsult.examFindings}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, examFindings: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>

                {/* 4. Diagnostic & Conduite à tenir */}
                <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                  <i className="flaticon-381-folder me-1"></i> 3. Diagnostic & Conduite à Tenir
                </h6>
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label fs-13 font-w500">Diagnostic Médical (CIM-10) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Bilan de santé normal, Rhinopharyngite, Hypertension, Grossesse débutante..."
                      value={formConsult.diagnosis}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, diagnosis: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label fs-13 font-w500">Conduite à tenir & Conseils</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Repos, conseils hygiéno-diététiques, bilans complémentaires, date de prochain contrôle..."
                      value={formConsult.recommendations}
                      onChange={(e) =>
                        setFormConsult({ ...formConsult, recommendations: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>

                {/* Section Échographie Médicale (Conditionnelle) */}
                {showEchoReportSection && (
                  <div className="mt-3 p-3 border rounded bg-light mb-3" id="echo-report-section">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                      <div>
                        <h6 className="text-info font-w600 mb-0">
                          <i className="flaticon-381-search-1 me-1"></i> Échographie Médicale
                        </h6>
                        <span className="text-muted fs-12">
                          Renseignez le compte-rendu d'échographie pour cette consultation
                        </span>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => setShowFullCREcho(true)}
                      >
                        <i className="fa fa-calculator me-1"></i> Ouvrir le formulaire biométrique complet
                      </Button>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fs-12 font-w500">Type d'échographie</label>
                        <select
                          className="form-control form-control-sm"
                          value={formConsult.echoType}
                          onChange={(e) =>
                            setFormConsult({ ...formConsult, echoType: e.target.value })
                          }
                        >
                          <option value="Échographie pelvienne / gynécologique">Échographie pelvienne / gynécologique</option>
                          <option value="Échographie obstétrique — 1er Trimestre (T1)">Échographie obstétrique — 1er Trimestre (T1)</option>
                          <option value="Échographie obstétrique — 2ème Trimestre (T2)">Échographie obstétrique — 2ème Trimestre (T2)</option>
                          <option value="Échographie obstétrique — 3ème Trimestre (T3)">Échographie obstétrique — 3ème Trimestre (T3)</option>
                          <option value="Échographie obstétrique de contrôle / datation">Échographie obstétrique de contrôle / datation</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-2">
                        <label className="form-label fs-12 font-w500">Observations / Biométrie</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Ex: Sac gestationnel intra-utérin, embryon visible, LCC = 45mm..."
                          value={formConsult.echoFindings}
                          onChange={(e) =>
                            setFormConsult({ ...formConsult, echoFindings: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-4 mb-2">
                        <label className="form-label fs-12 font-w500">Conclusion Échographique</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Ex: Grossesse intra-utérine évolutive..."
                          value={formConsult.echoConclusion}
                          onChange={(e) =>
                            setFormConsult({ ...formConsult, echoConclusion: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Section Ordonnance Médicale (Conditionnelle) */}
                {showPrescriptionSection && (
                  <div className="mt-3 p-3 border rounded bg-light mb-3" id="prescription-section">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                      <div>
                        <h6 className="text-success font-w600 mb-0">
                          <i className="flaticon-381-file-1 me-1"></i> 4. Prescription Médicale (Ordonnance)
                        </h6>
                        <span className="text-muted fs-12">
                          Renseignez les médicaments prescrits pour cette consultation
                        </span>
                      </div>
                      <Button
                        variant="outline-success"
                        size="sm"
                        type="button"
                        onClick={handleAddMedication}
                        className="d-flex align-items-center"
                      >
                        <i className="flaticon-381-add-1 me-1"></i> Ajouter un médicament
                      </Button>
                    </div>

                    {prescriptionItems.map((item, index) => (
                      <div key={index} className="p-3 border rounded mb-2 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-muted fs-12">Médicament #{index + 1}</strong>
                          {prescriptionItems.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-xs"
                              onClick={() => handleRemoveMedication(index)}
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                        <div className="row">
                          <div className="col-md-5 mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="form-label fs-12 mb-0">Médicament (DCI ou Spécialité) *</label>
                              <select
                                className="form-select form-select-sm py-0 px-1 fs-11 text-primary border-primary"
                                style={{ width: "auto", maxWidth: "160px", height: "24px" }}
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleSelectPredefinedMed(index, e.target.value);
                                  }
                                }}
                              >
                                <option value="">-- Choisir --</option>
                                {medications.map((m, mIdx) => (
                                  <option key={m.id || `${m.name}-${mIdx}`} value={m.name}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <input
                              type="text"
                              list="consult-medications-datalist"
                              className="form-control form-control-sm"
                              placeholder="Ex: PARACÉTAMOL 1g, SPASFON, AMOXICILLINE..."
                              value={item.medication}
                              onChange={(e) => {
                                handleMedicationChange(index, "medication", e.target.value);
                                const exact = medications.find(
                                  (m) => m.name.toLowerCase() === e.target.value.trim().toLowerCase()
                                );
                                if (exact) {
                                  handleSelectPredefinedMed(index, exact.name);
                                }
                              }}
                              required={showPrescriptionSection}
                            />
                          </div>
                          <div className="col-md-4 mb-2">
                            <label className="form-label fs-12">Posologie détaillée *</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Ex: 1 comprimé 3 fois par jour au repas..."
                              value={item.posology}
                              onChange={(e) =>
                                handleMedicationChange(index, "posology", e.target.value)
                              }
                              required={showPrescriptionSection}
                            />
                          </div>
                          <div className="col-md-3 mb-2">
                            <label className="form-label fs-12">Durée</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Ex: 5 jours, 1 mois..."
                              value={item.duration}
                              onChange={(e) =>
                                handleMedicationChange(index, "duration", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2 border-top">
                {/* Zone Téléversement de fichier vers le dossier médical (remplace le texte supprimé) */}
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <input
                    type="file"
                    ref={consultFileInputRef}
                    style={{ display: "none" }}
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleConsultFileUpload}
                  />
                  <Button
                    variant="outline-primary"
                    type="button"
                    className="d-flex align-items-center btn-sm rounded font-w600"
                    onClick={() => consultFileInputRef.current && consultFileInputRef.current.click()}
                    title="Téléverser un document ou fichier d'examen qui sera archivé dans le dossier médical du patient"
                  >
                    <i className="flaticon-381-upload me-1"></i>
                    Joindre un fichier / Document
                  </Button>

                  {/* Fichiers joints en attente d'enregistrement */}
                  {attachedFiles.map((f, idx) => (
                    <span
                      key={idx}
                      className="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2 fs-12"
                      style={{ background: "#f8fafc", borderColor: "#cbd5e1" }}
                    >
                      <i className="flaticon-381-file-1 text-primary me-1"></i>
                      <span className="text-truncate" style={{ maxWidth: "160px" }}>
                        {f.name}
                      </span>
                      <small className="text-muted ms-1">({f.size})</small>
                      <button
                        type="button"
                        className="btn-close btn-close-sm ms-1"
                        style={{ fontSize: "8px" }}
                        onClick={() => handleRemoveAttachedFile(idx)}
                        title="Retirer ce fichier"
                      ></button>
                    </span>
                  ))}
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <Button
                    variant="outline-primary"
                    type="button"
                    onClick={handlePrintEchoGeneral}
                    className="d-flex align-items-center"
                    title="Imprimer le compte-rendu d'échographie"
                  >
                    <i className="flaticon-381-print me-1"></i> Imprimer Échographie
                  </Button>
                  <Button
                    variant="outline-success"
                    type="button"
                    onClick={handlePrintPrescriptionGeneral}
                    className="d-flex align-items-center"
                    title="Imprimer l'ordonnance médicale"
                  >
                    <i className="flaticon-381-file-1 me-1"></i> Imprimer Ordonnance
                  </Button>
                  <Button variant="danger" light onClick={() => setShowNewModal(false)}>
                    Annuler
                  </Button>
                  <Button variant="primary" type="submit">
                    <i className="flaticon-381-check-2 me-1"></i> Enregistrer
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )
      )}

      {/* Fiche Détails de la Consultation Clinique (Intégrée dans la page sans popup) */}
      {selectedConsultation && (() => {
        const selectedPatient =
          patients.find((p) => p.id === selectedConsultation.patientId) ||
          initialPatients.find((p) => p.id === selectedConsultation.patientId);
        const selectedPrescription =
          selectedConsultation.prescriptionData ||
          (selectedConsultation.prescriptionCreated
            ? initialPrescriptions.find((p) => p.patientId === selectedConsultation.patientId)
            : null);

        return (
          <div className="card mb-4 border border-primary shadow-sm" id="consultation-details-card">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center bg-light rounded-top">
              <div>
                <h4 className="card-title text-primary mb-1">
                  <i className="flaticon-381-notepad me-2"></i>
                  Détails de la Consultation Clinique — {selectedConsultation.consultationNumber}
                </h4>
                <p className="text-muted fs-13 mb-0">
                  Patiente : <strong>{selectedConsultation.patientName}</strong> • Date : {selectedConsultation.date} à {selectedConsultation.time} • {initialDoctor.name}
                </p>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectedConsultation(null)}
                className="btn-rounded"
              >
                <i className="fa fa-times me-1"></i> Fermer
              </Button>
            </div>

            <div className="card-body">
              {/* Synthèse Patiente & Motif */}
              <div className="p-3 mb-3 rounded bg-light border d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="text-muted fs-12 d-block">Patiente & Dossier Médical</span>
                  <Link
                    to={`/patient-details?id=${selectedConsultation.patientId}`}
                    className="fs-16 font-w600 text-dark hover-primary"
                  >
                    {selectedConsultation.patientName}
                  </Link>
                  {selectedPatient && (
                    <span className="text-muted fs-12 ms-2">
                      (Dossier #{selectedPatient.fileNumber} • Née le {selectedPatient.dob} ({selectedPatient.age} ans) • Groupe {selectedPatient.bloodGroup})
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div>
                    <span className="text-muted fs-12 d-block">Motif de consultation</span>
                    <strong className="text-dark fs-13">{selectedConsultation.reason}</strong>
                  </div>
                  <div>
                    <span className="text-muted fs-12 d-block">Cotation & Acte</span>
                    <span className="consult-sober-tag">{selectedConsultation.billingCode}</span>
                  </div>
                </div>
              </div>

              {/* 1. Paramètres cliniques & Constantes Vitales */}
              <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                <i className="flaticon-381-heart me-1"></i> 1. Constantes Vitales & Paramètres Cliniques
              </h6>
              <div className="row g-2 mb-3">
                <div className="col-md-3 col-6">
                  <div className="p-2 border rounded text-center bg-white">
                    <span className="text-muted fs-11 d-block">Tension Artérielle (TA)</span>
                    <strong className="text-dark fs-14">
                      {selectedConsultation.vitals?.bp || "-"}
                    </strong>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="p-2 border rounded text-center bg-white">
                    <span className="text-muted fs-11 d-block">Poids</span>
                    <strong className="text-dark fs-14">
                      {selectedConsultation.vitals?.weight
                        ? `${selectedConsultation.vitals.weight} kg`
                        : "-"}
                    </strong>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="p-2 border rounded text-center bg-white">
                    <span className="text-muted fs-11 d-block">Température / DDR</span>
                    <strong className="text-dark fs-14">
                      {selectedConsultation.vitals?.temperature
                        ? `${selectedConsultation.vitals.temperature} °C`
                        : (selectedConsultation.vitals?.ddr ? selectedConsultation.vitals.ddr : "-")}
                    </strong>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="p-2 border rounded text-center bg-white">
                    <span className="text-muted fs-11 d-block">Pouls / Terme</span>
                    <strong className="text-dark fs-14">
                      {selectedConsultation.vitals?.heartRate
                        ? `${selectedConsultation.vitals.heartRate} bpm`
                        : (selectedConsultation.vitals?.terme ? selectedConsultation.vitals.terme : "-")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. Examen gynécologique et Échographie */}
              <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                <i className="flaticon-381-search-1 me-1"></i> 2. Examen Clinique & Échographie
              </h6>
              <div className="row mb-3">
                <div className="col-md-6 mb-2">
                  <label className="form-label fs-12 font-w600 text-muted mb-1">
                    EXAMEN CLINIQUE GYNÉCOLOGIQUE
                  </label>
                  <div className="p-3 bg-light rounded text-dark fs-13 border" style={{ minHeight: "80px" }}>
                    {selectedConsultation.examFindings || "Aucune observation clinique notée."}
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fs-12 font-w600 text-muted mb-1">
                    COMPTE-RENDU ÉCHOGRAPHIE
                  </label>
                  <div className="p-3 bg-light rounded text-dark fs-13 border" style={{ minHeight: "80px" }}>
                    {selectedConsultation.echoFindings || "Aucun compte-rendu échographique noté."}
                  </div>
                </div>
              </div>

              {/* 3. Diagnostic & Conduite à tenir */}
              <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                <i className="flaticon-381-folder me-1"></i> 3. Diagnostic Médical & Recommandations
              </h6>
              <div className="row mb-3">
                <div className="col-md-6 mb-2">
                  <label className="form-label fs-12 font-w600 text-muted mb-1">
                    DIAGNOSTIC (CIM-10)
                  </label>
                  <div className="p-3 border rounded bg-white font-w600 text-dark fs-14">
                    {selectedConsultation.diagnosis}
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fs-12 font-w600 text-muted mb-1">
                    CONDUITE À TENIR & CONSEILS
                  </label>
                  <div className="p-3 bg-light rounded text-dark fs-13 border">
                    {selectedConsultation.recommendations || "Aucune consigne particulière notée."}
                  </div>
                </div>
              </div>

              {/* 4. Ordonnance & Traitement Prescrit */}
              <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                <i className="flaticon-381-file-1 me-1"></i> 4. Prescription Médicale (Ordonnance)
              </h6>
              {selectedPrescription && selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                <div className="p-3 border rounded bg-light mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <span className="font-w600 text-dark fs-13">
                      <i className="fa fa-prescription-bottle-alt me-1 text-primary"></i>
                      Ordonnance émise : {selectedPrescription.prescriptionNumber || "N° en cours"} ({selectedPrescription.items.length} médicament{selectedPrescription.items.length > 1 ? "s" : ""})
                    </span>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleOpenPrescription(selectedConsultation)}
                      className="d-flex align-items-center"
                    >
                      <i className="flaticon-381-print me-1"></i> Imprimer l'ordonnance officielle
                    </Button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered bg-white mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40px" }}>#</th>
                          <th>Médicament (DCI / Spécialité)</th>
                          <th>Posologie</th>
                          <th>Durée</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.items.map((item, idx) => (
                          <tr key={idx}>
                            <td><strong>{idx + 1}</strong></td>
                            <td><strong className="text-dark">{item.medication}</strong></td>
                            <td>{item.posology}</td>
                            <td><span className="consult-sober-tag">{item.duration || "-"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-light rounded text-muted fs-13 border mb-2">
                  <i className="fa fa-info-circle me-1 text-primary"></i> Aucune ordonnance médicamenteuse prescrite lors de cette consultation.
                </div>
              )}
              {/* 5. Documents & Fichiers joints (Dossier Médical) */}
              <h6 className="text-primary font-w600 mb-2 border-bottom pb-1">
                <i className="flaticon-381-folder-1 me-1"></i> 5. Documents & Justificatifs rattachés au Dossier Médical
              </h6>
              {selectedConsultation.documents && selectedConsultation.documents.length > 0 ? (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedConsultation.documents.map((doc, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-2 border rounded bg-white d-flex align-items-center justify-content-between gap-3 shadow-sm"
                      style={{ minWidth: "260px" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="flaticon-381-file-1 fs-20 text-primary"></i>
                        <div>
                          <strong className="d-block fs-13 text-dark">{doc.title}</strong>
                          <small className="text-muted fs-11">{doc.category || "Document"} • {doc.fileSize || "PDF"}</small>
                        </div>
                      </div>
                      {doc.filePath && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary p-1 px-2 rounded"
                          onClick={() => setPreviewingDoc(doc)}
                          title="Visualiser le document"
                        >
                          <i className="flaticon-381-view me-1"></i> Voir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-light rounded text-muted fs-13 border mb-3">
                  <i className="fa fa-info-circle me-1 text-primary"></i> Aucun document ou fichier spécifique n'a été rattaché lors de cette consultation.
                </div>
              )}
            </div>

            <div className="card-footer d-flex justify-content-between align-items-center border-top flex-wrap gap-2">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setPreviewEchoReport(selectedConsultation)}
                  className="d-flex align-items-center"
                >
                  <i className="flaticon-381-print me-1"></i> Imprimer le Compte-Rendu Échographique
                </Button>
                {selectedPrescription && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleOpenPrescription(selectedConsultation)}
                    className="d-flex align-items-center"
                  >
                    <i className="flaticon-381-file-1 me-1"></i> Imprimer l'ordonnance
                  </Button>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedConsultation(null)}
              >
                <i className="fa fa-times me-1"></i> Fermer les détails
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Liste des consultations */}
      <div className="card">
        <div className="card-header border-0 pb-0">
          <div>
            <h4 className="card-title">Historique des Consultations Cliniques</h4>
            <p className="text-muted fs-13 mb-0">
              Réservé au {initialDoctor.name} • Spécialiste en Gynécologie Obstétrique
            </p>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: "90px" }}><strong>DATE & HEURE</strong></th>
                  <th><strong>PATIENT</strong></th>
                  <th className="d-none d-md-table-cell"><strong>MOTIF</strong></th>
                  <th className="d-none d-md-table-cell"><strong>DIAGNOSTIC (CIM-10)</strong></th>
                  <th className="d-none d-md-table-cell"><strong>COTATION</strong></th>
                  <th className="text-end" style={{ width: "170px" }}><strong>ACTIONS</strong></th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Aucune consultation trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((cs) => (
                    <tr key={cs.id} className={selectedConsultation?.id === cs.id ? "table-primary" : ""}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <strong className="text-primary">{cs.date}</strong>
                        <span className="text-muted fs-12 ms-2 d-none d-sm-inline">à {cs.time}</span>
                        <div className="d-block d-sm-none text-muted fs-11">{cs.time}</div>
                      </td>
                      <td>
                        <Link
                          to={`/patient-details?id=${cs.patientId}`}
                          className="font-w600 text-dark hover-primary"
                        >
                          {cs.patientName}
                        </Link>
                        {/* Motif et diagnostic visibles sous le nom sur mobile */}
                        <div className="d-block d-md-none text-muted fs-11 mt-1">
                          {cs.reason}
                        </div>
                        {cs.diagnosis && (
                          <div className="d-block d-md-none text-muted fs-11">
                            {cs.diagnosis}
                          </div>
                        )}
                      </td>
                      <td className="d-none d-md-table-cell">{cs.reason}</td>
                      <td className="d-none d-md-table-cell">
                        <span className="text-dark font-w500">{cs.diagnosis}</span>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <span className="consult-sober-tag">
                          {cs.billingCode}
                        </span>
                      </td>
                      <td style={{ width: "170px", whiteSpace: "nowrap" }} className="text-end pe-0">
                        <div className="d-flex gap-1 justify-content-end align-items-center">
                          <button
                            type="button"
                            className={`btn ${selectedConsultation?.id === cs.id ? "btn-primary" : "btn-outline-primary"} btn-xs`}
                            onClick={() => {
                              if (selectedConsultation?.id === cs.id) {
                                setSelectedConsultation(null);
                              } else {
                                setSelectedConsultation(cs);
                                setTimeout(() => {
                                  const el = document.getElementById("consultation-details-card");
                                  if (el) {
                                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }
                                }, 100);
                              }
                            }}
                            title={selectedConsultation?.id === cs.id ? "Masquer les détails" : "Afficher les détails de la consultation"}
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewEchoReport(cs)}
                            className="btn btn-outline-primary btn-xs"
                            title="Imprimer le compte-rendu échographique officiel"
                          >
                            <i className="flaticon-381-print"></i>
                            <span className="d-none d-sm-inline ms-1">Écho</span>
                          </button>
                          <Link
                            to={`/patient-details?id=${cs.patientId}`}
                            className="btn btn-primary btn-xs"
                            title="Voir le dossier patient"
                          >
                            <i className="flaticon-381-folder"></i>
                          </Link>
                          {cs.prescriptionCreated && (
                            <button
                              type="button"
                              onClick={() => handleOpenPrescription(cs)}
                              className="btn btn-outline-success btn-xs"
                              title="Imprimer l'ordonnance médicale officielle"
                            >
                              <i className="flaticon-381-file-1"></i>
                            </button>
                          )}
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

      {/* Modal Prévisualisation & Impression Officielle d'Ordonnance avec En-tête Bilingue Officiel */}
      <PrescriptionPreviewModal
        show={!!previewPrescription}
        onHide={() => setPreviewPrescription(null)}
        prescription={previewPrescription}
      />

      {/* Modal Impression Compte-Rendu Échographique Officiel (CREcho) */}
      <EchoReportPrintModal
        show={!!previewEchoReport}
        onHide={() => setPreviewEchoReport(null)}
        consultation={previewEchoReport}
        doctor={initialDoctor}
      />

      {/* Modal Visualisation Document / Justificatif joint */}
      <Modal
        show={!!previewingDoc}
        onHide={() => setPreviewingDoc(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-16 font-w700">
            Document Médical : {previewingDoc?.title || previewingDoc?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-3">
          {previewingDoc?.filePath && (previewingDoc.filePath.startsWith("data:application/pdf") || previewingDoc.filePath.endsWith(".pdf")) ? (
            <iframe
              src={previewingDoc.filePath}
              title="Aperçu PDF"
              width="100%"
              height="550px"
              style={{ border: "none" }}
            ></iframe>
          ) : (
            <img
              src={previewingDoc?.filePath}
              alt="Document"
              style={{ maxWidth: "100%", maxHeight: "550px", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewingDoc(null)}>
            Fermer
          </Button>
          {previewingDoc?.filePath && (
            <a
              href={previewingDoc.filePath}
              download={previewingDoc.title || previewingDoc.name || "document"}
              className="btn btn-primary"
            >
              Télécharger
            </a>
          )}
        </Modal.Footer>
      </Modal>

      {/* Datalist pour saisie rapide des médicaments */}
      <datalist id="consult-medications-datalist">
        {medications.map((m, mIdx) => (
          <option key={m.id || `${m.name}-${mIdx}`} value={m.name}>
            {m.dosage ? `${m.dosage} - ${m.defaultPosology || ""}` : ""}
          </option>
        ))}
      </datalist>
    </>
  );
};

export default ConsultationsPage;


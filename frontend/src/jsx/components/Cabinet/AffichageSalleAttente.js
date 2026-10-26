import React, { useState, useEffect, useRef } from "react";
import { initialWaitingRoom, initialDoctor } from "../../../services/CabinetData";
import ApiService from "../../../services/ApiService";

// Créneaux horaires officiels pour calcul du ticket réservé (ex: 09:00 -> Ticket 1, 11:30 -> Ticket 6)
const ALL_DAY_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const getPatientTicketNumber = (p, fallbackIdx) => {
  if (p?.ticketNumber) return p.ticketNumber;
  const time = p?.appointmentTime || p?.time;
  if (time) {
    const normalized = time.trim().substring(0, 5).padStart(5, "0");
    const slotIdx = ALL_DAY_SLOTS.indexOf(normalized);
    if (slotIdx !== -1) return slotIdx + 1;
    const [h, m] = time.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const diff = (h * 60 + m) - (9 * 60);
      if (diff >= 0) return Math.floor(diff / 30) + 1;
    }
  }
  return fallbackIdx != null ? fallbackIdx + 1 : 1;
};

const AffichageSalleAttente = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [waitingList, setWaitingList] = useState(() => {
    try {
      const saved = localStorage.getItem("cabinet_waiting_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p) => p.patientName !== "Sophie Bernard" && p.patientName !== "Marc Lemoine"
          );
        }
      }
    } catch (e) {}
    return [];
  });

  const [calledPatient, setCalledPatient] = useState(() => {
    const saved = localStorage.getItem("current_called_patient");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCallingAnimation, setIsCallingAnimation] = useState(false);

  // Audio Synth Chime (Ding-Dong professionnel avec Web Audio API)
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Note 1 : 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.8);

      // Note 2 : 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // Annonce vocale de synthèse vocale (SpeechSynthesis)
  const speakPatient = (patientName, ticketNum) => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const text = ticketNum
        ? `Ticket numéro ${ticketNum}. ${patientName}. Veuillez entrer dans le cabinet.`
        : `Le docteur appelle : ${patientName}. Veuillez entrer dans le cabinet.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  };

  const triggerCallNotification = (callData) => {
    setCalledPatient(callData);
    setIsCallingAnimation(true);
    const ticketNum = callData.ticketNumber || getPatientTicketNumber(callData);
    if (soundEnabled) {
      playChime();
      setTimeout(() => {
        speakPatient(callData.patientName, ticketNum);
      }, 700);
    }
    setTimeout(() => {
      setIsCallingAnimation(false);
    }, 15000);
  };

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Écoute des appels et mise à jour de la liste
  useEffect(() => {
    // 0. Synchronisation initiale avec MySQL API
    ApiService.getWaitingRoom().then((data) => {
      if (Array.isArray(data)) {
        const filtered = data.filter(
          (p) => p.patientName !== "Sophie Bernard" && p.patientName !== "Marc Lemoine"
        );
        setWaitingList(filtered);
        localStorage.setItem("cabinet_waiting_list", JSON.stringify(filtered));
      }
    }).catch(() => {});

    // 1. BroadcastChannel (Communication rapide entre onglets)
    let channel;
    try {
      channel = new BroadcastChannel("waiting_room_display_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "CALL_PATIENT") {
          triggerCallNotification(event.data.data);
        } else if (event.data?.type === "UPDATE_LIST") {
          setWaitingList(event.data.list);
        }
      };
    } catch (e) {
      // BroadcastChannel non supporté sur vieux navigateurs
    }

    // 2. Storage event (pour synchronisation locale inter-onglets)
    const handleStorageChange = (e) => {
      if (e.key === "current_called_patient" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          triggerCallNotification(parsed);
        } catch (err) {
          // ignore
        }
      }
      if (e.key === "cabinet_waiting_list" && e.newValue) {
        try {
          setWaitingList(JSON.parse(e.newValue));
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #051636 0%, #0c337c 50%, #071e4a 100%)",
        color: "#ffffff",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Halo lumineux d'arrière plan */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "20%",
          width: "60vw",
          height: "60vh",
          background: "radial-gradient(circle, rgba(29, 99, 237, 0.25) 0%, rgba(5, 22, 54, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      ></div>

      {/* Barre supérieure / En-tête de l'écran TV */}
      <header
        style={{
          padding: "20px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(5, 18, 48, 0.6)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #1e60d5 0%, #00d2ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(30, 96, 213, 0.4)",
            }}
          >
            <i className="fa fa-hospital-user" style={{ fontSize: "28px", color: "#fff" }}></i>
          </div>
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                color: "#ffffff",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Cabinet Médical - {initialDoctor.name}
            </h1>
            <p
              style={{
                fontSize: "14px",
                margin: "3px 0 0",
                color: "#93c5fd",
                fontWeight: "500",
              }}
            >
              Gynécologie Obstétrique • Médecine Générale • Échographie
            </p>
          </div>
        </div>

        {/* Badge En Direct & Horloge */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "6px 14px",
              borderRadius: "30px",
              color: "#34d399",
              fontSize: "13px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 10px #10b981",
              }}
            ></span>
            Salle d'attente
          </div>

          {/* Horloge Numérique */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "34px",
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: "1px",
                lineHeight: "1",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formattedTime}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#bfdbfe",
                textTransform: "capitalize",
                marginTop: "4px",
              }}
            >
              {formattedDate}
            </div>
          </div>

          {/* Boutons Utilitaires */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Couper le son" : "Activer le son"}
              style={{
                background: soundEnabled ? "rgba(255, 255, 255, 0.15)" : "rgba(239, 68, 68, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className={soundEnabled ? "fa fa-volume-up" : "fa fa-volume-mute"}></i>
              {soundEnabled ? "Son ON" : "Son OFF"}
            </button>
            <button
              onClick={toggleFullscreen}
              title="Basculer en plein écran"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <i className="fa fa-expand"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main
        style={{
          flex: 1,
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          zIndex: 5,
        }}
      >
        {/* BANNIÈRE D'APPEL PATIENT DU MÉDECIN (HERO DISPLAY) */}
        {calledPatient ? (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(30, 96, 213, 0.45) 0%, rgba(14, 165, 233, 0.35) 100%)",
              borderRadius: "24px",
              border: isCallingAnimation
                ? "3px solid #fbbf24"
                : "2px solid rgba(255, 255, 255, 0.3)",
              boxShadow: isCallingAnimation
                ? "0 0 50px rgba(251, 191, 36, 0.6), inset 0 0 30px rgba(251, 191, 36, 0.3)"
                : "0 20px 40px rgba(0, 0, 0, 0.3)",
              padding: "36px 44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backdropFilter: "blur(16px)",
              transition: "all 0.4s ease-in-out",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              {/* Cloche animée */}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: isCallingAnimation
                    ? "radial-gradient(circle, #fbbf24 0%, #d97706 100%)"
                    : "linear-gradient(135deg, #2563eb, #38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  animation: isCallingAnimation ? "pulse 1.2s infinite" : "none",
                }}
              >
                <i
                  className="fa fa-bell"
                  style={{
                    fontSize: "44px",
                    color: isCallingAnimation ? "#78350f" : "#ffffff",
                  }}
                ></i>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      background: "#fbbf24",
                      color: "#78350f",
                      fontWeight: "800",
                      fontSize: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                    }}
                  >
                    <i className="fa fa-bullhorn me-2"></i> Le médecin vous appelle
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      color: "#ffffff",
                      fontWeight: "900",
                      fontSize: "14px",
                      letterSpacing: "1px",
                    }}
                  >
                    <i className="fa fa-ticket-alt text-warning"></i> TICKET N° {calledPatient.ticketNumber || getPatientTicketNumber(calledPatient)}
                  </div>
                </div>

                {/* NOM DU PATIENT EN TRÈS GRAND ET BLANC */}
                <h2
                  style={{
                    fontSize: "56px",
                    fontWeight: "800",
                    color: "#ffffff",
                    margin: "0 0 8px 0",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    textShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {calledPatient.patientName}
                </h2>

                <p
                  style={{
                    fontSize: "20px",
                    color: "#e0f2fe",
                    margin: 0,
                    fontWeight: "500",
                  }}
                >
                  👉 Veuillez entrer dans le cabinet :{" "}
                  <strong style={{ color: "#ffffff", textDecoration: "underline" }}>
                    {calledPatient.room || "Cabinet de Consultation N° 1"}
                  </strong>
                </p>
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                background: "rgba(0, 0, 0, 0.2)",
                padding: "20px 28px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <div style={{ color: "#93c5fd", fontSize: "14px", fontWeight: "600", textTransform: "uppercase" }}>
                Médecin traitant
              </div>
              <div style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>
                {calledPatient.doctorName || initialDoctor.name}
              </div>
              {calledPatient.calledAt && (
                <div style={{ color: "#fef08a", fontSize: "13px", marginTop: "8px", fontWeight: "600" }}>
                  Appelé à {calledPatient.calledAt}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "36px 44px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="fa fa-user-clock" style={{ fontSize: "30px", color: "#60a5fa" }}></i>
            </div>
            <div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", margin: "0 0 6px" }}>
                Bienvenue en Salle d'Attente
              </h3>
              <p style={{ fontSize: "16px", color: "#bfdbfe", margin: 0 }}>
                Veuillez vous asseoir et patienter. Votre nom s'affichera directement sur cet écran dès que le médecin vous invitera à entrer.
              </p>
            </div>
          </div>
        )}

        {/* SECTION LISTE DES PATIENTS AU CABINET */}
        <div
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "28px 36px",
            backdropFilter: "blur(14px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="fa fa-list-ol" style={{ fontSize: "20px", color: "#38bdf8" }}></i>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Patients actuellement au cabinet
              </h3>
            </div>
            <div style={{ color: "#93c5fd", fontSize: "14px", fontWeight: "600" }}>
              {waitingList.filter((p) => p.status === "En attente" || p.status === "Appelé").length} patient(s) en attente
            </div>
          </div>

          {/* Tableau / Cartes des patients (SANS TEMPS D'ATTENTE) */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 10px",
              }}
            >
              <thead>
                <tr style={{ color: "#93c5fd", fontSize: "13px", fontWeight: "700", textTransform: "uppercase" }}>
                  <th style={{ padding: "8px 20px" }}>Ticket</th>
                  <th style={{ padding: "8px 20px" }}>Heure d'arrivée</th>
                  <th style={{ padding: "8px 20px" }}>RDV Prévu</th>
                  <th style={{ padding: "8px 20px" }}>Nom du Patient</th>
                  <th style={{ padding: "8px 20px", textAlign: "right" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {waitingList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        color: "#93c5fd",
                        fontSize: "18px",
                      }}
                    >
                      <i className="fa fa-couch" style={{ fontSize: "36px", display: "block", marginBottom: "12px", opacity: 0.7 }}></i>
                      La salle d'attente est actuellement vide.
                    </td>
                  </tr>
                ) : (
                  waitingList.map((p, idx) => {
                    const isCalled = p.status === "Appelé" || (calledPatient && calledPatient.patientName === p.patientName);
                    const isInConsult = p.status === "En consultation";
                    const ticketNum = getPatientTicketNumber(p, idx);

                    return (
                      <tr
                        key={p.id || idx}
                        style={{
                          background: isCalled
                            ? "linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)"
                            : isInConsult
                            ? "rgba(14, 165, 233, 0.12)"
                            : "rgba(255, 255, 255, 0.05)",
                          borderRadius: "14px",
                          boxShadow: isCalled ? "0 4px 20px rgba(245, 158, 11, 0.2)" : "none",
                          border: isCalled
                            ? "1px solid rgba(245, 158, 11, 0.5)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* Numéro de Ticket réservé */}
                        <td
                          style={{
                            padding: "16px 20px",
                            borderTopLeftRadius: "14px",
                            borderBottomLeftRadius: "14px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              minWidth: "38px",
                              height: "38px",
                              padding: "0 10px",
                              borderRadius: "19px",
                              background: isCalled ? "#f59e0b" : "rgba(56, 189, 248, 0.2)",
                              border: isCalled ? "2px solid #fbbf24" : "1px solid rgba(56, 189, 248, 0.4)",
                              color: isCalled ? "#000" : "#38bdf8",
                              fontWeight: "900",
                              fontSize: "15px",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: isCalled ? "0 0 16px rgba(245, 158, 11, 0.6)" : "none",
                            }}
                          >
                            #{ticketNum}
                          </span>
                        </td>

                        {/* Heure Arrivée */}
                        <td style={{ padding: "16px 20px", fontWeight: "700", fontSize: "16px", color: "#38bdf8" }}>
                          {p.arrivalTime || "--:--"}
                        </td>

                        {/* RDV Prévu */}
                        <td style={{ padding: "16px 20px", color: "#cbd5e1", fontSize: "15px" }}>
                          {p.appointmentTime || "--:--"}
                        </td>

                        {/* Nom Patient */}
                        <td style={{ padding: "16px 20px" }}>
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: isCalled ? "#fef08a" : "#ffffff",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {p.patientName}
                          </span>
                        </td>

                        {/* Statut (Sans temps d'attente) */}
                        <td
                          style={{
                            padding: "16px 20px",
                            textAlign: "right",
                            borderTopRightRadius: "14px",
                            borderBottomRightRadius: "14px",
                          }}
                        >
                          {isCalled ? (
                            <span
                              style={{
                                background: "#f59e0b",
                                color: "#78350f",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontWeight: "800",
                                fontSize: "13px",
                                textTransform: "uppercase",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <i className="fa fa-bell"></i> Appelé
                            </span>
                          ) : isInConsult ? (
                            <span
                              style={{
                                background: "rgba(14, 165, 233, 0.25)",
                                border: "1px solid rgba(14, 165, 233, 0.5)",
                                color: "#38bdf8",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontWeight: "700",
                                fontSize: "13px",
                              }}
                            >
                              En consultation
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "rgba(255, 255, 255, 0.12)",
                                color: "#e2e8f0",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontWeight: "600",
                                fontSize: "13px",
                              }}
                            >
                              • En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bandeau d'information défilant au bas de l'écran */}
      <footer
        style={{
          background: "rgba(5, 18, 48, 0.8)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "12px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          color: "#bfdbfe",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="fa fa-info-circle" style={{ color: "#38bdf8" }}></i>
          <span>
            Bienvenue au Cabinet Médical du {initialDoctor.name} • Veuillez préparer votre carnet de santé et ordonnances précédentes.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>📵 Merci de mettre vos téléphones portables en mode silencieux</span>
          <a
            href="/waiting-room"
            style={{
              color: "#93c5fd",
              textDecoration: "underline",
              fontSize: "12px",
            }}
          >
            Retour gestion
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AffichageSalleAttente;

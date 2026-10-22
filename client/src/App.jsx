import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  BarChart2,
  MessageSquare,
  CheckCircle2,
  Phone,
  User,
  ShieldCheck,
  Send,
  X,
  ArrowRight,
  Sun,
  Moon,
  Sunset,
  Home,
  Info,
} from "lucide-react";

// Créneaux horaires du Matin (09:00 - 12:30, chaque 30 min)
const MORNING_SLOTS = [
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "12:00", "12:30"
];

// Créneaux horaires du Soir / Après-midi (13:00 - 17:30, chaque 30 min)
const EVENING_SLOTS = [
  "13:00", "13:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30",
  "17:00", "17:30"
];

export default function App() {
  // Navigation entre vues: 'doctor' (présentation) | 'schedule' (agenda) | 'profile' (profil) | 'about' (à propos) | 'confirmed' (succès)
  const [view, setView] = useState("doctor");

  // Liste des réservations du patient
  const [patientAppointments, setPatientAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cabinet_client_appointments") || "[]");
    } catch {
      return [];
    }
  });

  // ===================================================================
  // GESTION DU TEMPS RÉEL (HEURE & DATE DE L'APPAREIL)
  // ===================================================================
  const now = new Date();
  const currentDayNumber = now.getDate(); // Jour actuel de l'appareil (ex: 22)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // Vendredis du mois d'octobre 2026 (cabinet fermé)
  const FRIDAYS = [2, 9, 16, 23, 30];

  // Vérifie si un créneau horaire ("14:30") est déjà passé pour le jour sélectionné
  const isSlotPast = (slot, day) => {
    if (day < currentDayNumber) return true; // Jours antérieurs : tous les créneaux sont passés
    if (day > currentDayNumber) return false; // Jours futurs : tous les créneaux sont ouverts
    // Aujourd'hui : on bloque les heures antérieures ou égales à l'heure actuelle de l'appareil
    const [h, m] = slot.split(":").map(Number);
    return (h * 60 + m) <= currentTotalMinutes;
  };

  // Vérifie si un jour est déjà passé
  const isDayPast = (day) => day < currentDayNumber;

  // Vérifie s'il reste des créneaux disponibles aujourd'hui
  const hasFutureSlotsToday = [...MORNING_SLOTS, ...EVENING_SLOTS].some(
    (s) => !isSlotPast(s, currentDayNumber)
  );

  // Jour initial par défaut : aujourd'hui s'il reste des créneaux, sinon le prochain jour ouvrable
  const getInitialDay = () => {
    if (hasFutureSlotsToday && !FRIDAYS.includes(currentDayNumber)) {
      return currentDayNumber;
    }
    let next = currentDayNumber + 1;
    while (FRIDAYS.includes(next) && next <= 31) {
      next++;
    }
    return Math.min(next, 31);
  };

  // Période initiale par défaut (matin ou après-midi selon l'heure de l'appareil)
  const getInitialPeriod = (day) => {
    if (day === currentDayNumber && currentTotalMinutes >= 12 * 60 + 30) {
      return "soir";
    }
    return "matin";
  };

  // Premier créneau horaire disponible
  const getFirstAvailableSlot = (day, period) => {
    const slots = period === "matin" ? MORNING_SLOTS : EVENING_SLOTS;
    const available = slots.filter((s) => !isSlotPast(s, day));
    if (available.length > 0) return available[0];
    const otherSlots = period === "matin" ? EVENING_SLOTS : MORNING_SLOTS;
    const otherAvailable = otherSlots.filter((s) => !isSlotPast(s, day));
    return otherAvailable.length > 0 ? otherAvailable[0] : (slots[0] || "09:00");
  };

  const initialDay = getInitialDay();
  const initialPeriod = getInitialPeriod(initialDay);

  // Sélection du calendrier et créneaux (initialisés sur le jour actuel et prochaine heure valide)
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [timePeriod, setTimePeriod] = useState(initialPeriod);
  const [selectedTime, setSelectedTime] = useState(() =>
    getFirstAvailableSlot(initialDay, initialPeriod)
  );

  // Gestion du clic sur un jour du calendrier
  const handleSelectDay = (day) => {
    if (isDayPast(day) || FRIDAYS.includes(day)) return;
    if (day === currentDayNumber && !hasFutureSlotsToday) return;

    setSelectedDay(day);

    let nextPeriod = timePeriod;
    if (day === currentDayNumber) {
      const morningAvailable = MORNING_SLOTS.some((s) => !isSlotPast(s, day));
      if (!morningAvailable) {
        nextPeriod = "soir";
        setTimePeriod("soir");
      }
    }

    if (isSlotPast(selectedTime, day)) {
      const validSlot = getFirstAvailableSlot(day, nextPeriod);
      setSelectedTime(validSlot);
    }
  };

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [consultationReason, setConsultationReason] = useState("Suivi de Grossesse");

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Assistant IA tiroir
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChat, setAiChat] = useState([
    {
      sender: "ai",
      text: "Bonjour ! Je suis l'assistant médical virtuel du Dr N. BELBACHIR OULD HENNIA. Comment puis-je vous aider dans votre prise de rendez-vous aujourd'hui ?",
    },
  ]);

  // Gestion de la confirmation du RDV
  const handleConfirmBooking = (e) => {
    e.preventDefault();

    if (!patientName.trim() || !patientPhone.trim()) {
      alert("Veuillez renseigner votre nom complet et votre numéro de téléphone.");
      return;
    }

    if (isDayPast(selectedDay) || isSlotPast(selectedTime, selectedDay)) {
      alert("Ce créneau horaire est déjà passé. Veuillez sélectionner un horaire futur disponible.");
      return;
    }

    const bookingData = {
      id: "RDV-" + Math.floor(1000 + Math.random() * 9000),
      doctorName: "Dr. N. BELBACHIR OULD HENNIA",
      specialty: "Gynécologie Obstétrique & Échographie",
      date: `${selectedDay} Octobre 2026`,
      time: selectedTime,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      reason: consultationReason,
      price: "2 500 DA",
      location: "Haï Seddikia, Cité 340 Logts, Bât. 18/A, Oran",
      createdAt: new Date().toISOString(),
    };

    // Sauvegarde locale
    try {
      const existing = JSON.parse(localStorage.getItem("cabinet_client_appointments") || "[]");
      existing.unshift(bookingData);
      localStorage.setItem("cabinet_client_appointments", JSON.stringify(existing));
      setPatientAppointments(existing);
    } catch (err) {
      console.error(err);
    }

    // Synchronisation en direct avec la Base de Données MySQL (table appointments & patients)
    try {
      const dayStr = String(selectedDay).padStart(2, "0");
      fetch("http://127.0.0.1:8000/api/appointments.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim(),
          date: `2026-10-${dayStr}`,
          time: selectedTime,
          duration: "30 min",
          reason: consultationReason,
          status: "Confirmé",
          notes: "Réservation en ligne depuis l'application patient",
        }),
      }).catch((err) => console.warn("Erreur enregistrement rendez-vous MySQL :", err));
    } catch (e) {
      // ignore
    }

    // Animation Confetti festive
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#bbf7d0", "#86efac", "#10b981", "#ffffff"],
      });
    } catch (e) {
      // fallback
    }

    setConfirmedBooking(bookingData);
    setView("confirmed");
  };

  // Envoi de message à l'assistant IA
  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userText = aiQuestion.trim();
    const newHistory = [...aiChat, { sender: "user", text: userText }];
    setAiChat(newHistory);
    setAiQuestion("");

    // Réponse intelligente simulée
    setTimeout(() => {
      let reply = "Pour préparer votre consultation avec le Dr N. BELBACHIR OULD HENNIA, veuillez apporter vos anciennes échographies, bilans sanguins récents et votre carnet de santé.";
      const lower = userText.toLowerCase();

      if (lower.includes("tarif") || lower.includes("prix") || lower.includes("cout")) {
        reply = "La consultation de gynécologie avec examen clinique est fixée à 2 500 DA. L'échographie obstétricale morphologique 3D/4D est également disponible au cabinet.";
      } else if (lower.includes("adresse") || lower.includes("où") || lower.includes("lieu") || lower.includes("localisation")) {
        reply = "Le cabinet est situé à Haï Seddikia (ex-Cité Boulanger), Cité 340 Logements, Bâtiment 18/A, Oran. Le secrétariat est joignable au 041 53 97 82.";
      } else if (lower.includes("urgence") || lower.includes("douleur") || lower.includes("urgent")) {
        reply = "En cas d'urgence obstétrique ou de saignement aigu, rendez-vous immédiatement aux urgences de la maternité la plus proche ou contactez le cabinet directement au 041 53 97 82 ou 05 50 12 34 56.";
      } else if (lower.includes("grossesse") || lower.includes("echo") || lower.includes("bébé")) {
        reply = "Le cabinet est équipé d'un appareil d'échographie haute définition avec Doppler couleur et rendu 3D/4D pour le suivi optimal de votre grossesse.";
      }

      setAiChat((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="app-device-wrapper">

      {/* Contenu Déroulant */}
      <div className="screen-scroll">
        {/* =================================================================== */}
        {/* VUE 1 : PRÉSENTATION DU DOCTEUR AVEC GRAND BOUTON DE RÉSERVATION    */}
        {/* =================================================================== */}
        {view === "doctor" && (
          <div className="fade-in-up">

            {/* Titre Principal */}
            <div style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  lineHeight: "1.15",
                  color: "#ffffff",
                }}
              >
                Dr. N. BELBACHIR
                <br />
                <span style={{ color: "var(--text-secondary)", fontWeight: "600", fontSize: "20px" }}>
                  OULD HENNIA
                </span>
              </h2>
              <p style={{ color: "var(--accent-mint)", fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>
                Spécialiste Gynécologie Obstétrique & Échographie
              </p>
            </div>

            {/* Carte Portrait du Médecin (Directement inspirée de la capture) */}
            <div className="doctor-hero-card">
              <div className="doctor-img-container">
                <img
                  src="/doctor.jpg"
                  alt="Dr. N. BELBACHIR OULD HENNIA"
                  className="doctor-img"
                  onError={(e) => {
                    // Fallback élégant si l'image est indisponible
                    e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                <div className="doctor-img-overlay"></div>
                <div className="doctor-available-badge">
                  <span className="pulse-dot"></span>
                  <span>Consultations Ouvertes</span>
                </div>
              </div>
            </div>

            {/* Présentation du Cabinet (En environ 10 lignes) */}
            <div className="glass-panel" style={{ padding: "18px", marginBottom: "20px" }}>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.65",
                  margin: 0,
                }}
              >
                Cabinet médical de gynécologie obstétrique et d'échographie du Dr N. BELBACHIR OULD HENNIA, situé à Haï Seddikia à Oran.
                <br /><br />
                Dédié à la santé et au bien-être de la femme, notre cabinet assure un suivi bienveillant et personnalisé de votre grossesse, de la conception jusqu'au terme. Équipée des dernières technologies d'imagerie ultrasonore avec Doppler couleur et rendu 3D/4D HD Live, la praticienne réalise vos bilans morphologiques et diagnostics prénataux avec la plus haute précision.
                <br /><br />
                Nous assurons également les consultations de gynécologie générale, le dépistage précoce, les bilans de fertilité et la contraception, dans un cadre serein privilégiant l'écoute attentive, le respect du secret médical et la ponctualité.
              </p>
            </div>

            {/* GRAND BOUTON POUR RÉSERVER (Demandé explicitement par l'utilisateur) */}
            <button
              className="btn-primary-mint"
              onClick={() => setView("schedule")}
              style={{ padding: "18px 24px", fontSize: "16px", marginBottom: "10px" }}
            >
              <Calendar size={20} />
              <span>Réserver un Rendez-vous</span>
              <ArrowRight size={18} style={{ marginLeft: "auto" }} />
            </button>
            <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)" }}>
              Confirmation instantanée • Sans frais d'annulation
            </p>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 2 : CALENDRIER DE RÉSERVATION (Exactement comme la capture)     */}
        {/* =================================================================== */}
        {view === "schedule" && (
          <div className="fade-in-up">
            {/* Top Bar avec retour */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <button
                className="btn-icon-circle"
                onClick={() => setView("doctor")}
                title="Retour à la présentation"
              >
                <ChevronLeft size={22} />
              </button>
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Dr. N. BELBACHIR
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "var(--accent-mint)",
                    fontWeight: "600",
                  }}
                >
                  Gynécologie Obstétrique
                </span>
              </div>
              <div style={{ width: "40px" }} />
            </div>



            {/* SECTION SCHEDULE / CALENDRIER (Directement calquée sur la capture) */}
            <div className="glass-panel" style={{ padding: "18px 16px", marginBottom: "16px" }}>
              <div className="schedule-header">
                <div className="schedule-title">Schedule</div>
                <div className="schedule-month-nav">
                  <span>Octobre 2026</span>
                </div>
              </div>

              {/* En-tête des jours de la semaine : S M T W T F S */}
              <div className="calendar-weekdays">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Grille du calendrier avec blocage automatique des jours passés */}
              <div className="calendar-grid">
                {[
                  1, 2, 3, 4, 5, 6, 7,
                  8, 9, 10, 11, 12, 13, 14,
                  15, 16, 17, 18, 19, 20, 21,
                  22, 23, 24, 25, 26, 27, 28,
                  29, 30, 31
                ].map((d) => {
                  const isPast = isDayPast(d);
                  const isToday = d === currentDayNumber;
                  const isFriday = FRIDAYS.includes(d);
                  const isAvailable = !isPast && !isFriday && (!isToday || hasFutureSlotsToday);
                  const isSelected = selectedDay === d;

                  let cellClass = "calendar-day-cell";
                  let cellTitle = "";
                  if (isSelected) {
                    cellClass += " available selected";
                    cellTitle = `Sélectionné : ${d} Octobre 2026`;
                  } else if (isAvailable) {
                    cellClass += " available";
                    cellTitle = isToday
                      ? `Aujourd'hui (${d} Octobre) - Créneaux disponibles`
                      : `${d} Octobre 2026 (Disponible)`;
                  } else if (isPast) {
                    cellClass += " past";
                    cellTitle = `${d} Octobre 2026 (Passé - non réservable)`;
                  } else if (isFriday) {
                    cellClass += " closed";
                    cellTitle = `${d} Octobre 2026 (Vendredi - Cabinet fermé)`;
                  } else if (isToday && !hasFutureSlotsToday) {
                    cellClass += " past";
                    cellTitle = `Aujourd'hui (${d} Octobre) : Plus aucun créneau disponible`;
                  }

                  return (
                    <div
                      key={d}
                      className={cellClass}
                      title={cellTitle}
                      onClick={isAvailable ? () => handleSelectDay(d) : undefined}
                    >
                      {d}
                    </div>
                  );
                })}

                {/* Padding du mois suivant (1 à 4) */}
                <div className="calendar-day-cell" style={{ opacity: 0.15, cursor: "not-allowed" }}>1</div>
                <div className="calendar-day-cell" style={{ opacity: 0.15, cursor: "not-allowed" }}>2</div>
                <div className="calendar-day-cell" style={{ opacity: 0.15, cursor: "not-allowed" }}>3</div>
                <div className="calendar-day-cell" style={{ opacity: 0.15, cursor: "not-allowed" }}>4</div>
              </div>

              {/* Sélecteur Période : Matin ou Après-midi */}
              <div
                style={{
                  display: "flex",
                  background: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "14px",
                  padding: "4px",
                  marginTop: "16px",
                  marginBottom: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setTimePeriod("matin");
                    const available = MORNING_SLOTS.filter((s) => !isSlotPast(s, selectedDay));
                    if (available.length > 0 && (!MORNING_SLOTS.includes(selectedTime) || isSlotPast(selectedTime, selectedDay))) {
                      setSelectedTime(available[0]);
                    }
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: timePeriod === "matin" ? "800" : "600",
                    fontSize: "12.5px",
                    transition: "all 0.25s ease",
                    background: timePeriod === "matin" ? "#bbf7d0" : "transparent",
                    color: timePeriod === "matin" ? "#0d2315" : "var(--text-secondary)",
                    boxShadow: timePeriod === "matin" ? "0 4px 15px rgba(187, 247, 208, 0.35)" : "none",
                  }}
                >
                  <Sun size={15} color={timePeriod === "matin" ? "#0d2315" : "#eab308"} />
                  <span>Matin</span>
                  <span
                    style={{
                      fontSize: "9.5px",
                      opacity: timePeriod === "matin" ? 0.75 : 0.6,
                      marginLeft: "1px",
                    }}
                  >
                    (09h - 12h30)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimePeriod("soir");
                    const available = EVENING_SLOTS.filter((s) => !isSlotPast(s, selectedDay));
                    if (available.length > 0 && (!EVENING_SLOTS.includes(selectedTime) || isSlotPast(selectedTime, selectedDay))) {
                      setSelectedTime(available[0]);
                    }
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: timePeriod === "soir" ? "800" : "600",
                    fontSize: "12.5px",
                    transition: "all 0.25s ease",
                    background: timePeriod === "soir" ? "#bbf7d0" : "transparent",
                    color: timePeriod === "soir" ? "#0d2315" : "var(--text-secondary)",
                    boxShadow: timePeriod === "soir" ? "0 4px 15px rgba(187, 247, 208, 0.35)" : "none",
                  }}
                >
                  <Sunset size={15} color={timePeriod === "soir" ? "#0d2315" : "#f59e0b"} />
                  <span>Après-midi</span>
                  <span
                    style={{
                      fontSize: "9.5px",
                      opacity: timePeriod === "soir" ? 0.75 : 0.6,
                      marginLeft: "1px",
                    }}
                  >
                    (13h - 17h30)
                  </span>
                </button>
              </div>

              {/* Titre des Créneaux du Matin ou du Soir */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  Créneaux ({selectedDay === currentDayNumber ? `Aujourd'hui, ${selectedDay}` : selectedDay} Octobre) :
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-mint)",
                    fontWeight: "700",
                  }}
                >
                  {timePeriod === "matin" ? "Matinée (09:00 - 12:30)" : "Après-midi (13:00 - 17:30)"}
                </span>
              </div>

              {/* Grille des créneaux horaires avec blocage des heures passées */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {(timePeriod === "matin" ? MORNING_SLOTS : EVENING_SLOTS).map((slot) => {
                  const isPast = isSlotPast(slot, selectedDay);
                  const isSelected = selectedTime === slot && !isPast;

                  return (
                    <div
                      key={slot}
                      className={`time-slot-pill ${isPast ? "disabled" : isSelected ? "selected" : ""}`}
                      onClick={!isPast ? () => setSelectedTime(slot) : undefined}
                      title={isPast ? `${slot} (Passé - non réservable)` : `Réserver pour ${slot}`}
                      style={{
                        padding: "10px 4px",
                        fontSize: "12.5px",
                      }}
                    >
                      {slot}
                    </div>
                  );
                })}
              </div>

              {/* Message d'alerte contextuel si tous les créneaux de la période sont passés aujourd'hui */}
              {selectedDay === currentDayNumber && (timePeriod === "matin" ? MORNING_SLOTS : EVENING_SLOTS).every((s) => isSlotPast(s, selectedDay)) && (
                <div
                  style={{
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(234, 179, 8, 0.1)",
                    border: "1px solid rgba(234, 179, 8, 0.25)",
                    color: "#fef08a",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginTop: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <span>
                    ⚠️ Créneaux {timePeriod === "matin" ? "du matin" : "de l'après-midi"} passés pour aujourd'hui.
                  </span>
                  {timePeriod === "matin" && EVENING_SLOTS.some((s) => !isSlotPast(s, selectedDay)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTimePeriod("soir");
                        const available = EVENING_SLOTS.filter((s) => !isSlotPast(s, selectedDay));
                        if (available.length > 0) setSelectedTime(available[0]);
                      }}
                      style={{
                        background: "rgba(234, 179, 8, 0.3)",
                        border: "none",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Après-midi →
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Formulaire Coordonnées Patiente */}
            <form onSubmit={handleConfirmBooking} className="glass-panel" style={{ padding: "18px 16px", marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <User size={16} color="var(--accent-mint)" />
                <span>Coordonnées pour la Réservation</span>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Nom & Prénom de la Patiente *
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Numéro de Téléphone (Mobile) *
                </label>
                <input
                  type="tel"
                  className="glass-input"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  required
                />
              </div>


              {/* Bouton de confirmation finale */}
              <button
                type="submit"
                className="btn-primary-mint"
                style={{ padding: "16px", fontSize: "15px" }}
              >
                <CheckCircle2 size={18} />
                <span>Confirmer pour le {selectedDay} Oct à {selectedTime}</span>
              </button>
            </form>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 3 : CONFIRMATION FESTIVE DU RENDEZ-VOUS                         */}
        {/* =================================================================== */}
        {view === "confirmed" && confirmedBooking && (
          <div className="fade-in-up" style={{ textAlign: "center", padding: "10px 0 30px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(187, 247, 208, 0.15)",
                border: "2px solid var(--accent-mint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 0 30px var(--accent-mint-glow)",
              }}
            >
              <CheckCircle2 size={36} color="var(--accent-mint)" />
            </div>

            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#fff", marginBottom: "6px" }}>
              Rendez-vous Confirmé !
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
              Votre demande a été enregistrée avec succès au cabinet.
            </p>

            {/* Ticket / Reçu de réservation */}
            <div
              className="glass-panel"
              style={{
                padding: "20px",
                textAlign: "left",
                marginBottom: "24px",
                border: "1px dashed var(--accent-mint)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Code Réservation
                </span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--accent-mint)" }}>
                  {confirmedBooking.id}
                </span>
              </div>

              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginBottom: "12px" }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>
                  {confirmedBooking.doctorName}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {confirmedBooking.specialty}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Date</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                    {confirmedBooking.date}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Heure</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-mint)" }}>
                    {confirmedBooking.time}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Patiente</span>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                  {confirmedBooking.patientName} ({confirmedBooking.patientPhone})
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Motif : {confirmedBooking.reason}
                </div>
              </div>
            </div>

            <button
              className="btn-primary-mint"
              onClick={() => setView("doctor")}
              style={{ marginBottom: "10px" }}
            >
              <span>Retour à l'Accueil</span>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 3 : PROFIL PATIENT & HISTORIQUE DES RENDEZ-VOUS                 */}
        {/* =================================================================== */}
        {view === "profile" && (
          <div className="fade-in-up">
            {/* Header Profil */}
            <div style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                Mon Espace Patient
              </h2>
              <p style={{ color: "var(--accent-mint)", fontSize: "12.5px", fontWeight: "600", marginTop: "4px" }}>
                Gérez vos rendez-vous et vos informations
              </p>
            </div>

            {/* Carte Profil Utilisateur */}
            <div
              className="glass-panel"
              style={{
                padding: "16px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                border: "1px solid rgba(187, 247, 208, 0.2)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(187, 247, 208, 0.25), rgba(16, 185, 129, 0.25))",
                  border: "2px solid var(--accent-mint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-mint)",
                  flexShrink: 0,
                }}
              >
                <User size={26} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {patientName.trim() || "Patient(e)"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {patientPhone.trim() || "Numéro de téléphone non renseigné"}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", color: "var(--accent-mint)", marginTop: "4px" }}>
                  <ShieldCheck size={12} /> Dossier Médical Sécurisé
                </div>
              </div>
            </div>

            {/* Formulaire rapide pour compléter ses coordonnées */}
            <div className="glass-panel" style={{ padding: "16px", marginBottom: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginBottom: "12px" }}>
                Mes Coordonnées de Contact
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Nom & Prénom
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    style={{ padding: "10px 12px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    className="glass-input"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    style={{ padding: "10px 12px", fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>

            {/* Section Rendez-vous */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: 0 }}>
                  Mes Rendez-vous ({patientAppointments.length})
                </h4>
                {patientAppointments.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Voulez-vous effacer l'historique local de vos rendez-vous ?")) {
                        localStorage.removeItem("cabinet_client_appointments");
                        setPatientAppointments([]);
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(239, 68, 68, 0.8)",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Effacer
                  </button>
                )}
              </div>

              {patientAppointments.length === 0 ? (
                <div
                  className="glass-panel"
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    border: "1px dashed var(--border-subtle)",
                  }}
                >
                  <Calendar size={32} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                    Aucun rendez-vous enregistré
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 14px" }}>
                    Vous n'avez pas encore de consultation programmée auprès du Dr N. BELBACHIR OULD HENNIA.
                  </p>
                  <button
                    className="btn-primary-mint"
                    onClick={() => setView("schedule")}
                    style={{ padding: "12px 18px", fontSize: "13px" }}
                  >
                    <Calendar size={16} />
                    <span>Prendre un Rendez-vous</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {patientAppointments.map((apt, index) => (
                    <div
                      key={apt.id || index}
                      className="glass-panel"
                      style={{
                        padding: "14px",
                        borderLeft: "3px solid var(--accent-mint)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--accent-mint)" }}>
                          {apt.id || "RDV"}
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background: "rgba(187, 247, 208, 0.15)",
                            color: "var(--accent-mint)",
                            fontWeight: "700",
                          }}
                        >
                          Confirmé
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
                        {apt.reason || "Consultation"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} color="var(--accent-mint)" />
                          {apt.date}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} color="var(--accent-mint)" />
                          {apt.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 4 : À PROPOS DU CABINET & INFORMATIONS PRATIQUES               */}
        {/* =================================================================== */}
        {view === "about" && (
          <div className="fade-in-up" style={{ paddingBottom: "24px" }}>
            {/* Header À Propos */}
            <div style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                À Propos du Cabinet
              </h2>
              <p style={{ color: "var(--accent-mint)", fontSize: "12.5px", fontWeight: "600", marginTop: "4px" }}>
                Dr. N. BELBACHIR OULD HENNIA
              </p>
            </div>

            {/* Carte Présentation Médecin */}
            <div className="glass-panel" style={{ padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "12px" }}>
                <img
                  src="/doctor.jpg"
                  alt="Dr. N. BELBACHIR OULD HENNIA"
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--accent-mint)",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", margin: 0 }}>
                    Dr. N. BELBACHIR OULD HENNIA
                  </h4>
                  <div style={{ fontSize: "12px", color: "var(--accent-mint)", fontWeight: "600", marginTop: "2px" }}>
                    Spécialiste Gynécologie Obstétrique & Échographie
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    الدكتورة ن. بلبشير ولد هنية • طبيبة مختصة
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.55", margin: 0 }}>
                Cabinet médical moderne dédié à la santé féminine, au suivi complet de la grossesse, au diagnostic prénatal et aux échographies obstétricales et pelviennes de haute précision.
              </p>
            </div>

            {/* Horaires d'Ouverture (09:00 jusqu'à 18:00) */}
            <div className="glass-panel" style={{ padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={16} color="var(--accent-mint)" />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                    Horaires des Consultations
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: "rgba(187, 247, 208, 0.15)",
                    color: "var(--accent-mint)",
                    fontWeight: "700",
                  }}
                >
                  09:00 — 18:00
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Samedi — Jeudi</span>
                  <span style={{ fontWeight: "700", color: "#fff" }}>09:00 — 18:00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Vendredi</span>
                  <span style={{ color: "rgba(239, 68, 68, 0.85)", fontWeight: "600" }}>Fermé</span>
                </div>
              </div>
            </div>

            {/* Coordonnées & Téléphone */}
            <div className="glass-panel" style={{ padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <MapPin size={16} color="var(--accent-mint)" />
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                  Adresse & Contact
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: "700", lineHeight: "1.4", marginBottom: "3px" }}>
                Haï Seddikia (ex-Cité Boulanger)
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "14px" }}>
                Cité 340 Logements, Bâtiment 18/A, Oran
              </div>

              {/* Boutons d'appel direct */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a
                  href="tel:041539782"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "rgba(187, 247, 208, 0.1)",
                    border: "1px solid rgba(187, 247, 208, 0.25)",
                    color: "var(--accent-mint)",
                    textDecoration: "none",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={15} />
                    <span>Secrétariat Fixe</span>
                  </span>
                  <span style={{ color: "#fff" }}>041 53 97 82</span>
                </a>

                <a
                  href="tel:0550123456"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={15} color="var(--accent-mint)" />
                    <span>Mobile & Rendez-vous</span>
                  </span>
                  <span style={{ color: "var(--accent-mint)" }}>05 50 12 34 56</span>
                </a>
              </div>
            </div>

            {/* Carte de Localisation Interactive Google Maps */}
            <div className="glass-panel" style={{ padding: "16px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={16} color="var(--accent-mint)" />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                    Localisation sur la Carte
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Gynecologue+Belbachir+Ouldhennia!5e0"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-mint)",
                    textDecoration: "none",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>Ouvrir GPS</span>
                  <ArrowRight size={12} />
                </a>
              </div>

              {/* Cadre de la carte avec manipulation directe à la main (touch & zoom) */}
              <div
                style={{
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid rgba(187, 247, 208, 0.25)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                  position: "relative",
                  height: "260px",
                  background: "rgba(0, 0, 0, 0.2)",
                }}
              >
                <iframe
                  title="Localisation Cabinet Gynecologue Belbachir Ouldhennia"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1362.0324598325215!2d-0.6038324575020871!3d35.714476270634655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e88208f3036ef%3A0xe61f6a97eabb0912!2sGynecologue%20Belbachir%20Ouldhennia!5e0!3m2!1sfr!2sdz!4v1792679429928!5m2!1sfr!2sdz"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              <div style={{ marginTop: "10px", fontSize: "11.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📍 Gynecologue Belbachir Ouldhennia — Oran</span>
              </div>
            </div>

            {/* Bouton Prendre RDV */}
            <button
              className="btn-primary-mint"
              onClick={() => setView("schedule")}
              style={{ marginBottom: "20px" }}
            >
              <Calendar size={18} />
              <span>Prendre Rendez-vous en Ligne</span>
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* BARRE FLOTTANTE INFÉRIEURE (Home, Agenda, Profil, À propos)        */}
      {/* =================================================================== */}
      <div className="bottom-floating-nav">
        {/* 1. Home / Accueil */}
        <button
          className={`nav-tab-btn ${view === "doctor" ? "active" : ""}`}
          onClick={() => setView("doctor")}
          title="Accueil"
        >
          <Home size={19} />
          <span>Accueil</span>
        </button>

        {/* 2. Agenda */}
        <button
          className={`nav-tab-btn ${view === "schedule" ? "active" : ""}`}
          onClick={() => setView("schedule")}
          title="Agenda & Rendez-vous"
        >
          <Calendar size={19} />
          <span>Agenda</span>
        </button>

        {/* 3. Profil */}
        <button
          className={`nav-tab-btn ${view === "profile" ? "active" : ""}`}
          onClick={() => {
            try {
              const saved = JSON.parse(localStorage.getItem("cabinet_client_appointments") || "[]");
              setPatientAppointments(saved);
            } catch (e) {}
            setView("profile");
          }}
          title="Profil & Mes Rendez-vous"
        >
          <User size={19} />
          <span>Profil</span>
        </button>

        {/* 4. À propos / About */}
        <button
          className={`nav-tab-btn ${view === "about" ? "active" : ""}`}
          onClick={() => setView("about")}
          title="À propos du cabinet"
        >
          <Info size={19} />
          <span>À propos</span>
        </button>
      </div>


      {/* =================================================================== */}
      {/* MODAL / TIROIR IA ASSISTANT                                         */}
      {/* =================================================================== */}
      {showAiModal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(6, 11, 8, 0.94)",
            backdropFilter: "blur(20px)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {/* Header IA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "14px",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--accent-mint)",
                  color: "var(--accent-mint-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "#fff" }}>
                  Assistant Médical IA
                </h5>
                <span style={{ fontSize: "10px", color: "var(--accent-mint)" }}>
                  Dr N. BELBACHIR OULD HENNIA
                </span>
              </div>
            </div>
            <button
              className="btn-icon-circle"
              style={{ width: "36px", height: "36px" }}
              onClick={() => setShowAiModal(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Corps de conversation */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            {aiChat.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "12px 14px",
                  borderRadius: "18px",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  background:
                    msg.sender === "user"
                      ? "var(--accent-mint)"
                      : "rgba(255, 255, 255, 0.08)",
                  color:
                    msg.sender === "user"
                      ? "var(--accent-mint-dark)"
                      : "var(--text-primary)",
                  fontWeight: msg.sender === "user" ? "600" : "400",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Suggestions rapides */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "10px" }}>
            {[
              "Tarif consultation ?",
              "Préparation échographie ?",
              "Adresse du cabinet ?",
            ].map((sugg, i) => (
              <button
                key={i}
                onClick={() => setAiQuestion(sugg)}
                style={{
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {sugg}
              </button>
            ))}
          </div>

          {/* Input de saisie */}
          <form onSubmit={handleSendAiMessage} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Posez votre question médicale..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary-mint"
              style={{ width: "48px", height: "48px", padding: 0, flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

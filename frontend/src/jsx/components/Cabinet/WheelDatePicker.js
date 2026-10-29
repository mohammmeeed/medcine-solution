import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";

const MONTHS_FR = [
  { value: 1, label: "Jan", full: "Janvier" },
  { value: 2, label: "Fév", full: "Février" },
  { value: 3, label: "Mar", full: "Mars" },
  { value: 4, label: "Avr", full: "Avril" },
  { value: 5, label: "Mai", full: "Mai" },
  { value: 6, label: "Jun", full: "Juin" },
  { value: 7, label: "Juil", full: "Juillet" },
  { value: 8, label: "Aoû", full: "Août" },
  { value: 9, label: "Sep", full: "Septembre" },
  { value: 10, label: "Oct", full: "Octobre" },
  { value: 11, label: "Nov", full: "Novembre" },
  { value: 12, label: "Déc", full: "Décembre" },
];

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 220px
const PADDING_Y = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2; // 88px

// Helper : nombre de jours dans un mois donné
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// ========================================================
// Colonne de Défilement (Roue Drum Picker style iOS)
// Supporte: Molette, Drag & Drop souris, Touch mobile, Clic direct
// ========================================================
const WheelColumn = ({ items, selectedValue, onSelect, renderItem }) => {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Positionnement initial
  useEffect(() => {
    if (!containerRef.current) return;
    const index = items.findIndex((it) => (it?.value !== undefined ? it.value : it) === selectedValue);
    if (index >= 0) {
      containerRef.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, [items, selectedValue]);

  // Détection du scroll avec snap
  const handleScroll = () => {
    if (!containerRef.current || isDraggingRef.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const safeIndex = Math.max(0, Math.min(items.length - 1, rawIndex));
      const targetItem = items[safeIndex];
      const val = targetItem?.value !== undefined ? targetItem.value : targetItem;

      if (val !== selectedValue) {
        onSelect(val);
      }
    }, 70);
  };

  // Support Drag Souris (desktop)
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startScrollTopRef.current = containerRef.current ? containerRef.current.scrollTop : 0;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const deltaY = e.clientY - startYRef.current;
    containerRef.current.scrollTop = startScrollTopRef.current - deltaY;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const safeIndex = Math.max(0, Math.min(items.length - 1, rawIndex));
      containerRef.current.scrollTo({
        top: safeIndex * ITEM_HEIGHT,
        behavior: "smooth",
      });
      const targetItem = items[safeIndex];
      const val = targetItem?.value !== undefined ? targetItem.value : targetItem;
      if (val !== selectedValue) {
        onSelect(val);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      className="wheel-picker-column"
      style={{
        height: `${CONTAINER_HEIGHT}px`,
        overflowY: "auto",
        scrollSnapType: isDraggingRef.current ? "none" : "y mandatory",
        position: "relative",
        paddingTop: `${PADDING_Y}px`,
        paddingBottom: `${PADDING_Y}px`,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
        cursor: "grab",
        flex: 1,
      }}
    >
      {items.map((item, idx) => {
        const val = item?.value !== undefined ? item.value : item;
        const isSelected = val === selectedValue;
        return (
          <div
            key={idx}
            className={`wheel-picker-item ${isSelected ? "selected" : ""}`}
            style={{
              height: `${ITEM_HEIGHT}px`,
              scrollSnapAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              userSelect: "none",
              fontSize: isSelected ? "20px" : "15px",
              fontWeight: isSelected ? "700" : "500",
              color: isSelected ? "#1e60d5" : "#64748b",
              transition: "transform 0.15s ease, opacity 0.15s ease, color 0.15s ease",
              transform: isSelected ? "scale(1.08)" : "scale(0.92)",
              opacity: isSelected ? 1 : 0.4,
            }}
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: idx * ITEM_HEIGHT,
                  behavior: "smooth",
                });
                onSelect(val);
              }
            }}
          >
            {renderItem ? renderItem(item, isSelected) : val}
          </div>
        );
      })}
    </div>
  );
};

// ========================================================
// Modal Popover Roue avec couleurs du Panel Admin
// ========================================================
const WheelDatePickerModal = ({
  isOpen,
  onClose,
  initialDate,
  onConfirm,
  title = "DÉFINIR LA DATE",
  minYear = 1920,
  maxYear = 2035,
}) => {
  const parseDate = (dStr) => {
    if (dStr && typeof dStr === "string" && dStr.includes("-")) {
      const parts = dStr.split("-").map((p) => parseInt(p, 10));
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return { year: parts[0], month: parts[1], day: parts[2] };
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  };

  const [dateState, setDateState] = useState(() => parseDate(initialDate));

  useEffect(() => {
    if (isOpen) {
      setDateState(parseDate(initialDate));
    }
  }, [isOpen, initialDate]);

  // Liste des années
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Liste des mois
  const months = MONTHS_FR;

  // Liste des jours selon l'année et le mois
  const maxDays = getDaysInMonth(dateState.year, dateState.month);
  const days = [];
  for (let d = 1; d <= maxDays; d++) {
    days.push(d);
  }

  // Si le jour dépasse le max du mois sélectionné
  useEffect(() => {
    if (dateState.day > maxDays) {
      setDateState((prev) => ({ ...prev, day: maxDays }));
    }
  }, [maxDays, dateState.day]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const pad = (n) => String(n).padStart(2, "0");
    const formatted = `${dateState.year}-${pad(dateState.month)}-${pad(dateState.day)}`;
    onConfirm(formatted);
    onClose();
  };

  const handleSetToday = () => {
    const now = new Date();
    setDateState({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    });
  };

  const modalContent = (
    <div
      className="wheel-datepicker-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "wheelFadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="wheel-datepicker-card"
        style={{
          width: "360px",
          maxWidth: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.2), 0 4px 12px rgba(30, 96, 213, 0.08)",
          padding: "24px 20px 20px 20px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "wheelPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        {/* En-tête : Titre centré + Bouton Aujourd'hui + Croix de fermeture */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            paddingBottom: "12px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <button
            type="button"
            className="btn btn-xs btn-link p-0 text-primary text-decoration-none"
            style={{ fontSize: "11px", fontWeight: "600" }}
            onClick={handleSetToday}
            title="Aller à la date d'aujourd'hui"
          >
            Aujourd'hui
          </button>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "1.2px",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "18px",
              padding: "4px",
              lineHeight: 1,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Zone des 3 Roues Drum style */}
        <div
          style={{
            position: "relative",
            height: `${CONTAINER_HEIGHT}px`,
            display: "flex",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          {/* Barre centrale de sélection aux couleurs de la charte Admin (#1e60d5) */}
          <div
            style={{
              position: "absolute",
              top: `${PADDING_Y}px`,
              left: "4px",
              right: "4px",
              height: `${ITEM_HEIGHT}px`,
              backgroundColor: "rgba(30, 96, 213, 0.08)",
              borderRadius: "12px",
              border: "1.5px solid rgba(30, 96, 213, 0.25)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Dégradé de fondu haut et bas style 3D drum */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: `${PADDING_Y}px`,
              background: "linear-gradient(to bottom, #ffffff 15%, rgba(255, 255, 255, 0) 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${PADDING_Y}px`,
              background: "linear-gradient(to top, #ffffff 15%, rgba(255, 255, 255, 0) 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Colonne 1 : Année */}
          <WheelColumn
            items={years}
            selectedValue={dateState.year}
            onSelect={(val) => setDateState((prev) => ({ ...prev, year: val }))}
          />

          {/* Colonne 2 : Mois */}
          <WheelColumn
            items={months}
            selectedValue={dateState.month}
            onSelect={(val) => setDateState((prev) => ({ ...prev, month: val }))}
            renderItem={(m) => m.label}
          />

          {/* Colonne 3 : Jour */}
          <WheelColumn
            items={days}
            selectedValue={dateState.day}
            onSelect={(val) => setDateState((prev) => ({ ...prev, day: val }))}
            renderItem={(d) => String(d).padStart(2, "0")}
          />
        </div>

        {/* Bouton de confirmation SUBMIT arrondi aux couleurs du panel admin (#1e60d5) */}
        <button
          type="button"
          onClick={handleConfirm}
          className="btn btn-primary w-100"
          style={{
            borderRadius: "50px",
            padding: "13px",
            fontSize: "14px",
            fontWeight: "700",
            letterSpacing: "1.2px",
            backgroundColor: "#1e60d5",
            borderColor: "#1e60d5",
            boxShadow: "0 6px 18px rgba(30, 96, 213, 0.35)",
            color: "#ffffff",
            transition: "all 0.2s ease",
            textTransform: "uppercase",
          }}
        >
          CONFIRMER
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

// ========================================================
// Composant Input avec Trigger intégré (Drop-in replacement)
// ========================================================
const WheelDatePicker = ({
  value,
  onChange,
  name,
  id,
  className = "form-control",
  placeholder = "JJ/MM/AAAA",
  title = "DÉFINIR LA DATE",
  disabled = false,
  required = false,
  style = {},
  minYear,
  maxYear,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Formatage de la date affichée dans le champ (ex: 29/10/2026)
  const formatDisplay = (val) => {
    if (!val || typeof val !== "string") return "";
    const parts = val.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const handleConfirm = (newVal) => {
    if (onChange) {
      onChange({
        target: {
          name: name || "",
          value: newVal,
        },
      });
    }
  };

  return (
    <div
      className="wheel-datepicker-wrapper"
      style={{ position: "relative", display: "inline-block", width: "100%", ...style }}
    >
      <div
        className="input-group"
        onClick={() => {
          if (!disabled) setIsOpen(true);
        }}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <input
          type="text"
          id={id}
          name={name}
          className={className}
          value={formatDisplay(value)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          required={required}
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: disabled ? "#e9ecef" : "#ffffff",
            fontWeight: "500",
          }}
        />
        <span
          className="input-group-text"
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: "#f8fafc",
            color: "#1e60d5",
            borderColor: "#e2e8f0",
          }}
        >
          <i className="fa fa-calendar"></i>
        </span>
      </div>

      <WheelDatePickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialDate={value}
        onConfirm={handleConfirm}
        title={title}
        minYear={minYear}
        maxYear={maxYear}
      />
    </div>
  );
};

export default WheelDatePicker;
export { WheelDatePickerModal };

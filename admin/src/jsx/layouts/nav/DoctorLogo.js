import React from "react";

const DoctorLogo = ({ isDark = false, className = "logo-abbr" }) => {
  return (
    <span
      className={className}
      style={{
        width: "42px",
        height: "42px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="42"
        height="42"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="doctorLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C1458" />
            <stop offset="50%" stopColor="#D81B60" />
            <stop offset="100%" stopColor="#E91E63" />
          </linearGradient>
          <linearGradient id="stethGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="doctorShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#9C1458" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Squircle Badge */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill={isDark ? "#2563EB" : "url(#doctorLogoBg)"}
          filter="url(#doctorShadow)"
        />

        {/* Doctor Silhouette */}
        {/* Head */}
        <circle cx="24" cy="14" r="5.5" fill="#FFFFFF" />

        {/* Doctor Coat & Shoulders */}
        <path
          d="M13 37C13 30 17.5 25 24 25C30.5 25 35 30 35 37C35 38.5 34 39 32.5 39H15.5C14 39 13 38.5 13 37Z"
          fill="#FFFFFF"
        />

        {/* Doctor V-Neck */}
        <path
          d="M21 25L24 31.5L27 25"
          stroke={isDark ? "#2563EB" : "#D81B60"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Stethoscope around Neck */}
        <path
          d="M19 23C18 24 17.2 26 17.5 28C17.8 30 19.5 32.5 22 32.5H23.5"
          stroke={isDark ? "#93C5FD" : "url(#stethGrad)"}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M29 23C30 24 30.8 26 30.5 28C30.2 30 28.5 32.5 26 32.5H23.5"
          stroke={isDark ? "#93C5FD" : "url(#stethGrad)"}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stethoscope Chestpiece */}
        <path
          d="M23.5 32.5V35"
          stroke={isDark ? "#93C5FD" : "url(#stethGrad)"}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle
          cx="23.5"
          cy="36.5"
          r="2.2"
          fill={isDark ? "#93C5FD" : "#2563EB"}
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
      </svg>
    </span>
  );
};

export default DoctorLogo;

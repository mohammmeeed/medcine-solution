import React from "react";

export const MenuList = [
    // A. Principal
    {
        title: "PRINCIPAL",
        classsChange: "menu-title"
    },
    {
        title: "Tableau de bord",
        to: "dashboard",
        iconStyle: <i className="flaticon-381-networking" />
    },
    {
        title: "Agenda & RDV",
        to: "appointments",
        iconStyle: <i className="flaticon-381-calendar-1" />
    },
    {
        title: "Patients",
        to: "patients",
        iconStyle: <i className="flaticon-381-user-7" />
    },
    {
        title: "Salle d'attente",
        to: "waiting-room",
        iconStyle: <i className="flaticon-381-clock-1" />
    },
    {
        title: "Écran Salle d'attente",
        to: "affichage-salle-attente",
        iconStyle: <i className="flaticon-381-television" />
    },

    // B. Gestion médicale
    {
        title: "GESTION MÉDICALE",
        classsChange: "menu-title"
    },
    {
        title: "Consultations",
        to: "consultations",
        iconStyle: <i className="flaticon-381-notepad" />
    },
    {
        title: "Dossiers médicaux",
        to: "medical-records",
        iconStyle: <i className="flaticon-381-folder" />
    },
    {
        title: "Ordonnances",
        to: "prescriptions",
        iconStyle: <i className="flaticon-381-file-1" />
    },

    // C. Gestion administrative et financière
    {
        title: "GESTION ADMINISTRATIVE",
        classsChange: "menu-title"
    },
    {
        title: "Factures",
        to: "invoices",
        iconStyle: <i className="flaticon-381-calculator" />
    },
    {
        title: "Journal de Caisse",
        to: "cashflow",
        iconStyle: <i className="flaticon-381-notebook-1" />
    },

    {
        title: "Rapports & Stats",
        to: "reports",
        iconStyle: <i className="flaticon-381-controls-3" />
    },

    // D. Cabinet et configuration
    {
        title: "CABINET & CONFIGURATION",
        classsChange: "menu-title"
    },
    {
        title: "Personnel & Droits",
        to: "staff",
        iconStyle: <i className="flaticon-381-user-9" />
    },
    {
        title: "Mon cabinet",
        to: "clinic",
        iconStyle: <i className="flaticon-381-home-2" />
    },
    {
        title: "Paramètres",
        to: "settings",
        iconStyle: <i className="flaticon-381-settings-2" />
    },
    {
        title: "Configuration SMTP",
        to: "smtp",
        iconStyle: <i className="flaticon-381-send" />
    },
    {
        title: "Aide & Support",
        to: "support",
        iconStyle: <i className="flaticon-381-help" />
    }
];
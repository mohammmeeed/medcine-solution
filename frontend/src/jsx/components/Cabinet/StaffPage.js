import React, { useState, useEffect } from "react";
import { Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";
import ApiService from "../../../services/ApiService";

// Liste complète et officielle des pages et modules existants dans le site médical
export const SITE_PAGES = [
  {
    id: "dashboard",
    name: "Tableau de bord",
    path: "/dashboard",
    category: "Principal",
    icon: "flaticon-381-networking",
    description: "Indicateurs clés, rendez-vous du jour, recettes et résumé général",
  },
  {
    id: "appointments",
    name: "Agenda & Rendez-vous",
    path: "/appointments",
    category: "Principal",
    icon: "flaticon-381-calendar-1",
    description: "Calendrier médical, créneaux de consultation et prise de RDV",
  },
  {
    id: "patients",
    name: "Gestion des Patients",
    path: "/patients",
    category: "Principal",
    icon: "flaticon-381-user-7",
    description: "Liste complète des patients, coordonnées et nouvelles inscriptions",
  },
  {
    id: "patient-details",
    name: "Dossier Patient",
    path: "/patient-details",
    category: "Principal",
    icon: "flaticon-381-id-card",
    description: "Dossier médical individuel, constantes, antécédents et antériorités",
  },
  {
    id: "waiting-room",
    name: "Salle d'attente",
    path: "/waiting-room",
    category: "Principal",
    icon: "flaticon-381-clock-1",
    description: "Gestion des arrivées, ordre de passage et appel des patients",
  },
  {
    id: "affichage-salle-attente",
    name: "Écran Salle d'attente",
    path: "/affichage-salle-attente",
    category: "Principal",
    icon: "flaticon-381-television",
    description: "Affichage public dynamique sur écran de télévision pour les patients",
  },
  {
    id: "consultations",
    name: "Consultations Médicales",
    path: "/consultations",
    category: "Médical",
    icon: "flaticon-381-notepad",
    description: "Examen clinique gynéco-obstétrique, motif, diagnostic et actes",
  },
  {
    id: "medical-records",
    name: "Dossiers Médicaux",
    path: "/medical-records",
    category: "Médical",
    icon: "flaticon-381-folder",
    description: "Archives des dossiers médicaux, historiques et diagnostics",
  },
  {
    id: "prescriptions",
    name: "Ordonnances",
    path: "/prescriptions",
    category: "Médical",
    icon: "flaticon-381-file-1",
    description: "Rédaction, impression et signature des ordonnances médicamenteuses",
  },
  {
    id: "medical-documents",
    name: "Documents Médicaux",
    path: "/medical-documents",
    category: "Médical",
    icon: "flaticon-381-layer-1",
    description: "Certificats médicaux, courriers confrères et comptes-rendus",
  },
  {
    id: "invoices",
    name: "Factures",
    path: "/invoices",
    category: "Financier",
    icon: "flaticon-381-calculator",
    description: "Émission de factures, encaissements et feuilles de soins",
  },
  {
    id: "reports",
    name: "Rapports & Statistiques",
    path: "/reports",
    category: "Financier",
    icon: "flaticon-381-controls-3",
    description: "Chiffre d'affaires, statistiques d'actes et bilans d'activité",
  },
  {
    id: "staff",
    name: "Personnel & Droits",
    path: "/staff",
    category: "Configuration",
    icon: "flaticon-381-user-9",
    description: "Gestion des comptes administrateurs et matrice des rôles d'accès",
  },
  {
    id: "clinic",
    name: "Mon Cabinet",
    path: "/clinic",
    category: "Configuration",
    icon: "flaticon-381-home-2",
    description: "Informations légales, coordonnées et en-têtes officielles du praticien",
  },
  {
    id: "settings",
    name: "Paramètres",
    path: "/settings",
    category: "Configuration",
    icon: "flaticon-381-settings-2",
    description: "Tarification des actes, horaires et personnalisation du système",
  },
  {
    id: "support",
    name: "Aide & Support",
    path: "/support",
    category: "Configuration",
    icon: "flaticon-381-help",
    description: "Assistance technique, documentation et raccourcis d'aide",
  },
];

// Rôles initiaux par défaut
export const DEFAULT_ROLES = [
  {
    id: "role-superadmin",
    name: "Médecin Titulaire (Super Admin)",
    description: "Accès total et illimité à l'ensemble des modules médicaux, administratifs et de sécurité",
    badgeColor: "primary",
    isSystem: true,
    pages: SITE_PAGES.reduce((acc, p) => ({ ...acc, [p.id]: true }), {}),
  },
  {
    id: "role-secretary",
    name: "Secrétaire Médicale",
    description: "Accueil physique, gestion de l'agenda, file d'attente et facturation (Secret médical protégé)",
    badgeColor: "info",
    isSystem: false,
    pages: {
      dashboard: true,
      appointments: true,
      patients: true,
      "patient-details": false,
      "waiting-room": true,
      "affichage-salle-attente": true,
      consultations: false,
      "medical-records": false,
      prescriptions: false,
      "medical-documents": false,
      invoices: true,
      reports: false,
      staff: false,
      clinic: false,
      settings: false,
      support: true,
    },
  },
  {
    id: "role-accountant",
    name: "Gestionnaire Financier & Comptable",
    description: "Gestion des factures, règlements, statistiques et bilans financiers",
    badgeColor: "success",
    isSystem: false,
    pages: {
      dashboard: true,
      appointments: false,
      patients: false,
      "patient-details": false,
      "waiting-room": false,
      "affichage-salle-attente": false,
      consultations: false,
      "medical-records": false,
      prescriptions: false,
      "medical-documents": false,
      invoices: true,
      reports: true,
      staff: false,
      clinic: false,
      settings: false,
      support: true,
    },
  },
];

// Comptes utilisateurs initiaux
export const DEFAULT_ACCOUNTS = [
  {
    id: "acc-1",
    name: "Dr N. BELBACHIR OULD HENNIA",
    username: "admin",
    password: "admin123",
    email: "dr.belbachir@cabinet-medical.dz",
    phone: "01 42 68 50 10",
    roleId: "role-superadmin",
    roleName: "Médecin Titulaire (Super Admin)",
    status: "Actif",
    type: "doctor",
    createdAt: "2024-01-15",
  },
  {
    id: "acc-2",
    name: "Sophie Vasseur",
    username: "secretaire",
    password: "123",
    email: "accueil@cabinet-saint-honore.fr",
    phone: "01 42 68 50 11",
    roleId: "role-secretary",
    roleName: "Secrétaire Médicale",
    status: "Actif",
    type: "secretary",
    createdAt: "2024-02-01",
  },
];

const StaffPage = ({ initialView = "list" }) => {
  // États principaux
  const [activeTab, setActiveTab] = useState("accounts"); // 'accounts' | 'roles'
  const [viewMode, setViewMode] = useState(initialView); // 'list' | 'account-form' | 'role-form'
  const searchQuery = "";
  const statusFilter = "Tous";

  // Données persistées dans localStorage
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("cabinet_staff_roles");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ROLES;
  });

  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem("cabinet_staff_accounts");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ACCOUNTS;
  });

  // Chargement initial depuis la base de données MySQL
  useEffect(() => {
    const fetchStaffFromDb = async () => {
      try {
        const staffData = await ApiService.getStaff();
        if (Array.isArray(staffData) && staffData.length > 0) {
          const mapped = staffData.map((s) => ({
            id: s.id,
            name: s.name,
            username: s.type === "doctor" ? "admin" : (s.email ? s.email.split("@")[0] : `user${s.id}`),
            password: "••••••••",
            email: s.email || "",
            phone: s.phone || "",
            roleId: s.type === "doctor" ? "role-superadmin" : "role-secretary",
            roleName: s.role || (s.type === "doctor" ? "Médecin Titulaire (Super Admin)" : "Secrétaire Médicale"),
            status: s.status || "Actif",
            type: s.type || "secretary",
            createdAt: s.createdAt ? s.createdAt.split(" ")[0] : "2024-01-15",
          }));
          setAccounts(mapped);
        }
      } catch (err) {
        console.warn("Erreur chargement personnel MySQL :", err);
      }
    };
    fetchStaffFromDb();
  }, []);

  // Sauvegardes synchronisées dans localStorage
  useEffect(() => {
    localStorage.setItem("cabinet_staff_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("cabinet_staff_accounts", JSON.stringify(accounts));
  }, [accounts]);

  // Formulaire Compte Utilisateur (Pleine page)
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    roleId: "role-superadmin",
    status: "Actif",
  });

  // Formulaire Rôle & Permissions (Pleine page)
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [pageCategoryFilter, setPageCategoryFilter] = useState("Tous");
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    badgeColor: "primary",
    pages: SITE_PAGES.reduce((acc, p) => ({ ...acc, [p.id]: false }), {}),
  });

  // =========================================================================
  // GESTION DES COMPTES (Créer, Modifier, Supprimer, Statut)
  // =========================================================================
  const handleOpenNewAccount = () => {
    setEditingAccountId(null);
    setAccountForm({
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      roleId: roles[0]?.id || "role-superadmin",
      status: "Actif",
    });
    setShowPassword(false);
    setViewMode("account-form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditAccount = (acc) => {
    setEditingAccountId(acc.id);
    setAccountForm({
      name: acc.name || "",
      username: acc.username || "",
      email: acc.email || "",
      phone: acc.phone || "",
      password: acc.password || "",
      roleId: acc.roleId || roles[0]?.id,
      status: acc.status || "Actif",
    });
    setShowPassword(false);
    setViewMode("account-form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();

    const cleanName = accountForm.name.trim();
    const cleanUsername = accountForm.username.trim().toLowerCase();
    const cleanPass = accountForm.password.trim();

    if (!cleanName || !cleanUsername) {
      Swal.fire({
        icon: "warning",
        title: "Champs obligatoires",
        text: "Veuillez renseigner le nom complet et le nom d'utilisateur.",
      });
      return;
    }

    // Vérification unicité identifiant
    const isTaken = accounts.some(
      (a) => a.username.toLowerCase() === cleanUsername && a.id !== editingAccountId
    );
    if (isTaken) {
      Swal.fire({
        icon: "error",
        title: "Identifiant indisponible",
        text: "Ce nom d'utilisateur est déjà utilisé par un autre compte.",
      });
      return;
    }

    if (!editingAccountId && !cleanPass) {
      Swal.fire({
        icon: "warning",
        title: "Mot de passe requis",
        text: "Veuillez définir un mot de passe pour le nouveau compte.",
      });
      return;
    }

    const assignedRole = roles.find((r) => r.id === accountForm.roleId) || roles[0];

    if (editingAccountId) {
      // Modification
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === editingAccountId) {
            return {
              ...acc,
              name: cleanName,
              username: cleanUsername,
              email: accountForm.email.trim(),
              phone: accountForm.phone.trim(),
              password: cleanPass ? cleanPass : acc.password,
              roleId: assignedRole.id,
              roleName: assignedRole.name,
              status: accountForm.status,
            };
          }
          return acc;
        })
      );

      // Synchronisation MySQL
      ApiService.saveStaffUser({
        id: editingAccountId,
        name: cleanName,
        email: accountForm.email.trim() || `${cleanUsername}@cabinet.dz`,
        phone: accountForm.phone.trim(),
        role: assignedRole.name,
        roleName: assignedRole.name,
        type: cleanUsername === "admin" ? "doctor" : "secretary",
        status: accountForm.status,
        accessLevel: assignedRole.name,
        password: cleanPass || undefined,
      }).catch((err) => console.warn("Erreur sauvegarde MySQL :", err));

      Swal.fire({
        icon: "success",
        title: "Compte modifié dans la Base de Données",
        text: `Le compte de ${cleanName} a été mis à jour avec succès.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } else {
      // Création
      const newAcc = {
        id: "acc-" + Date.now(),
        name: cleanName,
        username: cleanUsername,
        password: cleanPass,
        email: accountForm.email.trim(),
        phone: accountForm.phone.trim(),
        roleId: assignedRole.id,
        roleName: assignedRole.name,
        status: accountForm.status,
        type: cleanUsername === "admin" ? "doctor" : "secretary",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAccounts((prev) => [newAcc, ...prev]);

      // Synchronisation MySQL
      ApiService.saveStaffUser({
        name: cleanName,
        email: accountForm.email.trim() || `${cleanUsername}@cabinet.dz`,
        phone: accountForm.phone.trim(),
        role: assignedRole.name,
        roleName: assignedRole.name,
        type: cleanUsername === "admin" ? "doctor" : "secretary",
        status: accountForm.status,
        accessLevel: assignedRole.name,
        password: cleanPass,
      }).catch((err) => console.warn("Erreur insertion MySQL :", err));

      Swal.fire({
        icon: "success",
        title: "Compte créé dans la Base de Données",
        text: `Le compte utilisateur pour ${cleanName} a été ajouté dans MySQL.`,
        timer: 1600,
        showConfirmButton: false,
      });
    }

    setViewMode("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAccount = (acc) => {
    // Empêcher la suppression du compte admin principal
    if (acc.username === "admin" || acc.type === "doctor" || acc.id === 1) {
      Swal.fire({
        icon: "info",
        title: "Compte protégé",
        text: "Le compte principal du Médecin Titulaire ne peut pas être supprimé pour garantir l'accès au cabinet.",
      });
      return;
    }

    Swal.fire({
      title: `Supprimer le compte ?`,
      html: `Êtes-vous sûr de vouloir supprimer définitivement le compte de <b>${acc.name}</b> (<i>@${acc.username}</i>) ?<br/><small class="text-danger">Cette action révoquera immédiatement tous ses accès au cabinet.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6e7881",
      confirmButtonText: "Oui, supprimer le compte",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
        try {
          await ApiService.deleteStaffUser(acc.id);
        } catch (e) {
          console.warn("Erreur suppression MySQL :", e);
        }
        Swal.fire({
          icon: "success",
          title: "Compte supprimé de la Base de Données",
          text: `Le compte de ${acc.name} a été supprimé.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleToggleStatus = (acc) => {
    if (acc.username === "admin") {
      Swal.fire({
        icon: "info",
        title: "Opération non autorisée",
        text: "Le compte Administrateur Principal doit rester actif.",
      });
      return;
    }
    const newStatus = acc.status === "Actif" ? "Inactif" : "Actif";
    setAccounts((prev) =>
      prev.map((a) => (a.id === acc.id ? { ...a, status: newStatus } : a))
    );
    Swal.fire({
      icon: newStatus === "Actif" ? "success" : "warning",
      title: `Compte ${newStatus === "Actif" ? "activé" : "désactivé"}`,
      text: `${acc.name} est désormais ${newStatus.toLowerCase()}.`,
      timer: 1200,
      showConfirmButton: false,
    });
  };

  // =========================================================================
  // GESTION DES RÔLES & PERMISSIONS PAR PAGE
  // =========================================================================
  const handleOpenNewRole = () => {
    setEditingRoleId(null);
    setRoleForm({
      name: "",
      description: "",
      badgeColor: "primary",
      pages: SITE_PAGES.reduce((acc, p) => ({ ...acc, [p.id]: false }), {}),
    });
    setPageCategoryFilter("Tous");
    setViewMode("role-form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name || "",
      description: role.description || "",
      badgeColor: role.badgeColor || "primary",
      pages: {
        ...SITE_PAGES.reduce((acc, p) => ({ ...acc, [p.id]: false }), {}),
        ...(role.pages || {}),
      },
    });
    setPageCategoryFilter("Tous");
    setViewMode("role-form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    const cleanName = roleForm.name.trim();

    if (!cleanName) {
      Swal.fire({
        icon: "warning",
        title: "Nom du rôle requis",
        text: "Veuillez attribuer un nom clair au rôle (ex: Secrétaire, Médecin Associé...).",
      });
      return;
    }

    if (editingRoleId) {
      // Modification du rôle existant
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRoleId
            ? {
              ...r,
              name: cleanName,
              description: roleForm.description.trim(),
              badgeColor: roleForm.badgeColor,
              pages: roleForm.pages,
            }
            : r
        )
      );

      // Mettre à jour le nom du rôle dans les comptes rattachés
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.roleId === editingRoleId ? { ...acc, roleName: cleanName } : acc
        )
      );

      Swal.fire({
        icon: "success",
        title: "Rôle mis à jour",
        text: `Les droits du rôle « ${cleanName} » ont été enregistrés.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } else {
      // Création d'un nouveau rôle
      const newRole = {
        id: "role-" + Date.now(),
        name: cleanName,
        description: roleForm.description.trim(),
        badgeColor: roleForm.badgeColor,
        isSystem: false,
        pages: roleForm.pages,
      };
      setRoles((prev) => [...prev, newRole]);
      Swal.fire({
        icon: "success",
        title: "Nouveau rôle créé",
        text: `Le rôle « ${cleanName} » a été ajouté à la matrice des droits.`,
        timer: 1600,
        showConfirmButton: false,
      });
    }

    setViewMode("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRole = (role) => {
    if (role.isSystem || role.id === "role-superadmin") {
      Swal.fire({
        icon: "info",
        title: "Rôle système protégé",
        text: "Le rôle Super Administrateur est indispensable au fonctionnement du cabinet.",
      });
      return;
    }

    // Vérifier si des utilisateurs ont ce rôle
    const assignedUsers = accounts.filter((a) => a.roleId === role.id);
    if (assignedUsers.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Rôle en cours d'utilisation",
        html: `Ce rôle est actuellement attribué à <b>${assignedUsers.length}</b> utilisateur(s) (${assignedUsers.map((u) => u.name).join(", ")}).<br/><small class="text-muted">Veuillez d'abord modifier leurs comptes vers un autre rôle avant de le supprimer.</small>`,
      });
      return;
    }

    Swal.fire({
      title: `Supprimer le rôle ?`,
      html: `Êtes-vous sûr de vouloir supprimer le rôle <b>« ${role.name} »</b> ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6e7881",
      confirmButtonText: "Oui, supprimer le rôle",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setRoles((prev) => prev.filter((r) => r.id !== role.id));
        Swal.fire({
          icon: "success",
          title: "Rôle supprimé",
          text: `Le rôle « ${role.name} » a été retiré.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleTogglePagePermission = (pageId) => {
    setRoleForm((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: !prev.pages[pageId],
      },
    }));
  };

  const handleSelectAllPages = (selectAll) => {
    setRoleForm((prev) => ({
      ...prev,
      pages: SITE_PAGES.reduce((acc, p) => ({ ...acc, [p.id]: selectAll }), {}),
    }));
  };

  // =========================================================================
  // CALCULS & FILTRES
  // =========================================================================
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.email && acc.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (acc.roleName && acc.roleName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "Tous" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countAllowedPages = (rolePages = {}) => {
    return Object.values(rolePages).filter(Boolean).length;
  };

  // =========================================================================
  // VUE 1 : NOUVEAU / MODIFIER COMPTE (PLEINE PAGE - PAS DE POPUP)
  // =========================================================================
  if (viewMode === "account-form") {
    const selectedRole = roles.find((r) => r.id === accountForm.roleId) || roles[0];
    const allowedPages = SITE_PAGES.filter(
      (p) => selectedRole && selectedRole.pages && selectedRole.pages[p.id]
    );

    return (
      <div className="fade-in-up">
        <PageTitle
          motherMenu="Cabinet & Configuration"
          activeMenu={editingAccountId ? "Modifier le Compte Administrateur" : "Nouveau Compte Administrateur"}
        />

        {/* Barre de retour et d'actions */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm btn-rounded d-inline-flex align-items-center gap-2"
            onClick={() => {
              setViewMode("list");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className="fa fa-arrow-left"></i>
            <span>Retour à la liste du personnel</span>
          </button>
          <div className="d-flex align-items-center gap-2">
            <span className="badge badge-light text-primary fs-12 px-3 py-2">
              <i className="flaticon-381-shield-1 me-1"></i> Sécurité & Gestion des Droits
            </span>
          </div>
        </div>

        {/* Formulaire Pleine Page */}
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="avatar-preview bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 46, height: 46, minWidth: 46 }}
                  >
                    <i className="flaticon-381-user-7 fs-22"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-1 font-w600 text-dark">
                      {editingAccountId
                        ? "Modifier le Compte Utilisateur"
                        : "Créer un Nouveau Compte Administrateur"}
                    </h5>
                    <p className="card-text text-muted fs-12 mb-0">
                      Renseignez les coordonnées de l'utilisateur et attribuez son rôle et ses permissions d'accès au cabinet.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveAccount}>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Nom complet du titulaire <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex : Dr N. BELBACHIR OULD HENNIA"
                        value={accountForm.name}
                        onChange={(e) =>
                          setAccountForm({ ...accountForm, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Nom d'utilisateur (Identifiant de connexion){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">@</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex : dr.belbachir ou secretaire"
                          value={accountForm.username}
                          onChange={(e) =>
                            setAccountForm({
                              ...accountForm,
                              username: e.target.value.toLowerCase().replace(/\s+/g, ""),
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Mot de passe{" "}
                        {editingAccountId ? (
                          <span className="text-muted fs-11 font-w400">
                            (Laisser vide pour ne pas modifier)
                          </span>
                        ) : (
                          <span className="text-danger">*</span>
                        )}
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder={
                            editingAccountId
                              ? "Nouveau mot de passe (optionnel)"
                              : "Mot de passe sécurisé"
                          }
                          value={accountForm.password}
                          onChange={(e) =>
                            setAccountForm({
                              ...accountForm,
                              password: e.target.value,
                            })
                          }
                          required={!editingAccountId}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i
                            className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Rôle & Droits d'Accès <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={accountForm.roleId}
                        onChange={(e) =>
                          setAccountForm({ ...accountForm, roleId: e.target.value })
                        }
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({countAllowedPages(r.pages)}/{SITE_PAGES.length} pages)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Adresse Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="contact@cabinet-medical.dz"
                        value={accountForm.email}
                        onChange={(e) =>
                          setAccountForm({ ...accountForm, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Téléphone professionnel
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex : 01 42 68 50 10 ou 05 50 ..."
                        value={accountForm.phone}
                        onChange={(e) =>
                          setAccountForm({ ...accountForm, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Statut du Compte
                      </label>
                      <div className="d-flex gap-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="accountStatus"
                            id="statusActive"
                            value="Actif"
                            checked={accountForm.status === "Actif"}
                            onChange={() =>
                              setAccountForm({ ...accountForm, status: "Actif" })
                            }
                          />
                          <label
                            className="form-check-label text-success font-w600"
                            htmlFor="statusActive"
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-check-circle me-1"></i> Actif (Connexion autorisée)
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="accountStatus"
                            id="statusInactive"
                            value="Inactif"
                            checked={accountForm.status === "Inactif"}
                            onChange={() =>
                              setAccountForm({ ...accountForm, status: "Inactif" })
                            }
                          />
                          <label
                            className="form-check-label text-danger font-w600"
                            htmlFor="statusInactive"
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-times-circle me-1"></i> Inactif (Accès suspendu)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu des permissions du rôle sélectionné */}
                  {selectedRole && (
                    <div className="p-3 bg-light rounded mt-3 border">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="font-w600 text-dark fs-12">
                          <i className="flaticon-381-shield-1 text-primary me-1"></i>
                          Aperçu des accès accordés pour le rôle « {selectedRole.name} » :
                        </span>
                        <span className="badge bg-primary fs-11">
                          {allowedPages.length} / {SITE_PAGES.length} pages
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {allowedPages.map((p) => (
                          <span
                            key={p.id}
                            className="badge bg-white text-dark border fs-11 font-w500"
                          >
                            <i className={`${p.icon} text-primary me-1`}></i>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer border-top d-flex justify-content-end gap-2 bg-light py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setViewMode("list");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                    <i className="fa fa-save"></i>
                    <span>
                      {editingAccountId ? "Enregistrer les modifications" : "Créer le compte"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VUE 2 : NOUVEAU / MODIFIER RÔLE (PLEINE PAGE - PAS DE POPUP)
  // =========================================================================
  if (viewMode === "role-form") {
    return (
      <div className="fade-in-up">
        <PageTitle
          motherMenu="Cabinet & Configuration"
          activeMenu={editingRoleId ? "Modifier le Rôle & Accès" : "Nouveau Rôle de Sécurité"}
        />

        {/* Barre de retour et d'actions */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm btn-rounded d-inline-flex align-items-center gap-2"
            onClick={() => {
              setViewMode("list");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className="fa fa-arrow-left"></i>
            <span>Retour à la liste du personnel</span>
          </button>
          <div className="d-flex align-items-center gap-2">
            <span className="badge badge-light text-primary fs-12 px-3 py-2">
              <i className="flaticon-381-shield-1 me-1"></i> Matrice des Permissions
            </span>
          </div>
        </div>

        {/* Formulaire Pleine Page */}
        <div className="row justify-content-center">
          <div className="col-xl-10 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="avatar-preview bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 46, height: 46, minWidth: 46 }}
                  >
                    <i className="flaticon-381-shield-1 fs-22"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-1 font-w600 text-dark">
                      {editingRoleId
                        ? "Modifier le Rôle & la Matrice des Permissions"
                        : "Créer un Nouveau Rôle de Sécurité"}
                    </h5>
                    <p className="card-text text-muted fs-12 mb-0">
                      Définissez les autorisations d'accès aux différentes rubriques et fonctionnalités du cabinet.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveRole}>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-7 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Nom du rôle <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex : Secrétaire Médicale, Médecin Remplaçant, Infirmier..."
                        value={roleForm.name}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-5 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Couleur du badge
                      </label>
                      <select
                        className="form-select"
                        value={roleForm.badgeColor}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, badgeColor: e.target.value })
                        }
                      >
                        <option value="primary">Bleu Primaire (Médecin / Titulaire)</option>
                        <option value="info">Cyan / Info (Secrétariat)</option>
                        <option value="success">Vert Succès (Comptabilité)</option>
                        <option value="warning">Orange / Attention</option>
                        <option value="secondary">Gris / Neutre</option>
                      </select>
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label font-w600 text-dark">
                        Description du rôle & missions
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex : Accueil des patientes, prise de RDV et encaissement sans accès aux diagnostics"
                        value={roleForm.description}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, description: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Matrice des droits par page */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                      <h6 className="font-w600 text-dark mb-0">
                        Habilitation d'Accès aux Pages du Site ({countAllowedPages(roleForm.pages)} / {SITE_PAGES.length} pages sélectionnées)
                      </h6>
                      <small className="text-muted">
                        Cochez les pages auxquelles les utilisateurs rattachés à ce rôle pourront accéder
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-success btn-xs"
                        onClick={() => handleSelectAllPages(true)}
                      >
                        <i className="fa fa-check-double me-1"></i> Tout autoriser
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs"
                        onClick={() => handleSelectAllPages(false)}
                      >
                        <i className="fa fa-ban me-1"></i> Tout révoquer
                      </button>
                    </div>
                  </div>

                  {/* Filtre par catégorie de pages */}
                  <div className="d-flex gap-1 mb-3">
                    {["Tous", "Principal", "Médical", "Financier", "Configuration"].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`btn btn-xs ${pageCategoryFilter === cat
                              ? "btn-primary"
                              : "btn-light text-muted"
                            }`}
                          onClick={() => setPageCategoryFilter(cat)}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  {/* Grille de sélection des 16 pages */}
                  <div className="row g-3">
                    {SITE_PAGES.filter(
                      (p) =>
                        pageCategoryFilter === "Tous" ||
                        p.category === pageCategoryFilter
                    ).map((page) => {
                      const isChecked = !!roleForm.pages[page.id];

                      return (
                        <div key={page.id} className="col-md-6">
                          <div
                            className={`p-3 rounded border h-100 d-flex align-items-start gap-3 ${isChecked
                                ? "border-primary bg-primary-light"
                                : "border-light bg-light opacity-75"
                              }`}
                            onClick={() => handleTogglePagePermission(page.id)}
                            style={{ cursor: "pointer", transition: "all 0.15s" }}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mt-1"
                              checked={isChecked}
                              onChange={() => { }}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center justify-content-between">
                                <span className="font-w600 text-dark fs-13">
                                  <i
                                    className={`${page.icon} me-1 ${isChecked ? "text-primary" : "text-muted"
                                      }`}
                                  ></i>
                                  {page.name}
                                </span>
                                <code className="fs-10 text-muted">{page.path}</code>
                              </div>
                              <p className="text-muted fs-11 mb-0 mt-1 line-clamp-1">
                                {page.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-footer border-top d-flex justify-content-end gap-2 bg-light py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setViewMode("list");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                    <i className="fa fa-save"></i>
                    <span>
                      {editingRoleId ? "Enregistrer les modifications" : "Créer le rôle"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        motherMenu="Cabinet & Configuration"
        activeMenu="Personnel & Droits d'Accès"
      />

      {/* Boutons d'Action Supérieurs */}
      <div className="d-flex mb-3 align-items-center justify-content-end gap-2 flex-wrap">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          onClick={handleOpenNewRole}
        >
          <i className="flaticon-381-shield-1"></i>
          <span>Nouveau Rôle</span>
        </button>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onClick={handleOpenNewAccount}
        >
          <i className="flaticon-381-user-7"></i>
          <span>Nouveau Compte</span>
        </button>
      </div>

      {/* Onglets de Navigation : Comptes vs Rôles */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header border-0 pb-0 pt-3 px-3">
          <ul className="nav nav-pills card-header-pills gap-2">
            <li className="nav-item">
              <button
                className={`nav-link px-3 py-2 font-w600 ${activeTab === "accounts" ? "active" : "text-muted"
                  }`}
                onClick={() => setActiveTab("accounts")}
              >
                <i className="flaticon-381-user-7 me-2"></i>
                Comptes Utilisateurs & Administrateurs ({accounts.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link px-3 py-2 font-w600 ${activeTab === "roles" ? "active" : "text-muted"
                  }`}
                onClick={() => setActiveTab("roles")}
              >
                <i className="flaticon-381-shield-1 me-2"></i>
                Rôles & Permissions par Page ({roles.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ONGLET 1 : COMPTES UTILISATEURS                                      */}
      {/* ==================================================================== */}
      {activeTab === "accounts" && (
        <div className="card border-0 shadow-sm">

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light fs-12 text-uppercase text-muted">
                  <tr>
                    <th className="ps-4">Utilisateur / Praticien</th>
                    <th>Identifiant (Login)</th>
                    <th>Rôle Assigné</th>
                    <th>Accès Modules</th>
                    <th>Contact</th>
                    <th>Statut</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="fs-13">
                  {filteredAccounts.map((acc) => {
                    const roleObj = roles.find((r) => r.id === acc.roleId);
                    const allowedCount = countAllowedPages(roleObj?.pages);
                    const initials = acc.name
                      ? acc.name
                        .split(" ")
                        .filter((w) => w.length > 0 && !w.startsWith("Dr"))
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "NB"
                      : "U";

                    return (
                      <tr key={acc.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center me-3 font-w700 fs-12 text-primary"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#e8f0fe",
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <h6 className="mb-0 font-w600 text-dark">
                                {acc.name}
                              </h6>
                              {acc.username === "admin" && (
                                <span className="badge bg-primary-light text-primary fs-11 py-0 px-2">
                                  Compte Principal
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="text-primary font-w600 fs-12 bg-light px-2 py-1 rounded">
                            @{acc.username}
                          </code>
                        </td>
                        <td>
                          <Badge
                            bg={roleObj?.badgeColor || "primary"}
                            className="light font-w600 fs-12"
                          >
                            {roleObj?.name || acc.roleName || "Sans rôle"}
                          </Badge>
                        </td>
                        <td>
                          <span className="font-w600 text-dark">
                            {allowedCount} / {SITE_PAGES.length}
                          </span>{" "}
                          <span className="text-muted fs-11">pages</span>
                        </td>
                        <td>
                          <div>
                            {acc.email ? (
                              <div className="text-muted fs-12">
                                <i className="flaticon-381-mail me-1 text-primary"></i>
                                {acc.email}
                              </div>
                            ) : null}
                            {acc.phone ? (
                              <div className="text-muted fs-12">
                                <i className="flaticon-381-smartphone me-1 text-primary"></i>
                                {acc.phone}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${acc.status === "Actif"
                                ? "bg-success text-white"
                                : "bg-danger text-white"
                              } cursor-pointer`}
                            onClick={() => handleToggleStatus(acc)}
                            title="Cliquer pour changer le statut"
                            style={{ cursor: "pointer" }}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm px-2 py-1"
                              onClick={() => handleEditAccount(acc)}
                              title="Modifier ce compte"
                            >
                              <i className="flaticon-381-edit"></i>
                            </button>
                            {acc.username !== "admin" && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm px-2 py-1"
                                onClick={() => handleDeleteAccount(acc)}
                                title="Supprimer ce compte"
                              >
                                <i className="flaticon-381-trash-1"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        <i className="flaticon-381-search-2 fs-24 d-block mb-1"></i>
                        Aucun compte trouvé correspondant à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ONGLET 2 : RÔLES & PERMISSIONS PAR PAGE                              */}
      {/* ==================================================================== */}
      {activeTab === "roles" && (
        <div className="row">
          {roles.map((role) => {
            const allowedPages = SITE_PAGES.filter(
              (p) => role.pages && role.pages[p.id]
            );
            const userCount = accounts.filter((a) => a.roleId === role.id).length;

            return (
              <div key={role.id} className="col-xl-6 col-lg-12 mb-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-header border-bottom py-3 px-4 d-flex justify-content-between align-items-start">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="card-title font-w600 mb-0 text-dark">
                          {role.name}
                        </h5>
                        <Badge
                          bg={role.badgeColor || "primary"}
                          className="light font-w600 fs-11"
                        >
                          {role.isSystem ? "Système" : "Personnalisé"}
                        </Badge>
                      </div>
                      <p className="text-muted fs-12 mb-0">{role.description}</p>
                    </div>
                    <span className="badge bg-light text-primary font-w600 fs-12 py-2 px-3">
                      {userCount} utilisateur{userCount > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="card-body px-4 py-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="text-muted fs-12 font-w600 text-uppercase">
                        Habilitations Modules ({allowedPages.length} /{" "}
                        {SITE_PAGES.length} autorisés) :
                      </span>
                      <span
                        className={`badge ${allowedPages.length === SITE_PAGES.length
                            ? "bg-success"
                            : "bg-info"
                          } light fs-11`}
                      >
                        {allowedPages.length === SITE_PAGES.length
                          ? "Plein Accès"
                          : "Accès Restreint"}
                      </span>
                    </div>

                    {/* Matrice des pages sous forme de badges clairs */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {SITE_PAGES.map((page) => {
                        const isAllowed = role.pages && role.pages[page.id];
                        return (
                          <div
                            key={page.id}
                            className={`d-flex align-items-center px-2 py-1 rounded fs-11 font-w500 ${isAllowed
                                ? "bg-success-light text-success border border-success-subtle"
                                : "bg-light text-muted opacity-50"
                              }`}
                            style={{ transition: "all 0.2s" }}
                          >
                            <i
                              className={`${page.icon} me-1 ${isAllowed ? "text-success" : "text-muted"
                                }`}
                            ></i>
                            <span>{page.name}</span>
                            {isAllowed ? (
                              <i className="fa fa-check ms-1 fs-9"></i>
                            ) : (
                              <i className="fa fa-lock ms-1 fs-9"></i>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card-footer border-top bg-transparent px-4 py-3 d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => handleEditRole(role)}
                    >
                      <i className="flaticon-381-edit"></i>
                      <span>Modifier Rôle & Accès</span>
                    </button>
                    {!role.isSystem && (
                      <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <i className="flaticon-381-trash-1"></i>
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default StaffPage;
